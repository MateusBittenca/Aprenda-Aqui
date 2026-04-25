import { useQuery } from '@tanstack/react-query';
import { Link, Navigate, useParams } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Flame,
  Gem,
  GitCompare,
  ListChecks,
  Trophy,
  Zap,
} from 'lucide-react';
import { apiFetch, requireToken } from '../lib/api';
import { useAuthHydration, useAuthStore } from '../stores/authStore';
import type { ComparePayload } from '../types/social';
import { Avatar } from '../components/Avatar';
import { ErrorState } from '../components/ui/ErrorState';
import { PageLoader } from '../components/ui/PageLoader';

const cardShadow = 'shadow-card';

type MetricDef = {
  key: string;
  label: string;
  Icon: LucideIcon;
  you: number;
  them: number;
  format: (n: number) => string;
};

function leaderFor(you: number, them: number): 'you' | 'them' | 'tie' {
  if (you > them) return 'you';
  if (them > you) return 'them';
  return 'tie';
}

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

  const metrics: MetricDef[] = [
    {
      key: 'level',
      label: 'Nível',
      Icon: Trophy,
      you: data.you.level,
      them: data.them.level,
      format: (n) => String(n),
    },
    {
      key: 'xp',
      label: 'XP total',
      Icon: Zap,
      you: data.you.xpTotal,
      them: data.them.xpTotal,
      format: (n) => n.toLocaleString('pt-BR'),
    },
    {
      key: 'gems',
      label: 'Gemas',
      Icon: Gem,
      you: data.you.gems,
      them: data.them.gems,
      format: (n) => String(n),
    },
    {
      key: 'streak',
      label: 'Sequência (dias)',
      Icon: Flame,
      you: data.you.currentStreak,
      them: data.them.currentStreak,
      format: (n) => String(n),
    },
    {
      key: 'longest',
      label: 'Recorde sequência',
      Icon: Award,
      you: data.you.longestStreak,
      them: data.them.longestStreak,
      format: (n) => String(n),
    },
    {
      key: 'lessons',
      label: 'Aulas concluídas',
      Icon: BookOpen,
      you: data.you.completedLessons,
      them: data.them.completedLessons,
      format: (n) => String(n),
    },
    {
      key: 'exercises',
      label: 'Exercícios resolvidos',
      Icon: ListChecks,
      you: data.you.solvedExercises,
      them: data.them.solvedExercises,
      format: (n) => String(n),
    },
  ];

  let youLeadCount = 0;
  let themLeadCount = 0;
  for (const m of metrics) {
    const L = leaderFor(m.you, m.them);
    if (L === 'you') youLeadCount += 1;
    else if (L === 'them') themLeadCount += 1;
  }

  const themFirst = data.them.displayName.split(/\s+/)[0] ?? data.them.displayName;

  return (
    <div className="relative mx-auto max-w-3xl pb-10">
      <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-violet-400/15 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute left-0 top-32 h-48 w-48 rounded-full bg-indigo-400/10 blur-3xl" aria-hidden />

      <Link
        to={`/app/users/${userId}`}
        className="relative mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Voltar ao perfil de {data.them.displayName}
      </Link>

      <header className="relative mb-6 space-y-2">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20">
            <GitCompare className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-on-surface">Comparar progresso</h1>
            <p className="text-sm text-on-surface-variant">
              Suas estatísticas ficam abaixo do seu avatar e as do amigo abaixo do avatar dele.
            </p>
          </div>
        </div>
        <p className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-on-surface">
          <span className="font-semibold text-primary">Resumo:</span>{' '}
          Você lidera em <strong className="tabular-nums">{youLeadCount}</strong> de {metrics.length} métricas
          {themLeadCount > 0 ? (
            <>
              {' '}
              · {themFirst} lidera em <strong className="tabular-nums">{themLeadCount}</strong>
            </>
          ) : null}
          {youLeadCount + themLeadCount < metrics.length ? (
            <>
              {' '}
              · {metrics.length - youLeadCount - themLeadCount} empate
              {metrics.length - youLeadCount - themLeadCount === 1 ? '' : 's'}
            </>
          ) : null}
        </p>
      </header>

      <div
        className={`relative overflow-hidden rounded-[1.35rem] border border-surface-container-high/90 bg-surface-container-lowest/90 backdrop-blur-sm ${cardShadow}`}
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10" aria-hidden />

        <div className="relative px-4 py-6 sm:px-6 sm:py-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto_1fr] lg:items-start lg:gap-6">
            {/* Coluna: Você */}
            <section aria-labelledby="compare-you-heading" className="flex min-w-0 flex-col">
              <div className="flex flex-col items-center border-b border-surface-container-high/60 pb-5 text-center lg:border-b-0 lg:pb-4">
                <div className="relative">
                  <div className="rounded-2xl border-2 border-surface-container-lowest p-0.5 shadow-md ring-2 ring-primary/25">
                    <Avatar userId={data.you.id} displayName={data.you.displayName} colorKey={data.you.avatarColorKey} size="lg" />
                  </div>
                  {youLeadCount > themLeadCount ? (
                    <span
                      className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-amber-950 shadow-md ring-2 ring-surface-container-lowest"
                      title="À frente no placar geral"
                    >
                      1º
                    </span>
                  ) : null}
                </div>
                <h2 id="compare-you-heading" className="mt-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                  Você
                </h2>
              </div>

              <ul className="mt-1 w-full space-y-2.5">
                {metrics.map((m) => {
                  const L = leaderFor(m.you, m.them);
                  const max = Math.max(m.you, m.them, 1);
                  const youBar = (m.you / max) * 100;
                  return (
                    <li key={`you-${m.key}`}>
                      <div
                        className={`rounded-xl px-3 py-2.5 ring-1 transition-colors ${
                          L === 'you'
                            ? 'bg-primary/5 ring-primary/25'
                            : L === 'tie'
                              ? 'bg-surface-container-low/90 ring-surface-container-high/80'
                              : 'bg-surface-container-lowest ring-surface-container-high/80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container-low text-on-surface-variant ring-1 ring-surface-container-high/70">
                              <m.Icon className="h-3.5 w-3.5" aria-hidden />
                            </span>
                            <span className="text-sm font-medium leading-snug text-on-surface">{m.label}</span>
                          </div>
                          <span
                            className={`shrink-0 tabular-nums text-base font-bold ${
                              L === 'you' ? 'text-primary' : 'text-on-surface'
                            }`}
                          >
                            {m.format(m.you)}
                          </span>
                        </div>
                        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-surface-container-high/90">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${youBar}%` }} />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            <div
              className="flex flex-col items-center justify-center gap-0 border-y border-surface-container-high/60 py-5 lg:min-h-[4rem] lg:border-y-0 lg:py-2"
              aria-hidden
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-low text-[10px] font-black uppercase tracking-widest text-on-surface-variant shadow-inner ring-1 ring-surface-container-high/80 lg:sticky lg:top-4 lg:h-12 lg:w-12 lg:text-xs">
                vs
              </div>
            </div>

            {/* Coluna: Amigo */}
            <section aria-labelledby="compare-them-heading" className="flex min-w-0 flex-col">
              <div className="flex flex-col items-center border-b border-surface-container-high/60 pb-5 text-center lg:border-b-0 lg:pb-4">
                <div className="relative">
                  <div className="rounded-2xl border-2 border-surface-container-lowest p-0.5 shadow-md ring-2 ring-tertiary/30">
                    <Avatar userId={data.them.id} displayName={data.them.displayName} colorKey={data.them.avatarColorKey} size="lg" />
                  </div>
                  {themLeadCount > youLeadCount ? (
                    <span
                      className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-amber-950 shadow-md ring-2 ring-surface-container-lowest"
                      title="À frente no placar geral"
                    >
                      1º
                    </span>
                  ) : null}
                </div>
                <h2
                  id="compare-them-heading"
                  className="mt-3 line-clamp-2 text-xs font-bold uppercase tracking-wide text-on-surface-variant"
                >
                  {data.them.displayName}
                </h2>
              </div>

              <ul className="mt-1 w-full space-y-2.5">
                {metrics.map((m) => {
                  const L = leaderFor(m.you, m.them);
                  const max = Math.max(m.you, m.them, 1);
                  const themBar = (m.them / max) * 100;
                  return (
                    <li key={`them-${m.key}`}>
                      <div
                        className={`rounded-xl px-3 py-2.5 ring-1 transition-colors ${
                          L === 'them'
                            ? 'bg-tertiary/10 ring-tertiary/30'
                            : L === 'tie'
                              ? 'bg-surface-container-low/90 ring-surface-container-high/80'
                              : 'bg-surface-container-lowest ring-surface-container-high/80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container-low text-on-surface-variant ring-1 ring-surface-container-high/70">
                              <m.Icon className="h-3.5 w-3.5" aria-hidden />
                            </span>
                            <span className="text-sm font-medium leading-snug text-on-surface">{m.label}</span>
                          </div>
                          <span
                            className={`shrink-0 tabular-nums text-base font-bold ${
                              L === 'them' ? 'text-tertiary' : 'text-on-surface'
                            }`}
                          >
                            {m.format(m.them)}
                          </span>
                        </div>
                        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-surface-container-high/90">
                          <div className="h-full rounded-full bg-tertiary" style={{ width: `${themBar}%` }} />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
