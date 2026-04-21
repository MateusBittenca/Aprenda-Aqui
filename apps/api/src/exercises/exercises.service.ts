import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ExerciseType } from '@prisma/client';
import type { InputJsonValue } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import {
  ExerciseEvaluatorService,
  SubmitPayload,
} from './exercise-evaluator.service';
import { EnrollmentService } from '../enrollment/enrollment.service';
import { GamificationService } from '../gamification/gamification.service';
import { ProgressService } from '../progress/progress.service';

function parseProgressiveHints(payload: unknown): [string, string] | null {
  if (!payload || typeof payload !== 'object') return null;
  const hints = (payload as { hints?: unknown }).hints;
  if (!Array.isArray(hints) || hints.length < 2) return null;
  const a = hints[0];
  const b = hints[1];
  if (typeof a !== 'string' || typeof b !== 'string') return null;
  if (!a.trim() || !b.trim()) return null;
  return [a, b];
}

@Injectable()
export class ExercisesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly evaluator: ExerciseEvaluatorService,
    private readonly gamification: GamificationService,
    private readonly progress: ProgressService,
    private readonly enrollment: EnrollmentService,
  ) {}

  async revealExplanation(userId: string, exerciseId: string) {
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

    const solved = await this.prisma.userExerciseProgress.findUnique({
      where: { userId_exerciseId: { userId, exerciseId } },
    });
    if (solved?.solved) {
      throw new BadRequestException('Exercício já resolvido');
    }

    const hintPair = parseProgressiveHints(exercise.payload);
    const progressiveType =
      exercise.type === ExerciseType.CODE_EDITOR ||
      exercise.type === ExerciseType.CODE_FILL;
    if (!progressiveType || !hintPair) {
      throw new BadRequestException(
        'Este exercício não permite desbloquear explicação com gema',
      );
    }

    const existing =
      await this.prisma.userExerciseExplanationUnlock.findUnique({
        where: {
          userId_exerciseId: { userId, exerciseId },
        },
      });

    const wrongAttempts = await this.prisma.userExerciseAttempt.count({
      where: { userId, exerciseId, correct: false },
    });
    if (!existing && wrongAttempts < 3) {
      throw new BadRequestException(
        'Use primeiro as duas dicas gratuitas; a explicação completa com gema fica disponível após a terceira tentativa incorreta.',
      );
    }

    if (existing) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { gems: true },
      });
      return {
        explanation: exercise.explanation,
        gemsRemaining: user?.gems ?? 0,
        alreadyUnlocked: true,
      };
    }

    const { gemsRemaining } = await this.gamification.spendGems(userId, 1);
    await this.prisma.userExerciseExplanationUnlock.create({
      data: { userId, exerciseId },
    });

    return {
      explanation: exercise.explanation,
      gemsRemaining,
      alreadyUnlocked: false,
    };
  }

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
    const evaluation = this.evaluator.evaluate(exercise.type, payload, body);
    const { correct, detail: evaluatorDetail } = evaluation;

    const priorWrongCount = await this.prisma.userExerciseAttempt.count({
      where: { userId, exerciseId, correct: false },
    });

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

    let explanation = exercise.explanation;
    let requiresGemForFullExplanation = false;
    let hintTier: number | undefined;
    const evaluatorDetailOut =
      !correct && evaluatorDetail ? evaluatorDetail : undefined;

    const hintPair = parseProgressiveHints(payload);
    const progressive =
      (exercise.type === ExerciseType.CODE_EDITOR ||
        exercise.type === ExerciseType.CODE_FILL) &&
      hintPair !== null;

    if (!correct && progressive && hintPair) {
      const [h1, h2] = hintPair;
      const unlocked =
        await this.prisma.userExerciseExplanationUnlock.findUnique({
          where: {
            userId_exerciseId: { userId, exerciseId },
          },
        });
      if (!unlocked) {
        if (priorWrongCount === 0) {
          explanation = h1;
          hintTier = 1;
        } else if (priorWrongCount === 1) {
          explanation = h2;
          hintTier = 2;
        } else {
          explanation =
            'Você já usou as duas dicas gratuitas. **Gaste 1 gema** para ver a explicação completa.';
          requiresGemForFullExplanation = true;
          hintTier = 3;
        }
      }
    }

    return {
      correct,
      explanation,
      xpGained,
      gemsGained,
      alreadySolved,
      rewardsApplied: correct && !alreadySolved,
      lessonCompleted,
      leveledUp,
      newLevel,
      evaluatorDetail: evaluatorDetailOut,
      requiresGemForFullExplanation,
      hintTier,
    };
  }
}
