import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Loader2,
  Play,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch, ApiError, requireToken } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import type { CourseCatalogDetail, UserCourseCatalogItem } from '../types/catalog';
import { getCourseVisual } from '../config/trackVisuals';
import { CourseCatalogLanding } from '../components/CourseCatalogLanding';
import { CourseCatalogProgramPreview } from '../components/CourseCatalogProgramPreview';
import { EnrolledCourseHero } from '../components/EnrolledCourseHero';
import { EnrolledCourseProgram } from '../components/EnrolledCourseProgram';
import { ErrorState } from '../components/ui/ErrorState';
import { PageLoader } from '../components/ui/PageLoader';
import { useProgress } from '../hooks/useProgress';

function fallbackOverviewMarkdown(data: CourseCatalogDetail): string {
  const desc =
    data.description?.trim() ||
    'Explore o programa abaixo e matricule-se para liberar as aulas e os exercícios.';
  return `## Visão geral\n\n${desc}\n\n`;
}

function formatPeople(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')} mi`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')} mil`;
  return new Intl.NumberFormat('pt-BR').format(n);
}

function formatMinutes(m: number): string {
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const r = m % 60;
    return r > 0 ? `${h} h ${r} min` : `${h} h`;
  }
  return `${m} min`;
}

export function CourseCatalogDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  const { data: catalog, isLoading: catalogLoading } = useQuery({
    queryKey: ['me', userId ?? '', 'courses', 'catalog'],
    queryFn: () => apiFetch<UserCourseCatalogItem[]>('/me/courses/catalog', { token: requireToken(token) }),
    enabled: !!token && !!userId,
  });

  const catalogEntry = catalog?.find((c) => c.slug === courseId || c.id === courseId);
  const enrolled = catalogEntry?.enrolled ?? false;
  const canEnroll = catalogEntry?.canEnrollInCourse !== false;

  const useMeEndpoint = !!token && !!userId && enrolled;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['course-detail', courseId, useMeEndpoint ? 'me' : 'pub', userId ?? ''],
    queryFn: () =>
      useMeEndpoint
        ? apiFetch<CourseCatalogDetail>(`/me/courses/${courseId}`, { token: requireToken(token) })
        : apiFetch<CourseCatalogDetail>(`/catalog/courses/${courseId}`),
    enabled:
      !!courseId &&
      (!token || !userId || !catalogLoading) &&
      (useMeEndpoint ? !!token : true),
  });

  const { completedLessonIds } = useProgress();

  const enroll = useMutation({
    mutationFn: async () => {
      if (!data?.id) throw new Error('Curso não carregado');
      return apiFetch<{ enrolled: boolean; message: string }>(`/courses/${data.id}/enroll`, {
        method: 'POST',
        token: requireToken(token),
      });
    },
    onSuccess: (res) => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['me', userId, 'courses', 'catalog'] });
        queryClient.invalidateQueries({ queryKey: ['me', userId, 'enrolled-courses'] });
        queryClient.invalidateQueries({ queryKey: ['me', userId, 'course', courseId] });
      }
      queryClient.invalidateQueries({ queryKey: ['course-detail', courseId] });
      toast.success(res.message);
    },
  });

  if (!courseId) return null;
  if (isLoading) return <PageLoader label="Carregando curso…" />;

  if (isError || !data) {
    return (
      <ErrorState
        title="Não foi possível carregar este curso."
        error={error ?? new Error()}
      />
    );
  }

  const visual = getCourseVisual(data.slug);
  const allLessons = data.modules.flatMap((m) => m.lessons);
  const completedCount = enrolled
    ? allLessons.filter((l) => completedLessonIds.has(l.id)).length
    : 0;
  const totalLessons = allLessons.length;
  const coursePct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const heroImage = data.coverImageUrl || visual.heroCover || null;
  const overviewMd = data.overviewMd?.trim() || fallbackOverviewMarkdown(data);

  const enrollBlock =
    !token ? (
      <p className="rounded-2xl border border-surface-container-high bg-surface-container-low/90 px-4 py-3 text-center text-sm leading-relaxed text-on-surface-variant">
        Entre na sua conta para se matricular e acompanhar o progresso.
      </p>
    ) : enrolled ? (
      <p className="rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-center text-sm font-medium text-emerald-900">
        Você já está matriculado neste curso.
      </p>
    ) : !canEnroll || !data.isFree ? (
      <p className="rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-center text-sm font-medium leading-relaxed text-amber-900">
        Este curso não está aberto para matrícula gratuita no momento.
      </p>
    ) : (
      <button
        type="button"
        disabled={enroll.isPending}
        onClick={() =>
          enroll.mutate(undefined, {
            onError: (e) => {
              const msg =
                e instanceof ApiError ? e.message : 'Não foi possível concluir a matrícula.';
              toast.error(msg);
            },
          })
        }
        className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-surface-container-highest px-6 py-4 text-sm font-bold text-on-surface shadow-xl transition hover:bg-surface-container-high active:scale-[0.98] disabled:opacity-60 sm:w-auto"
      >
        {enroll.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Matriculando…
          </>
        ) : (
          <>
            <BookOpen className="h-4 w-4" aria-hidden />
            Matricular-me neste curso
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
          </>
        )}
      </button>
    );

  if (!enrolled) {
    const students = data.enrollmentCount ?? 0;
    const stats = data.stats ?? {
      lessonCount: 0,
      totalMinutes: 0,
      exerciseCount: 0,
    };

    return (
      <div
        className="space-y-10 pb-10 [background:radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.1),transparent_52%),radial-gradient(ellipse_at_bottom_left,rgba(129,39,207,0.06),transparent_48%)]"
      >
        <CourseCatalogLanding
          data={data}
          heroImage={heroImage}
          catalogEntry={catalogEntry}
          enrollBlock={enrollBlock}
        />

        <section className="pb-2">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="space-y-8 lg:col-span-8">
              <div className="rounded-[24px] border border-surface-container-high/70 bg-surface-container-lowest/80 p-6 shadow-[0_20px_50px_-24px_rgba(30,27,75,0.12)] backdrop-blur-xl sm:p-8">
                <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface">Visão geral</h2>
                <div className="prose prose-slate dark:prose-invert mt-6 max-w-none prose-headings:scroll-mt-28 prose-headings:font-bold prose-h2:text-xl prose-h3:text-base prose-p:leading-relaxed prose-a:text-primary prose-blockquote:border-primary/30 prose-blockquote:bg-primary/5 prose-blockquote:py-0.5 prose-strong:text-on-surface prose-code:rounded-md prose-code:bg-surface-container-high prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-semibold prose-code:text-rose-700 dark:prose-code:text-rose-300 prose-pre:rounded-2xl prose-pre:border prose-pre:border-slate-800 prose-pre:bg-slate-900 prose-pre:text-slate-100">
                  <ReactMarkdown>{overviewMd}</ReactMarkdown>
                </div>
              </div>

              <div id="programa" className="scroll-mt-28">
                <CourseCatalogProgramPreview data={data} />
              </div>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 lg:col-span-4 lg:self-start">
              <div className="overflow-hidden rounded-[24px] border border-white/60 bg-white/85 p-2 shadow-[0_20px_50px_-24px_rgba(30,27,75,0.12)] backdrop-blur-xl">
                <a href="#programa" className="group relative block aspect-video overflow-hidden rounded-[18px]">
                  {heroImage ? (
                    <img
                      src={heroImage}
                      alt={data.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div
                      className="flex h-full min-h-[12rem] w-full items-center justify-center bg-gradient-to-br from-primary/20 via-tertiary/10 to-surface-container-high"
                      aria-hidden
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25 transition group-hover:bg-black/35">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-lowest/95 shadow-xl">
                      <Play className="ml-1 h-8 w-8 text-primary" aria-hidden />
                    </span>
                  </div>
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-surface-container-high/70 bg-surface-container-lowest/80 p-4 text-center shadow-sm backdrop-blur-xl transition hover:-translate-y-1">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Users className="h-5 w-5" aria-hidden />
                  </div>
                  <p className="font-headline text-xl font-bold tabular-nums text-on-surface">{formatPeople(students)}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Alunos</p>
                </div>
                <div className="rounded-2xl border border-surface-container-high/70 bg-surface-container-lowest/80 p-4 text-center shadow-sm backdrop-blur-xl transition hover:-translate-y-1">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300">
                    <BookOpen className="h-5 w-5" aria-hidden />
                  </div>
                  <p className="font-headline text-xl font-bold tabular-nums text-on-surface">{stats.lessonCount}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Aulas</p>
                </div>
                <div className="rounded-2xl border border-surface-container-high/70 bg-surface-container-lowest/80 p-4 text-center shadow-sm backdrop-blur-xl transition hover:-translate-y-1">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant">
                    <Clock className="h-5 w-5" aria-hidden />
                  </div>
                  <p className="font-headline text-lg font-bold leading-tight text-on-surface">
                    {formatMinutes(stats.totalMinutes)}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Carga</p>
                </div>
                <div className="rounded-2xl border border-surface-container-high/70 bg-surface-container-lowest/80 p-4 text-center shadow-sm backdrop-blur-xl transition hover:-translate-y-1">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300">
                    <Code2 className="h-5 w-5" aria-hidden />
                  </div>
                  <p className="font-headline text-xl font-bold tabular-nums text-on-surface">{stats.exerciseCount}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Exercícios</p>
                </div>
              </div>

              <div className="rounded-[24px] border border-surface-container-high/70 bg-surface-container-lowest/80 p-5 shadow-sm backdrop-blur-xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Instrução</h4>
                <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                  Conteúdo produzido e revisado pela equipe pedagógica da plataforma.
                </p>
                <ul className="mt-4 space-y-2.5 text-sm text-on-surface">
                  {visual.hints.map((hint) => (
                    <li key={hint} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                      <span>{hint}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/app/courses"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
                >
                  Voltar ao catálogo
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div
      className="space-y-10 pb-10 [background:radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.1),transparent_52%),radial-gradient(ellipse_at_bottom_left,rgba(129,39,207,0.06),transparent_48%)]"
    >
      <EnrolledCourseHero
        data={data}
        visual={visual}
        heroImage={heroImage}
        completedCount={completedCount}
        totalLessons={totalLessons}
        coursePct={coursePct}
        completedLessonIds={completedLessonIds}
        secondaryAction={{ to: `/app/my-courses/${data.slug}`, label: 'Abrir em Meus cursos' }}
      />
      <EnrolledCourseProgram
        modules={data.modules}
        completedLessonIds={completedLessonIds}
        visual={visual}
      />
    </div>
  );
}

