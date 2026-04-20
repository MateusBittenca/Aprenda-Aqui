import { Injectable, NotFoundException } from '@nestjs/common';
import { ExerciseType } from '@prisma/client';
import { EnrollmentService } from '../enrollment/enrollment.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LessonsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly enrollment: EnrollmentService,
  ) {}

  async getLesson(lessonId: string, userId?: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
        exercises: { orderBy: { orderIndex: 'asc' } },
      },
    });
    if (!lesson) {
      throw new NotFoundException('Aula não encontrada');
    }

    if (userId) {
      await this.enrollment.assertEnrolledInCourse(
        userId,
        lesson.module.courseId,
      );
    }

    let exerciseStates: Record<string, boolean> = {};
    if (userId) {
      const ids = lesson.exercises.map((e) => e.id);
      const progress = await this.prisma.userExerciseProgress.findMany({
        where: { userId, exerciseId: { in: ids } },
      });
      exerciseStates = Object.fromEntries(
        progress.map((p) => [p.exerciseId, p.solved]),
      );
    }

    return {
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      objective: lesson.objective,
      contentMd: lesson.contentMd,
      estimatedMinutes: lesson.estimatedMinutes,
      orderIndex: lesson.orderIndex,
      course: {
        id: lesson.module.course.id,
        slug: lesson.module.course.slug,
        title: lesson.module.course.title,
      },
      module: {
        id: lesson.module.id,
        slug: lesson.module.slug,
        title: lesson.module.title,
      },
      exercises: lesson.exercises.map((ex) => ({
        id: ex.id,
        type: ex.type,
        title: ex.title,
        prompt: ex.prompt,
        orderIndex: ex.orderIndex,
        xpReward: ex.xpReward,
        gemReward: ex.gemReward,
        solved: exerciseStates[ex.id] ?? false,
        payload: this.sanitizePayload(ex.type, ex.payload),
      })),
    };
  }

  private sanitizePayload(type: ExerciseType, payload: unknown) {
    if (type === ExerciseType.MULTIPLE_CHOICE) {
      const p = payload as { options: string[] };
      return { options: p.options };
    }
    if (type === ExerciseType.CODE_FILL) {
      const p = payload as {
        template: string;
        blanks: { id: string; answer: string }[];
      };
      return {
        template: p.template,
        blanks: p.blanks.map((b) => ({ id: b.id })),
      };
    }
    if (type === ExerciseType.CODE_EDITOR) {
      const p = payload as {
        language: string;
        starterCode?: string;
        tests: unknown[];
      };
      return {
        language: p.language,
        starterCode: p.starterCode ?? '',
        testCount: Array.isArray(p.tests) ? p.tests.length : 0,
      };
    }
    return {};
  }
}
