/**
 * Espelha `apps/api/src/gamification/level.util.ts` — XP na faixa do nível L = 100*L.
 */

/** XP acumulado mínimo para estar no nível `level` (início da faixa). */
export function xpAtStartOfLevel(level: number): number {
  let spent = 0;
  for (let l = 1; l < level; l++) {
    spent += 100 * l;
  }
  return spent;
}

export function bandSizeForLevel(level: number): number {
  return 100 * level;
}

export type TrajectoryStep = {
  level: number;
  xpRequiredTotal: number;
  xpRemainingFrom: number;
  bandXp: number;
  isCurrent: boolean;
};

export function buildTrajectory(xpTotal: number, currentLevel: number, ahead = 14): TrajectoryStep[] {
  const steps: TrajectoryStep[] = [];
  const max = Math.min(currentLevel + ahead, 80);
  for (let L = currentLevel; L <= max; L++) {
    const xpRequiredTotal = xpAtStartOfLevel(L);
    const xpRemainingFrom = Math.max(0, xpRequiredTotal - xpTotal);
    const isCurrent = L === currentLevel;
    steps.push({
      level: L,
      xpRequiredTotal,
      xpRemainingFrom,
      bandXp: bandSizeForLevel(L),
      isCurrent,
    });
  }
  return steps;
}
