import { useQuery } from '@tanstack/react-query';
import { apiFetch, requireToken } from '../lib/api';
import { useAuthHydration, useAuthStore } from '../stores/authStore';

export type LeaderboardEntry = {
  id: string;
  displayName: string;
  avatarColorKey: string;
  xpTotal: number;
  level: number;
  currentStreak: number;
};

export type LeaderboardData = {
  top: LeaderboardEntry[];
  myRank: number;
  total: number;
};

export function useLeaderboard() {
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthHydration();

  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => apiFetch<LeaderboardData>('/leaderboard', { token: requireToken(token) }),
    enabled: hydrated && !!token,
    staleTime: 60_000,
  });
}
