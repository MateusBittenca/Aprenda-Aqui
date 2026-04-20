import { useQuery } from '@tanstack/react-query';
import { apiFetch, requireToken } from '../lib/api';
import { useAuthHydration, useAuthStore } from '../stores/authStore';

type LessonProgress = { lessonId: string; completed: boolean; completedAt: string | null };
type ExerciseProgress = { exerciseId: string; solved: boolean; solvedAt: string | null };

export type UserProgress = {
  lessons: LessonProgress[];
  exercises: ExerciseProgress[];
};

export function useProgress() {
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?.id);
  const hydrated = useAuthHydration();

  const query = useQuery({
    queryKey: ['progress', userId ?? ''],
    queryFn: () => apiFetch<UserProgress>('/progress', { token: requireToken(token) }),
    enabled: hydrated && !!token && !!userId,
    staleTime: 15_000,
  });

  const completedLessonIds = new Set(
    (query.data?.lessons ?? []).filter((l) => l.completed).map((l) => l.lessonId),
  );

  return { ...query, completedLessonIds };
}
