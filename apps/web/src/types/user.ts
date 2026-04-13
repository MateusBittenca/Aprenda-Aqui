export type UserRole = 'USER' | 'ADMIN';

/** Resposta de `GET /me` (perfil + gamificação). */
export type MeProfile = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  timezone: string;
  bio?: string | null;
  showInSearch?: boolean;
  xpTotal: number;
  level: number;
  gems: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  createdAt: string;
  xpProgress: {
    level: number;
    currentBandXp: number;
    bandSize: number;
  };
};
