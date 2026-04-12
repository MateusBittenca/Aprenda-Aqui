import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
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
