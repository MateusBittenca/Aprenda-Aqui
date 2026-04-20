import { Injectable, NotFoundException } from '@nestjs/common';
import type { InputJsonValue } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import {
  ExerciseEvaluatorService,
  SubmitPayload,
} from './exercise-evaluator.service';
import { EnrollmentService } from '../enrollment/enrollment.service';
import { GamificationService } from '../gamification/gamification.service';
import { ProgressService } from '../progress/progress.service';

@Injectable()
export class ExercisesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly evaluator: ExerciseEvaluatorService,
    private readonly gamification: GamificationService,
    private readonly progress: ProgressService,
    private readonly enrollment: EnrollmentService,
  ) {}

  async submit(userId: string, exerciseId: string, body: SubmitPayload) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: { lesson: { include: { module: true } } },
    });
    if (!exercise) {
      throw new NotFoundException('Exercício não encontrado');
    }

    await this.enrollment.assertEnrolledInCourse(
      userId,
      exercise.lesson.module.courseId,
    );

    const payload = exercise.payload as Record<string, unknown>;
    const { correct } = this.evaluator.evaluate(exercise.type, payload, body);

    await this.prisma.userExerciseAttempt.create({
      data: {
        userId,
        exerciseId,
        correct,
        answer: body as unknown as InputJsonValue,
      },
    });

    let xpGained = 0;
    let gemsGained = 0;
    let alreadySolved = false;
    let leveledUp = false;
    let newLevel: number | undefined;
    let lessonCompleted = false;

    const existing = await this.prisma.userExerciseProgress.findUnique({
      where: { userId_exerciseId: { userId, exerciseId } },
    });

    if (correct) {
      if (existing?.solved) {
        alreadySolved = true;
        await this.gamification.recordDailyActivity(userId);
      } else {
        await this.prisma.userExerciseProgress.upsert({
          where: { userId_exerciseId: { userId, exerciseId } },
          create: { userId, exerciseId, solved: true, solvedAt: new Date() },
          update: { solved: true, solvedAt: new Date() },
        });
        const gamResult = await this.gamification.applyXpAndGems(
          userId,
          exercise.xpReward,
          exercise.gemReward,
        );
        xpGained = gamResult.xpGained;
        gemsGained = gamResult.gemsGained;
        leveledUp = gamResult.leveledUp;
        newLevel = gamResult.level;
        const lessonResult = await this.progress.tryCompleteLesson(
          userId,
          exercise.lessonId,
        );
        lessonCompleted = lessonResult.justCompleted;
      }
    }

    return {
      correct,
      explanation: exercise.explanation,
      xpGained,
      gemsGained,
      alreadySolved,
      rewardsApplied: correct && !alreadySolved,
      lessonCompleted,
      leveledUp,
      newLevel,
    };
  }
}
