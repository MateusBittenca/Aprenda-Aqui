import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Flame,
  Gem,
  GitCompare,
  Loader2,
  Sparkles,
  Trophy,
  UserPlus,
  UserMinus,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch, ApiError, requireToken } from '../lib/api';
import { useAuthHydration, useAuthStore } from '../stores/authStore';
import type { PublicProfile } from '../types/social';
import { getRankForLevel } from '../lib/levelTitles';
import { Avatar } from '../components/Avatar';
import { ErrorState } from '../components/ui/ErrorState';
import { PageLoader } from '../components/ui/PageLoader';
import { FollowListModal } from '../components/FollowListModal';
import type { FollowListKind } from '../hooks/useFollowList';

const cardShadow = 'shadow-card';

export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const token = useAuthStore((s) => s.token);
  const me = useAuthStore((s) => s.user);
  const hydrated = useAuthHydration();
  const queryClient = useQueryClient();
  const [followModalKind, setFollowModalKind] = useState<FollowListKind | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users', userId, 'profile'],
    queryFn: () => apiFetch<PublicProfile>(`/users/${userId}`, { token: requireToken(token) }),
    enabled: hydrated && !!token && !!userId,
  });

  const followMut = useMutation({
    mutationFn: async (action: 'follow' | 'unfollow') => {
      return apiFetch<{ following: boolean }>(`/users/${userId}/follow`, {
        method: action === 'follow' ? 'POST' : 'DELETE',
        token: requireToken(token),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', userId, 'profile'] });
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

  const xpToNext =
    data.xpProgress.bandSize > 0 ? Math.max(0, data.xpProgress.bandSize - data.xpProgress.currentBandXp) : 0;

  const rank = getRankForLevel(data.level);
  const memberSince = new Date(data.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="relative mx-auto max-w-5xl pb-10">
      <div
        className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-violet-400/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-0 top-32 h-48 w-48 rounded-full bg-indigo-400/10 blur-3xl"
        aria-hidden
      />

      <Link
        to="/app/community"
        className="relative mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Voltar à comunidade
      </Link>

      <div className="relative grid gap-8 lg:grid-cols-12 lg:gap-10">
        {/* Coluna principal */}
        <div className="space-y-6 lg:col-span-7">
          <section
            className={`relative overflow-hidden rounded-[1.35rem] border border-surface-container-high/90 bg-surface-container-lowest/90 p-6 backdrop-blur-sm sm:p-8 ${cardShadow}`}
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary/10" aria-hidden />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="relative mx-auto shrink-0 sm:mx-0">
                <div className="h-28 w-28 overflow-hidden rounded-2xl border-4 border-surface-container-lowest shadow-lg ring-2 ring-surface-container-high sm:h-32 sm:w-32">
                  <Avatar
                    userId={data.id}
                    displayName={data.displayName}
                    colorKey={data.avatarColorKey}
                    size="xl"
                    className="!h-full !w-full !rounded-2xl !text-4xl sm:!text-5xl"
                  />
                </div>
                {data.isFollowing && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
                    Seguindo
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl">
                  {data.displayName}
                </h1>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                  Membro desde {memberSince}
                </p>

                {data.bio ? (
                  <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">{data.bio}</p>
                ) : (
                  <p className="mt-4 text-sm italic text-on-surface-variant">Sem bio pública ainda.</p>
                )}

                <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <button
                    type="button"
                    onClick={() => setFollowModalKind('followers')}
                    aria-label="Ver seguidores"
                    className="press-tactile focus-ring-primary inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1.5 text-sm text-on-surface transition duration-300 ease-ios-out hover:bg-primary/5 hover:text-primary"
                  >
                    <span className="font-bold tabular-nums text-on-surface">{data.followerCount}</span>
                    seguidores
                  </button>
                  <button
                    type="button"
                    onClick={() => setFollowModalKind('following')}
                    aria-label="Ver seguindo"
                    className="press-tactile focus-ring-primary inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1.5 text-sm text-on-surface transition duration-300 ease-ios-out hover:bg-primary/5 hover:text-primary"
                  >
                    <span className="font-bold tabular-nums text-on-surface">{data.followingCount}</span>
                    seguindo
                  </button>
                </div>

                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                  {data.isFollowing ? (
                    <>
                      <Link
                        to={`/app/users/${userId}/compare`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-primary-dim sm:flex-initial"
                      >
                        <GitCompare className="h-4 w-4 shrink-0" aria-hidden />
                        Comparar comigo
                      </Link>
                      <button
                        type="button"
                        disabled={followMut.isPending}
                        onClick={() => followMut.mutate('unfollow')}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-surface-container-high bg-surface-container-lowest px-4 py-3 text-sm font-semibold text-on-surface transition hover:bg-surface-container-low sm:flex-initial"
                      >
                        {followMut.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        ) : (
                          <UserMinus className="h-4 w-4 shrink-0" aria-hidden />
                        )}
                        Deixar de seguir
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={followMut.isPending}
                        onClick={() => followMut.mutate('follow')}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-primary-dim sm:flex-initial"
                      >
                        {followMut.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        ) : (
                          <UserPlus className="h-4 w-4 shrink-0" aria-hidden />
                        )}
                        Seguir
                      </button>
                      <Link
                        to={`/app/users/${userId}/compare`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-primary/25 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary transition hover:border-primary/40 hover:bg-primary/10 sm:flex-initial"
                      >
                        <GitCompare className="h-4 w-4 shrink-0" aria-hidden />
                        Comparar comigo
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section
            className={`rounded-[1.35rem] border border-surface-container-high/90 bg-gradient-to-br from-surface-container-lowest to-primary/5 p-6 sm:p-7 ${cardShadow}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                  <Trophy className="h-4 w-4 text-amber-500" aria-hidden />
                  Nível &amp; XP
                </p>
                <p className="mt-2 font-headline text-3xl font-black tabular-nums text-on-surface">Nv. {data.level}</p>
                <p className="mt-1 text-sm font-medium text-primary">{rank.name}</p>
                <p className="mt-0.5 max-w-md text-xs text-on-surface-variant">{rank.description}</p>
              </div>
              <div className="rounded-2xl border border-primary/20 bg-surface-container-low/90 px-4 py-3 text-right shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">XP total</p>
                <p className="text-lg font-black tabular-nums text-on-surface">{data.xpTotal.toLocaleString('pt-BR')}</p>
              </div>
            </div>
            <div className="mt-5">
              <div className="mb-1.5 flex justify-between text-xs font-medium text-on-surface-variant">
                <span>Progresso neste nível</span>
                <span className="tabular-nums">{pct}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-surface-container-high/80">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-tertiary transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-on-surface-variant">
                {xpToNext > 0 ? (
                  <>
                    Faltam <strong className="text-on-surface">{xpToNext.toLocaleString('pt-BR')} XP</strong> para o
                    próximo nível.
                  </>
                ) : (
                  <>Próximo nível logo ali — continue praticando.</>
                )}
              </p>
            </div>
          </section>
        </div>

        {/* Sidebar stats */}
        <aside className="space-y-4 lg:col-span-5">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <StatTile
              icon={<Gem className="h-5 w-5 text-sky-500" aria-hidden />}
              label="Gemas"
              value={data.gems.toLocaleString('pt-BR')}
            />
            <StatTile
              icon={<Flame className="h-5 w-5 text-orange-500" aria-hidden />}
              label="Ofensiva"
              value={`${data.currentStreak}d`}
              hint={data.longestStreak > 0 ? `Recorde ${data.longestStreak}d` : undefined}
            />
            <StatTile
              icon={<BookOpen className="h-5 w-5 text-emerald-600" aria-hidden />}
              label="Aulas feitas"
              value={String(data.completedLessons)}
            />
            <StatTile
              icon={<Zap className="h-5 w-5 text-violet-600" aria-hidden />}
              label="Exercícios"
              value={String(data.solvedExercises)}
            />
          </div>

          <div
            className={`rounded-[1.25rem] border border-primary/20 bg-primary/5 p-5 ${cardShadow}`}
          >
            <div className="flex gap-3">
              <Sparkles className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-on-surface">Dica</p>
                <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
                  Use <strong>Comparar comigo</strong> para ver lado a lado XP, ofensiva e atividade com este perfil.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <FollowListModal
        open={followModalKind !== null}
        userId={data.id}
        initialKind={followModalKind ?? 'followers'}
        followerCount={data.followerCount}
        followingCount={data.followingCount}
        ownerDisplayName={data.displayName}
        onClose={() => setFollowModalKind(null)}
      />
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div
      className={`flex min-h-[5.5rem] flex-col justify-center rounded-2xl border border-surface-container-high/90 bg-surface-container-lowest/95 p-4 ${cardShadow}`}
    >
      <div className="mb-2 flex items-center gap-2 text-on-surface-variant">{icon}</div>
      <p className="text-xl font-black tabular-nums tracking-tight text-on-surface sm:text-2xl">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">{label}</p>
      {hint && <p className="mt-1 text-[11px] text-on-surface-variant">{hint}</p>}
    </div>
  );
}
