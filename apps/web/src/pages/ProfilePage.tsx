import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Gem, GraduationCap, Sparkles, Trophy, Zap } from 'lucide-react';
import { ErrorState } from '../components/ui/ErrorState';
import { PageLoader } from '../components/ui/PageLoader';
import { Avatar } from '../components/Avatar';
import { useMe } from '../hooks/useMe';
import { useProgress } from '../hooks/useProgress';
import { computeBadges, RARITY_LABEL, RARITY_STYLE } from '../lib/badges';
import type { MeProfile } from '../types/user';
import type { UserProgress } from '../hooks/useProgress';

export function ProfilePage() {
  const { data, isLoading, isError, error, hydrated } = useMe({ syncStore: true });
  const { data: progress } = useProgress();

  if (!hydrated || isLoading) return <PageLoader label="Carregando perfil…" />;

  if (isError) {
    return (
      <ErrorState
        title="Não foi possível carregar o perfil."
        error={error}
        hint={<p>Verifique a API em <code className="rounded bg-white px-1 text-slate-800">localhost:3000</code>.</p>}
      />
    );
  }

  if (!data) return null;

  const safeProgress: UserProgress = progress ?? { lessons: [], exercises: [] };
  const completedLessons = safeProgress.lessons.filter((l) => l.completed).length;
  const solvedEx = safeProgress.exercises.filter((e) => e.solved).length;
  const badges = computeBadges(data, safeProgress);
  const earned = badges.filter((b) => b.earned);

  const pct =
    data.xpProgress.bandSize > 0
      ? Math.min(100, Math.round((data.xpProgress.currentBandXp / data.xpProgress.bandSize) * 100))
      : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          to="/app/community"
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"
        >
          Comunidade
        </Link>
        <Link
          to="/app/settings"
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"
        >
          Configurações
        </Link>
      </div>

      {/* Identity */}
      <IdentityCard data={data} completedLessons={completedLessons} solvedEx={solvedEx} />

      {/* XP */}
      <XPCard data={data} pct={pct} />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={<Sparkles className="h-5 w-5 text-blue-500" />} label="XP total" value={data.xpTotal.toLocaleString('pt-BR')} />
        <StatTile icon={<Gem className="h-5 w-5 text-sky-500" />} label="Gemas" value={String(data.gems)} />
        <StatTile icon={<Flame className="h-5 w-5 text-orange-500" />} label="Sequência" value={`${data.currentStreak}d`} />
        <StatTile icon={<Trophy className="h-5 w-5 text-amber-500" />} label="Recorde" value={`${data.longestStreak}d`} />
      </div>

      {/* Activity */}
      {(completedLessons > 0 || solvedEx > 0) && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Atividade</h2>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <ActivityStat icon={<GraduationCap className="h-5 w-5 text-blue-500" />} value={completedLessons} label="aulas concluídas" />
            <ActivityStat icon={<Zap className="h-5 w-5 text-violet-500" />} value={solvedEx} label="exercícios resolvidos" />
            <ActivityStat icon={<Trophy className="h-5 w-5 text-amber-500" />} value={earned.length} label="conquistas" />
          </div>
        </div>
      )}

      {/* Badges */}
      <BadgesFullSection badges={badges} />
    </div>
  );
}

function IdentityCard({
  data,
  completedLessons,
  solvedEx: _solvedEx,
}: {
  data: MeProfile;
  completedLessons: number;
  solvedEx: number;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-soft">
      <div className="h-2 bg-blue-600" />
      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
        <Avatar userId={data.id} displayName={data.displayName} size="xl" />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-slate-900">{data.displayName}</h1>
          {data.bio ? <p className="mt-2 text-sm text-slate-600">{data.bio}</p> : null}
          <p className="text-sm text-slate-500">{data.email}</p>
          <p className="mt-1 text-xs text-slate-400">
            Membro desde {new Date(data.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
              Nível {data.level}
            </span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
              {completedLessons} aulas
            </span>
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">
              🔥 {data.currentStreak} dias
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function XPCard({ data, pct }: { data: MeProfile; pct: number }) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Progresso de nível</p>
          <p className="text-2xl font-black text-slate-900">Nível {data.level}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-slate-400">XP total</p>
          <p className="text-lg font-black text-slate-700">{data.xpTotal.toLocaleString('pt-BR')}</p>
        </div>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-blue-600 transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-sm text-slate-600">
        {data.xpProgress.currentBandXp} / {data.xpProgress.bandSize} XP para nível {data.level + 1}
        <span className="ml-2 font-semibold text-slate-400">({pct}%)</span>
      </p>
    </div>
  );
}

function ActivityStat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="flex justify-center text-slate-500">{icon}</div>
      <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 text-center shadow-soft">
      <div className="flex justify-center">{icon}</div>
      <p className="mt-2 text-lg font-black text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function BadgesFullSection({ badges }: { badges: ReturnType<typeof computeBadges> }) {
  const earned = badges.filter((b) => b.earned);
  const locked = badges.filter((b) => !b.earned);

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Conquistas
        </h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
          {earned.length}/{badges.length}
        </span>
      </div>

      {earned.length > 0 && (
        <>
          <p className="mb-3 text-xs font-semibold uppercase text-emerald-600">Desbloqueadas</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {earned.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </>
      )}

      {locked.length > 0 && (
        <>
          <p className="mb-3 mt-5 text-xs font-semibold uppercase text-slate-400">A desbloquear</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {locked.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} locked />
            ))}
          </div>
        </>
      )}

      <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-center text-xs text-blue-700">
          Continue concluindo aulas e mantendo sua sequência para desbloquear mais conquistas!
        </p>
        <Link
          to="/app/my-tracks"
          className="mt-2 flex items-center justify-center gap-1 text-xs font-bold text-blue-700 hover:underline"
        >
          Ir para Minhas trilhas <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function BadgeCard({ badge, locked }: { badge: ReturnType<typeof computeBadges>[0]; locked?: boolean }) {
  return (
    <div
      title={`${badge.name}: ${badge.description}`}
      className={`flex flex-col items-center gap-1 rounded-2xl border p-3 text-center transition ${
        locked
          ? 'border-slate-100 bg-slate-50 opacity-50 grayscale'
          : RARITY_STYLE[badge.rarity]
      }`}
    >
      <span className="text-3xl">{badge.icon}</span>
      <p className="text-[11px] font-bold leading-tight text-slate-800">{badge.name}</p>
      <p className="text-[10px] text-slate-500 leading-tight">{badge.description}</p>
      {locked && badge.progress && (
        <div className="w-full mt-1">
          <div className="h-1 rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-400"
              style={{ width: `${Math.round((badge.progress.current / badge.progress.total) * 100)}%` }}
            />
          </div>
          <p className="mt-0.5 text-[9px] tabular-nums text-slate-400">
            {badge.progress.current}/{badge.progress.total}
          </p>
        </div>
      )}
      {!locked && (
        <span className="mt-1 rounded-full bg-white/70 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-500">
          {RARITY_LABEL[badge.rarity]}
        </span>
      )}
    </div>
  );
}
