import type { LucideIcon } from 'lucide-react';
import { Database, LayoutTemplate, Server } from 'lucide-react';

/** Metadados visuais por slug de trilha (ícones, cores, dicas rápidas). Sem gradientes — paleta flat. */
export type TrackVisual = {
  Icon: LucideIcon;
  /** Classes Tailwind para fundo do ícone */
  iconBg: string;
  iconColor: string;
  /** Barra superior em cards de trilha/curso */
  accentBar: string;
  /** Bolinhas das dicas na lista */
  hintDot: string;
  /** Cor da faixa lateral em módulos (detalhe da trilha) — use com border-l-4 */
  accentStripe: string;
  /** Fundo suave opcional para hero / destaques */
  softBg: string;
  hints: string[];
};

const defaultVisual: TrackVisual = {
  Icon: LayoutTemplate,
  iconBg: 'bg-slate-700',
  iconColor: 'text-white',
  accentBar: 'bg-slate-600',
  hintDot: 'bg-slate-500',
  accentStripe: 'border-slate-400',
  softBg: 'bg-slate-50',
  hints: ['Microaulas objetivas', 'Exercícios com feedback na hora', 'Progresso salvo automaticamente'],
};

const map: Record<string, TrackVisual> = {
  frontend: {
    Icon: LayoutTemplate,
    iconBg: 'bg-fuchsia-600',
    iconColor: 'text-white',
    accentBar: 'bg-fuchsia-600',
    hintDot: 'bg-fuchsia-500',
    accentStripe: 'border-fuchsia-600',
    softBg: 'bg-fuchsia-50',
    hints: [
      'HTML semântico e acessível',
      'CSS: layout, cores e responsivo',
      'Prepare-se para frameworks depois',
    ],
  },
  backend: {
    Icon: Server,
    iconBg: 'bg-violet-600',
    iconColor: 'text-white',
    accentBar: 'bg-violet-600',
    hintDot: 'bg-violet-500',
    accentStripe: 'border-violet-600',
    softBg: 'bg-violet-50',
    hints: [
      'Node.js e módulos no servidor',
      'APIs e lógica de negócio',
      'Conexão com banco de dados',
    ],
  },
  dados: {
    Icon: Database,
    iconBg: 'bg-emerald-600',
    iconColor: 'text-white',
    accentBar: 'bg-emerald-600',
    hintDot: 'bg-emerald-500',
    accentStripe: 'border-emerald-600',
    softBg: 'bg-emerald-50',
    hints: [
      'Entidades e relacionamentos',
      'Boas práticas de modelagem',
      'Base para SQL e APIs',
    ],
  },
};

export function getTrackVisual(slug: string): TrackVisual {
  return map[slug] ?? defaultVisual;
}
