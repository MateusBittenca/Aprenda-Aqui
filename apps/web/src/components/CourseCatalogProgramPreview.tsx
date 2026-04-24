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
      <h2 className="px-1 font-headline text-2xl font-bold tracking-tight text-on-surface">Programa do curso</h2>
      <p className="px-1 text-sm text-on-surface-variant">
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
              className="overflow-hidden rounded-[24px] border border-surface-container-high/60 bg-surface-container-lowest/80 shadow-[0_20px_50px_-24px_rgba(30,27,75,0.12)] backdrop-blur-xl"
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : mod.id)}
                className="flex w-full items-center justify-between gap-4 bg-gradient-to-r from-surface-container-low/98 to-primary/[0.04] p-5 text-left transition hover:from-surface-container-low hover:to-primary/[0.06]"
                aria-expanded={open}
              >
                <div className="min-w-0">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                    Módulo {idx + 1}
                  </span>
                  <h3 className="mt-1 font-headline text-lg font-bold uppercase tracking-tight text-on-surface">
                    {mod.title}
                  </h3>
                  <p className="mt-2 text-xs font-medium text-on-surface-variant">
                    {totalInModule} aula{totalInModule !== 1 ? 's' : ''}
                    {minutesInModule > 0 ? ` · ~${minutesInModule} min` : ''}
                  </p>
                </div>
                <ChevronDown
                  className={twMerge('h-5 w-5 shrink-0 text-on-surface-variant transition-transform duration-300', open && 'rotate-180')}
                  aria-hidden
                />
              </button>
              {open ? (
                <div className="border-t border-surface-container-high/60 bg-surface-container-low/40">
                  <div className="border-b border-surface-container-high/60 bg-surface-container-low/60 px-5 py-4 sm:px-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-high text-on-surface-variant ring-1 ring-surface-container-high/80">
                        <Library className="h-5 w-5" aria-hidden />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">Prévia do módulo</p>
                        <p className="text-xs text-on-surface-variant">
                          As aulas abaixo desbloqueiam após a matrícula. Você acompanha o progresso por módulo no painel do curso.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="divide-y divide-surface-container-high/60">
                  {mod.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex flex-col justify-between gap-4 p-5 transition-colors hover:bg-surface-container-low/60 md:flex-row md:items-center"
                    >
                      <div className="flex min-w-0 items-start gap-4">
                        <div
                          className={twMerge(
                            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ring-surface-container-high/80',
                            'bg-surface-container-high text-on-surface-variant',
                          )}
                        >
                          <Lock className="h-5 w-5" aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-headline text-base font-bold text-on-surface">{lesson.title}</h4>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-on-surface-variant">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-4 w-4 shrink-0" aria-hidden />
                              {lesson.estimatedMinutes} min
                            </span>
                            {lesson._count.exercises > 0 ? (
                              <>
                                <span className="hidden h-1 w-1 rounded-full bg-outline/40 sm:inline" aria-hidden />
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
                        <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
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
