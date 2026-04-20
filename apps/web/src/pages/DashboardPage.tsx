import { useState } from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  Flame,
  Gem,
  GraduationCap,
  Map,
  Medal,
  ShoppingBag,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { XpTrajectoryModal } from '../components/XpTrajectoryModal';
import { getNextRankThreshold, getRankForLevel } from '../lib/levelTitles';
import { ErrorState } from '../components/ui/ErrorState';
import { PageLoader } from '../components/ui/PageLoader';
import { Avatar } from '../components/Avatar';
import { useMe } from '../hooks/useMe';
import { useProgress } from '../hooks/useProgress';
import { useEnrolledCourses } from '../hooks/useEnrolledCourses';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { computeBadges, RARITY_STYLE } from '../lib/badges';
import type { MeProfile } from '../types/user';
import type { UserProgress } from '../hooks/useProgress';
import type { EnrolledCourse } from '../hooks/useEnrolledCourses';
import type { LeaderboardData } from '../hooks/useLeaderboard';

// ─── helpers ─────────────────────────────────────────────────────────────────

function isToday(dateStr: string | null) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isThisWeek(dateStr: string | null) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return d >= startOfWeek;
}

function streakMessage(streak: number) {
  if (streak === 0) return 'Comece hoje sua ofensiva — um exercício certo ou aula concluída já conta!';
  if (streak === 1) return 'Primeiro dia de ofensiva! Volte amanhã para manter a chama. 💪';
  if (streak < 7) return `${streak} dias de ofensiva — ótimo ritmo!`;
  if (streak < 30) return `${streak} dias seguidos em chamas! 🔥`;
  return `${streak} dias — ofensiva lendária! 🏆`;
}

