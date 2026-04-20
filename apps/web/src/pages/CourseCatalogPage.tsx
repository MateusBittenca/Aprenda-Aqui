import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { apiFetch, requireToken } from '../lib/api';
import { getCourseVisual } from '../config/trackVisuals';
import type { UserCourseCatalogItem } from '../types/catalog';
import { CatalogCourseCard } from '../components/CatalogCourseCard';
import { ErrorState } from '../components/ui/ErrorState';
import { PageLoader } from '../components/ui/PageLoader';
import { useAuthHydration, useAuthStore } from '../stores/authStore';

export function CourseCatalogPage() {
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?.id);
  const hydrated = useAuthHydration();
  const [q, setQ] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['me', userId ?? '', 'courses', 'catalog'],
    queryFn: () => apiFetch<UserCourseCatalogItem[]>('/me/courses/catalog', { token: requireToken(token) }),
    enabled: hydrated && !!token && !!userId,
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const s = q.trim().toLowerCase();
    if (!s) return data;
    return data.filter(
      (c) =>
        c.title.toLowerCase().includes(s) ||
        (c.description?.toLowerCase().includes(s) ?? false) ||
        (c.tagline?.toLowerCase().includes(s) ?? false),
    );
  }, [data, q]);

  const enrolledCount = useMemo(() => (data ? data.filter((c) => c.enrolled).length : 0), [data]);

  if (!hydrated) return <PageLoader label="Carregando sessão…" />;
  if (isLoading) return <PageLoader label="Carregando catálogo…" />;
  if (isError || !data) {
    return <ErrorState title="Não foi possível carregar o catálogo." error={error ?? new Error()} />;
  }

  const total = data.length;

  return (
    <div className="relative pb-4">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-48 w-[min(100%,36rem)] -translate-x-1/2 rounded-full bg-indigo-400/15 blur-3xl"
        aria-hidden
      />

      <header className="relative mb-8 flex min-w-0 flex-col gap-6 md:mb-10 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 max-w-2xl">
          <h1 className="font-headline font-extrabold tracking-tight text-indigo-950 [font-size:clamp(1.75rem,1.1rem+2.8vw,2.75rem)] md:leading-tight">
            Cursos
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-500 sm:text-lg">
            Explore o catálogo, veja o que cada curso cobre e matricule-se em um clique. Há {total} curso
            {total !== 1 ? 's' : ''} disponíve{total !== 1 ? 'is' : 'l'}.
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Já matriculado?{' '}
            <Link
              to="/app/my-courses"
              className="font-semibold text-indigo-600 underline decoration-indigo-300/70 underline-offset-4 transition hover:text-indigo-800"
            >
              Abrir Meus cursos
            </Link>
          </p>
        </div>
        <div
          className="flex min-h-11 shrink-0 items-center gap-2 rounded-2xl border border-white/60 bg-white/80 px-5 py-3 shadow-[0_40px_40px_-10px_rgba(30,27,75,0.06)] backdrop-blur-xl md:px-6"
          aria-live="polite"
        >
          <span className="min-w-[2ch] text-2xl font-bold tabular-nums text-indigo-600">{enrolledCount}</span>
          <span className="max-w-[10rem] text-xs font-semibold uppercase leading-tight tracking-wide text-slate-500">
            Na sua lista
          </span>
        </div>
      </header>

      <div className="relative mb-8">
        <label className="sr-only" htmlFor="catalog-search">
          Buscar cursos
        </label>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          id="catalog-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome ou tema…"
          className="min-h-11 w-full rounded-2xl border border-slate-200/90 bg-white/85 py-3 pl-12 pr-4 text-base font-medium text-slate-800 shadow-[0_40px_40px_-10px_rgba(30,27,75,0.06)] backdrop-blur-xl outline-none ring-0 transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-400/25 sm:text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/70 py-16 text-center backdrop-blur-sm">
          <p className="text-sm font-medium text-slate-700">Nenhum curso combina com essa busca.</p>
          <p className="mt-1 text-xs text-slate-500">Ajuste o termo ou limpe o campo.</p>
        </div>
      ) : (
        <ul className="relative grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 wide:gap-8">
          {filtered.map((c) => {
            const v = getCourseVisual(c.slug);
            const modCount = c._count.modules;
            return (
              <li key={c.id} className="flex min-h-[300px]">
                <CatalogCourseCard
                  to={`/app/courses/${c.slug}`}
                  slug={c.slug}
                  title={c.title}
                  description={c.description}
                  tagline={c.tagline}
                  visual={v}
                  moduleCount={modCount}
                  enrolled={c.enrolled}
                  canEnroll={c.canEnrollInCourse}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
