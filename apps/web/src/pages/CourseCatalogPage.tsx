import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, Database, LayoutTemplate, Server, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { apiFetch, requireToken } from '../lib/api';
import { getCourseVisual } from '../config/trackVisuals';
import type { UserCourseCatalogItem } from '../types/catalog';
import { CatalogCourseCard } from '../components/CatalogCourseCard';
import { ErrorState } from '../components/ui/ErrorState';
import { PageLoader } from '../components/ui/PageLoader';
import { Input } from '../components/ui/Input';
import { SectionHeading } from '../components/ui/SectionHeading';
import { useAuthHydration, useAuthStore } from '../stores/authStore';
import {
  COURSE_CATEGORY_ORDER,
  getCourseCategory,
  type CourseCategory,
} from '../lib/courseCardAccent';

type CategoryMeta = {
  key: CourseCategory;
  title: string;
  subtitle: string;
  Icon: LucideIcon;
  accentText: string;
  accentBg: string;
  accentRing: string;
};

const CATEGORY_META: Record<CourseCategory, CategoryMeta> = {
  Frontend: {
    key: 'Frontend',
    title: 'Frontend',
    subtitle: 'Interfaces, HTML, CSS, JS, TypeScript e React.',
    Icon: LayoutTemplate,
    accentText: 'text-fuchsia-700',
    accentBg: 'bg-fuchsia-50',
    accentRing: 'ring-fuchsia-200/70',
  },
  Backend: {
    key: 'Backend',
    title: 'Backend',
    subtitle: 'Node, APIs, SQL e integração com banco de dados.',
    Icon: Server,
    accentText: 'text-violet-700',
    accentBg: 'bg-violet-50',
    accentRing: 'ring-violet-200/70',
  },
  Dados: {
    key: 'Dados',
    title: 'Dados',
    subtitle: 'Modelagem, entidades e base para SQL e APIs.',
    Icon: Database,
    accentText: 'text-emerald-700',
    accentBg: 'bg-emerald-50',
    accentRing: 'ring-emerald-200/70',
  },
  Fundamentos: {
    key: 'Fundamentos',
    title: 'Fundamentos e Ferramentas',
    subtitle: 'Lógica, algoritmos, testes e Git — a base.',
    Icon: Wrench,
    accentText: 'text-on-surface',
    accentBg: 'bg-surface-container-low',
    accentRing: 'ring-surface-container-high',
  },
};

