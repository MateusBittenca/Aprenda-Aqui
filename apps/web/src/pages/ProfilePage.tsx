import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Gem,
  GraduationCap,
  Pencil,
  Terminal,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { ErrorState } from '../components/ui/ErrorState';
import { PageLoader } from '../components/ui/PageLoader';
import { Avatar } from '../components/Avatar';
import { FollowListModal } from '../components/FollowListModal';
import { useMe } from '../hooks/useMe';
import { useProgress } from '../hooks/useProgress';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { computeBadges, RARITY_LABEL, RARITY_STYLE } from '../lib/badges';
import type { MeProfile } from '../types/user';
import { getRankForLevel, getNextRankThreshold } from '../lib/levelTitles';
import type { UserProgress } from '../hooks/useProgress';
import type { FollowListKind } from '../hooks/useFollowList';

const cardShadow = 'shadow-card';

export function ProfilePage() {
  const { data, isLoading, isError, error, hydrated } = useMe({ syncStore: true });
  const { data: progress } = useProgress();
  const { data: lb } = useLeaderboard();
  const [followModalKind, setFollowModalKind] = useState<FollowListKind | null>(null);

  if (!hydrated || isLoading) return <PageLoader label="Carregando perfil…" />;

  if (isError) {
    return (
      <ErrorState
        title="Não foi possível carregar o perfil."
        error={error}
        hint={<p>Verifique a API em <code className="rounded bg-surface-container-high px-1 text-on-surface">localhost:3000</code>.</p>}
      />
    );
  }

  if (!data) return null;

  const safeProgress: UserProgress = progress ?? { lessons: [], exercises: [] };
  const completedLessons = safeProgress.lessons.filter((l) => l.completed).length;
  const solvedEx = safeProgress.exercises.filter((e) => e.solved).length;
  const badges = computeBadges(data, safeProgress);

  const pct =
    data.xpProgress.bandSize > 0
      ? Math.min(100, Math.round((data.xpProgress.currentBandXp / data.xpProgress.bandSize) * 100))
      : 0;

  const earned = badges.filter((b) => b.earned);
  const locked = badges.filter((b) => !b.earned);
  const showcaseBadges = [...earned, ...locked].slice(0, 4);

  const activityPeers = (lb?.top ?? []).filter((u) => u.id !== data.id).slice(0, 3);

  const xpCompact =
    data.xpTotal >= 1000 ? `${(data.xpTotal / 1000).toFixed(1).replace('.', ',')}k` : String(data.xpTotal);

  return (
    <div className="w-full">
      {/* Barra tipo TopAppBar do mockup (título + stats) */}
      <header className="mb-8 flex h-14 min-h-[3.5rem] items-center justify-between gap-4 border-b border-surface-container-high/70 pb-4">
        <h1 className="font-headline text-lg font-bold text-primary sm:text-xl">Perfil</h1>
        <div className="flex items-center gap-5 sm:gap-8">
          <div className="flex cursor-default items-center gap-2 transition-transform hover:scale-105">
            <Flame className="h-5 w-5 text-orange-500" aria-hidden />
            <span className="font-bold text-on-surface">{data.currentStreak}</span>
          </div>
          <div className="flex cursor-default items-center gap-2 transition-transform hover:scale-105">
            <Gem className="h-5 w-5 text-sky-400" aria-hidden />
            <span className="font-bold text-on-surface">{data.gems.toLocaleString('pt-BR')}</span>
          </div>
          <div className="hidden cursor-default items-center gap-2 transition-transform hover:scale-105 sm:flex">
            <Trophy className="h-5 w-5 text-amber-500" aria-hidden />
            <span className="font-bold text-on-surface">Nv. {data.level}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <ProfileHeroCard
            data={data}
            completedLessons={completedLessons}
            xpCompact={xpCompact}
            onOpenFollowList={setFollowModalKind}
          />

          <AchievementsGallery badges={showcaseBadges} total={badges.length} earnedCount={earned.length} />

          <LearningPathCard data={data} pct={pct} />

          <section id="todas-conquistas" className="scroll-mt-28 space-y-4">
            <h2 className="font-headline text-sm font-bold uppercase tracking-wide text-on-surface-variant">
              Todas as conquistas
            </h2>
            <BadgesFullGrid badges={badges} />
          </section>

          {(completedLessons > 0 || solvedEx > 0) && (
            <section
              className={`rounded-[1.25rem] border border-surface-container-high/60 bg-surface-container-lowest p-6 ${cardShadow}`}
            >
              <h2 className="font-headline text-sm font-bold uppercase tracking-wide text-on-surface-variant">
                Atividade
              </h2>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <ActivityMini
                  icon={<GraduationCap className="mx-auto h-6 w-6 text-primary" />}
                  value={completedLessons}
                  label="aulas"
                />
                <ActivityMini
                  icon={<Zap className="mx-auto h-6 w-6 text-tertiary" />}
                  value={solvedEx}
                  label="exercícios"
                />
                <ActivityMini
                  icon={<Trophy className="mx-auto h-6 w-6 text-amber-500" />}
                  value={earned.length}
                  label="conquistas"
                />
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-8 lg:sticky lg:top-28 lg:col-span-4">
          <ActivityFeedCard peers={activityPeers} />
          <WeekendSprintCard />
        </aside>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/app/community"
          className="rounded-full border border-surface-container-high bg-surface-container-lowest px-4 py-2 text-sm font-semibold text-on-surface shadow-sm transition hover:border-primary/40 hover:text-primary"
        >
          Comunidade
        </Link>
        <Link
          to="/app/settings"
          className="rounded-full border border-surface-container-high bg-surface-container-lowest px-4 py-2 text-sm font-semibold text-on-surface shadow-sm transition hover:border-primary/40 hover:text-primary"
        >
          Configurações
        </Link>
      </div>

      <FollowListModal
        open={followModalKind !== null}
        userId={data.id}
        initialKind={followModalKind ?? 'followers'}
        followerCount={data.followerCount}
        followingCount={data.followingCount}
        onClose={() => setFollowModalKind(null)}
      />
    </div>
  );
}

function ProfileHeroCard({
  data,
  completedLessons,
  xpCompact,
  onOpenFollowList,
}: {
  data: MeProfile;
  completedLessons: number;
  xpCompact: string;
  onOpenFollowList: (kind: FollowListKind) => void;
}) {
  const rank = getRankForLevel(data.level);
  return (
    <section
      className={`relative flex flex-col gap-8 overflow-hidden rounded-[1.25rem] bg-surface-container-lowest p-6 sm:p-8 md:flex-row md:items-start ${cardShadow}`}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-bl-full bg-primary-container/20" />
      <div className="relative flex flex-col items-center md:items-start">
        <div className="relative">
          <div className="h-36 w-36 overflow-hidden rounded-2xl border-4 border-surface-container-highest shadow-inner sm:h-40 sm:w-40">
            <Avatar
              userId={data.id}
              displayName={data.displayName}
              colorKey={data.avatarColorKey}
              size="xl"
              className="!h-full !w-full !rounded-2xl !text-4xl sm:!text-5xl"
            />
          </div>
          <Link
            to="/app/settings"
            title="Editar perfil"
            className="absolute -bottom-2 -right-2 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-lg transition hover:scale-110 active:translate-y-0.5"
          >
            <Pencil className="h-5 w-5" aria-hidden />
          </Link>
        </div>
      </div>

      <div className="relative min-w-0 flex-1 text-center md:text-left">
        <div className="mb-2 flex flex-col items-center gap-3 md:flex-row md:items-center">
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">{data.displayName}</h2>
          <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-black uppercase tracking-widest text-on-secondary-container">
            Nv. {data.level} · {rank.name}
          </span>
        </div>
        {data.bio ? <p className="mb-4 text-sm font-medium text-on-surface-variant">{data.bio}</p> : null}
        <p className="mb-4 text-sm font-medium text-on-surface-variant">
          Membro desde {new Date(data.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} ·{' '}
          {completedLessons} aulas concluídas
        </p>

        <div className="mb-6 flex flex-wrap justify-center gap-2 md:justify-start">
          <FollowChip
            count={data.followerCount}
            label="seguidores"
            onClick={() => onOpenFollowList('followers')}
          />
          <FollowChip
            count={data.followingCount}
            label="seguindo"
            onClick={() => onOpenFollowList('following')}
          />
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="flex flex-col items-center justify-center rounded-xl border-b-4 border-orange-200 bg-surface-container-low p-4">
            <Flame className="mb-1 h-6 w-6 text-orange-500" aria-hidden />
            <span className="font-headline text-xl font-black text-on-surface">{data.currentStreak}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Sequência</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border-b-4 border-blue-200 bg-surface-container-low p-4">
            <Zap className="mb-1 h-6 w-6 text-primary" aria-hidden />
            <span className="font-headline text-xl font-black text-on-surface">{xpCompact}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">XP total</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border-b-4 border-tertiary-container bg-surface-container-low p-4">
            <Trophy className="mb-1 h-6 w-6 text-tertiary" aria-hidden />
            <span className="line-clamp-2 min-h-[2.25rem] text-center font-headline text-sm font-black leading-tight text-on-surface">
              {rank.name}
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Título</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function FollowChip({
  count,
  label,
  onClick,
}: {
  count: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="press-tactile focus-ring-primary inline-flex items-center gap-1.5 rounded-full border border-surface-container-high bg-surface-container-low px-3 py-1.5 text-sm font-medium text-on-surface-variant transition duration-300 ease-ios-out hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
      aria-label={`Ver ${label}`}
    >
      <span className="font-bold tabular-nums text-on-surface">{count}</span>
      <span>{label}</span>
    </button>
  );
}

function AchievementsGallery({
  badges,
  total,
  earnedCount,
}: {
  badges: ReturnType<typeof computeBadges>;
  total: number;
  earnedCount: number;
}) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-headline text-xl font-extrabold text-on-surface">Conquistas</h3>
        <a href="#todas-conquistas" className="text-sm font-bold text-primary hover:underline">
          Ver todas
        </a>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
        {badges.map((badge) => (
          <ShowcaseBadge key={badge.id} badge={badge} />
        ))}
        {Array.from({ length: Math.max(0, 4 - badges.length) }).map((_, i) => (
          <div
            key={`placeholder-${i}`}
            className="flex flex-col items-center rounded-xl border border-dashed border-surface-container-high bg-surface-container-low/50 p-6 text-center opacity-60"
          >
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface-container-highest">
              <span className="text-2xl text-outline">…</span>
            </div>
            <span className="text-xs font-medium text-on-surface-variant">Mais em breve</span>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-on-surface-variant">
        {earnedCount} de {total} desbloqueadas
      </p>
    </section>
  );
}

function ShowcaseBadge({ badge }: { badge: ReturnType<typeof computeBadges>[0] }) {
  const locked = !badge.earned;
  return (
    <div className="group cursor-default">
      <div
        className={`flex flex-col items-center rounded-xl border-b-4 border-transparent bg-surface-container-lowest p-5 text-center shadow-sm transition-all hover:-translate-y-2 ${
          locked
            ? 'opacity-60 grayscale hover:opacity-100 hover:grayscale-0'
            : 'hover:border-secondary-container hover:shadow-md'
        } ${!locked ? RARITY_STYLE[badge.rarity] : 'border border-surface-container-high'}`}
      >
        <div
          className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
            locked ? 'bg-surface-container-highest' : 'bg-secondary-container/20'
          }`}
        >
          {locked ? (
            <span className="text-3xl text-outline" aria-hidden>
              🔒
            </span>
          ) : (
            <span className="text-4xl">{badge.icon}</span>
          )}
        </div>
        <span className="font-headline text-sm font-bold text-on-surface">{badge.name}</span>
        <span className="mt-1 text-xs font-medium leading-tight text-on-surface-variant">{badge.description}</span>
      </div>
    </div>
  );
}

function LearningPathCard({ data, pct }: { data: MeProfile; pct: number }) {
  const rank = getRankForLevel(data.level);
  const nextRank = getNextRankThreshold(data.level);
  return (
    <section className="space-y-6 rounded-[1.25rem] bg-surface-container-low p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-4">
        <div className="rounded-xl bg-surface-container-lowest p-3 shadow-sm">
          <Terminal className="h-7 w-7 text-primary" aria-hidden />
        </div>
        <div>
          <h3 className="font-headline text-lg font-extrabold text-on-surface">Sua jornada de nível</h3>
          <p className="text-sm text-on-surface-variant">
            {pct}% do caminho para o nível {data.level + 1} · {rank.name}
          </p>
        </div>
      </div>
      <div className="h-4 w-full overflow-hidden rounded-full bg-surface-container-highest">
        <div
          className="h-full rounded-full bg-primary transition-all duration-1000 motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-on-surface-variant">
        <span>{data.xpProgress.currentBandXp} XP neste nível</span>
        <span>{data.xpProgress.bandSize} XP necessários</span>
      </div>
      {nextRank && (
        <p className="text-xs text-on-surface-variant">
          Próximo título em nv. {nextRank.level}: <span className="font-bold text-primary">{nextRank.name}</span>
        </p>
      )}
    </section>
  );
}

function BadgesFullGrid({ badges }: { badges: ReturnType<typeof computeBadges> }) {
  const earned = badges.filter((b) => b.earned);
  const locked = badges.filter((b) => !b.earned);
  return (
    <div className={`rounded-[1.25rem] border border-surface-container-high/60 bg-surface-container-lowest p-5 ${cardShadow}`}>
      {earned.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {earned.map((badge) => (
            <FullBadge key={badge.id} badge={badge} />
          ))}
        </div>
      )}
      {locked.length > 0 && (
        <>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-outline">Em progresso / bloqueadas</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {locked.map((badge) => (
              <FullBadge key={badge.id} badge={badge} locked />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FullBadge({ badge, locked }: { badge: ReturnType<typeof computeBadges>[0]; locked?: boolean }) {
  return (
    <div
      title={`${badge.name}: ${badge.description}`}
      className={`flex flex-col items-center rounded-xl border p-3 text-center ${
        locked
          ? 'border-surface-container-high bg-surface-container-low opacity-70 grayscale'
          : RARITY_STYLE[badge.rarity]
      }`}
    >
      <span className="text-2xl">{locked ? '🔒' : badge.icon}</span>
      <p className="mt-1 text-xs font-bold leading-tight text-on-surface">{badge.name}</p>
      {!locked && (
        <span className="mt-1 rounded-full bg-surface-container-low px-1.5 py-0.5 text-xs font-bold uppercase text-on-surface-variant">
          {RARITY_LABEL[badge.rarity]}
        </span>
      )}
      {locked && badge.progress && (
        <p className="mt-1 text-xs text-on-surface-variant">
          {badge.progress.current}/{badge.progress.total}
        </p>
      )}
    </div>
  );
}

function ActivityMini({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="text-center">
      {icon}
      <p className="mt-2 font-headline text-2xl font-black text-on-surface">{value}</p>
      <p className="text-xs text-on-surface-variant">{label}</p>
    </div>
  );
}

function ActivityFeedCard({
  peers,
}: {
  peers: {
    id: string;
    displayName: string;
    avatarColorKey: string;
    xpTotal: number;
    level: number;
    currentStreak: number;
  }[];
}) {
  return (
    <section className={`rounded-[1.25rem] bg-surface-container-lowest p-6 ${cardShadow}`}>
      <h3 className="font-headline text-xl font-extrabold text-on-surface">Atividade no ranking</h3>
      <p className="mt-1 text-xs text-on-surface-variant">Destaques da comunidade</p>
      <div className="mt-6 space-y-6">
        {peers.length === 0 ? (
          <p className="text-sm text-on-surface-variant">
            Ainda não há outros alunos no ranking ou os dados estão carregando.
          </p>
        ) : (
          peers.map((u) => (
            <div key={u.id} className="flex gap-4">
              <Avatar
                userId={u.id}
                displayName={u.displayName}
                colorKey={u.avatarColorKey}
                size="md"
                className="!h-12 !w-12 !rounded-xl !text-lg"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-relaxed text-on-surface">
                  <span className="font-bold">{u.displayName.split(' ')[0]}</span>{' '}
                  <span className="text-on-surface-variant">está com</span>{' '}
                  <span className="font-bold text-primary">{u.xpTotal.toLocaleString('pt-BR')} XP</span> no ranking.
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Nv. {u.level} · sequência {u.currentStreak}d
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      <Link
        to="/app/community"
        className="mt-6 flex w-full items-center justify-center rounded-xl bg-surface-container-low py-3 text-sm font-bold text-on-surface-variant transition hover:bg-surface-container-high"
      >
        <Users className="mr-2 h-4 w-4" aria-hidden />
        Explorar comunidade
      </Link>
    </section>
  );
}

function WeekendSprintCard() {
  return (
    <section className="relative overflow-hidden rounded-[1.25rem] bg-tertiary p-6 text-on-tertiary shadow-lg">
      <div className="relative z-10">
        <h4 className="font-headline text-lg font-extrabold">Meta da semana</h4>
        <p className="mb-6 mt-2 text-sm opacity-90">
          Conclua aulas nos seus cursos e suba no ranking — cada aula conta XP e gemas.
        </p>
        <Link
          to="/app/my-courses"
          className="inline-flex items-center justify-center rounded-xl bg-surface-container-lowest px-6 py-2.5 text-xs font-black uppercase tracking-widest text-tertiary shadow-md transition hover:scale-105 active:scale-95"
        >
          Meus cursos
        </Link>
      </div>
      <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-surface/10 blur-2xl" />
      <div className="pointer-events-none absolute -left-4 -top-4 h-20 w-20 rounded-full bg-tertiary-dim/50 blur-xl" />
    </section>
  );
}