function StreakWeekStrip({ days }: { days: boolean[] }) {
  if (days.length !== 7) return null;
  return (
    <div className="mt-3 flex items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/80">7 dias</span>
      <div className="flex gap-1" role="img" aria-label="Atividade nos últimos sete dias; o último círculo é hoje">
        {days.map((on, i) => (
          <span
            key={i}
            className={twMerge(
              'h-2.5 w-2.5 rounded-full',
              on ? 'bg-orange-500' : 'bg-slate-200',
              i === 6 && 'ring-2 ring-orange-400 ring-offset-1',
            )}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { data, isLoading, isError, error, hydrated } = useMe({ syncStore: true });
  const { data: progress } = useProgress();
  const { data: enrolled, isLoading: enrolledLoading } = useEnrolledCourses();
  const { data: lb } = useLeaderboard();

  if (!hydrated || isLoading) return <PageLoader label="Carregando painel…" />;

  if (isError) {
    return (
      <ErrorState
        title="Não foi possível carregar o painel."
        error={error}
        hint={<p>Verifique se a API está em execução em <code className="rounded bg-white px-1 text-slate-800">localhost:3000</code>.</p>}
      />
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <HeroSection data={data} />
      <XPSection data={data} />
      <StatsRow data={data} progress={progress} />
      <GoalsSection progress={progress} />
      <CoursesSection enrolled={enrolled ?? []} loading={enrolledLoading} />
      <BottomGrid data={data} progress={progress} lb={lb} />
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection({ data }: { data: MeProfile }) {
  const firstName = data.displayName.split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-surface-container-lowest p-6 shadow-elevated sm:p-8">
      <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary-container/25 opacity-90" />
      <div className="relative flex items-center gap-4 sm:gap-5">
        <Avatar userId={data.id} displayName={data.displayName} colorKey={data.avatarColorKey} size="xl" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-on-surface-variant">{greeting},</p>
          <h1 className="font-headline mt-0.5 truncate text-2xl font-black tracking-tight text-on-surface sm:text-3xl">
            {firstName}!
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">{streakMessage(data.currentStreak)}</p>
          <StreakWeekStrip days={data.streakWeekDays} />
        </div>
        {data.currentStreak >= 3 && (
          <div className="hidden flex-col items-center rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-3 text-center shadow-sm sm:flex">
            <Flame className={`h-6 w-6 text-amber-500 ${data.currentStreak >= 7 ? 'animate-pulse' : ''}`} />
            <span className="mt-1 text-2xl font-black text-amber-700">{data.currentStreak}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-amber-600">dias</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── XP ───────────────────────────────────────────────────────────────────────

function XPSection({ data }: { data: MeProfile }) {
  const [trajOpen, setTrajOpen] = useState(false);
  const pct =
    data.xpProgress.bandSize > 0
      ? Math.min(100, Math.round((data.xpProgress.currentBandXp / data.xpProgress.bandSize) * 100))
      : 0;
  const rank = getRankForLevel(data.level);
  const nextRank = getNextRankThreshold(data.level);

  return (
    <>
      <button
        type="button"
        onClick={() => setTrajOpen(true)}
        className="w-full rounded-2xl border border-slate-200/60 bg-surface-container-lowest p-5 text-left shadow-elevated transition hover:border-primary/25 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:p-6"
      >
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-primary">
              <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden /> Nível {data.level}
            </p>
            <p className="mt-1 text-sm font-semibold text-indigo-800">{rank.name}</p>
            <p className="mt-1.5 text-3xl font-black tabular-nums text-slate-900">
              {data.xpProgress.currentBandXp}
              <span className="ml-1 text-lg font-bold text-slate-400">/ {data.xpProgress.bandSize} XP</span>
            </p>
          </div>
          <p className="shrink-0 text-right text-sm font-semibold text-slate-500">
            {pct}% para<br />
            <span className="text-slate-900">Nível {data.level + 1}</span>
          </p>
        </div>
        <div className="mt-4 h-3.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-3 flex flex-col gap-1 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">{data.xpTotal.toLocaleString('pt-BR')} XP total acumulado</p>
          {nextRank ? (
            <p className="text-xs font-medium text-slate-500">
              Próximo título em nv. {nextRank.level}: <span className="text-indigo-700">{nextRank.name}</span>
            </p>
          ) : (
            <p className="text-xs font-medium text-amber-700">Título máximo alcançado nesta escala</p>
          )}
        </div>
        <p className="mt-2 text-[11px] font-medium text-primary">Ver trajetória e recompensas →</p>
      </button>
      <XpTrajectoryModal
        open={trajOpen}
        onClose={() => setTrajOpen(false)}
        xpTotal={data.xpTotal}
        level={data.level}
      />
    </>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function StatsRow({ data, progress }: { data: MeProfile; progress?: UserProgress }) {
  const completedLessons = progress?.lessons.filter((l) => l.completed).length ?? 0;
  const solvedEx = progress?.exercises.filter((e) => e.solved).length ?? 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatKpi icon={<Flame className="h-5 w-5 text-amber-500" />} label="Ofensiva" value={`${data.currentStreak}d`} sub={`Recorde: ${data.longestStreak}d`} accent="amber" />
      <StatKpi icon={<Gem className="h-5 w-5 text-sky-500" />} label="Gemas" value={String(data.gems)} sub="coletadas" accent="sky" />
      <StatKpi icon={<GraduationCap className="h-5 w-5 text-emerald-600" />} label="Aulas" value={String(completedLessons)} sub="concluídas" accent="emerald" />
      <StatKpi icon={<Zap className="h-5 w-5 text-violet-600" />} label="Exercícios" value={String(solvedEx)} sub="resolvidos" accent="violet" />
    </div>
  );
}

function StatKpi({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  const bg: Record<string, string> = {
    amber: 'bg-amber-50',
    sky: 'bg-sky-50',
    emerald: 'bg-emerald-50',
    violet: 'bg-violet-50',
  };
  return (
    <div className={`rounded-2xl border border-slate-200/60 ${bg[accent] ?? 'bg-surface-container-lowest'} p-4 shadow-elevated`}>
      <div className="flex items-center gap-1.5">{icon}<span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span></div>
      <p className="mt-2 text-2xl font-black tabular-nums text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  );
}

// ─── Goals ────────────────────────────────────────────────────────────────────

function GoalsSection({ progress }: { progress?: UserProgress }) {
  const todayLessons = progress?.lessons.filter((l) => l.completed && isToday(l.completedAt)).length ?? 0;
  const todayEx = progress?.exercises.filter((e) => e.solved && isToday(e.solvedAt)).length ?? 0;
  const weekLessons = progress?.lessons.filter((l) => l.completed && isThisWeek(l.completedAt)).length ?? 0;
  const weekEx = progress?.exercises.filter((e) => e.solved && isThisWeek(e.solvedAt)).length ?? 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Daily */}
      <div className="rounded-2xl border border-slate-200/60 bg-surface-container-lowest p-5 shadow-elevated">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Meta do dia</h2>
          {todayLessons >= 1 && todayEx >= 3 && (
            <span className="ml-auto text-xs font-bold text-emerald-600">Concluída! 🎉</span>
          )}
        </div>
        <ul className="space-y-3">
          <GoalItem label="1 aula hoje" done={todayLessons >= 1} current={Math.min(todayLessons, 1)} total={1} />
          <GoalItem label="3 exercícios hoje" done={todayEx >= 3} current={Math.min(todayEx, 3)} total={3} />
        </ul>
      </div>
      {/* Weekly challenge */}
      <div className="rounded-2xl border border-slate-200/60 bg-surface-container-lowest p-5 shadow-elevated">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Desafio semanal</h2>
        </div>
        <ul className="space-y-3">
          <GoalItem label="5 aulas esta semana" done={weekLessons >= 5} current={Math.min(weekLessons, 5)} total={5} />
          <GoalItem label="10 exercícios esta semana" done={weekEx >= 10} current={Math.min(weekEx, 10)} total={10} />
        </ul>
      </div>
    </div>
  );
}

function GoalItem({ label, done, current, total }: { label: string; done: boolean; current: number; total: number }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <li>
      <div className="flex items-center gap-2">
        {done
          ? <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
          : <Circle className="h-4.5 w-4.5 shrink-0 text-slate-300" />
        }
        <span className={`text-sm font-medium ${done ? 'text-emerald-700 line-through' : 'text-slate-700'}`}>
          {label}
        </span>
        <span className="ml-auto text-xs font-semibold tabular-nums text-slate-400">{current}/{total}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${done ? 'bg-emerald-500' : 'bg-primary'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </li>
  );
}

// ─── Courses in progress ──────────────────────────────────────────────────────

function CoursesSection({ enrolled, loading }: { enrolled: EnrolledCourse[]; loading: boolean }) {
  const inProgress = enrolled.filter((c) => c.progress.pct < 100 && c.progress.total > 0);
  const completed = enrolled.filter((c) => c.progress.pct === 100 && c.progress.total > 0);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
          <BookOpen className="h-4 w-4 text-primary" />
          Cursos em andamento
        </h2>
        <Link to="/app/my-courses" className="text-xs font-semibold text-primary hover:underline">
          Ver todos →
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl border border-surface-container-high bg-surface-container-low/80"
              aria-hidden
            />
          ))}
        </div>
      ) : enrolled.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-surface-container-high bg-surface-container-lowest py-8 text-center text-sm text-on-surface-variant shadow-elevated">
          <BookOpen className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          <p className="font-medium">Você ainda não está matriculado em nenhum curso.</p>
          <Link to="/app/courses" className="mt-3 inline-flex items-center gap-1 font-semibold text-primary hover:underline">
            Explorar cursos <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {inProgress.slice(0, 3).map((c) => <CourseCard key={c.id} course={c} />)}
          {inProgress.length === 0 && completed.length > 0 && (
            <div className="sm:col-span-2 xl:col-span-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center text-sm shadow-elevated">
              <p className="font-semibold text-emerald-800">Todos os cursos concluídos! 🎉 Explore mais no catálogo.</p>
            </div>
          )}
          {inProgress.length === 0 && completed.length === 0 && enrolled.length > 0 && (
            <div className="sm:col-span-2 xl:col-span-3 rounded-2xl border border-surface-container-high bg-surface-container-lowest p-5 text-center text-sm text-on-surface-variant shadow-elevated">
              <p>Matriculado em {enrolled.length} curso{enrolled.length !== 1 ? 's' : ''} sem aulas criadas ainda.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function CourseCard({ course }: { course: EnrolledCourse }) {
  return (
    <Link
      to={`/app/my-courses/${course.slug}`}
      className="group flex flex-col rounded-2xl border border-slate-200/60 bg-surface-container-lowest p-5 shadow-elevated transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Curso</p>
      <h3 className="mt-1 font-bold text-on-surface group-hover:text-primary">{course.title}</h3>
      {course.description && (
        <p className="mt-1 line-clamp-2 text-xs text-slate-500">{course.description}</p>
      )}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>{course.progress.completed}/{course.progress.total} aulas</span>
          <span className="font-bold text-slate-700">{course.progress.pct}%</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${course.progress.pct}%` }}
          />
        </div>
      </div>
    </Link>
  );
}

// ─── Bottom grid ──────────────────────────────────────────────────────────────

function BottomGrid({
  data,
  progress,
  lb,
}: {
  data: MeProfile;
  progress?: UserProgress;
  lb?: LeaderboardData;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <LeaderboardMini lb={lb} myId={data.id} />
      <BadgesSection data={data} progress={progress} />
    </div>
  );
}

// ─── Leaderboard mini ─────────────────────────────────────────────────────────

function LeaderboardMini({ lb, myId }: { lb?: LeaderboardData; myId: string }) {
  if (!lb) {
    return (
      <div className="rounded-2xl border border-slate-200/60 bg-surface-container-lowest p-5 shadow-elevated">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
          <Medal className="h-4 w-4 text-amber-500" /> Ranking Global
        </h2>
        <div className="mt-4 animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  const top5 = lb.top.slice(0, 5);
  const myEntry = lb.top.find((u) => u.id === myId);
  const myRank = lb.myRank;
  const inTop = myRank <= 5;

  const rankStyle = (rank: number, isMe: boolean) => {
    if (isMe) return 'border-2 border-blue-500 bg-blue-50';
    if (rank === 1) return 'border border-amber-200 bg-amber-50';
    if (rank === 2) return 'border border-slate-200 bg-slate-50';
    if (rank === 3) return 'border border-orange-100 bg-orange-50';
    return 'border border-transparent';
  };

  const rankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-surface-container-lowest p-5 shadow-elevated">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
          <Medal className="h-4 w-4 text-amber-500" /> Ranking Global
        </h2>
        <Link to="/app/ranking" className="text-xs font-semibold text-primary hover:underline">
          Ver completo →
        </Link>
      </div>

      <ul className="space-y-1.5">
        {top5.map((u, i) => {
          const rank = i + 1;
          const isMe = u.id === myId;
          return (
            <li key={u.id} className={`flex items-center gap-3 rounded-xl px-3 py-2 ${rankStyle(rank, isMe)}`}>
              <span className="w-7 shrink-0 text-center text-sm font-black">{rankEmoji(rank)}</span>
              <Avatar userId={u.id} displayName={u.displayName} colorKey={u.avatarColorKey} size="sm" />
              <span className={`flex-1 truncate text-sm font-semibold ${isMe ? 'text-blue-800' : 'text-slate-800'}`}>
                {u.displayName}{isMe && ' (você)'}
              </span>
              <span className="shrink-0 text-xs font-bold tabular-nums text-slate-500">
                {u.xpTotal} XP
              </span>
            </li>
          );
        })}
      </ul>

      {!inTop && myEntry && (
        <div className="mt-3 flex items-center gap-3 rounded-xl border-2 border-blue-500 bg-blue-50 px-3 py-2">
          <span className="w-7 shrink-0 text-center text-sm font-black text-blue-700">#{myRank}</span>
          <Avatar userId={myId} displayName={myEntry.displayName} colorKey={myEntry.avatarColorKey} size="sm" />
          <span className="flex-1 truncate text-sm font-semibold text-blue-800">{myEntry.displayName} (você)</span>
          <span className="shrink-0 text-xs font-bold tabular-nums text-slate-500">{myEntry.xpTotal} XP</span>
        </div>
      )}
      {!inTop && !myEntry && (
        <p className="mt-3 text-xs text-center text-slate-400">Você está em #{myRank} de {lb.total}</p>
      )}
    </div>
  );
}

// ─── Badges ───────────────────────────────────────────────────────────────────

function BadgesSection({ data, progress }: { data: MeProfile; progress?: UserProgress }) {
  const safeProgress: UserProgress = progress ?? { lessons: [], exercises: [] };
  const badges = computeBadges(data, safeProgress);
  const earned = badges.filter((b) => b.earned);
  const notEarned = badges.filter((b) => !b.earned);
  const shown = [...earned, ...notEarned].slice(0, 9);

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-surface-container-lowest p-5 shadow-elevated">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
          <Trophy className="h-4 w-4 text-amber-500" /> Conquistas
        </h2>
        <span className="text-xs font-bold text-slate-500">
          {earned.length}/{badges.length}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {shown.map((badge) => (
          <div
            key={badge.id}
            title={`${badge.name}: ${badge.description}`}
            className={`flex flex-col items-center rounded-2xl border p-2.5 text-center transition ${
              badge.earned
                ? RARITY_STYLE[badge.rarity]
                : 'border-slate-100 bg-slate-50 opacity-40 grayscale'
            }`}
          >
            <span className="text-2xl">{badge.icon}</span>
            <p className="mt-1 text-[10px] font-bold leading-tight text-slate-700">{badge.name}</p>
            {badge.progress && !badge.earned && (
              <p className="mt-0.5 text-[9px] tabular-nums text-slate-400">
                {badge.progress.current}/{badge.progress.total}
              </p>
            )}
          </div>
        ))}
      </div>
      <Link
        to="/app/me"
        className="mt-4 flex items-center justify-center gap-1 text-xs font-semibold text-slate-500 hover:text-primary"
      >
        Ver todas as conquistas <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

// ─── Quick actions bar ────────────────────────────────────────────────────────

export function QuickActionsBar() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Link
        to="/app/courses"
        className="group flex items-center justify-between rounded-2xl bg-primary p-4 font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-dim"
      >
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-5 w-5" />
          <div>
            <p className="font-bold">Cursos</p>
            <p className="text-[11px] text-white/80">Catálogo e matrícula</p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </Link>
      <Link
        to="/app/my-courses"
        className="group flex items-center justify-between rounded-2xl border-2 border-violet-200 bg-violet-50 p-4 font-semibold text-violet-800 transition hover:border-violet-300"
      >
        <div className="flex items-center gap-3">
          <Map className="h-5 w-5" />
          <div>
            <p className="font-bold">Meus cursos</p>
            <p className="text-[11px] text-violet-500">Onde estou estudando</p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </Link>
      <Link
        to="/app/ranking"
        className="group flex items-center justify-between rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 font-semibold text-amber-800 transition hover:border-amber-300"
      >
        <div className="flex items-center gap-3">
          <Medal className="h-5 w-5" />
          <div>
            <p className="font-bold">Ranking</p>
            <p className="text-[11px] text-amber-500">Sua posição global</p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