export function CourseCatalogPage() {
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?.id);
  const hydrated = useAuthHydration();
  const [q, setQ] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['me', userId ?? '', 'courses', 'catalog'],
    queryFn: () =>
      apiFetch<UserCourseCatalogItem[]>('/me/courses/catalog', { token: requireToken(token) }),
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

  const grouped = useMemo(() => {
    const map = new Map<CourseCategory, UserCourseCatalogItem[]>();
    for (const cat of COURSE_CATEGORY_ORDER) map.set(cat, []);
    for (const c of filtered) {
      const v = getCourseVisual(c.slug);
      const cat = getCourseCategory(c.slug, v);
      map.get(cat)!.push(c);
    }
    return map;
  }, [filtered]);

  const enrolledCount = useMemo(
    () => (data ? data.filter((c) => c.enrolled).length : 0),
    [data],
  );

  if (!hydrated) return <PageLoader label="Carregando sessão…" />;
  if (isLoading) return <PageLoader label="Carregando catálogo…" />;
  if (isError || !data) {
    return <ErrorState title="Não foi possível carregar o catálogo." error={error ?? new Error()} />;
  }

  const total = data.length;
  const isSearching = q.trim().length > 0;

  return (
    <div className="relative pb-4">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-48 w-[min(100%,36rem)] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />

      <SectionHeading
        level="page"
        eyebrow="Catálogo"
        title="Cursos"
        description={
          <>
            Explore o catálogo, veja o que cada curso cobre e matricule-se em um clique. Há {total} curso
            {total !== 1 ? 's' : ''} disponíve{total !== 1 ? 'is' : 'l'}.{' '}
            <Link to="/app/my-courses" className="font-semibold text-primary underline underline-offset-4 hover:text-primary-dim">
              Abrir Meus cursos
            </Link>
            .
          </>
        }
        action={
          <div
            className="flex min-h-11 items-center gap-2 rounded-2xl border border-surface-container-high/70 bg-surface-container-lowest/90 px-5 py-3 shadow-card backdrop-blur-xl"
            aria-live="polite"
          >
            <span className="font-headline min-w-[2ch] text-2xl font-extrabold tabular-nums text-primary">{enrolledCount}</span>
            <span className="max-w-[10rem] text-xs font-semibold uppercase leading-tight tracking-wide text-on-surface-variant">
              Na sua lista
            </span>
          </div>
        }
        className="relative mb-8 md:mb-10"
      />

      <div className="relative mb-8">
        <Input
          id="catalog-search"
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome ou tema…"
          leftIcon={<Search className="h-4 w-4" />}
          aria-label="Buscar cursos"
          className="bg-surface-container-lowest/90 shadow-card backdrop-blur-xl"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-surface-container-high bg-surface-container-lowest/70 py-16 text-center backdrop-blur-sm">
          <p className="text-sm font-medium text-on-surface">Nenhum curso combina com essa busca.</p>
          <p className="mt-1 text-xs text-on-surface-variant">Ajuste o termo ou limpe o campo.</p>
        </div>
      ) : isSearching ? (
        <ul className="relative grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 wide:gap-8">
          {filtered.map((c) => {
            const v = getCourseVisual(c.slug);
            return (
              <li key={c.id} className="flex min-h-[300px]">
                <CatalogCourseCard
                  to={`/app/courses/${c.slug}`}
                  slug={c.slug}
                  title={c.title}
                  description={c.description}
                  tagline={c.tagline}
                  visual={v}
                  difficulty={c.difficulty}
                  moduleCount={c._count.modules}
                  lessonCount={c.stats.lessonCount}
                  totalMinutes={c.stats.totalMinutes}
                  enrollmentCount={c.enrollmentCount}
                  enrolled={c.enrolled}
                  canEnroll={c.canEnrollInCourse}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="relative space-y-12">
          {COURSE_CATEGORY_ORDER.map((cat) => {
            const items = grouped.get(cat) ?? [];
            if (items.length === 0) return null;
            const meta = CATEGORY_META[cat];
            const CatIcon = meta.Icon;
            return (
              <section key={cat} aria-labelledby={`shelf-${cat}`}>
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ${meta.accentBg} ${meta.accentRing}`}
                    >
                      <CatIcon className={`h-5 w-5 ${meta.accentText}`} strokeWidth={1.75} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <h2
                        id={`shelf-${cat}`}
                        className="font-headline truncate text-lg font-bold tracking-tight text-on-surface sm:text-xl"
                      >
                        {meta.title}
                      </h2>
                      <p className="truncate text-xs text-on-surface-variant sm:text-sm">{meta.subtitle}</p>
                    </div>
                  </div>
                  <span className="shrink-0 whitespace-nowrap rounded-full bg-surface-container-lowest/90 px-3 py-1 text-xs font-semibold text-on-surface-variant ring-1 ring-surface-container-high/70">
                    {items.length} curso{items.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="relative -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-12">
                  <ul
                    className="snap-shelf flex gap-5 overflow-x-auto px-4 pb-4 pt-1 sm:px-6 md:px-8 lg:px-12"
                    role="list"
                  >
                    {items.map((c) => {
                      const v = getCourseVisual(c.slug);
                      return (
                        <li
                          key={c.id}
                          className="flex min-h-[300px] w-[84vw] max-w-[22rem] shrink-0 sm:w-[20rem] md:w-[22rem]"
                        >
                          <CatalogCourseCard
                            to={`/app/courses/${c.slug}`}
                            slug={c.slug}
                            title={c.title}
                            description={c.description}
                            tagline={c.tagline}
                            visual={v}
                            difficulty={c.difficulty}
                            moduleCount={c._count.modules}
                            lessonCount={c.stats.lessonCount}
                            totalMinutes={c.stats.totalMinutes}
                            enrollmentCount={c.enrollmentCount}
                            enrolled={c.enrolled}
                            canEnroll={c.canEnrollInCourse}
                          />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
