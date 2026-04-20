import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch, requireToken } from '../lib/api';
import { useAuthHydration, useAuthStore } from '../stores/authStore';
import type { MeProfile } from '../types/user';

export function useMe(options?: { syncStore?: boolean }) {
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?.id);
  const hydrated = useAuthHydration();
  const patchUser = useAuthStore((s) => s.patchUser);

  const query = useQuery({
    /** Uma chave por usuário — ao trocar de conta, não reutiliza o perfil da sessão anterior. */
    queryKey: ['me', userId ?? ''],
    queryFn: () => apiFetch<MeProfile>('/me', { token: requireToken(token) }),
    enabled: hydrated && !!token && !!userId,
  });

  useEffect(() => {
    if (!options?.syncStore || !query.data) return;
    patchUser({
      displayName: query.data.displayName,
      role: query.data.role,
      avatarColorKey: query.data.avatarColorKey,
      xpTotal: query.data.xpTotal,
      level: query.data.level,
      gems: query.data.gems,
      currentStreak: query.data.currentStreak,
      longestStreak: query.data.longestStreak,
    });
  }, [options?.syncStore, query.data, patchUser]);

  return { ...query, hydrated };
}
