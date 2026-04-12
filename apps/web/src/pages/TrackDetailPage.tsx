import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Clock } from 'lucide-react';
import { apiFetch } from '../lib/api';
import type { TrackDetail } from '../types/catalog';

export function TrackDetailPage() {
  const { trackId } = useParams<{ trackId: string }>();
  const { data, isLoading, error } = useQuery({
    queryKey: ['track', trackId],
    queryFn: () => apiFetch<TrackDetail>(`/tracks/${trackId}`),
    enabled: !!trackId,
  });

  if (!trackId) return null;
  if (isLoading) return <p className="text-center text-slate-500">Carregando trilha…</p>;
  if (error || !data) return <p className="text-center text-red-600">Trilha não encontrada.</p>;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-blue-600">Trilha</p>
        <h1 className="text-3xl font-bold text-slate-900">{data.title}</h1>
        {data.description && <p className="mt-2 max-w-2xl text-slate-600">{data.description}</p>}
      </div>

      {data.courses.map((course) => (
        <section key={course.id} className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-900">{course.title}</h2>
          {course.description && <p className="mt-1 text-sm text-slate-600">{course.description}</p>}
          <div className="mt-6 space-y-6">
            {course.modules.map((mod) => (
              <div key={mod.id}>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{mod.title}</h3>
                <ul className="mt-3 space-y-2">
                  {mod.lessons.map((lesson) => (
                    <li key={lesson.id}>
                      <Link
                        to={`/app/lessons/${lesson.id}`}
                        className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-left transition hover:border-blue-200 hover:bg-white"
                      >
                        <span className="font-medium text-slate-900">{lesson.title}</span>
                        <span className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {lesson.estimatedMinutes} min
                          </span>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
