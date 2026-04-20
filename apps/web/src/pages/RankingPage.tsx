import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  ChevronRight,
  Flame,
  Gem,
  Medal,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useMe } from '../hooks/useMe';
import { PageLoader } from '../components/ui/PageLoader';
import { ErrorState } from '../components/ui/ErrorState';
import type { LeaderboardEntry } from '../hooks/useLeaderboard';

const cardShadow = 'shadow-[0_20px_40px_rgba(44,47,49,0.04)]';

function useSeasonCountdown() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  return useMemo(() => {
    void tick;
    const now = new Date();
    const target = new Date(now);
    const dow = now.getDay();
    const daysUntilSun = dow === 0 ? 7 : 7 - dow;
    target.setDate(now.getDate() + daysUntilSun);
    target.setHours(23, 59, 59, 999);
    let diff = target.getTime() - now.getTime();
    if (diff <= 0) {
      target.setDate(target.getDate() + 7);
      diff = target.getTime() - now.getTime();
    }
    const days = Math.floor(diff / 86_400_000);
    const hours = Math.floor((diff % 86_400_000) / 3_600_000);
    const mins = Math.floor((diff % 3_600_000) / 60_000);
    return { days, hours, mins };
  }, [tick]);
}

function leagueFromRank(myRank: number, total: number) {
  if (total <= 0) {
    return {
      title: 'Sua liga',
      subtitle: 'Participe do ranking completando aulas e exercícios.',
      variant: 'bronze' as const,
    };
  }
  const top10 = myRank <= Math.max(1, Math.ceil(total * 0.1));
  const top25 = myRank <= Math.max(1, Math.ceil(total * 0.25));
  if (top10) {
    return {
      title: 'Liga Ouro',
      subtitle: 'Você está entre os 10% melhores esta semana!',
      variant: 'gold' as const,
    };
  }
  if (top25) {
    return {
      title: 'Liga Prata',
      subtitle: 'Ótimo desempenho — continue para chegar à Liga Ouro!',
      variant: 'silver' as const,
    };
  }
  return {
    title: 'Liga Bronze',
    subtitle: 'Cada XP conta — suba no ranking para mudar de liga!',
    variant: 'bronze' as const,
  };
}

