import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { withCoursePresentation } from './course-detail.util';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  listCoursesPublic() {
    return this.prisma.course.findMany({
      orderBy: { orderIndex: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        tagline: true,
        orderIndex: true,
        isFree: true,
        coverImageUrl: true,
        overviewMd: true,
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
      },
    });
  }

  async getCoursePublic(courseId: string) {
    const course = await this.prisma.course.findFirst({
      where: { OR: [{ id: courseId }, { slug: courseId }] },
      include: {
        _count: { select: { enrollments: true } },
        modules: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            slug: true,
            title: true,
            orderIndex: true,
            lessons: {
              orderBy: { orderIndex: 'asc' },
              select: {
                id: true,
                slug: true,
                title: true,
                estimatedMinutes: true,
                orderIndex: true,
                _count: { select: { exercises: true } },
              },
            },
          },
        },
      },
    });
    if (!course) throw new NotFoundException('Curso não encontrado');
    return withCoursePresentation(course);
  }

  /** Catálogo autenticado: cursos + matrícula e se pode matricular (grátis). */
  async listCatalogForUser(userId: string) {
    const [courses, mine] = await Promise.all([
      this.prisma.course.findMany({
        orderBy: { orderIndex: 'asc' },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          tagline: true,
          orderIndex: true,
          isFree: true,
          coverImageUrl: true,
          _count: { select: { modules: true } },
        },
      }),
      this.prisma.userCourseEnrollment.findMany({
        where: { userId },
        select: { courseId: true },
      }),
    ]);
    const enrolledSet = new Set(mine.map((m) => m.courseId));
    return courses.map((c) => ({
      ...c,
      enrolled: enrolledSet.has(c.id),
      canEnrollInCourse: c.isFree,
    }));
  }

  /** Conteúdo do curso para estudo: exige matrícula no curso (ou curso gratuito acessível após matrícula explícita — mesma regra que aulas). */
  async getCourseForUser(courseId: string, userId: string) {
    const courseRef = await this.prisma.course.findFirst({
      where: { OR: [{ id: courseId }, { slug: courseId }] },
      select: { id: true, isFree: true },
    });
    if (!courseRef) throw new NotFoundException('Curso não encontrado');

    const courseEnrolled = await this.prisma.userCourseEnrollment.findUnique({
      where: { userId_courseId: { userId, courseId: courseRef.id } },
    });
    if (!courseEnrolled) {
      throw new NotFoundException('Curso não encontrado');
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseRef.id },
      include: {
        _count: { select: { enrollments: true } },
        modules: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            slug: true,
            title: true,
            orderIndex: true,
            lessons: {
              orderBy: { orderIndex: 'asc' },
              select: {
                id: true,
                slug: true,
                title: true,
                estimatedMinutes: true,
                orderIndex: true,
                _count: { select: { exercises: true } },
              },
            },
          },
        },
      },
    });
    if (!course) throw new NotFoundException('Curso não encontrado');

    return withCoursePresentation(course);
  }
}
