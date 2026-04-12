import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import type { LessonDetail } from '../types/catalog';
import { SessionProgressBar } from '../components/SessionProgressBar';
import { ExerciseRunner, type SubmitResult } from '../components/ExerciseRunner';
import { FeedbackDrawer } from '../components/FeedbackDrawer';

export function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<SubmitResult | null>(null);
  const [openFeedback, setOpenFeedback] = useState(false);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => apiFetch<LessonDetail>(`/lessons/${lessonId}`, { token: token! }),
    enabled: !!lessonId && !!token,
  });

  const active = useMemo(
    () => lesson?.exercises.find((e) => e.id === activeId) ?? null,
    [lesson, activeId],
  );

  const solvedCount = lesson?.exercises.filter((e) => e.solved).length ?? 0;
  const total = lesson?.exercises.length ?? 0;

  const onSubmitResult = (r: SubmitResult) => {
    setFeedback(r);
    setOpenFeedback(true);
    queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] });
    queryClient.invalidateQueries({ queryKey: ['me'] });
    queryClient.invalidateQueries({ queryKey: ['progress'] });
  };

  if (!lessonId) return null;
  if (isLoading || !lesson) {
    return <p className="text-center text-slate-500">Carregando aula…</p>;
  }

  return (
    <div className="space-y-8">
      <nav className="text-sm text-slate-500">
        <Link to="/app/tracks" className="hover:text-blue-600">
          Trilhas
        </Link>
        <span className="mx-2">/</span>
        <Link to={`/app/tracks/${lesson.track.slug}`} className="hover:text-blue-600">
          {lesson.track.title}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-800">{lesson.title}</span>
      </nav>

      <header>
        <p className="text-sm font-medium text-blue-600">{lesson.course.title}</p>
        <h1 className="text-3xl font-bold text-slate-900">{lesson.title}</h1>
        {lesson.objective && <p className="mt-2 text-lg text-slate-600">{lesson.objective}</p>}
      </header>

      <SessionProgressBar current={solvedCount} total={total} />

      <article className="prose prose-slate max-w-none rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft prose-pre:bg-slate-100 prose-pre:text-slate-800">
        <ReactMarkdown>{lesson.contentMd}</ReactMarkdown>
      </article>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Exercícios</h2>
        <ul className="mt-4 space-y-2">
          {lesson.exercises.map((ex) => (
            <li key={ex.id}>
              <button
                type="button"
                onClick={() => setActiveId(ex.id)}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-blue-300"
              >
                <span className="font-medium text-slate-900">{ex.title}</span>
                <span className="text-xs text-slate-500">
                  {ex.solved ? 'Concluído' : `${ex.xpReward} XP`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {active && (
        <section className="rounded-3xl border border-blue-200 bg-blue-50/50 p-6 shadow-inner">
          <h3 className="text-lg font-semibold text-slate-900">{active.title}</h3>
          <p className="mt-2 whitespace-pre-wrap text-slate-700">{active.prompt}</p>
          <div className="mt-6">
            <ExerciseRunner exercise={active} onAfterSubmit={onSubmitResult} />
          </div>
        </section>
      )}

      <FeedbackDrawer open={openFeedback} result={feedback} onClose={() => setOpenFeedback(false)} />
    </div>
  );
}
