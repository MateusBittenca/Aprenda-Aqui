import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, Sparkles } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { getTrackVisual } from '../config/trackVisuals';
import type { TrackSummary } from '../types/catalog';
import { ErrorState } from '../components/ui/ErrorState';
import { PageLoader } from '../components/ui/PageLoader';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuthHydration, useAuthStore } from '../stores/authStore';

export function MyTracksPage() {
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?.id);
  const hydrated = useAuthHydration();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['me', userId ?? '', 'tracks'],
    queryFn: () => apiFetch<TrackSummary[]>('/me/tracks', { token: token! }),
    enabled: hydrated && !!token && !!userId,
  });

  if (!hydrated) {
    return <PageLoader label="Carregando sessão…" />;
  }

  if (isLoading) {
    return <PageLoader label="Carregando trilhas…" />;
  }

  if (isError || !data) {
    return <ErrorState title="Não foi possível carregar as trilhas." error={error ?? new Error('Sem dados')} />;
  }

  return (
    <div className="space-y-10">
      <header className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-8 sm:py-10">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Estudo</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Minhas trilhas</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Retome de onde parou. Para ver outras opções,{' '}
          <Link to="/app/tracks" className="font-semibold text-indigo-600 underline-offset-2 hover:underline">
            abra o catálogo
          </Link>
          .
        </p>
      </header>

      {data.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="mx-auto h-12 w-12 text-slate-300" />}
          title="Nenhuma trilha ainda"
          description="Escolha uma trilha no catálogo e matricule-se — ela aparece aqui na hora para você estudar."
          action={
            <Link
              to="/app/tracks"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-900/30 transition hover:bg-indigo-700"
            >
              Ir ao catálogo
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          }
        />
      ) : (
        <ul className="relative grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {data.map((t) => {
            const v = getTrackVisual(t.slug);
            const Icon = v.Icon;
            return (
              <li key={t.id}>
                <Link
                  to={`/app/my-tracks/${t.slug}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className={`relative h-3 ${v.accentBar}`} />
                  {t.completed !== true && (
                    <div className="absolute right-4 top-6 opacity-0 transition group-hover:opacity-100">
                      <Sparkles className="h-5 w-5 text-amber-400" aria-hidden />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6 sm:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <span
                        className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition group-hover:rotate-3 group-hover:scale-105 ${v.iconBg} ${v.iconColor}`}
                      >
                        <Icon className="h-7 w-7" strokeWidth={2} />
                      </span>
                      <div className="flex flex-col items-end gap-1.5">
                        {t.completed === true && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-200/80">
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                            Concluído
                          </span>
                        )}
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200/80">
                          {t._count.courses} curso{t._count.courses !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <h2 className="mt-5 text-2xl font-bold text-slate-900">{t.title}</h2>
                    {t.tagline && <p className="mt-2 text-sm font-medium text-indigo-600">{t.tagline}</p>}
                    {t.description && (
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">{t.description}</p>
                    )}

                    <ul className="mt-5 space-y-2 border-t border-slate-100 pt-5">
                      {v.hints.slice(0, 3).map((hint) => (
                        <li key={hint} className="flex items-start gap-2.5 text-sm text-slate-700">
                          <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${v.hintDot}`} aria-hidden />
                          {hint}
                        </li>
                      ))}
                    </ul>

                    <span
                      className={[
                        'mt-8 inline-flex items-center gap-2 text-sm font-bold transition group-hover:gap-3',
                        t.completed === true ? 'text-emerald-700' : 'text-indigo-600',
                      ].join(' ')}
                    >
                      {t.completed === true ? (
                        <>
                          Trilha concluída — revisar
                          <ArrowRight className="h-4 w-4" aria-hidden />
                        </>
                      ) : (
                        <>
                          Continuar estudando
                          <ArrowRight className="h-4 w-4" aria-hidden />
                        </>
                      )}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
