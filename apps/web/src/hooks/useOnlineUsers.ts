import { useQuery } from '@tanstack/react-query';
import { apiFetch, requireToken } from '../lib/api';
import { useAuthHydration, useAuthStore } from '../stores/authStore';
import type { OnlineUsersPayload } from '../types/social';

export function useOnlineUsers() {
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthHydration();

  return useQuery({
    queryKey: ['users', 'online'],
    queryFn: () => apiFetch<OnlineUsersPayload>('/users/online', { token: requireToken(token) }),
    enabled: hydrated && !!token,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}
