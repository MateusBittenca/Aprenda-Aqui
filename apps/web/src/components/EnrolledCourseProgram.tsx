import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, ChevronDown, ChevronRight, ClipboardList, Clock, Library } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { ModuleDetail } from '../types/catalog';
import type { CourseVisual } from '../config/trackVisuals';

function findNextLessonId(modules: ModuleDetail[], completed: Set<string>): string | null {
  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      if (!completed.has(lesson.id)) return lesson.id;
    }
  }
  return null;
}

function initialOpenModuleId(modules: ModuleDetail[], completed: Set<string>): string | null {
  const next = findNextLessonId(modules, completed);
  if (next) {
    for (const mod of modules) {
      if (mod.lessons.some((l) => l.id === next)) return mod.id;
    }
  }
  return modules[0]?.id ?? null;
}

type Props = {
  modules: ModuleDetail[];
  completedLessonIds: Set<string>;
  visual: CourseVisual;
};

export function EnrolledCourseProgram({ modules, completedLessonIds, visual }: Props) {
  const { hash } = useLocation();
  const hashModuleId = useMemo(() => {
    if (hash.startsWith('#module-')) {
      try {
        return decodeURIComponent(hash.slice('#module-'.length));
      } catch {
        return hash.slice('#module-'.length);
      }
    }
    return null;
  }, [hash]);

  const nextLessonId = useMemo(
    () => findNextLessonId(modules, completedLessonIds),
    [modules, completedLessonIds],
  );

  const [openId, setOpenId] = useState<string | null>(() =>
    initialOpenModuleId(modules, completedLessonIds),
  );

  useEffect(() => {
    if (!hashModuleId || !modules.some((m) => m.id === hashModuleId)) return;
    const tOpen = window.setTimeout(() => setOpenId(hashModuleId), 0);
    const tScroll = window.setTimeout(() => {
      document.getElementById(`module-${hashModuleId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    return () => {
      window.clearTimeout(tOpen);
      window.clearTimeout(tScroll);
    };
  }, [hashModuleId, modules]);

  return (
    <div className="space-y-4">
      <div className="px-1">
        <h2 className="font-headline text-2xl font-bold tracking-tight text-indigo-950">Programa do curso</h2>
        <p className="mt-1 text-sm text-slate-500">Toque em uma aula para estudar. Seu progresso é salvo automaticamente.</p>
      </div>
      <div className="space-y-3">
        {modules.map((mod, idx) => {
          const open = openId === mod.id;
          const doneInModule = mod.lessons.filter((l) => completedLessonIds.has(l.id)).length;
          const totalInModule = mod.lessons.length;
          const modulePct =
            totalInModule > 0 ? Math.round((doneInModule / totalInModule) * 100) : 0;
          const minutesInModule = mod.lessons.reduce((acc, l) => acc + l.estimatedMinutes, 0);
          const resumeInModule = mod.lessons.find((l) => !completedLessonIds.has(l.id));
          return (
            <div
              key={mod.id}
              id={`module-${mod.id}`}
              className="scroll-mt-28 overflow-hidden rounded-[24px] border border-white/60 bg-white/80 shadow-[0_20px_50px_-24px_rgba(30,27,75,0.12)] backdrop-blur-xl"
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : mod.id)}
                className="flex w-full items-center justify-between gap-4 bg-gradient-to-r from-slate-50/98 to-indigo-50/40 p-5 text-left transition hover:from-slate-50 hover:to-indigo-50/60"
                aria-expanded={open}
                aria-controls={`module-panel-${mod.id}`}
              >
                <div className="min-w-0">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                    Módulo {idx + 1}
                  </span>
                  <h3 className="mt-1 font-headline text-lg font-bold uppercase tracking-tight text-indigo-950">
                    {mod.title}
                  </h3>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {doneInModule}/{totalInModule} aulas concluídas
                    {minutesInModule > 0 ? ` · ~${minutesInModule} min no módulo` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {modulePct === 100 ? (
                    <span className="hidden rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800 sm:inline">
                      Módulo feito
                    </span>
                  ) : null}
                  <ChevronDown
                    className={twMerge(
                      'h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300',
                      open && 'rotate-180',
                    )}
                    aria-hidden
                  />
                </div>
              </button>
              {open ? (
                <div
                  id={`module-panel-${mod.id}`}
                  className="border-t border-slate-200/60 bg-white/40"
                  role="region"
                  aria-label={`Aulas do módulo ${mod.title}`}
                >
                  <div className="border-b border-slate-100/90 bg-gradient-to-b from-white/90 to-slate-50/30 px-5 py-4 sm:px-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200/60">
                          <Library className="h-5 w-5" aria-hidden />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">Conteúdo deste módulo</p>
                          <p className="text-xs text-slate-500">
                            {totalInModule} aula{totalInModule !== 1 ? 's' : ''}
                            {mod.lessons.some((l) => l._count.exercises > 0)
                              ? ' · com exercícios práticos'
                              : ''}
                          </p>
                        </div>
                      </div>
                      {resumeInModule ? (
                        <Link
                          to={`/app/lessons/${resumeInModule.id}`}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-slate-800 sm:shrink-0"
                        >
                          Continuar módulo
                          <ChevronRight className="h-4 w-4" aria-hidden />
                        </Link>
                      ) : modulePct === 100 ? (
                        <span className="text-xs font-semibold text-emerald-700">Todas as aulas deste módulo concluídas.</span>
                      ) : null}
                    </div>
                    <div className="mt-4">
                      <div className="mb-1 flex justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
                        <span>Progresso no módulo</span>
                        <span className="tabular-nums text-indigo-700">{modulePct}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/90">
                        <div
                          className={twMerge(
                            'h-full rounded-full bg-gradient-to-r transition-all duration-500',
                            modulePct === 100
                              ? 'from-emerald-500 to-teal-500'
                              : 'from-indigo-500 to-violet-500',
                          )}
                          style={{ width: `${modulePct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <ul className="divide-y divide-slate-200/80">
                  {mod.lessons.map((lesson) => {
                    const done = completedLessonIds.has(lesson.id);
                    const isNext = !done && lesson.id === nextLessonId;
                    return (
                      <li key={lesson.id}>
                        <Link
                          to={`/app/lessons/${lesson.id}`}
                          className={twMerge(
                            'group flex flex-col gap-4 p-5 transition-colors hover:bg-white/70 md:flex-row md:items-center md:justify-between',
                            done && 'bg-emerald-50/50',
                            isNext && 'bg-indigo-50/70 ring-2 ring-inset ring-indigo-300/50',
                          )}
                        >
                          <div className="flex min-w-0 items-start gap-4">
                            <div
                              className={twMerge(
                                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ring-slate-200/80',
                                done ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-slate-500',
                                isNext && 'bg-indigo-100 text-indigo-700 ring-indigo-200',
                              )}
                            >
                              {done ? (
                                <CheckCircle2 className="h-6 w-6" aria-hidden />
                              ) : (
                                <span
                                  className={twMerge(
                                    'flex h-6 w-6 items-center justify-center rounded-md border-2 border-slate-300 bg-white',
                                    visual.accentBar,
                                    isNext && 'border-indigo-400',
                                  )}
                                  aria-hidden
                                />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-headline text-base font-bold text-indigo-950">{lesson.title}</h4>
                                {isNext ? (
                                  <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                                    Próxima aula
                                  </span>
                                ) : null}
                              </div>
                              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="h-4 w-4 shrink-0" aria-hidden />
                                  {lesson.estimatedMinutes} min
                                </span>
                                {lesson._count.exercises > 0 ? (
                                  <>
                                    <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline" aria-hidden />
                                    <span className="inline-flex items-center gap-1">
                                      <ClipboardList className="h-4 w-4 shrink-0" aria-hidden />
                                      {lesson._count.exercises} exercício{lesson._count.exercises !== 1 ? 's' : ''}
                                    </span>
                                  </>
                                ) : null}
                              </div>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center justify-end gap-2 md:pl-4">
                            {done ? (
                              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                Concluída
                              </span>
                            ) : null}
                            <ChevronRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-600" />
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                  </ul>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
