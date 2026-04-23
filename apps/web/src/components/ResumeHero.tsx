import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { ArrowRight } from 'lucide-react';
import { getCourseVisual } from '../config/trackVisuals';
import { courseCardAccentFor } from '../lib/courseCardAccent';
import type { EnrolledCourse } from '../hooks/useEnrolledCourses';

/**
 * Card primário de "Continue de onde parou" / "Começar agora".
 * Usado no topo de Meus Cursos e na Dashboard como CTA principal do dia.
 */
export function ResumeHero({ course }: { course: EnrolledCourse }) {
  const v = getCourseVisual(course.slug);
  const a = courseCardAccentFor(course.slug, v);
  const Icon = v.Icon;
  const pct = Math.min(100, Math.max(0, Math.round(course.progress.pct)));
  const done = course.progress.completed;
  const total = course.progress.total;
  const label = pct === 0 ? 'Começar' : 'Continuar';

  return (
    <Link
      to={`/app/my-courses/${course.slug}`}
      className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
    >
      <article className="flex flex-col gap-5 rounded-2xl border border-surface-container-high bg-white p-5 shadow-card transition duration-300 ease-ios-out hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elevated sm:flex-row sm:items-center sm:gap-6 sm:p-6">
        <div
          className={twMerge(
            'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br',
            a.iconBox,
          )}
        >
          <Icon className={twMerge('h-6 w-6', a.iconColor)} strokeWidth={1.75} aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
            {pct === 0 ? 'Começar agora' : 'Continue de onde parou'}
          </div>
          <h2 className="font-headline mt-0.5 line-clamp-1 text-lg font-bold text-on-surface sm:text-xl">
            {course.title}
          </h2>
          {course.nextLessonTitle && pct < 100 ? (
            <p className="mt-1 line-clamp-1 text-sm text-on-surface-variant">
              Próxima aula: {course.nextLessonTitle}
            </p>
          ) : null}

          <div className="mt-3 flex items-center gap-3">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-container-low">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
                style={{ width: `${Math.max(pct, 3)}%` }}
              />
            </div>
            <span className="shrink-0 text-xs font-semibold tabular-nums text-on-surface-variant">
              {done}/{total}
            </span>
          </div>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition group-hover:bg-primary-dim sm:self-center">
          {label}
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
      </article>
    </Link>
  );
}
