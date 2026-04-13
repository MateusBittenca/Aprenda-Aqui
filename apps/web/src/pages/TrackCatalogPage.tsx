import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Search, ShoppingBag, Sparkles } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { getTrackVisual } from '../config/trackVisuals';
import type { TrackCatalogItem } from '../types/catalog';
import { ErrorState } from '../components/ui/ErrorState';
import { PageLoader } from '../components/ui/PageLoader';
import { useAuthHydration, useAuthStore } from '../stores/authStore';

export function TrackCatalogPage() {
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?.id);
  const hydrated = useAuthHydration();
  const [q, setQ] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['me', userId ?? '', 'tracks', 'catalog'],
    queryFn: () => apiFetch<TrackCatalogItem[]>('/me/tracks/catalog', { token: token! }),
    enabled: hydrated && !!token && !!userId,
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const s = q.trim().toLowerCase();
    if (!s) return data;
    return data.filter(
      (t) =>
        t.title.toLowerCase().includes(s) ||
        (t.description?.toLowerCase().includes(s) ?? false) ||
        (t.tagline?.toLowerCase().includes(s) ?? false),
    );
  }, [data, q]);

  if (!hydrated) return <PageLoader label="Carregando sessão…" />;
  if (isLoading) return <PageLoader label="Carregando catálogo…" />;
  if (isError || !data) {
    return <ErrorState title="Não foi possível carregar o catálogo." error={error ?? new Error()} />;
  }

  return (
    <div className="relative space-y-10">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-400/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 top-40 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl"
        aria-hidden
      />

      <header className="relative overflow-hidden rounded-[2rem] border border-indigo-100/80 bg-indigo-50/40 p-8 shadow-xl shadow-indigo-500/5 sm:p-10 md:p-12">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-[100%] bg-indigo-500/10" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 shadow-sm">
              <ShoppingBag className="h-3.5 w-3.5" aria-hidden />
              Catálogo
            </p>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-[2.5rem] md:leading-tight">
              Escolha uma trilha e <span className="text-indigo-600">comece hoje</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-lg">
              Cada trilha é um caminho completo. Abra os detalhes, matricule-se em um clique e estude no seu ritmo — tudo
              em <strong className="text-slate-800">Minhas trilhas</strong>.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200/80">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden />
                {data.length} trilha{data.length !== 1 ? 's' : ''} disponíveis
              </span>
            </div>
          </div>
          <div className="relative w-full max-w-md lg:shrink-0">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-400" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome, tema ou palavra-chave…"
              className="w-full rounded-2xl border-2 border-white/80 bg-white/90 py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 shadow-inner shadow-indigo-500/5 outline-none ring-indigo-500/20 transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4"
              aria-label="Buscar trilhas"
            />
          </div>
        </div>
      </header>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/90 py-16 text-center">
          <p className="text-sm font-medium text-slate-600">Nenhuma trilha encontrada para essa busca.</p>
          <p className="mt-1 text-xs text-slate-500">Tente outro termo ou limpe o campo de busca.</p>
        </div>
      ) : (
        <ul className="relative grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((t) => {
            const v = getTrackVisual(t.slug);
            const Icon = v.Icon;
            return (
              <li key={t.id}>
                <Link
                  to={`/app/tracks/${t.slug}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/40 ring-1 ring-slate-100 transition duration-300 hover:-translate-y-1 hover:border-indigo-200/60 hover:shadow-2xl hover:shadow-indigo-500/10"
                >
                  <div className={`relative h-3 ${v.accentBar}`}>
                    <div className="absolute inset-0 bg-white/25 opacity-0 transition group-hover:opacity-100" />
                  </div>
                  <div className="flex flex-1 flex-col p-6 md:p-7">
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition group-hover:scale-105 ${v.iconBg} ${v.iconColor}`}
                      >
                        <Icon className="h-7 w-7" strokeWidth={2} />
                      </span>
                      {t.enrolled ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-200/80">
                          <Check className="h-3.5 w-3.5" aria-hidden />
                          Matriculado
                        </span>
                      ) : t.canEnrollInTrack === false ? (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-900 ring-1 ring-amber-200/80">
                          Sem vaga grátis
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {t.freeCourseCount > 0 && t.paidCourseCount > 0
                            ? `${t.freeCourseCount} grátis · ${t.paidCourseCount} extra`
                            : `${t._count.courses} curso${t._count.courses !== 1 ? 's' : ''}`}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-5 text-xl font-bold leading-snug text-slate-900 transition group-hover:text-indigo-900">
                      {t.title}
                    </h2>
                    {t.tagline && (
                      <p className="mt-2 text-sm font-medium text-indigo-600">{t.tagline}</p>
                    )}
                    {t.description && (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">{t.description}</p>
                    )}
                    <span className="mt-auto flex items-center gap-2 pt-6 text-sm font-bold text-indigo-600">
                      Ver detalhes
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
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
