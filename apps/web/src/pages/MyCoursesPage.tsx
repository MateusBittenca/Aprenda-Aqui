import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { getCourseVisual } from '../config/trackVisuals';
import { MyCourseCard } from '../components/MyCourseCard';
import { ErrorState } from '../components/ui/ErrorState';
import { PageLoader } from '../components/ui/PageLoader';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuthHydration } from '../stores/authStore';
import { useEnrolledCourses } from '../hooks/useEnrolledCourses';
import { useProgress } from '../hooks/useProgress';

function isThisWeek(dateStr: string | null) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return d >= startOfWeek;
}

export function MyCoursesPage() {
  const hydrated = useAuthHydration();
  const { data, isLoading, isError, error } = useEnrolledCourses();
  const { data: progress, isLoading: progressLoading } = useProgress();

  const weekLessons =
    progress?.lessons.filter((l) => l.completed && isThisWeek(l.completedAt)).length ?? 0;

  if (!hydrated) {
    return <PageLoader label="Carregando sessão…" />;
  }

  if (isLoading) {
    return <PageLoader label="Carregando seus cursos…" />;
  }

  if (isError || !data) {
    return <ErrorState title="Não foi possível carregar os cursos." error={error ?? new Error('Sem dados')} />;
  }

  const count = data.length;

  return (
    <div className="relative pb-4">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-48 w-[min(100%,36rem)] -translate-x-1/2 rounded-full bg-indigo-400/15 blur-3xl"
        aria-hidden
      />

      <header className="relative mb-10 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-indigo-950 sm:text-4xl md:text-[2.75rem] md:leading-tight">
            Meus Cursos
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-500 sm:text-lg">
            Continue sua jornada de aprendizado onde parou.
            {count > 0 ? (
              <>
                {' '}
                Você tem {count} curso{count !== 1 ? 's' : ''} na sua lista.
              </>
            ) : null}
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Quer incluir mais cursos?{' '}
            <Link
              to="/app/courses"
              className="font-semibold text-indigo-600 underline decoration-indigo-300/70 underline-offset-4 transition hover:text-indigo-800"
            >
              Abrir catálogo
            </Link>
          </p>
        </div>
        <div
          className="flex shrink-0 items-center gap-2 rounded-2xl border border-white/60 bg-white/80 px-5 py-3 shadow-[0_40px_40px_-10px_rgba(30,27,75,0.06)] backdrop-blur-xl md:px-6"
          aria-live="polite"
        >
          <span className="min-w-[2ch] text-2xl font-bold tabular-nums text-indigo-600">
            {progressLoading && progress === undefined ? '—' : weekLessons}
          </span>
          <span className="max-w-[10rem] text-xs font-semibold uppercase leading-tight tracking-wide text-slate-500">
            Aulas esta semana
          </span>
        </div>
      </header>

      {count === 0 ? (
        <EmptyState
          icon={<BookOpen className="mx-auto h-12 w-12 text-slate-300" />}
          title="Nada aqui ainda"
          description="Escolha um curso no catálogo e matricule-se — ele aparece aqui com progresso e próxima aula sugerida."
          action={
            <Link
              to="/app/courses"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/25 transition hover:bg-indigo-900"
            >
              Explorar catálogo
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          }
        />
      ) : (
        <ul className="relative grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.map((c) => {
            const v = getCourseVisual(c.slug);
            return (
              <li key={c.id} className="flex min-h-[280px]">
                <MyCourseCard
                  to={`/app/my-courses/${c.slug}`}
                  slug={c.slug}
                  title={c.title}
                  description={c.description ?? c.tagline}
                  visual={v}
                  progressPct={c.progress.pct}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
