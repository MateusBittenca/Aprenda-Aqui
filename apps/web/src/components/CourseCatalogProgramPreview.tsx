import { useState } from 'react';
import { ChevronDown, ClipboardList, Clock, Library, Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { CourseCatalogDetail } from '../types/catalog';

type Props = {
  data: CourseCatalogDetail;
};

export function CourseCatalogProgramPreview({ data }: Props) {
  const [openId, setOpenId] = useState<string | null>(data.modules[0]?.id ?? null);

  return (
    <div className="space-y-4">
      <h2 className="px-1 font-headline text-2xl font-bold tracking-tight text-indigo-950">Programa do curso</h2>
      <p className="px-1 text-sm text-slate-500">
        Prévia do conteúdo. As aulas e exercícios abrem após a matrícula.
      </p>
      <div className="space-y-3">
        {data.modules.map((mod, idx) => {
          const open = openId === mod.id;
          const totalInModule = mod.lessons.length;
          const minutesInModule = mod.lessons.reduce((acc, l) => acc + l.estimatedMinutes, 0);
          return (
            <div
              key={mod.id}
              className="overflow-hidden rounded-[24px] border border-white/60 bg-white/80 shadow-[0_20px_50px_-24px_rgba(30,27,75,0.12)] backdrop-blur-xl"
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : mod.id)}
                className="flex w-full items-center justify-between gap-4 bg-gradient-to-r from-slate-50/98 to-indigo-50/40 p-5 text-left transition hover:from-slate-50 hover:to-indigo-50/60"
                aria-expanded={open}
              >
                <div className="min-w-0">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                    Módulo {idx + 1}
                  </span>
                  <h3 className="mt-1 font-headline text-lg font-bold uppercase tracking-tight text-indigo-950">
                    {mod.title}
                  </h3>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {totalInModule} aula{totalInModule !== 1 ? 's' : ''}
                    {minutesInModule > 0 ? ` · ~${minutesInModule} min` : ''}
                  </p>
                </div>
                <ChevronDown
                  className={twMerge('h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300', open && 'rotate-180')}
                  aria-hidden
                />
              </button>
              {open ? (
                <div className="border-t border-slate-200/60 bg-white/40">
                  <div className="border-b border-slate-100/90 bg-gradient-to-b from-white/90 to-slate-50/30 px-5 py-4 sm:px-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200/80">
                        <Library className="h-5 w-5" aria-hidden />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Prévia do módulo</p>
                        <p className="text-xs text-slate-500">
                          As aulas abaixo desbloqueiam após a matrícula. Você acompanha o progresso por módulo no painel do curso.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-200/80">
                  {mod.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex flex-col justify-between gap-4 p-5 transition-colors hover:bg-white/60 md:flex-row md:items-center"
                    >
                      <div className="flex min-w-0 items-start gap-4">
                        <div
                          className={twMerge(
                            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ring-slate-200/80',
                            'bg-slate-100 text-slate-500',
                          )}
                        >
                          <Lock className="h-5 w-5" aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-headline text-base font-bold text-indigo-950">{lesson.title}</h4>
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
                      <div className="flex shrink-0 items-center md:justify-end">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Após matrícula
                        </span>
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
