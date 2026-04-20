/** Nível começa em 1. Para avançar do nível L para L+1 é necessário 100*L XP acumulados na faixa. */
export function levelFromTotalXp(xpTotal: number): number {
  let level = 1;
  let spent = 0;
  while (xpTotal >= spent + 100 * level) {
    spent += 100 * level;
    level++;
  }
  return level;
}

export function xpToNextLevel(xpTotal: number): {
  level: number;
  currentBandXp: number;
  bandSize: number;
} {
  const level = levelFromTotalXp(xpTotal);
  let spent = 0;
  for (let l = 1; l < level; l++) {
    spent += 100 * l;
  }
  const bandSize = 100 * level;
  const currentBandXp = xpTotal - spent;
  return { level, currentBandXp, bandSize };
}
