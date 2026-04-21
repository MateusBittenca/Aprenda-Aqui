import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Gem,
  Layers,
  ListTree,
  Trophy,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch, ApiError, requireToken } from '../lib/api';
import { useAuthHydration, useAuthStore } from '../stores/authStore';
import type { LessonDetail } from '../types/catalog';
import { SessionProgressBar } from '../components/SessionProgressBar';
import { ExerciseRunner, type SubmitResult } from '../components/ExerciseRunner';
import { FeedbackDrawer } from '../components/FeedbackDrawer';
import { ErrorState } from '../components/ui/ErrorState';
import { PageLoader } from '../components/ui/PageLoader';

export function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?.id);
  const hydrated = useAuthHydration();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<SubmitResult | null>(null);
  const [openFeedback, setOpenFeedback] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const { data: lesson, isLoading, isError, error } = useQuery({
    queryKey: ['lesson', userId ?? '', lessonId],
    queryFn: () => apiFetch<LessonDetail>(`/lessons/${lessonId}`, { token: requireToken(token) }),
    enabled: !!lessonId && hydrated && !!token && !!userId,
  });

  const completeMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/progress/lessons/${lessonId}/complete`, { method: 'POST', token: requireToken(token) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['me', 'enrolled-courses'] });
      queryClient.invalidateQueries({ queryKey: ['lesson', userId, lessonId] });
    },
    onError: (e) => {
      if (e instanceof ApiError && e.status !== 403) {
        toast.error('Não foi possível marcar a aula como concluída.');
      }
    },
  });

  const markedRef = useRef(false);
  useEffect(() => {
    if (!lesson || markedRef.current) return;
    if (lesson.exercises.length === 0 && token) {
      markedRef.current = true;
      completeMutation.mutate();
    }
  }, [lesson, token]); // eslint-disable-line react-hooks/exhaustive-deps

  const active = useMemo(
    () => lesson?.exercises.find((e) => e.id === activeId) ?? null,
    [lesson, activeId],
  );

  const solvedCount = lesson?.exercises.filter((e) => e.solved).length ?? 0;
  const total = lesson?.exercises.length ?? 0;

  const onSubmitResult = (r: SubmitResult) => {
    setFeedback(r);
    setOpenFeedback(true);
    queryClient.invalidateQueries({ queryKey: ['lesson', userId, lessonId] });
    queryClient.invalidateQueries({ queryKey: ['me'] });
    queryClient.invalidateQueries({ queryKey: ['progress'] });
    queryClient.invalidateQueries({ queryKey: ['me', 'enrolled-courses'] });
    if (r.lessonCompleted) {
      setAllDone(true);
    }
  };

  if (!lessonId) return null;

  if (!hydrated || isLoading) {
    return <PageLoader label="Carregando aula…" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Não foi possível abrir esta aula."
        error={error}
        hint={
          <p>
            Se você ainda não se matriculou no curso, abra <Link to="/app/courses">Cursos</Link> e matricule-se.
            Confira também se a API está rodando.
          </p>
        }
      />
    );
  }

  if (!lesson) return null;

  const isComplete = allDone || (total > 0 && solvedCount === total);

  const moduleAnchor = `/app/my-courses/${lesson.course.slug}#module-${encodeURIComponent(lesson.module.id)}`;

  return (
    <div className="relative min-w-0 space-y-8 overflow-x-hidden pb-6 [background:radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.08),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(129,39,207,0.05),transparent_45%)]">
      <div
        className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-violet-400/12 blur-3xl"
        aria-hidden
      />

      <nav
        className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-600 sm:gap-2"
        aria-label="Navegação da aula"
      >
        <Link
          to="/app/my-courses"
          className="inline-flex min-h-11 min-w-0 max-w-full items-center rounded-full border border-white/60 bg-white/80 px-3 py-2 shadow-sm backdrop-blur-sm transition hover:border-indigo-200 hover:bg-white hover:text-indigo-900"
        >
          Meus cursos
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 self-center text-slate-400" aria-hidden />
        <Link
          to={`/app/my-courses/${lesson.course.slug}`}
          className="inline-flex min-h-11 min-w-0 max-w-[10rem] items-center truncate rounded-full border border-white/60 bg-white/80 px-3 py-2 shadow-sm backdrop-blur-sm transition hover:border-indigo-200 hover:bg-white hover:text-indigo-900 sm:max-w-[14rem]"
          title={lesson.course.title}
        >
          {lesson.course.title}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 self-center text-slate-400" aria-hidden />
        <Link
          to={moduleAnchor}
          className="inline-flex min-h-11 min-w-0 max-w-[10rem] items-center truncate rounded-full border border-indigo-100 bg-indigo-50/90 px-3 py-2 text-indigo-900 shadow-sm ring-1 ring-indigo-100/80 transition hover:bg-indigo-100 sm:max-w-[14rem]"
          title={lesson.module.title}
        >
          {lesson.module.title}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 self-center text-slate-400" aria-hidden />
        <span
          className="inline-flex min-h-11 min-w-0 max-w-[12rem] items-center truncate rounded-full bg-slate-900 px-3 py-2 font-bold text-white shadow-md sm:max-w-[18rem]"
          title={lesson.title}
        >
          {lesson.title}
        </span>
      </nav>

      <header className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_60px_-24px_rgba(30,27,75,0.15)] backdrop-blur-xl sm:p-9">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-indigo-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 left-1/4 h-32 w-32 rounded-full bg-violet-400/10 blur-2xl" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-800">
              <Layers className="h-3.5 w-3.5" aria-hidden />
              Módulo
            </span>
            <Link
              to={moduleAnchor}
              className="inline-flex max-w-full items-center gap-1 text-sm font-bold text-indigo-700 underline decoration-indigo-300/60 underline-offset-4 transition hover:text-indigo-900"
            >
              {lesson.module.title}
              <ListTree className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
            </Link>
          </div>
          <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
            <BookOpen className="h-4 w-4 text-indigo-500" aria-hidden />
            {lesson.course.title}
          </p>
          <h1 className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-indigo-950 sm:text-4xl md:text-[2.35rem] md:leading-tight">
            {lesson.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 font-medium ring-1 ring-slate-200/80">
              ~{lesson.estimatedMinutes} min de leitura
            </span>
            {total > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 font-medium ring-1 ring-slate-200/80">
                {total} desafio{total !== 1 ? 's' : ''}
              </span>
            ) : null}
          </div>
          {lesson.objective && (
            <div className="mt-5 max-w-3xl space-y-2 border-l-4 border-indigo-300/80 pl-4">
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-800">Objetivo da aula</p>
              <p className="text-base leading-relaxed text-slate-600">{lesson.objective}</p>
            </div>
          )}
          {total > 0 ? (
            <div className="mt-6 max-w-3xl rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 py-4 text-left ring-1 ring-indigo-100/80">
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-900">O que você vai praticar</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-700">
                {lesson.exercises.map((ex) => (
                  <li key={ex.id}>
                    <span className="font-medium text-slate-800">{ex.title}</span>
                    <span className="text-slate-500">
                      {' '}
                      ({ex.type === 'MULTIPLE_CHOICE' ? 'quiz' : ex.type === 'CODE_FILL' ? 'lacunas' : 'editor de código'})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </header>

      {total > 0 && <SessionProgressBar current={solvedCount} total={total} />}

      <article className="prose prose-slate prose-headings:font-bold prose-a:text-indigo-600 prose-pre:rounded-xl max-w-none overflow-x-auto rounded-[1.75rem] border border-slate-200/60 bg-white p-6 shadow-lg shadow-slate-200/30 ring-1 ring-slate-100 sm:p-8 md:p-10 prose-pre:bg-slate-900 prose-pre:text-slate-100">
        <ReactMarkdown>{lesson.contentMd}</ReactMarkdown>
      </article>

      {isComplete && (
        <div className="relative overflow-hidden rounded-[2rem] border-2 border-emerald-200/80 bg-emerald-50 p-8 text-center shadow-xl shadow-emerald-500/10 sm:p-10">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-400/20 blur-2xl" />
          <span className="relative inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-3xl shadow-lg shadow-emerald-600/25">
            <Trophy className="h-10 w-10 text-white" aria-hidden />
          </span>
          <div className="relative mt-4">
            <h2 className="text-2xl font-black text-emerald-900">Aula concluída!</h2>
            <p className="mt-2 text-sm text-emerald-800/90">
              Todos os exercícios resolvidos. Continue avançando no curso!
            </p>
          </div>
          <Link
            to={`/app/my-courses/${lesson.course.slug}`}
            className="relative mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-700"
          >
            Voltar ao curso
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      )}

      {total > 0 && (
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex min-w-0 flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Desafios</h2>
              <p className="text-sm text-slate-500">Toque em um para abrir o editor</p>
            </div>
            {isComplete && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200/80">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                Tudo feito
              </span>
            )}
          </div>
          <ul className="space-y-3">
            {lesson.exercises.map((ex, idx) => (
              <li key={ex.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(activeId === ex.id ? null : ex.id)}
                  aria-expanded={activeId === ex.id}
                  className={[
                    'group flex w-full items-center justify-between rounded-2xl border-2 px-4 py-4 text-left transition',
                    ex.solved
                      ? 'border-emerald-200 bg-emerald-50/90 hover:border-emerald-300'
                      : activeId === ex.id
                        ? 'border-indigo-400 bg-indigo-50 shadow-md shadow-indigo-500/10'
                        : 'border-slate-200/80 bg-white shadow-sm hover:border-indigo-300 hover:shadow-md',
                  ].join(' ')}
                >
                  <span className="flex items-center gap-4">
                    {ex.solved ? (
                      <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-500" aria-hidden />
                    ) : (
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-sm font-black text-white shadow-md">
                        {idx + 1}
                      </span>
                    )}
                    <span
                      className={
                        ex.solved ? 'font-bold text-emerald-900' : 'font-bold text-slate-900'
                      }
                    >
                      {ex.title}
                    </span>
                  </span>
                  <span
                    className={
                      ex.solved
                        ? 'inline-flex items-center gap-1 text-xs font-bold text-emerald-700'
                        : 'inline-flex items-center gap-2 text-xs font-bold text-indigo-600'
                    }
                  >
                    {ex.solved ? (
                      'Concluído'
                    ) : (
                      <>
                        <Zap className="h-3.5 w-3.5 text-amber-500" aria-hidden />
                        +{ex.xpReward} XP
                        <Gem className="h-3.5 w-3.5 text-sky-500" aria-hidden />
                        +{ex.gemReward}
                      </>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {active && (
        <section className="mx-auto max-w-3xl" aria-label="Exercício ativo">
          <ExerciseRunner key={active.id} exercise={active} onAfterSubmit={onSubmitResult} />
        </section>
      )}

      <FeedbackDrawer
        open={openFeedback}
        result={feedback}
        exerciseId={active?.id ?? null}
        onExplanationUnlocked={(p) => {
          setFeedback((f) =>
            f
              ? {
                  ...f,
                  explanation: p.explanation,
                  requiresGemForFullExplanation: false,
                  hintTier: undefined,
                }
              : f,
          );
          useAuthStore.getState().patchUser({ gems: p.gemsRemaining });
        }}
        onClose={() => {
          setOpenFeedback(false);
          if (feedback?.correct && lesson) {
            const nextUnsolved = lesson.exercises.find((e) => !e.solved && e.id !== activeId);
            if (nextUnsolved) {
              setTimeout(() => setActiveId(nextUnsolved.id), 200);
            }
          }
        }}
      />
    </div>
  );
}
