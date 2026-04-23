import { useQuery } from '@tanstack/react-query';
import { apiFetch, requireToken } from '../lib/api';
import { useAuthHydration, useAuthStore } from '../stores/authStore';
import type { OnlineUsersPayload } from '../types/social';

export function useOnlineUsers(scope: 'all' | 'following' = 'all') {
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthHydration();

  return useQuery({
    queryKey: ['users', 'online', scope],
    queryFn: () =>
      apiFetch<OnlineUsersPayload>(
        scope === 'following' ? '/users/online?scope=following' : '/users/online',
        { token: requireToken(token) },
      ),
    enabled: hydrated && !!token,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}
