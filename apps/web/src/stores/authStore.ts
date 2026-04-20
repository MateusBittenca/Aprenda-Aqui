import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole } from '../types/user';

export type { UserRole };
export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  /** Presente após login/me; sessões antigas podem não ter o campo. */
  avatarColorKey?: string;
  xpTotal: number;
  level: number;
  gems: number;
  currentStreak: number;
  longestStreak: number;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  setSession: (token: string, user: AuthUser) => void;
  clear: () => void;
  patchUser: (partial: Partial<AuthUser>) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      clear: () => set({ token: null, user: null }),
      patchUser: (partial) =>
        set((s) => (s.user ? { user: { ...s.user, ...partial } } : {})),
    }),
    { name: 'codepath-auth' },
  ),
);

/** Evita ler `token` antes do persist reidratar (localStorage), o que quebrava queries com `enabled: !!token`. */
export function useAuthHydration(): boolean {
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated());

  useEffect(() => {
    const mark = () => queueMicrotask(() => setHydrated(true));
    if (useAuthStore.persist.hasHydrated()) mark();
    const unsub = useAuthStore.persist.onFinishHydration(() => mark());
    return unsub;
  }, []);

  return hydrated;
}
