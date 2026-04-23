import { useQuery } from '@tanstack/react-query';
import { apiFetch, requireToken } from '../lib/api';
import { useAuthHydration, useAuthStore } from '../stores/authStore';

export type DailyGoal = {
  lessons: { target: number; current: number };
  exercises: { target: number; current: number };
  baseline: { lessonsP50: number; exercisesP50: number };
};

export function useDailyGoal() {
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?.id);
  const hydrated = useAuthHydration();

  return useQuery({
    queryKey: ['me', userId ?? '', 'daily-goal'],
    queryFn: () => apiFetch<DailyGoal>('/me/daily-goal', { token: requireToken(token) }),
    enabled: hydrated && !!token && !!userId,
    staleTime: 60_000,
  });
}
