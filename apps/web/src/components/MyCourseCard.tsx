import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import type { CourseVisual } from '../config/trackVisuals';
import { courseCardAccentFor } from '../lib/courseCardAccent';

export type MyCourseCardProps = {
  to: string;
  title: string;
  description: string | null | undefined;
  visual: CourseVisual;
  slug: string;
  progressPct: number;
};

export function MyCourseCard({ to, title, description, visual, slug, progressPct }: MyCourseCardProps) {
  const Icon = visual.Icon;
  const a = courseCardAccentFor(slug, visual);
  const pct = Math.min(100, Math.max(0, Math.round(progressPct)));
  const empty = pct === 0;

  return (
    <Link
      to={to}
      className="group relative flex h-full min-h-[280px] flex-col outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50 focus-visible:ring-offset-2"
    >
      <article
        className={twMerge(
          'flex h-full flex-1 flex-col rounded-[24px] border border-white/60 bg-white/85 p-6 shadow-[0_40px_40px_-10px_rgba(30,27,75,0.06)] backdrop-blur-xl transition duration-500 ease-out',
          'hover:-translate-y-2 hover:border-indigo-200/80 hover:bg-white/95 hover:shadow-[0_28px_56px_-24px_rgba(79,70,229,0.22)]',
        )}
      >
        <div
          className={twMerge(
            'mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm ring-1 ring-black/[0.04] transition duration-500 group-hover:scale-110',
            a.iconBox,
          )}
        >
          <Icon className={twMerge('h-7 w-7', a.iconColor)} strokeWidth={1.75} aria-hidden />
        </div>
        <span className={twMerge('mb-2 block text-xs font-semibold uppercase tracking-[0.05em]', a.labelClass)}>
          {a.categoryLabel}
        </span>
        <h2 className="font-headline text-xl font-bold leading-snug tracking-tight text-indigo-950">{title}</h2>
        {description ? (
          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-500">{description}</p>
        ) : (
          <p className="mt-2 flex-1 text-sm text-slate-400">Sem descrição breve ainda.</p>
        )}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
            <span>Progresso</span>
            <span className={twMerge('tabular-nums', empty ? 'text-slate-400' : a.pctClass)}>{pct}%</span>
          </div>
          <div className={twMerge('h-1 overflow-hidden rounded-full', empty ? 'bg-slate-100' : a.trackClass)}>
            <div
              className={twMerge(
                'h-full rounded-full transition-[width] duration-700 ease-out',
                empty ? 'bg-slate-200' : a.fillClass,
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </article>
    </Link>
  );
}
