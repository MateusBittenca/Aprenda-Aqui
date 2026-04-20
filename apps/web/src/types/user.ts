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
  /** Cor do avatar: "auto" ou chave fixa (blue, violet, …). */
  avatarColorKey: string;
  xpTotal: number;
  level: number;
  gems: number;
  currentStreak: number;
  longestStreak: number;
  /** Últimos 7 dias (mais antigo → hoje); true = dia com estudo (exercício certo ou aula concluída). */
  streakWeekDays: boolean[];
  lastActivityDate: string | null;
  createdAt: string;
  xpProgress: {
    level: number;
    currentBandXp: number;
    bandSize: number;
  };
};
