import { ExerciseType } from '@prisma/client';
import { ExerciseEvaluatorService } from './exercise-evaluator.service';

describe('ExerciseEvaluatorService', () => {
  const evaluator = new ExerciseEvaluatorService();

  it('aceita múltipla escolha correta', () => {
    const r = evaluator.evaluate(
      ExerciseType.MULTIPLE_CHOICE,
      { correctIndex: 2 },
      { selectedIndex: 2 },
    );
    expect(r.correct).toBe(true);
  });

  it('rejeita múltipla escolha incorreta', () => {
    const r = evaluator.evaluate(
      ExerciseType.MULTIPLE_CHOICE,
      { correctIndex: 0 },
      { selectedIndex: 1 },
    );
    expect(r.correct).toBe(false);
  });
});
