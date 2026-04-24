import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { ArrowRight, BookOpen, CheckCircle2, Flame, Target } from 'lucide-react';
import { getCourseVisual } from '../config/trackVisuals';
import { MyCourseCard } from '../components/MyCourseCard';
import { ResumeHero } from '../components/ResumeHero';
import { ErrorState } from '../components/ui/ErrorState';
import { PageLoader } from '../components/ui/PageLoader';
import { EmptyState } from '../components/ui/EmptyState';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Button } from '../components/ui/Button';
import { useAuthHydration, useAuthStore } from '../stores/authStore';
import { useEnrolledCourses } from '../hooks/useEnrolledCourses';
import { useProgress } from '../hooks/useProgress';
import {
  COURSE_CATEGORY_ORDER,
  getCourseCategory,
  type CourseCategory,
} from '../lib/courseCardAccent';
import { pickResumeCourse } from '../lib/resumeCourse';

type StatusFilter = 'in_progress' | 'done' | 'all';

function startOfWeek() {
  const now = new Date();
  const d = new Date(now);
  d.setDate(now.getDate() - now.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function isThisWeek(dateStr: string | null) {
  if (!dateStr) return false;
  return new Date(dateStr) >= startOfWeek();
}

export function MyCoursesPage() {
  const hydrated = useAuthHydration();
  const { data, isLoading, isError, error } = useEnrolledCourses();
  const { data: progress, isLoading: progressLoading } = useProgress();
  const currentStreak = useAuthStore((s) => s.user?.currentStreak ?? 0);

  const [status, setStatus] = useState<StatusFilter>('all');
  const [category, setCategory] = useState<CourseCategory | 'all'>('all');

  const weekLessons = useMemo(
    () => progress?.lessons.filter((l) => l.completed && isThisWeek(l.completedAt)).length ?? 0,
    [progress],
  );
  const weekExercises = useMemo(
    () => progress?.exercises.filter((e) => e.solved && isThisWeek(e.solvedAt)).length ?? 0,
    [progress],
  );

  const counts = useMemo(() => {
    if (!data) return { all: 0, in_progress: 0, done: 0 };
    let done = 0;
    let inP = 0;
    for (const c of data) {
      if (c.progress.pct >= 100) done++;
      else inP++;
    }
    return { all: data.length, in_progress: inP, done };
  }, [data]);

  const categoryCounts = useMemo(() => {
    const map = new Map<CourseCategory, number>();
    for (const cat of COURSE_CATEGORY_ORDER) map.set(cat, 0);
    for (const c of data ?? []) {
      const v = getCourseVisual(c.slug);
      const cat = getCourseCategory(c.slug, v);
      map.set(cat, (map.get(cat) ?? 0) + 1);
    }
    return map;
  }, [data]);

  const visible = useMemo(() => {
    if (!data) return [];
    return data.filter((c) => {
      if (status === 'in_progress' && c.progress.pct >= 100) return false;
      if (status === 'done' && c.progress.pct < 100) return false;
      if (category !== 'all') {
        const v = getCourseVisual(c.slug);
        if (getCourseCategory(c.slug, v) !== category) return false;
      }
      return true;
    });
  }, [data, status, category]);

  const resume = useMemo(() => (data ? pickResumeCourse(data) : null), [data]);

  if (!hydrated) return <PageLoader label="Carregando sessão…" />;
  if (isLoading) return <PageLoader label="Carregando seus cursos…" />;
  if (isError || !data) {
    return <ErrorState title="Não foi possível carregar os cursos." error={error ?? new Error('Sem dados')} />;
  }

  const count = data.length;

  return (
    <div className="relative pb-4">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-48 w-[min(100%,36rem)] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />

      <SectionHeading
        level="page"
        eyebrow="Sua trilha"
        title="Meus Cursos"
        description={
          <>
            Continue sua jornada de aprendizado onde parou.
            {count > 0 ? <> Você tem {count} curso{count !== 1 ? 's' : ''} na sua lista. </> : ' '}
            Quer incluir mais?{' '}
            <Link to="/app/courses" className="font-semibold text-primary underline underline-offset-4 hover:text-primary-dim">
              Abrir catálogo
            </Link>
            .
          </>
        }
        className="relative mb-8 md:mb-10"
      />

      {count === 0 ? (
        <EmptyState
          icon={<BookOpen className="mx-auto h-12 w-12" />}
          title="Nada aqui ainda"
          description="Escolha um curso no catálogo e matricule-se — ele aparece aqui com progresso e próxima aula sugerida."
          action={
            <Link to="/app/courses" className="inline-flex">
              <Button variant="brand" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Explorar catálogo
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="relative space-y-8">
          {resume ? <ResumeHero course={resume} /> : null}

          <WeekStrip
            lessons={weekLessons}
            exercises={weekExercises}
            streak={currentStreak}
            loading={progressLoading && progress === undefined}
          />

          <div className="space-y-4">
            <StatusTabs current={status} onChange={setStatus} counts={counts} />
            <CategoryChips
              current={category}
              onChange={setCategory}
              counts={categoryCounts}
              total={counts.all}
            />
          </div>

          {visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-surface-container-high bg-surface-container-lowest/70 py-16 text-center backdrop-blur-sm">
              <p className="text-sm font-medium text-on-surface">Nenhum curso nessa combinação de filtros.</p>
              <p className="mt-1 text-xs text-on-surface-variant">Ajuste a aba ou a categoria.</p>
            </div>
          ) : (
            <ul className="relative grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((c) => {
                const v = getCourseVisual(c.slug);
                return (
                  <li key={c.id} className="flex min-h-[300px]">
                    <MyCourseCard
                      to={`/app/my-courses/${c.slug}`}
                      slug={c.slug}
                      title={c.title}
                      description={c.description ?? c.tagline}
                      visual={v}
                      progressPct={c.progress.pct}
                      difficulty={c.difficulty}
                      lessonCount={c.stats.lessonCount}
                      totalMinutes={c.stats.totalMinutes}
                      enrollmentCount={c.enrollmentCount}
                      enrolledAt={c.enrolledAt}
                      nextLessonTitle={c.nextLessonTitle}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Subcomponentes locais                                               */
/* ------------------------------------------------------------------ */

function WeekStrip({
  lessons,
  exercises,
  streak,
  loading,
}: {
  lessons: number;
  exercises: number;
  streak: number;
  loading: boolean;
}) {
  const items: Array<{
    key: string;
    label: string;
    value: number | string;
    Icon: typeof CheckCircle2;
    accent: string;
    bg: string;
    ring: string;
  }> = [
    {
      key: 'lessons',
      label: 'Aulas na semana',
      value: loading ? '—' : lessons,
      Icon: CheckCircle2,
      accent: 'text-emerald-700',
      bg: 'bg-emerald-50',
      ring: 'ring-emerald-200/70',
    },
    {
      key: 'exercises',
      label: 'Exercícios na semana',
      value: loading ? '—' : exercises,
      Icon: Target,
      accent: 'text-primary',
      bg: 'bg-primary/10',
      ring: 'ring-primary/15',
    },
    {
      key: 'streak',
      label: 'Dias seguidos',
      value: streak,
      Icon: Flame,
      accent: 'text-amber-700',
      bg: 'bg-amber-50',
      ring: 'ring-amber-200/70',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((it) => {
        const ItemIcon = it.Icon;
        return (
          <div
            key={it.key}
            className="hover-lift flex items-center gap-3 rounded-2xl border border-surface-container-high/70 bg-surface-container-lowest/90 px-4 py-3 shadow-card backdrop-blur-xl"
          >
            <span
              className={twMerge(
                'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1',
                it.bg,
                it.ring,
              )}
            >
              <ItemIcon className={twMerge('h-5 w-5', it.accent)} strokeWidth={2} aria-hidden />
            </span>
            <div className="min-w-0">
              <div
                className={twMerge('text-xl font-extrabold leading-none tabular-nums', it.accent)}
              >
                {it.value}
              </div>
              <div className="mt-1 text-[0.68rem] font-semibold uppercase tracking-wide text-on-surface-variant">
                {it.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatusTabs({
  current,
  onChange,
  counts,
}: {
  current: StatusFilter;
  onChange: (s: StatusFilter) => void;
  counts: { all: number; in_progress: number; done: number };
}) {
  const tabs: Array<{ key: StatusFilter; label: string; count: number }> = [
    { key: 'all', label: 'Todos', count: counts.all },
    { key: 'in_progress', label: 'Em andamento', count: counts.in_progress },
    { key: 'done', label: 'Concluídos', count: counts.done },
  ];

  return (
    <div
      role="tablist"
      aria-label="Filtrar por status"
      className="inline-flex w-full max-w-full gap-1 overflow-x-auto rounded-2xl border border-surface-container-high/70 bg-surface-container-lowest/90 p-1 shadow-sm backdrop-blur-xl sm:w-auto"
    >
      {tabs.map((t) => {
        const active = current === t.key;
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.key)}
            className={twMerge(
              'press-tactile focus-ring-primary inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition duration-300 ease-ios-out',
              active
                ? 'bg-primary text-white shadow-sm shadow-primary/25'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface',
            )}
          >
            {t.label}
            <span
              className={twMerge(
                'inline-flex min-w-[1.5rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[0.68rem] font-bold tabular-nums',
                active ? 'bg-white/20 text-white' : 'bg-surface-container-low text-on-surface-variant',
              )}
            >
              {t.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function CategoryChips({
  current,
  onChange,
  counts,
  total,
}: {
  current: CourseCategory | 'all';
  onChange: (c: CourseCategory | 'all') => void;
  counts: Map<CourseCategory, number>;
  total: number;
}) {
  const categories: Array<{ key: CourseCategory | 'all'; label: string; count: number }> = [
    { key: 'all', label: 'Todas as trilhas', count: total },
    ...COURSE_CATEGORY_ORDER.filter((c) => (counts.get(c) ?? 0) > 0).map((c) => ({
      key: c,
      label: c === 'Fundamentos' ? 'Fundamentos' : c,
      count: counts.get(c) ?? 0,
    })),
  ];

  if (categories.length <= 2) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((c) => {
        const active = current === c.key;
        return (
          <button
            key={c.key}
            type="button"
            onClick={() => onChange(c.key)}
            className={twMerge(
              'press-tactile focus-ring-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition duration-300 ease-ios-out',
              active
                ? 'border-primary bg-primary text-white shadow-sm'
                : 'border-surface-container-high bg-surface-container-lowest text-on-surface-variant hover:border-primary/40 hover:text-primary',
            )}
          >
            {c.label}
            <span
              className={twMerge(
                'tabular-nums',
                active ? 'text-white/70' : 'text-on-surface-variant/70',
              )}
            >
              {c.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