export function RankingPage() {
  const { data: lb, isLoading, isError, error } = useLeaderboard();
  const { data: me, hydrated } = useMe({});
  const countdown = useSeasonCountdown();

  if (isLoading || !hydrated) return <PageLoader label="Carregando ranking…" />;
  if (isError) return <ErrorState title="Não foi possível carregar o ranking." error={error} />;
  if (!lb) return null;

  const league = me ? leagueFromRank(lb.myRank, lb.total) : null;
  const top3 = lb.top.slice(0, 3);
  const listRest = lb.top.slice(3);
  const inTop = me ? lb.top.some((u) => u.id === me.id) : false;

  return (
    <div className="relative mx-auto w-full max-w-5xl pb-28 md:pb-8">
      {/* TopAppBar local (mockup) */}
      <header className="mb-8 flex min-h-[3.5rem] flex-wrap items-center justify-between gap-4 border-b border-surface-container-high/70 pb-4">
        <h1 className="font-headline text-lg font-bold text-primary sm:text-xl">Classificação</h1>
        {me && (
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1">
              <Flame className="h-5 w-5 text-red-600" aria-hidden />
              <span className="font-bold text-red-700">{me.currentStreak}</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
              <Gem className="h-5 w-5 text-primary" aria-hidden />
              <span className="font-bold text-primary">{me.gems.toLocaleString('pt-BR')}</span>
            </div>
            <div className="rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-white shadow-[0_4px_0_0_#004aad] transition active:translate-y-0.5 active:shadow-[0_2px_0_0_#004aad]">
              Nv. {me.level}
            </div>
          </div>
        )}
      </header>

      {/* Banner da liga */}
      {me && league && (
        <section
          className={`relative mb-10 overflow-hidden rounded-[1.25rem] border-b-4 border-surface-container-highest bg-surface-container-lowest p-6 sm:p-8 ${cardShadow}`}
        >
          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <div
                className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl shadow-lg ${
                  league.variant === 'gold'
                    ? 'bg-amber-400'
                    : league.variant === 'silver'
                      ? 'bg-slate-400'
                      : 'bg-orange-700'
                }`}
              >
                <Award className="h-10 w-10 text-white" strokeWidth={2} aria-hidden />
              </div>
              <div>
                <h2 className="font-headline text-2xl font-extrabold text-on-surface sm:text-3xl">{league.title}</h2>
                <p className="mt-1 font-medium text-on-surface-variant">{league.subtitle}</p>
              </div>
            </div>
            <div className="flex flex-col md:items-end">
              <span className="mb-2 text-xs font-bold uppercase tracking-widest text-outline">
                A temporada termina em:
              </span>
              <div className="flex gap-2">
                <CountBox value={countdown.days} label="Dias" />
                <CountBox value={countdown.hours} label="Horas" />
                <CountBox value={countdown.mins} label="Min" />
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute -bottom-10 -right-10 opacity-[0.06]">
            <Trophy className="h-48 w-48 text-primary" strokeWidth={1} aria-hidden />
          </div>
        </section>
      )}

      {/* Pódio */}
      {top3.length >= 3 && (
        <section className="mb-10 grid h-auto grid-cols-1 items-end gap-6 md:h-[26rem] md:grid-cols-3">
          <PodiumSlot entry={top3[1]} rank={2} myId={me?.id} order="order-2 md:order-1" />
          <PodiumSlot entry={top3[0]} rank={1} myId={me?.id} order="order-1 md:order-2" highlight />
          <PodiumSlot entry={top3[2]} rank={3} myId={me?.id} order="order-3" />
        </section>
      )}

      {/* Lista Top */}
      <section className={`mb-12 overflow-hidden rounded-[1.25rem] bg-surface-container-lowest ${cardShadow}`}>
        <div className="flex flex-col gap-2 border-b border-surface-container-high px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-headline text-lg font-extrabold text-on-surface">
            Top {Math.min(50, lb.top.length)} aprendizes
          </h3>
          {me && (
            <div className="flex items-center gap-2 text-xs font-bold text-outline-variant">
              <TrendingUp className="h-4 w-4 text-emerald-600" aria-hidden />
              Sua posição: #{lb.myRank}
            </div>
          )}
        </div>
        <div className="divide-y divide-surface-container-low">
          {listRest.map((entry, i) => {
            const rank = i + 4;
            const isMe = me?.id === entry.id;
            return (
              <RankRow
                key={entry.id}
                entry={entry}
                rank={rank}
                isMe={!!isMe}
                streakHint={isMe && lb.myRank < lb.total}
              />
            );
          })}
        </div>

        {me && !inTop && (
          <div className="border-t-2 border-dashed border-surface-container-high bg-primary/5">
            <div className="flex items-center border-l-4 border-primary p-4">
              <div className="w-10 text-center font-bold text-primary">#{lb.myRank}</div>
              <Avatar userId={me.id} displayName={me.displayName} size="md" className="!ml-4 !rounded-full !border-2 !border-primary" />
              <div className="ml-4 min-w-0 flex-1">
                <p className="font-bold text-on-surface">
                  Você ({me.displayName.split(' ')[0]})
                </p>
                <p className="text-xs font-bold text-primary">Continue subindo — complete mais aulas!</p>
              </div>
              <div className="text-right">
                <p className="font-black text-primary">{me.xpTotal.toLocaleString('pt-BR')}</p>
                <p className="text-[10px] font-bold uppercase text-outline">XP total</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Barra fixa — mobile */}
      {me && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-surface-container-high bg-surface-container-lowest/95 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] backdrop-blur-md md:hidden">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                #{lb.myRank}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{me.displayName}</p>
                <p className="text-[10px] font-bold uppercase text-primary">
                  {me.xpTotal.toLocaleString('pt-BR')} XP total
                </p>
              </div>
            </div>
            <Link
              to="/app/me"
              className="flex shrink-0 items-center gap-1 rounded-xl bg-secondary-container px-3 py-2 text-xs font-bold text-on-secondary-container"
            >
              Perfil
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function CountBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-[3.5rem] rounded-xl bg-surface-container-high px-3 py-2 text-center">
      <span className="block text-xl font-bold text-on-surface">{String(value).padStart(2, '0')}</span>
      <span className="text-[10px] font-bold uppercase text-outline">{label}</span>
    </div>
  );
}

function PodiumSlot({
  entry,
  rank,
  myId,
  order,
  highlight,
}: {
  entry: LeaderboardEntry;
  rank: 1 | 2 | 3;
  myId?: string;
  order: string;
  highlight?: boolean;
}) {
  const isMe = entry.id === myId;
  const baseHeights = { 1: 'h-44', 2: 'h-28', 3: 'h-24' };
  const ring =
    rank === 1
      ? 'bg-amber-400 p-1.5 shadow-xl ring-2 ring-amber-300/80'
      : rank === 2
        ? 'bg-slate-300 p-1'
        : 'bg-orange-400/80 p-1';

  const inner = (
    <>
      <div className={`relative mb-4 ${highlight ? 'mb-6 scale-110' : ''}`}>
        {rank === 1 && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 animate-bounce text-amber-400 motion-reduce:animate-none">
            <Medal className="h-8 w-8 text-amber-500" aria-hidden />
          </div>
        )}
        <div className={`relative ${ring} rounded-full`}>
          <Avatar
            userId={entry.id}
            displayName={entry.displayName}
            size="lg"
            className={`!h-20 !w-20 !rounded-full !text-2xl sm:!h-24 sm:!w-24 ${highlight ? '!text-3xl' : ''} ${isMe ? 'ring-4 ring-primary ring-offset-2' : ''}`}
          />
        </div>
        <div
          className={`absolute -bottom-2 -right-2 flex items-center justify-center rounded-full border-4 border-surface font-bold text-white shadow-lg ${
            rank === 1
              ? 'h-10 w-10 bg-amber-500 text-lg'
              : rank === 2
                ? 'h-8 w-8 bg-slate-400 text-sm'
                : 'h-8 w-8 bg-orange-600 text-sm'
          }`}
        >
          {rank}
        </div>
      </div>
      <div
        className={`flex w-full flex-col items-center justify-end rounded-t-xl p-6 shadow-inner ${baseHeights[rank]} ${
          rank === 1
            ? 'border-x-4 border-t-4 border-primary/15 bg-primary/15 shadow-lg'
            : 'bg-surface-container-low'
        }`}
      >
        <span className={`font-headline text-center font-bold text-on-surface ${rank === 1 ? 'text-xl font-extrabold' : ''}`}>
          {entry.displayName}
        </span>
        <span className="font-black text-primary">{entry.xpTotal.toLocaleString('pt-BR')} XP</span>
      </div>
    </>
  );

  if (isMe) {
    return <div className={`flex flex-col items-center ${order}`}>{inner}</div>;
  }

  return (
    <Link to={`/app/users/${entry.id}`} className={`flex flex-col items-center ${order}`}>
      {inner}
    </Link>
  );
}

function RankRow({
  entry,
  rank,
  isMe,
  streakHint,
}: {
  entry: LeaderboardEntry;
  rank: number;
  isMe: boolean;
  streakHint?: boolean;
}) {
  const inner = (
    <>
      <div className="w-10 text-center font-bold text-outline">#{rank}</div>
      <Avatar userId={entry.id} displayName={entry.displayName} size="md" className="!ml-4 !rounded-full" />
      <div className="ml-4 min-w-0 flex-1">
        <p className={`font-bold ${isMe ? 'text-on-surface' : 'text-on-surface'}`}>
          {entry.displayName}
          {isMe && <span className="ml-1 text-xs font-bold text-primary"> (você)</span>}
        </p>
        {isMe && streakHint && (
          <p className="text-xs font-bold text-primary">Continue firme — próximo nível está perto!</p>
        )}
      </div>
      <div className="text-right">
        <p className="font-black text-primary">{entry.xpTotal.toLocaleString('pt-BR')}</p>
        <p className="text-[10px] font-bold uppercase text-outline">XP total</p>
      </div>
    </>
  );

  const rowClass = `flex items-center p-4 transition-colors ${
    isMe ? 'border-l-4 border-primary bg-primary/5' : 'hover:bg-surface-container-low group'
  }`;

  if (isMe) {
    return <div className={rowClass}>{inner}</div>;
  }

  return (
    <Link to={`/app/users/${entry.id}`} className={rowClass}>
      {inner}
    </Link>
  );
}
