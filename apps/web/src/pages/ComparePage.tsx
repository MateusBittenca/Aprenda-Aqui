import { useQuery } from '@tanstack/react-query';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { apiFetch, requireToken } from '../lib/api';
import { useAuthHydration, useAuthStore } from '../stores/authStore';
import type { ComparePayload } from '../types/social';
import { Avatar } from '../components/Avatar';
import { ErrorState } from '../components/ui/ErrorState';
import { PageLoader } from '../components/ui/PageLoader';

export function ComparePage() {
  const { userId } = useParams<{ userId: string }>();
  const token = useAuthStore((s) => s.token);
  const me = useAuthStore((s) => s.user);
  const hydrated = useAuthHydration();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users', userId, 'compare'],
    queryFn: () => apiFetch<ComparePayload>(`/users/${userId}/compare`, { token: requireToken(token) }),
    enabled: hydrated && !!token && !!userId && userId !== me?.id,
  });

  if (!userId) return null;
  if (me?.id === userId) {
    return <Navigate to="/app/me" replace />;
  }

  if (!hydrated || isLoading) return <PageLoader label="Carregando comparação…" />;
  if (isError || !data) {
    return <ErrorState title="Não foi possível comparar." error={error instanceof Error ? error : new Error()} />;
  }

  const rows: { label: string; you: string | number; them: string | number }[] = [
    { label: 'Nível', you: data.you.level, them: data.them.level },
    { label: 'XP total', you: data.you.xpTotal.toLocaleString('pt-BR'), them: data.them.xpTotal.toLocaleString('pt-BR') },
    { label: 'Gemas', you: data.you.gems, them: data.them.gems },
    { label: 'Sequência (dias)', you: data.you.currentStreak, them: data.them.currentStreak },
    { label: 'Recorde sequência', you: data.you.longestStreak, them: data.them.longestStreak },
    { label: 'Aulas concluídas', you: data.you.completedLessons, them: data.them.completedLessons },
    { label: 'Exercícios resolvidos', you: data.you.solvedExercises, them: data.them.solvedExercises },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to={`/app/users/${userId}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-indigo-600"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Voltar ao perfil de {data.them.displayName}
      </Link>

      <h1 className="text-2xl font-bold text-slate-900">Comparar progresso</h1>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-3 gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
          <span className="text-left">Métrica</span>
          <span>Você</span>
          <span>{data.them.displayName}</span>
        </div>
        <div className="grid grid-cols-3 items-center gap-2 border-b border-slate-100 px-4 py-4">
          <span />
          <div className="flex flex-col items-center gap-1">
            <Avatar userId={data.you.id} displayName={data.you.displayName} colorKey={data.you.avatarColorKey} size="md" />
            <span className="text-xs font-semibold text-slate-800">Você</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Avatar userId={data.them.id} displayName={data.them.displayName} colorKey={data.them.avatarColorKey} size="md" />
            <span className="text-xs font-semibold text-slate-800 line-clamp-2">{data.them.displayName}</span>
          </div>
        </div>
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-3 gap-2 border-b border-slate-50 px-4 py-3 text-sm last:border-0"
          >
            <span className="text-slate-600">{row.label}</span>
            <span className="text-center font-bold tabular-nums text-slate-900">{row.you}</span>
            <span className="text-center font-bold tabular-nums text-indigo-700">{row.them}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
