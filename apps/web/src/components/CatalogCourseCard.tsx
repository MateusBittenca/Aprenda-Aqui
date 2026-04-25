import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { BookmarkCheck, BookOpen, Clock, Lock, Users } from 'lucide-react';
import type { CourseVisual } from '../config/trackVisuals';
import {
  courseCardAccentFor,
  difficultyLabel,
  formatCourseDuration,
  formatEnrollmentCount,
  getCourseCategory,
} from '../lib/courseCardAccent';
import type { CourseDifficulty } from '../types/catalog';

export type CatalogCourseCardProps = {
  to: string;
  slug: string;
  title: string;
  description: string | null | undefined;
  tagline: string | null | undefined;
  visual: CourseVisual;
  difficulty: CourseDifficulty;
  /** Total de aulas (preferencial). Fallback para `moduleCount` quando ausente. */
  lessonCount?: number;
  totalMinutes?: number;
  enrollmentCount: number;
  moduleCount: number;
  enrolled: boolean;
  canEnroll: boolean;
  /** Quando em prateleira horizontal, forçamos largura fixa via classe utilitária. */
  shelfWidthClass?: string;
};

export function CatalogCourseCard({
  to,
  slug,
  title,
  description,
  tagline,
  visual,
  difficulty,
  lessonCount,
  totalMinutes,
  enrollmentCount,
  moduleCount,
  enrolled,
  canEnroll,
  shelfWidthClass,
}: CatalogCourseCardProps) {
  const Icon = visual.Icon;
  const a = courseCardAccentFor(slug, visual);
  const category = getCourseCategory(slug, visual);
  const blurb = description ?? tagline;
  const hasDuration = typeof totalMinutes === 'number' && totalMinutes > 0;
  const lessonOrModuleLabel = lessonCount ? `${lessonCount} aulas` : `${moduleCount} mód.`;

  return (
    <Link
      to={to}
      className={twMerge(
        'group relative flex h-full min-h-[300px] w-full min-w-0 flex-col outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50 focus-visible:ring-offset-2',
        shelfWidthClass,
      )}
    >
      <article
        className={twMerge(
          /* translateY no GPU; sombra em propriedade separada reduz reflow em mobile */
          'shine-sweep relative flex h-full min-h-[300px] flex-1 flex-col overflow-hidden rounded-[24px] border border-surface-container-high/70 bg-surface-container-lowest/90 p-6 shadow-[0_40px_40px_-10px_rgba(30,27,75,0.06)] backdrop-blur-xl transition-[transform,box-shadow] duration-500 ease-out motion-reduce:transform-none motion-reduce:transition-none',
          'hover:-translate-y-2 hover:border-primary/30 hover:bg-surface-container-lowest hover:shadow-[0_28px_56px_-24px_rgba(79,70,229,0.22)]',
        )}
      >
        {enrolled ? (
          <span className="animate-pop absolute right-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wide text-emerald-700 shadow-sm ring-1 ring-emerald-200/70">
            <BookmarkCheck className="h-3 w-3" aria-hidden />
            Na sua lista
          </span>
        ) : !canEnroll ? (
          <span className="absolute right-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wide text-amber-700 shadow-sm ring-1 ring-amber-200/70">
            <Lock className="h-3 w-3" aria-hidden />
            Premium
          </span>
        ) : null}

        <div
          className={twMerge(
            'mb-5 inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm ring-1 ring-black/[0.04] transition duration-500 group-hover:scale-110',
            a.iconBox,
          )}
        >
          <Icon className={twMerge('h-7 w-7', a.iconColor)} strokeWidth={1.75} aria-hidden />
        </div>
        <span
          className={twMerge(
            'mb-2 block shrink-0 text-xs font-semibold uppercase tracking-[0.05em]',
            a.labelClass,
          )}
        >
          {category} · {difficultyLabel(difficulty)}
        </span>
        <div className="flex min-h-0 flex-1 flex-col">
          <h2 className="font-headline line-clamp-2 min-h-[3.25rem] text-xl font-bold leading-snug tracking-tight text-indigo-950">
            {title}
          </h2>
          <div className="mt-2 min-h-[2.875rem] flex-1">
            {blurb ? (
              <p className="line-clamp-2 text-sm leading-relaxed text-on-surface-variant">{blurb}</p>
            ) : (
              <p className="line-clamp-2 text-sm leading-relaxed text-on-surface-variant">Sem descrição breve ainda.</p>
            )}
          </div>
        </div>
        <dl
          className="mt-5 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-surface-container-high/60 pt-3 text-xs font-medium text-on-surface-variant"
          aria-label="Metadados do curso"
        >
          {hasDuration ? (
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-on-surface-variant" aria-hidden />
              <dt className="sr-only">Duração total</dt>
              <dd>{formatCourseDuration(totalMinutes as number)}</dd>
            </div>
          ) : null}
          <div className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5 text-on-surface-variant" aria-hidden />
            <dt className="sr-only">Aulas ou módulos</dt>
            <dd>{lessonOrModuleLabel}</dd>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-on-surface-variant" aria-hidden />
            <dt className="sr-only">Alunos matriculados</dt>
            <dd>{formatEnrollmentCount(enrollmentCount)} alunos</dd>
          </div>
        </dl>
      </article>
    </Link>
  );
}
