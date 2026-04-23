import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, requireToken } from '../lib/api';
import { useAuthHydration, useAuthStore } from '../stores/authStore';

export type DailyGiftStatus = {
  canClaim: boolean;
  dayInCycle: number;
  amount: number;
  willResetCycle: boolean;
  cycleAmounts: number[];
  alreadyClaimedToday: boolean;
};

export type DailyGiftClaim = {
  amount: number;
  dayInCycle: number;
  gemsTotal: number;
  cycleAmounts: number[];
};

export function useDailyGift() {
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?.id);
  const hydrated = useAuthHydration();

  return useQuery({
    queryKey: ['me', userId ?? '', 'daily-gift'],
    queryFn: () => apiFetch<DailyGiftStatus>('/me/daily-gift', { token: requireToken(token) }),
    enabled: hydrated && !!token && !!userId,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useClaimDailyGift() {
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?.id);
  const patchUser = useAuthStore((s) => s.patchUser);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch<DailyGiftClaim>('/me/daily-gift/claim', {
        method: 'POST',
        token: requireToken(token),
        body: JSON.stringify({}),
      }),
    onSuccess: (data) => {
      patchUser({ gems: data.gemsTotal });
      qc.invalidateQueries({ queryKey: ['me', userId ?? ''] });
    },
  });
}
