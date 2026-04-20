import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, Code2, GraduationCap, Layers, Map, Sparkles } from 'lucide-react';
import type { EnrolledCourseDetail } from '../types/catalog';
import type { CourseVisual } from '../config/trackVisuals';

function findNextLessonId(modules: EnrolledCourseDetail['modules'], completed: Set<string>): string | null {
  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      if (!completed.has(lesson.id)) return lesson.id;
    }
  }
  return null;
}

function firstLessonId(data: EnrolledCourseDetail): string | null {
  const first = data.modules[0]?.lessons[0];
  return first?.id ?? null;
}

function formatMinutes(m: number): string {
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const r = m % 60;
    return r > 0 ? `${h} h ${r} min` : `${h} h`;
  }
  return `${m} min`;
}

type Props = {
  data: EnrolledCourseDetail;
  visual: CourseVisual;
  heroImage: string | null;
  completedCount: number;
  totalLessons: number;
  coursePct: number;
  completedLessonIds: Set<string>;
  /** Segundo botão (ex.: abrir rota Meus cursos) */
  secondaryAction?: { to: string; label: string };
};

export function EnrolledCourseHero({
  data,
  visual,
  heroImage,
  completedCount,
  totalLessons,
  coursePct,
  completedLessonIds,
  secondaryAction,
}: Props) {
  const CourseIcon = visual.Icon;
  const stats = data.stats ?? { lessonCount: 0, totalMinutes: 0, exerciseCount: 0 };
  const nextId = findNextLessonId(data.modules, completedLessonIds);
  const firstId = firstLessonId(data);
  const primaryLessonId = nextId ?? firstId;
  const primaryTo = primaryLessonId ? `/app/lessons/${primaryLessonId}` : '/app/my-courses';
  const primaryLabel =
    nextId != null
      ? 'Continuar de onde parei'
      : coursePct >= 100
        ? 'Revisar curso'
        : 'Começar primeira aula';

  return (
    <section className="relative">
      <div
        className={[
          'relative overflow-hidden rounded-[32px] border border-white/60 bg-white/85 shadow-[0_25px_60px_-20px_rgba(30,27,75,0.14)] backdrop-blur-xl',
          'p-6 md:p-10 lg:p-12',
        ].join(' ')}
      >
        {heroImage ? (
          <div
            className="pointer-events-none absolute right-0 top-0 hidden h-full w-2/5 opacity-[0.08] lg:block"
            aria-hidden
          >
            <img src={heroImage} alt="" className="h-full w-full object-cover" />
          </div>
        ) : null}

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          <div className="min-w-0 flex-1">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-indigo-900">
              <GraduationCap className="h-4 w-4 text-indigo-600" aria-hidden />
              Curso em andamento
            </div>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div
                className={[
                  'flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 shadow-md sm:h-[4.5rem] sm:w-[4.5rem]',
                  visual.iconBg,
                  visual.iconColor,
                ].join(' ')}
              >
                <CourseIcon className="h-8 w-8 sm:h-10 sm:w-10" strokeWidth={2} aria-hidden />
              </div>
              <div className="min-w-0">
                <h1 className="font-headline text-3xl font-extrabold tracking-tight text-indigo-950 sm:text-4xl md:text-[2.6rem] md:leading-tight">
                  {data.title}
                </h1>
                {data.tagline ? (
                  <p className="mt-2 text-lg font-semibold text-indigo-700 sm:text-xl">{data.tagline}</p>
                ) : null}
                {data.description ? (
                  <p className="mt-3 max-w-2xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
                    {data.description}
                  </p>
                ) : null}
              </div>
            </div>

            {totalLessons > 0 ? (
              <div className="mt-8 max-w-xl">
                <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Seu progresso</p>
                    <p className="text-xs text-slate-500">Aulas concluídas neste curso.</p>
                  </div>
                  <p className="text-sm font-bold tabular-nums text-indigo-950">
                    {completedCount}/{totalLessons} · {coursePct}%
                  </p>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200/90 ring-1 ring-slate-200/60">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all duration-700 ease-out"
                    style={{ width: `${coursePct}%` }}
                  />
                </div>
                {coursePct >= 100 ? (
                  <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                    <Sparkles className="h-4 w-4" aria-hidden />
                    Curso concluído — parabéns!
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to={primaryTo}
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-slate-900/20 transition hover:bg-slate-800 active:scale-[0.98]"
              >
                {primaryLabel}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
              </Link>
              {secondaryAction ? (
                <Link
                  to={secondaryAction.to}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-indigo-200/90 bg-white/90 px-6 py-4 text-sm font-bold text-indigo-800 shadow-sm transition hover:border-indigo-300 hover:bg-white"
                >
                  <Map className="h-4 w-4" aria-hidden />
                  {secondaryAction.label}
                </Link>
              ) : (
                <Link
                  to="/app/courses"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/90 bg-white/90 px-6 py-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-white"
                >
                  Explorar catálogo
                </Link>
              )}
            </div>
          </div>

          <div className="grid w-full shrink-0 grid-cols-2 gap-3 sm:max-w-md lg:w-72">
            <div className="rounded-2xl border border-white/60 bg-white/70 p-4 text-center shadow-sm backdrop-blur-md">
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                <BookOpen className="h-4 w-4" aria-hidden />
              </div>
              <p className="font-headline text-lg font-bold tabular-nums text-indigo-950">{stats.lessonCount}</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Aulas</p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/70 p-4 text-center shadow-sm backdrop-blur-md">
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <Clock className="h-4 w-4" aria-hidden />
              </div>
              <p className="font-headline text-base font-bold leading-tight text-indigo-950">
                {formatMinutes(stats.totalMinutes)}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Carga</p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/70 p-4 text-center shadow-sm backdrop-blur-md">
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <Layers className="h-4 w-4" aria-hidden />
              </div>
              <p className="font-headline text-lg font-bold tabular-nums text-indigo-950">{data.modules.length}</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Módulos</p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/70 p-4 text-center shadow-sm backdrop-blur-md">
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <Code2 className="h-4 w-4" aria-hidden />
              </div>
              <p className="font-headline text-lg font-bold tabular-nums text-indigo-950">{stats.exerciseCount}</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Exercícios</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
