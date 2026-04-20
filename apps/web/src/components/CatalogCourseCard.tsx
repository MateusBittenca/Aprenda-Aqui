import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import type { CourseVisual } from '../config/trackVisuals';
import { courseCardAccentFor } from '../lib/courseCardAccent';

export type CatalogCourseCardProps = {
  to: string;
  slug: string;
  title: string;
  description: string | null | undefined;
  tagline: string | null | undefined;
  visual: CourseVisual;
  moduleCount: number;
  enrolled: boolean;
  canEnroll: boolean;
};

export function CatalogCourseCard({
  to,
  slug,
  title,
  description,
  tagline,
  visual,
  moduleCount,
  enrolled,
  canEnroll,
}: CatalogCourseCardProps) {
  const Icon = visual.Icon;
  const a = courseCardAccentFor(slug, visual);
  const blurb = description ?? tagline;
  const barPct = enrolled ? 100 : 0;

  const statusRight = !canEnroll
    ? 'Indisponível'
    : enrolled
      ? `${moduleCount} mód. · Na lista`
      : `${moduleCount} mód.`;

  const statusClass = !canEnroll ? 'text-amber-600' : enrolled ? 'text-emerald-600' : a.pctClass;

  return (
    <Link
      to={to}
      className="group relative flex h-full min-h-[300px] w-full min-w-0 flex-col outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50 focus-visible:ring-offset-2"
    >
      <article
        className={twMerge(
          /* translateY no GPU; sombra em propriedade separada reduz reflow em mobile */
          'flex h-full min-h-[300px] flex-1 flex-col rounded-[24px] border border-white/60 bg-white/85 p-6 shadow-[0_40px_40px_-10px_rgba(30,27,75,0.06)] backdrop-blur-xl transition-[transform,box-shadow] duration-500 ease-out motion-reduce:transform-none motion-reduce:transition-none',
          'hover:-translate-y-2 hover:border-indigo-200/80 hover:bg-white/95 hover:shadow-[0_28px_56px_-24px_rgba(79,70,229,0.22)]',
        )}
      >
        <div
          className={twMerge(
            'mb-5 inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm ring-1 ring-black/[0.04] transition duration-500 group-hover:scale-110',
            a.iconBox,
          )}
        >
          <Icon className={twMerge('h-7 w-7', a.iconColor)} strokeWidth={1.75} aria-hidden />
        </div>
        <span className={twMerge('mb-2 block shrink-0 text-xs font-semibold uppercase tracking-[0.05em]', a.labelClass)}>
          {a.categoryLabel}
        </span>
        <div className="flex min-h-0 flex-1 flex-col">
          <h2 className="font-headline line-clamp-2 min-h-[3.25rem] text-xl font-bold leading-snug tracking-tight text-indigo-950">
            {title}
          </h2>
          <div className="mt-2 min-h-[2.875rem] flex-1">
            {blurb ? (
              <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">{blurb}</p>
            ) : (
              <p className="line-clamp-2 text-sm leading-relaxed text-slate-400">Sem descrição breve ainda.</p>
            )}
          </div>
        </div>
        <div className="mt-6 shrink-0 space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <span>Matrícula</span>
            <span className={twMerge('min-w-0 text-right normal-case tracking-normal', statusClass)}>{statusRight}</span>
          </div>
          <div className={twMerge('h-1 overflow-hidden rounded-full', barPct === 0 ? 'bg-slate-100' : a.trackClass)}>
            <div
              className={twMerge(
                'h-full rounded-full transition-[width] duration-700 ease-out',
                barPct === 0 ? 'bg-slate-200' : a.fillClass,
              )}
              style={{ width: `${barPct}%` }}
            />
          </div>
        </div>
      </article>
    </Link>
  );
}
