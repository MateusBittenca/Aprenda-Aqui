import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';

const LESSON_COMPLETE_XP = 25;
const LESSON_COMPLETE_GEMS = 3;

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamification: GamificationService,
  ) {}

  async getProgress(userId: string) {
    const [lessons, exercises] = await Promise.all([
      this.prisma.userLessonProgress.findMany({
        where: { userId },
        select: { lessonId: true, completed: true, completedAt: true },
      }),
      this.prisma.userExerciseProgress.findMany({
        where: { userId },
        select: { exerciseId: true, solved: true, solvedAt: true },
      }),
    ]);
    return {
      lessons,
      exercises,
    };
  }

  async completeLesson(userId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { exercises: true },
    });
    if (!lesson) throw new NotFoundException('Aula não encontrada');

    if (lesson.exercises.length > 0) {
      const solved = await this.prisma.userExerciseProgress.findMany({
        where: {
          userId,
          exerciseId: { in: lesson.exercises.map((e) => e.id) },
          solved: true,
        },
      });
      if (solved.length < lesson.exercises.length) {
        return { completed: false, message: 'Conclua todos os exercícios primeiro' };
      }
    }

    return this.markLessonComplete(userId, lessonId);
  }

  /** Chamado após acerto de exercício: verifica se a aula pode ser concluída. */
  async tryCompleteLesson(userId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { exercises: true },
    });
    if (!lesson || !lesson.exercises.length) return;

    const solvedCount = await this.prisma.userExerciseProgress.count({
      where: {
        userId,
        exerciseId: { in: lesson.exercises.map((e) => e.id) },
        solved: true,
      },
    });
    if (solvedCount < lesson.exercises.length) return;

    await this.markLessonComplete(userId, lessonId);
  }

  private async markLessonComplete(userId: string, lessonId: string) {
    const existing = await this.prisma.userLessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });
    if (existing?.completed) {
      return { completed: true, alreadyCompleted: true };
    }

    await this.prisma.userLessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: { userId, lessonId, completed: true, completedAt: new Date() },
      update: { completed: true, completedAt: new Date() },
    });

    let xpGained = 0;
    let gemsGained = 0;
    if (!existing?.completed) {
      const res = await this.gamification.applyXpAndGems(userId, LESSON_COMPLETE_XP, LESSON_COMPLETE_GEMS);
      xpGained = res.xpGained;
      gemsGained = res.gemsGained;
    }

    return { completed: true, alreadyCompleted: false, xpGained, gemsGained };
  }
}
