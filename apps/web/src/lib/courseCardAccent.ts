import { Database, Server } from 'lucide-react';
import type { CourseVisual } from '../config/trackVisuals';

export type CourseCardAccent = {
  categoryLabel: string;
  iconBox: string;
  iconColor: string;
  labelClass: string;
  trackClass: string;
  fillClass: string;
  pctClass: string;
  /** Cor sólida do blob decorativo (usada no ResumeHero de Meus cursos). */
  blobClass: string;
};

const SLUG_CATEGORY: Record<string, string> = {
  'web-fundamentals': 'Iniciante',
  'css-layout': 'Design System',
  'typescript-fundamentos': 'Intermediário',
  'javascript-moderno': 'Essentials',
  'react-fundamentos': 'Frontend',
  'react-interfaces': 'Frontend',
  'react-formularios-ui': 'UX/UI',
};

const FRONT_PALETTES: Omit<CourseCardAccent, 'categoryLabel'>[] = [
  {
    iconBox: 'from-indigo-100 to-indigo-50',
    iconColor: 'text-indigo-600',
    labelClass: 'text-indigo-500',
    trackClass: 'bg-indigo-50',
    fillClass: 'bg-gradient-to-r from-indigo-500 to-purple-500',
    pctClass: 'text-indigo-600',
    blobClass: 'bg-indigo-200/40',
  },
  {
    iconBox: 'from-purple-100 to-purple-50',
    iconColor: 'text-purple-600',
    labelClass: 'text-purple-500',
    trackClass: 'bg-purple-50',
    fillClass: 'bg-gradient-to-r from-purple-500 to-pink-500',
    pctClass: 'text-purple-600',
    blobClass: 'bg-purple-200/40',
  },
  {
    iconBox: 'from-sky-100 to-sky-50',
    iconColor: 'text-sky-600',
    labelClass: 'text-sky-500',
    trackClass: 'bg-sky-50',
    fillClass: 'bg-gradient-to-r from-sky-500 to-cyan-500',
    pctClass: 'text-sky-600',
    blobClass: 'bg-sky-200/40',
  },
  {
    iconBox: 'from-amber-100 to-amber-50',
    iconColor: 'text-amber-600',
    labelClass: 'text-amber-600',
    trackClass: 'bg-amber-50',
    fillClass: 'bg-gradient-to-r from-amber-500 to-orange-500',
    pctClass: 'text-amber-600',
    blobClass: 'bg-amber-200/40',
  },
  {
    iconBox: 'from-cyan-100 to-cyan-50',
    iconColor: 'text-cyan-600',
    labelClass: 'text-cyan-500',
    trackClass: 'bg-cyan-50',
    fillClass: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    pctClass: 'text-cyan-600',
    blobClass: 'bg-cyan-200/40',
  },
  {
    iconBox: 'from-pink-100 to-pink-50',
    iconColor: 'text-pink-600',
    labelClass: 'text-pink-500',
    trackClass: 'bg-pink-50',
    fillClass: 'bg-gradient-to-r from-pink-500 to-rose-500',
    pctClass: 'text-pink-600',
    blobClass: 'bg-pink-200/40',
  },
];

const BACKEND_PALETTES: Omit<CourseCardAccent, 'categoryLabel'>[] = [
  {
    iconBox: 'from-violet-100 to-violet-50',
    iconColor: 'text-violet-600',
    labelClass: 'text-violet-500',
    trackClass: 'bg-violet-50',
    fillClass: 'bg-gradient-to-r from-violet-500 to-indigo-600',
    pctClass: 'text-violet-600',
    blobClass: 'bg-violet-200/40',
  },
  {
    iconBox: 'from-indigo-100 to-indigo-50',
    iconColor: 'text-indigo-600',
    labelClass: 'text-indigo-500',
    trackClass: 'bg-indigo-50',
    fillClass: 'bg-gradient-to-r from-indigo-500 to-violet-500',
    pctClass: 'text-indigo-600',
    blobClass: 'bg-indigo-200/40',
  },
];

const DADOS_PALETTES: Omit<CourseCardAccent, 'categoryLabel'>[] = [
  {
    iconBox: 'from-emerald-100 to-emerald-50',
    iconColor: 'text-emerald-600',
    labelClass: 'text-emerald-600',
    trackClass: 'bg-emerald-50',
    fillClass: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    pctClass: 'text-emerald-600',
    blobClass: 'bg-emerald-200/40',
  },
  {
    iconBox: 'from-teal-100 to-teal-50',
    iconColor: 'text-teal-600',
    labelClass: 'text-teal-600',
    trackClass: 'bg-teal-50',
    fillClass: 'bg-gradient-to-r from-teal-500 to-cyan-600',
    pctClass: 'text-teal-600',
    blobClass: 'bg-teal-200/40',
  },
];

function hashSlug(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function courseCardAccentFor(slug: string, visual: CourseVisual): CourseCardAccent {
  const categoryLabel =
    SLUG_CATEGORY[slug] ?? (visual.Icon === Server ? 'Backend' : visual.Icon === Database ? 'Dados' : 'Trilha');
  const pool = visual.Icon === Server ? BACKEND_PALETTES : visual.Icon === Database ? DADOS_PALETTES : FRONT_PALETTES;
  const p = pool[hashSlug(slug) % pool.length];
  return { categoryLabel, ...p };
}

/** Agrupamento macro usado nas prateleiras do catálogo e nos chips de filtro. */
export type CourseCategory = 'Frontend' | 'Backend' | 'Dados' | 'Fundamentos';

const FUNDAMENTOS_SLUGS = new Set([
  'algoritmos-logica',
  'complexidade-arrays',
  'strings-mapas',
  'qualidade-testes',
  'testes-piramide',
  'ci-observabilidade',
  'ferramentas',
  'git-essencial',
]);

export function getCourseCategory(slug: string, visual: CourseVisual): CourseCategory {
  if (FUNDAMENTOS_SLUGS.has(slug)) return 'Fundamentos';
  if (visual.Icon === Server) return 'Backend';
  if (visual.Icon === Database) return 'Dados';
  return 'Frontend';
}

/** Ordem estável das categorias no catálogo (mais "aproachável" primeiro). */
export const COURSE_CATEGORY_ORDER: CourseCategory[] = ['Frontend', 'Backend', 'Dados', 'Fundamentos'];
