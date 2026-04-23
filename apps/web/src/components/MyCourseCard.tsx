import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { BookOpen, CheckCircle2, Clock, Flame, Sparkles, Users } from 'lucide-react';
import type { CourseVisual } from '../config/trackVisuals';
import {
  courseCardAccentFor,
  difficultyLabel,
  formatCourseDuration,
  formatEnrollmentCount,
  getCourseCategory,
} from '../lib/courseCardAccent';
import type { CourseDifficulty } from '../types/catalog';

export type MyCourseCardProps = {
  to: string;
  title: string;
  description: string | null | undefined;
  visual: CourseVisual;
  slug: string;
  progressPct: number;
  difficulty: CourseDifficulty;
  lessonCount: number;
  totalMinutes: number;
  enrollmentCount: number;
  /** Usado para badge "Recém-matriculado" (até 5 dias). */
  enrolledAt?: string | null;
  /** Primeira aula ainda não concluída — usado como "dica da próxima aula". */
  nextLessonTitle?: string | null;
};

type BadgeKind = 'done' | 'almost' | 'fresh' | null;

function resolveBadge(pct: number, enrolledAt?: string | null): BadgeKind {
  if (pct >= 100) return 'done';
  if (pct >= 90) return 'almost';
  if (enrolledAt) {
    const days = (Date.now() - new Date(enrolledAt).getTime()) / (1000 * 60 * 60 * 24);
    if (days <= 5 && pct < 10) return 'fresh';
  }
  return null;
}

/** Anel circular de progresso (SVG inline, sem dependência extra). */
function ProgressRing({ pct, strokeClass }: { pct: number; strokeClass: string }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, pct)) / 100) * c;
  return (
    <svg
      className="absolute inset-0 h-full w-full -rotate-90"
      viewBox="0 0 68 68"
      aria-hidden
    >
      <circle cx="34" cy="34" r={r} strokeWidth="3" className="fill-none stroke-black/[0.06]" />
      <circle
        cx="34"
        cy="34"
        r={r}
        strokeWidth="3"
        strokeLinecap="round"
        className={twMerge('fill-none transition-[stroke-dashoffset] duration-700 ease-out', strokeClass)}
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

export function MyCourseCard({
  to,
  title,
  description,
  visual,
  slug,
  progressPct,
  difficulty,
  lessonCount,
  totalMinutes,
  enrollmentCount,
  enrolledAt,
  nextLessonTitle,
}: MyCourseCardProps) {
  const Icon = visual.Icon;
  const a = courseCardAccentFor(slug, visual);
  const category = getCourseCategory(slug, visual);
  const pct = Math.min(100, Math.max(0, Math.round(progressPct)));
  const empty = pct === 0;
  const badge = resolveBadge(pct, enrolledAt);
  const hasDuration = totalMinutes > 0;

  /** Map da cor da stroke do anel a partir da paleta do curso (derivada do fillClass). */
  const ringStrokeClass = a.fillClass.includes('indigo')
    ? 'stroke-indigo-500'
    : a.fillClass.includes('purple')
      ? 'stroke-purple-500'
      : a.fillClass.includes('sky')
        ? 'stroke-sky-500'
        : a.fillClass.includes('amber')
          ? 'stroke-amber-500'
          : a.fillClass.includes('cyan')
            ? 'stroke-cyan-500'
            : a.fillClass.includes('pink')
              ? 'stroke-pink-500'
              : a.fillClass.includes('violet')
                ? 'stroke-violet-500'
                : a.fillClass.includes('emerald')
                  ? 'stroke-emerald-500'
                  : a.fillClass.includes('teal')
                    ? 'stroke-teal-500'
                    : 'stroke-indigo-500';

  return (
    <Link
      to={to}
      className="group relative flex h-full min-h-[300px] w-full min-w-0 flex-col outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50 focus-visible:ring-offset-2"
    >
      <article
        className={twMerge(
          'shine-sweep relative flex h-full min-h-[300px] flex-1 flex-col overflow-hidden rounded-[24px] border border-white/60 bg-white/85 p-6 shadow-[0_40px_40px_-10px_rgba(30,27,75,0.06)] backdrop-blur-xl transition duration-500 ease-out',
          'hover:-translate-y-2 hover:border-indigo-200/80 hover:bg-white/95 hover:shadow-[0_28px_56px_-24px_rgba(79,70,229,0.22)]',
        )}
      >
        {badge ? (
          <span
            className={twMerge(
              'absolute right-4 top-4 z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wide shadow-sm ring-1',
              badge === 'done' && 'bg-emerald-50 text-emerald-700 ring-emerald-200/70 animate-pop',
              badge === 'almost' && 'bg-amber-50 text-amber-700 ring-amber-200/70 animate-pop',
              badge === 'fresh' && 'bg-indigo-50 text-indigo-700 ring-indigo-200/70 animate-pop',
            )}
          >
            {badge === 'done' && (
              <>
                <CheckCircle2 className="h-3 w-3" aria-hidden />
                Concluído
              </>
            )}
            {badge === 'almost' && (
              <>
                <Flame className="h-3 w-3" aria-hidden />
                Quase lá!
              </>
            )}
            {badge === 'fresh' && (
              <>
                <Sparkles className="h-3 w-3" aria-hidden />
                Novo aqui
              </>
            )}
          </span>
        ) : null}

        <div className="relative mb-5 h-[68px] w-[68px] shrink-0">
          <ProgressRing pct={pct} strokeClass={ringStrokeClass} />
          <div
            className={twMerge(
              'absolute left-1/2 top-1/2 inline-flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm ring-1 ring-black/[0.04] transition duration-500 group-hover:scale-110',
              a.iconBox,
            )}
          >
            <Icon className={twMerge('h-6 w-6', a.iconColor)} strokeWidth={1.75} aria-hidden />
          </div>
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
            {nextLessonTitle && pct < 100 ? (
              <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">
                <span className="font-semibold text-slate-700">Próxima aula:</span> {nextLessonTitle}
              </p>
            ) : description ? (
              <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">{description}</p>
            ) : (
              <p className="line-clamp-2 text-sm leading-relaxed text-slate-400">Sem descrição breve ainda.</p>
            )}
          </div>
        </div>

        <dl
          className="mt-5 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-slate-100 pt-3 text-xs font-medium text-slate-500"
          aria-label="Metadados do curso"
        >
          {hasDuration ? (
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              <dt className="sr-only">Duração total</dt>
              <dd>{formatCourseDuration(totalMinutes)}</dd>
            </div>
          ) : null}
          <div className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5 text-slate-400" aria-hidden />
            <dt className="sr-only">Aulas</dt>
            <dd>{lessonCount} aulas</dd>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-slate-400" aria-hidden />
            <dt className="sr-only">Alunos matriculados</dt>
            <dd>{formatEnrollmentCount(enrollmentCount)} alunos</dd>
          </div>
        </dl>

        <div className="mt-4 shrink-0 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
            <span>Progresso</span>
            <span className={twMerge('tabular-nums', empty ? 'text-slate-400' : a.pctClass)}>{pct}%</span>
          </div>
          <div className={twMerge('h-1 overflow-hidden rounded-full', empty ? 'bg-slate-100' : a.trackClass)}>
            <div
              className={twMerge(
                'relative h-full overflow-hidden rounded-full transition-[width] duration-700 ease-out',
                empty ? 'bg-slate-200' : a.fillClass,
              )}
              style={{ width: `${pct}%` }}
            >
              {!empty && pct < 100 ? <div className="shimmer-line absolute inset-0" aria-hidden /> : null}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
