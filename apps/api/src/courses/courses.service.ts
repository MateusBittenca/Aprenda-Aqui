import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string) {
    const rows = await this.prisma.course.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        modules: {
          include: { _count: { select: { lessons: true } } },
        },
        enrollments: {
          where: { userId },
          select: { id: true, enrolledAt: true },
        },
      },
    });

    return rows.map((c) => {
      const lessonCount = c.modules.reduce(
        (sum, m) => sum + m._count.lessons,
        0,
      );
      const enrollment = c.enrollments[0];
      return {
        id: c.id,
        slug: c.slug,
        title: c.title,
        description: c.description,
        isFree: c.isFree,
        orderIndex: c.orderIndex,
        moduleCount: c.modules.length,
        lessonCount,
        enrolled: !!enrollment,
        enrolledAt: enrollment?.enrolledAt ?? null,
      };
    });
  }

  async enroll(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) throw new NotFoundException('Curso não encontrado');
    if (!course.isFree) {
      throw new ForbiddenException(
        'Este curso não está disponível para matrícula gratuita.',
      );
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
