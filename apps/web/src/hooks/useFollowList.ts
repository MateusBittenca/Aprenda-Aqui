import { useQuery } from '@tanstack/react-query';
import { apiFetch, requireToken } from '../lib/api';
import { useAuthHydration, useAuthStore } from '../stores/authStore';
import type { FollowListUser } from '../types/social';

export type FollowListKind = 'followers' | 'following';

export function useFollowList(userId: string | undefined, kind: FollowListKind, enabled = true) {
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthHydration();

  return useQuery({
    queryKey: ['users', userId ?? '', kind],
    queryFn: () =>
      apiFetch<FollowListUser[]>(`/users/${userId}/${kind}`, {
        token: requireToken(token),
      }),
    enabled: hydrated && !!token && !!userId && enabled,
    staleTime: 30_000,
  });
}
