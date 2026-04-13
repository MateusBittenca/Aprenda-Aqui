import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string) {
    const [rows, trackEnrollRows] = await Promise.all([
      this.prisma.course.findMany({
        orderBy: [{ track: { orderIndex: 'asc' } }, { orderIndex: 'asc' }],
        include: {
          track: { select: { id: true, title: true, slug: true, orderIndex: true } },
          modules: {
            include: { _count: { select: { lessons: true } } },
          },
          enrollments: {
            where: { userId },
            select: { id: true, enrolledAt: true },
          },
        },
      }),
      this.prisma.userTrackEnrollment.findMany({
        where: { userId },
        select: { trackId: true, enrolledAt: true },
      }),
    ]);

    const trackEnrolledAt = new Map(trackEnrollRows.map((t) => [t.trackId, t.enrolledAt]));

    return rows.map((c) => {
      const lessonCount = c.modules.reduce((sum, m) => sum + m._count.lessons, 0);
      const enrollment = c.enrollments[0];
      const trackEnrolled = trackEnrolledAt.has(c.trackId);
      const enrolledAt = enrollment?.enrolledAt ?? (trackEnrolled ? trackEnrolledAt.get(c.trackId)! : null);
      return {
        id: c.id,
        slug: c.slug,
        title: c.title,
        description: c.description,
        isFree: c.isFree,
        orderIndex: c.orderIndex,
        moduleCount: c.modules.length,
        lessonCount,
        track: c.track,
        trackEnrolled,
        enrolled: !!enrollment || trackEnrolled,
        enrolledAt,
      };
    });
  }

  /** Matrícula na trilha: acesso a todos os cursos gratuitos da trilha. */
  async enrollInTrack(userId: string, trackIdOrSlug: string) {
    const track = await this.prisma.track.findFirst({
      where: { OR: [{ id: trackIdOrSlug }, { slug: trackIdOrSlug }] },
      include: {
        courses: { select: { id: true, isFree: true } },
      },
    });
    if (!track) throw new NotFoundException('Trilha não encontrada');
    if (track.courses.length === 0) {
      throw new NotFoundException('Esta trilha ainda não tem cursos.');
    }
    const freeCourses = track.courses.filter((c) => c.isFree);
    if (freeCourses.length === 0) {
      throw new ForbiddenException(
        'Não há cursos gratuitos abertos para matrícula nesta trilha no momento.',
      );
    }

    const existing = await this.prisma.userTrackEnrollment.findUnique({
      where: { userId_trackId: { userId, trackId: track.id } },
    });
    if (existing) {
      return {
        enrolled: true,
        enrolledAt: existing.enrolledAt,
        message: 'Você já está matriculado nesta trilha.',
      };
    }

    const en = await this.prisma.userTrackEnrollment.create({
      data: { userId, trackId: track.id },
    });
    return {
      enrolled: true,
      enrolledAt: en.enrolledAt,
      message: 'Matrícula na trilha realizada com sucesso!',
    };
  }

  async enroll(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Curso não encontrado');
    if (!course.isFree) {
      throw new ForbiddenException('Este curso não está disponível para matrícula gratuita.');
    }

    const existing = await this.prisma.userCourseEnrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) {
      return {
        enrolled: true,
        enrolledAt: existing.enrolledAt,
        message: 'Você já está matriculado neste curso.',
      };
    }

    const en = await this.prisma.userCourseEnrollment.create({
      data: { userId, courseId },
    });
    return {
      enrolled: true,
      enrolledAt: en.enrolledAt,
      message: 'Matrícula realizada com sucesso!',
    };
  }
}
