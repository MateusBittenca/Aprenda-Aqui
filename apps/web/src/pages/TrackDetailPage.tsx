import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flame,
  Layers,
  Lock,
  Sparkles,
} from 'lucide-react';
import { apiFetch, ApiError } from '../lib/api';
import { courseAccessible } from '../lib/courseAccess';
import { useAuthHydration, useAuthStore } from '../stores/authStore';
import type { TrackDetail } from '../types/catalog';
import { getTrackVisual } from '../config/trackVisuals';
import { ErrorState } from '../components/ui/ErrorState';
import { PageLoader } from '../components/ui/PageLoader';
import { useProgress } from '../hooks/useProgress';

export function TrackDetailPage() {
  const { trackId } = useParams<{ trackId: string }>();
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?.id);
  const hydrated = useAuthHydration();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['me', userId ?? '', 'track', trackId],
    queryFn: () => apiFetch<TrackDetail>(`/me/tracks/${trackId}`, { token: token! }),
    enabled: !!trackId && hydrated && !!token && !!userId,
  });

  const { completedLessonIds } = useProgress();

  if (!trackId) return null;
  if (!hydrated || isLoading) return <PageLoader label="Carregando trilha…" />;

  if (isError) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <ErrorState
        title={notFound ? 'Trilha indisponível.' : 'Não foi possível carregar a trilha.'}
        error={error}
        hint={
          notFound ? (
            <p>
              Matricule-se na trilha pelo catálogo em{' '}
              <Link to="/app/tracks" className="font-semibold text-blue-600 underline-offset-4 hover:underline">
                Trilhas
              </Link>{' '}
              para ver o conteúdo aqui.
            </p>
          ) : undefined
        }
      />
    );
  }

  if (!data) return null;

  const visual = getTrackVisual(data.slug);
  const TrackIcon = visual.Icon;

  const progressLessons = data.courses
    .filter((c) => courseAccessible(c))
    .flatMap((c) => c.modules.flatMap((m) => m.lessons));
  const allLessons = data.courses.flatMap((c) => c.modules.flatMap((m) => m.lessons));
  const completedCount = progressLessons.filter((l) => completedLessonIds.has(l.id)).length;
  const totalLessons = progressLessons.length;
  const trackPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const totalCourses = data.courses.length;

  return (
    <div className="space-y-12">
      <section
        className={`relative overflow-hidden rounded-[2rem] border border-slate-200/80 shadow-2xl shadow-slate-900/10 ${visual.softBg}`}
      >
        <div className="absolute -right-20 top-0 h-64 w-64 rounded-full bg-amber-400/12 blur-3xl" />
        <div className="relative border-b border-slate-900/5 bg-white/90 px-5 py-6 backdrop-blur-sm sm:px-8 sm:py-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-4 sm:gap-6">
              <div
                className={`relative flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-2xl border-2 border-slate-900/10 shadow-xl sm:h-[5.5rem] sm:w-[5.5rem] ${visual.iconBg} ${visual.iconColor}`}
              >
                <TrackIcon className="h-10 w-10 sm:h-12 sm:w-12" strokeWidth={2} aria-hidden />
                <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-orange-500 shadow-md">
                  <Flame className="h-3.5 w-3.5 text-white" aria-hidden />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden />
                  Modo estudo
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-[2.35rem] md:leading-tight">
                  {data.title}
                </h1>
                {data.tagline && (
                  <p className="mt-2 text-lg font-semibold text-indigo-700 sm:text-xl">{data.tagline}</p>
                )}
                {data.description && (
                  <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-slate-600">{data.description}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 lg:max-w-md lg:justify-end">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm">
                <Layers className="h-3.5 w-3.5 text-indigo-500" aria-hidden />
                {totalCourses} curso{totalCourses !== 1 ? 's' : ''}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm">
                <Clock className="h-3.5 w-3.5 text-violet-500" aria-hidden />
                {allLessons.length} aula{allLessons.length !== 1 ? 's' : ''}
                {allLessons.length !== totalLessons && (
                  <span className="ml-1 font-normal text-slate-500">({totalLessons} no seu plano)</span>
                )}
              </span>
              {token && totalLessons > 0 && (
                <span className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-black text-indigo-900 shadow-sm">
                  {trackPct}% concluído
                </span>
              )}
            </div>
          </div>
        </div>

        {token && totalLessons > 0 && (
          <div className="relative px-5 py-6 sm:px-8 sm:py-7">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">Sua jornada</p>
                <p className="text-xs text-slate-500">
                  Progresso nas aulas incluídas na sua matrícula gratuita.
                </p>
              </div>
              <p className="text-sm font-black tabular-nums text-slate-900">
                {completedCount}/{totalLessons} aulas
              </p>
            </div>
            <div className="h-5 overflow-hidden rounded-full bg-slate-200/80 ring-1 ring-slate-200/60">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-700 ease-out"
                style={{ width: `${trackPct}%` }}
              />
            </div>
            {trackPct === 100 && (
              <p className="mt-4 flex items-center gap-2 text-sm font-bold text-emerald-700">
                <span className="text-lg">🎉</span> Trilha concluída — mandou muito bem!
              </p>
            )}
          </div>
        )}
      </section>

      {data.courses.map((course, courseIdx) => (
        <section
          key={course.id}
          className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-50 p-1 shadow-xl shadow-slate-200/40"
        >
          <div className={`absolute left-0 top-0 h-full w-1.5 rounded-l-3xl ${visual.accentBar}`} />
          <div className="rounded-[1.35rem] bg-white/95 px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <div>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Curso {courseIdx + 1}
                </span>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900 sm:text-2xl">{course.title}</h2>
                  {course.isFree ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                      Incluído na matrícula
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">
                      Conteúdo adicional
                    </span>
                  )}
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                <BookOpen className="h-3 w-3" aria-hidden />
                Conteúdo
              </span>
            </div>
            {course.description && (
              <p className="mt-3 max-w-prose text-sm leading-relaxed text-slate-600">{course.description}</p>
            )}

            <div className="mt-8 space-y-10">
              {course.modules.map((mod, modIdx) => (
                <div key={mod.id}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xs font-black text-white shadow-md">
                      {modIdx + 1}
                    </span>
                    <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-600">{mod.title}</h3>
                  </div>
                  <ul className="mt-4 space-y-3">
                    {mod.lessons.map((lesson) => {
                      const canOpen = courseAccessible(course);
                      const done = canOpen && completedLessonIds.has(lesson.id);
                      const rowInner = (
                        <>
                          <span className="flex min-w-0 items-center gap-3">
                            {!canOpen ? (
                              <Lock className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
                            ) : done ? (
                              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
                            ) : (
                              <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-slate-300 bg-white ${visual.accentBar}`}
                                aria-hidden
                              />
                            )}
                            <span
                              className={
                                done ? 'font-semibold text-emerald-950' : 'font-semibold text-slate-900'
                              }
                            >
                              {lesson.title}
                            </span>
                          </span>
                          <span className="flex shrink-0 flex-wrap items-center justify-end gap-2 text-xs text-slate-500 sm:gap-3">
                            {lesson._count.exercises > 0 && (
                              <span className="rounded-lg bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                                {lesson._count.exercises} ex.
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 font-medium">
                              <Clock className="h-3.5 w-3.5" aria-hidden />
                              {lesson.estimatedMinutes} min
                            </span>
                            {canOpen ? (
                              <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-500" />
                            ) : null}
                          </span>
                        </>
                      );
                      return (
                        <li key={lesson.id}>
                          {canOpen ? (
                            <Link
                              to={`/app/lessons/${lesson.id}`}
                              className={[
                                'group flex items-center justify-between gap-3 rounded-2xl border px-4 py-4 text-left transition',
                                done
                                  ? 'border-emerald-200 bg-emerald-50/90 hover:border-emerald-300'
                                  : 'border-slate-200/80 bg-white shadow-sm hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md',
                              ].join(' ')}
                            >
                              {rowInner}
                            </Link>
                          ) : (
                            <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/90 px-4 py-4 text-slate-500">
                              {rowInner}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
