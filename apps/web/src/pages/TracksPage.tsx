import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { apiFetch } from '../lib/api';
import type { TrackSummary } from '../types/catalog';

export function TracksPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tracks'],
    queryFn: () => apiFetch<TrackSummary[]>('/tracks'),
  });

  if (isLoading) return <p className="text-center text-slate-500">Carregando trilhas…</p>;
  if (error || !data) return <p className="text-center text-red-600">Não foi possível carregar as trilhas.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Trilhas</h1>
        <p className="mt-1 text-slate-600">Escolha um caminho e avance em microaulas.</p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {data.map((t) => (
          <li key={t.id}>
            <Link
              to={`/app/tracks/${t.slug}`}
              className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 transition hover:border-blue-200 hover:shadow-xl"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <BookOpen className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">{t.title}</h2>
              {t.description && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{t.description}</p>}
              <span className="mt-4 text-xs font-medium text-blue-600">
                {t._count.courses} curso(s)
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
