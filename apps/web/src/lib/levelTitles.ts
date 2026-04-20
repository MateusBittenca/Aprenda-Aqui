/**
 * Faixa de 5 níveis por título (níveis 1–5 → tier 0, 6–10 → tier 1, …).
 */

export type LevelRank = {
  /** Nome curto exibido como subtítulo (ex.: Pleno, Senior). */
  name: string;
  /** Uma linha de contexto. */
  description: string;
  /** Primeiro nível desta faixa. */
  fromLevel: number;
  /** Último nível desta faixa. */
  toLevel: number;
};

const RANKS: LevelRank[] = [
  { fromLevel: 1, toLevel: 5, name: 'Explorador', description: 'Primeiros passos na plataforma.' },
  { fromLevel: 6, toLevel: 10, name: 'Iniciante', description: 'Base e constância no aprendizado.' },
  { fromLevel: 11, toLevel: 15, name: 'Intermediário', description: 'Aprofundando conceitos e prática.' },
  { fromLevel: 16, toLevel: 20, name: 'Avançado', description: 'Desafios maiores e ritmo sólido.' },
  { fromLevel: 21, toLevel: 25, name: 'Pleno', description: 'Domínio consistente do conteúdo.' },
  { fromLevel: 26, toLevel: 30, name: 'Especialista', description: 'Profundidade e versatilidade.' },
  { fromLevel: 31, toLevel: 35, name: 'Senior', description: 'Visão ampla e decisões técnicas.' },
  { fromLevel: 36, toLevel: 40, name: 'Arquiteto', description: 'Estrutura, padrões e organização.' },
  { fromLevel: 41, toLevel: 45, name: 'Mentor', description: 'Referência para quem aprende junto.' },
  { fromLevel: 46, toLevel: 50, name: 'Mestre', description: 'Excelência e maestria no percurso.' },
  { fromLevel: 51, toLevel: 999, name: 'Lendário', description: 'Acima do esperado — jornada épica.' },
];

export function getRankForLevel(level: number): LevelRank {
  const safe = Math.max(1, level);
  const found = RANKS.find((r) => safe >= r.fromLevel && safe <= r.toLevel);
  return found ?? RANKS[RANKS.length - 1];
}

/** Próximo nível em que o título muda (ou null se já no último tier conhecido). */
export function getNextRankThreshold(level: number): { level: number; name: string } | null {
  const rank = getRankForLevel(level);
  if (rank.toLevel >= 999) return null;
  const next = RANKS.find((r) => r.fromLevel === rank.toLevel + 1);
  if (!next) return null;
  return { level: next.fromLevel, name: next.name };
}
