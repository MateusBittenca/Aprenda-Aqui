import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { CourseVisual } from '../config/trackVisuals';

export type LearningPathCardProps = {
  to: string;
  title: string;
  description?: string | null;
  tagline?: string | null;
  visual: CourseVisual;
  /** Títulos reais das primeiras aulas (evita listas genéricas repetidas) */
  lessonPreview?: string[];
  /** Primeira aula pendente — usado no layout “Meus cursos” premium */
  nextLessonTitle?: string | null;
  progress?: { completed: number; total: number; pct: number };
  footer: { label: string; completed?: boolean };
  /** Layout estilo dashboard premium: halo no ícone, barra fina, próxima aula */
  premiumEnrolled?: boolean;
  /** Modo catálogo: sem barra de progresso / sem bullets automáticos */
  catalog?: {
    moduleCount: number;
    enrolled: boolean;
    canEnroll: boolean;
  };
};

export function LearningPathCard({
  to,
  title,
  description,
  tagline,
  visual,
  lessonPreview,
  nextLessonTitle,
  progress,
  footer,
  premiumEnrolled,
  catalog,
}: LearningPathCardProps) {
  const Icon = visual.Icon;
  const previewItems = lessonPreview?.filter(Boolean).slice(0, 3) ?? [];
  const showLessonPreview = previewItems.length > 0 && !catalog && !premiumEnrolled;
  const showPremiumNext =
    premiumEnrolled &&
    !catalog &&
    nextLessonTitle &&
    !footer.completed &&
    progress &&
    progress.total > 0;

  if (premiumEnrolled && !catalog) {
    return (
      <Link
        to={to}
        className="group relative flex h-full min-h-[300px] flex-col outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40 focus-visible:ring-offset-2"
      >
        <article
          className={twMerge(
            'relative flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-surface-container-lowest transition duration-300 ease-out',
            'border-surface-container-high/90 shadow-[0_1px_0_rgba(15,23,42,0.02),0_14px_44px_-18px_rgba(15,23,42,0.12)]',
            'group-hover:-translate-y-1 group-hover:border-violet-200/70 group-hover:shadow-[0_28px_56px_-28px_rgba(91,33,182,0.18)]',
          )}
        >
          <div className="relative flex min-h-0 flex-1 flex-col p-6 sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div className="relative">
                <div
                  className="absolute inset-0 scale-150 rounded-full bg-violet-400/35 opacity-70 blur-2xl transition duration-500 group-hover:bg-violet-400/45 group-hover:opacity-90"
                  aria-hidden
                />
                <span
                  className={twMerge(
                    'relative inline-flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-2xl shadow-md ring-1 ring-violet-950/5 transition duration-300 group-hover:scale-[1.05]',
                    visual.iconBg,
                    visual.iconColor,
                  )}
                >
                  <Icon className="h-7 w-7" strokeWidth={1.75} aria-hidden />
                </span>
              </div>
              {footer.completed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-100/90">
                  <CheckCircle2 className="h-3 w-3" aria-hidden />
                  Concluído
                </span>
              )}
            </div>

            <h2 className="mt-5 font-headline text-xl font-bold leading-snug tracking-tight text-on-surface">
              {title}
            </h2>
            {description && (
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-on-surface-variant">{description}</p>
            )}

            {progress && progress.total > 0 && (
              <div className="mt-5">
                <div className="mb-1 flex items-baseline justify-between gap-2 text-xs font-semibold">
                  <span className="tabular-nums text-violet-700 dark:text-violet-400">{progress.pct}%</span>
                  <span className="tabular-nums text-on-surface-variant">
                    {progress.completed}/{progress.total} aulas
                  </span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-surface-container-high">
                  <div
                    className="h-full rounded-full bg-violet-500 transition-[width] duration-500 ease-out"
                    style={{ width: `${Math.min(100, progress.pct)}%` }}
                  />
                </div>
              </div>
            )}

            {showPremiumNext && (
              <p className="mt-4 flex gap-2 text-sm leading-snug text-on-surface-variant">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-violet-500" aria-hidden />
                <span>
                  <span className="font-semibold text-on-surface">Próxima aula:</span>{' '}
                  <span>{nextLessonTitle}</span>
                </span>
              </p>
            )}

            <div className="mt-auto pt-6">
              <span
                className={twMerge(
                  'inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-lg transition',
                  footer.completed
                    ? 'bg-surface-container-high text-on-surface ring-2 ring-on-surface/10 ring-offset-0 group-hover:bg-surface-container-highest'
                    : 'bg-primary text-white shadow-primary/25 group-hover:bg-primary-dim',
                )}
              >
                {footer.label}
                <ArrowUpRight className="h-4 w-4 shrink-0 opacity-95 transition group-hover:-translate-y-px group-hover:translate-x-px" aria-hidden />
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link
      to={to}
      className="group relative flex h-full min-h-[280px] flex-col outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:ring-offset-2"
    >
      <article
        className={twMerge(
          'relative flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-surface-container-lowest transition duration-300 ease-out',
          'border-surface-container-high/80 shadow-[0_1px_0_rgba(15,23,42,0.03),0_12px_40px_-16px_rgba(15,23,42,0.14)]',
          'group-hover:-translate-y-1 group-hover:border-surface-container-highest group-hover:shadow-[0_24px_48px_-24px_rgba(15,23,42,0.22)]',
        )}
      >
        <div className={twMerge('h-1 w-full shrink-0', visual.accentBar)} aria-hidden />
        <div
          className={twMerge(
            'pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-[0.06]',
            visual.iconBg,
            'blur-3xl',
          )}
          aria-hidden
        />

        <div className="relative flex min-h-0 flex-1 flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <span
              className={twMerge(
                'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-md ring-1 ring-black/[0.04] transition duration-300 group-hover:scale-[1.04]',
                visual.iconBg,
                visual.iconColor,
              )}
            >
              <Icon className="h-6 w-6" strokeWidth={2} aria-hidden />
            </span>
            <div className="min-w-0 text-right">
              {catalog ? (
                <div className="flex flex-col items-end gap-1">
                  {catalog.enrolled && (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-100/80">
                      Na sua lista
                    </span>
                  )}
                  {!catalog.canEnroll ? (
                    <span className="text-xs font-bold uppercase tracking-wide text-amber-800">Indisponível</span>
                  ) : (
                    <span className="text-xs font-semibold tabular-nums text-on-surface-variant">
                      {catalog.moduleCount} módulo{catalog.moduleCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              ) : progress ? (
                <div className="flex flex-col items-end gap-1">
                  {footer.completed && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-100/80">
                      <CheckCircle2 className="h-3 w-3" aria-hidden />
                      Concluído
                    </span>
                  )}
                  <span className="text-xs font-semibold tabular-nums text-slate-500">
                    {progress.completed}/{progress.total} aulas
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          <h2 className="mt-4 font-headline text-lg font-bold leading-snug tracking-tight text-on-surface sm:text-[1.35rem] sm:leading-tight">
            {title}
          </h2>
          {tagline && (
            <p className="mt-1.5 text-sm font-semibold leading-snug text-on-surface-variant">{tagline}</p>
          )}
          {description && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-on-surface-variant">{description}</p>
          )}

          {!catalog && progress && progress.total > 0 && (
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between gap-2 text-xs font-semibold">
                <span className="text-on-surface-variant">Progresso</span>
                <span className="tabular-nums text-on-surface">{progress.pct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-container-high ring-1 ring-surface-container-high/50">
                <div
                  className={twMerge('h-full rounded-full transition-[width] duration-500 ease-out', visual.accentBar)}
                  style={{ width: `${Math.min(100, progress.pct)}%` }}
                />
              </div>
            </div>
          )}

          {showLessonPreview && (
            <ul className="mt-4 space-y-2.5 border-t border-surface-container-high/50 pt-4">
              {previewItems.map((text) => (
                <li key={text} className="flex gap-2.5 text-sm leading-snug text-on-surface-variant">
                  <span
                    className={twMerge('mt-2 h-1 w-1 shrink-0 rounded-full', visual.hintDot)}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 line-clamp-2">{text}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-auto pt-6">
            <span
              className={twMerge(
                'inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition sm:w-auto sm:justify-start',
                footer.completed
                  ? 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-100 group-hover:bg-emerald-100/80 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800/40'
                  : 'bg-on-surface text-surface shadow-md shadow-on-surface/10 group-hover:bg-on-surface/90',
              )}
            >
              {footer.label}
              <ArrowRight className="h-4 w-4 shrink-0 opacity-90 transition group-hover:translate-x-0.5" aria-hidden />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
