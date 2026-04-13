import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Navigate, useParams } from 'react-router-dom';
import { GitCompare, Loader2, UserPlus, UserMinus } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch, ApiError } from '../lib/api';
import { useAuthHydration, useAuthStore } from '../stores/authStore';
import type { PublicProfile } from '../types/social';
import { Avatar } from '../components/Avatar';
import { ErrorState } from '../components/ui/ErrorState';
import { PageLoader } from '../components/ui/PageLoader';

export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const token = useAuthStore((s) => s.token);
  const me = useAuthStore((s) => s.user);
  const hydrated = useAuthHydration();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users', userId, 'profile'],
    queryFn: () => apiFetch<PublicProfile>(`/users/${userId}`, { token: token! }),
    enabled: hydrated && !!token && !!userId,
  });

  const followMut = useMutation({
    mutationFn: async (action: 'follow' | 'unfollow') => {
      return apiFetch<{ following: boolean }>(`/users/${userId}/follow`, {
        method: action === 'follow' ? 'POST' : 'DELETE',
        token: token!,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
      queryClient.invalidateQueries({ queryKey: ['users', me?.id, 'following'] });
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : 'Não foi possível atualizar.');
    },
  });

  if (!userId) return null;
  if (me?.id === userId) {
    return <Navigate to="/app/me" replace />;
  }

  if (!hydrated || isLoading) return <PageLoader label="Carregando perfil…" />;
  if (isError || !data) {
    return (
      <ErrorState
        title="Perfil indisponível."
        error={error instanceof Error ? error : new Error()}
        hint={<p>O usuário pode não existir ou não estar visível.</p>}
      />
    );
  }

  const pct =
    data.xpProgress.bandSize > 0
      ? Math.min(100, Math.round((data.xpProgress.currentBandXp / data.xpProgress.bandSize) * 100))
      : 0;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="h-2 bg-indigo-600" />
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
          <Avatar userId={data.id} displayName={data.displayName} size="xl" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{data.displayName}</h1>
            {data.bio && <p className="mt-2 text-sm text-slate-600">{data.bio}</p>}
            <p className="mt-2 text-xs text-slate-400">
              Membro desde{' '}
              {new Date(data.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
              <span>
                <strong className="text-slate-900">{data.followerCount}</strong> seguidores
              </span>
              <span>
                <strong className="text-slate-900">{data.followingCount}</strong> seguindo
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {data.isFollowing ? (
                <button
                  type="button"
                  disabled={followMut.isPending}
                  onClick={() => followMut.mutate('unfollow')}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {followMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4" />}
                  Deixar de seguir
                </button>
              ) : (
                <button
                  type="button"
                  disabled={followMut.isPending}
                  onClick={() => followMut.mutate('follow')}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  {followMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  Seguir
                </button>
              )}
              <Link
                to={`/app/users/${userId}/compare`}
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-800 transition hover:bg-indigo-100"
              >
                <GitCompare className="h-4 w-4" />
                Comparar comigo
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Nível & XP</p>
        <p className="mt-1 text-2xl font-black text-slate-900">Nv. {data.level}</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-sm text-slate-600">
          {data.xpTotal.toLocaleString('pt-BR')} XP total · {pct}% para o próximo nível
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Gemas" value={String(data.gems)} />
        <Stat label="Sequência" value={`${data.currentStreak}d`} />
        <Stat label="Aulas" value={String(data.completedLessons)} />
        <Stat label="Exercícios" value={String(data.solvedExercises)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-center">
      <p className="text-lg font-black text-slate-900">{value}</p>
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
    </div>
  );
}
