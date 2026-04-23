import type { MeProfile } from '../types/user';
import type { UserProgress } from '../hooks/useProgress';

export type Badge = {
  id: string;
  icon: string;
  name: string;
  description: string;
  earned: boolean;
  /** Para badges com progresso, exibe uma mini-barra. */
  progress?: { current: number; total: number };
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  /**
   * Data estimada do desbloqueio (ISO string) quando derivável da trilha de
   * atividades — aulas e exercícios. Badges de streak/level retornam null
   * porque não mantemos snapshot histórico desses contadores.
   */
  unlockedAt: string | null;
};

function nthActivityDate(
  timestamps: (string | null | undefined)[],
  n: number,
): string | null {
  const valid = timestamps.filter((t): t is string => !!t);
  if (valid.length < n) return null;
  const sorted = [...valid].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );
  return sorted[n - 1] ?? null;
}

export function computeBadges(profile: MeProfile, progress: UserProgress): Badge[] {
  const lessonDates = progress.lessons
    .filter((l) => l.completed)
    .map((l) => l.completedAt);
  const exerciseDates = progress.exercises
    .filter((e) => e.solved)
    .map((e) => e.solvedAt);
  const completedLessons = lessonDates.length;
  const solvedExercises = exerciseDates.length;
  const streak = Math.max(profile.currentStreak, profile.longestStreak);

  return [
    {
      id: 'first-step',
      icon: '🚀',
      name: 'Primeiros Passos',
      description: 'Complete sua primeira aula',
      earned: completedLessons >= 1,
      rarity: 'common',
      unlockedAt: completedLessons >= 1 ? nthActivityDate(lessonDates, 1) : null,
    },
    {
      id: 'apprentice',
      icon: '📚',
      name: 'Aprendiz',
      description: 'Complete 5 aulas',
      earned: completedLessons >= 5,
      progress: { current: Math.min(completedLessons, 5), total: 5 },
      rarity: 'common',
      unlockedAt: completedLessons >= 5 ? nthActivityDate(lessonDates, 5) : null,
    },
    {
      id: 'student',
      icon: '🎓',
      name: 'Estudante',
      description: 'Complete 15 aulas',
      earned: completedLessons >= 15,
      progress: { current: Math.min(completedLessons, 15), total: 15 },
      rarity: 'uncommon',
      unlockedAt: completedLessons >= 15 ? nthActivityDate(lessonDates, 15) : null,
    },
    {
      id: 'scholar',
      icon: '🏆',
      name: 'Mestre',
      description: 'Complete 30 aulas',
      earned: completedLessons >= 30,
      progress: { current: Math.min(completedLessons, 30), total: 30 },
      rarity: 'rare',
      unlockedAt: completedLessons >= 30 ? nthActivityDate(lessonDates, 30) : null,
    },
    {
      id: 'on-fire',
      icon: '🔥',
      name: 'Em Chamas',
      description: 'Mantenha sequência de 3 dias',
      earned: streak >= 3,
      progress: { current: Math.min(streak, 3), total: 3 },
      rarity: 'common',
      unlockedAt: null,
    },
    {
      id: 'unstoppable',
      icon: '⚡',
      name: 'Imparável',
      description: 'Sequência de 7 dias',
      earned: streak >= 7,
      progress: { current: Math.min(streak, 7), total: 7 },
      rarity: 'uncommon',
      unlockedAt: null,
    },
    {
      id: 'legendary',
      icon: '💫',
      name: 'Lendário',
      description: 'Sequência de 30 dias',
      earned: streak >= 30,
      progress: { current: Math.min(streak, 30), total: 30 },
      rarity: 'legendary',
      unlockedAt: null,
    },
    {
      id: 'level5',
      icon: '⭐',
      name: 'Veterano',
      description: 'Alcance o nível 5',
      earned: profile.level >= 5,
      progress: { current: Math.min(profile.level, 5), total: 5 },
      rarity: 'uncommon',
      unlockedAt: null,
    },
    {
      id: 'level10',
      icon: '💎',
      name: 'Diamante',
      description: 'Alcance o nível 10',
      earned: profile.level >= 10,
      progress: { current: Math.min(profile.level, 10), total: 10 },
      rarity: 'rare',
      unlockedAt: null,
    },
    {
      id: 'solver',
      icon: '🎯',
      name: 'Solucionador',
      description: 'Resolva 50 exercícios',
      earned: solvedExercises >= 50,
      progress: { current: Math.min(solvedExercises, 50), total: 50 },
      rarity: 'uncommon',
      unlockedAt:
        solvedExercises >= 50 ? nthActivityDate(exerciseDates, 50) : null,
    },
  ];
}

export const RARITY_STYLE: Record<Badge['rarity'], string> = {
  common: 'border-slate-200 bg-slate-50',
  uncommon: 'border-blue-200 bg-blue-50',
  rare: 'border-violet-200 bg-violet-50',
  legendary: 'border-amber-300 bg-amber-50',
};

export const RARITY_LABEL: Record<Badge['rarity'], string> = {
  common: 'Comum',
  uncommon: 'Incomum',
  rare: 'Raro',
  legendary: 'Lendário',
};
