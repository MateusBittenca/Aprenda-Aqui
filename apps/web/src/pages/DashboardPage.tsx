import { useMemo, useState } from 'react';
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
  Medal,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { DailyGiftCard } from '../components/DailyGiftCard';
import { ResumeHero } from '../components/ResumeHero';
import { XpTrajectoryModal } from '../components/XpTrajectoryModal';
import { getNextRankThreshold, getRankForLevel } from '../lib/levelTitles';
import { Card } from '../components/ui/Card';
import { ErrorState } from '../components/ui/ErrorState';
import { PageLoader } from '../components/ui/PageLoader';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Avatar } from '../components/Avatar';
import { useMe } from '../hooks/useMe';
import { useProgress } from '../hooks/useProgress';
import { useEnrolledCourses } from '../hooks/useEnrolledCourses';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useDailyGoal, type DailyGoal } from '../hooks/useDailyGoal';
import { computeBadges, RARITY_STYLE, type Badge } from '../lib/badges';
import { pickResumeCourse } from '../lib/resumeCourse';
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
      <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/80">7 dias</span>
      <div className="flex gap-1" role="img" aria-label="Atividade nos últimos sete dias; o último círculo é hoje">
        {days.map((on, i) => (
          <span
            key={i}
            className={twMerge(
              'h-2.5 w-2.5 rounded-full',
              on ? 'bg-orange-500' : 'bg-surface-container-high',
              i === 6 && 'ring-2 ring-orange-400 ring-offset-1 ring-offset-surface-container-lowest',
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
  const { data: goal } = useDailyGoal();

  const resume = useMemo(
    () => (enrolled ? pickResumeCourse(enrolled) : null),
    [enrolled],
  );

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
    <div className="stagger-children min-w-0 space-y-6 overflow-x-hidden">
      <HeroSection data={data} />
      {resume ? <ResumeHero course={resume} /> : null}
      <DailyGiftCard />
      <XPSection data={data} />
      <StatsRow data={data} progress={progress} />
      <GoalsSection progress={progress} goal={goal} />
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
    <Card variant="hero" className="relative overflow-hidden p-6 sm:p-8">
      <div className="relative flex items-center gap-4 sm:gap-5">
        <Avatar userId={data.id} displayName={data.displayName} colorKey={data.avatarColorKey} size="xl" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-on-surface-variant">{greeting},</p>
          <h1 className="font-headline mt-0.5 truncate text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl">
            {firstName}!
          </h1>
          <p className="mt-1 break-words text-sm text-on-surface-variant">{streakMessage(data.currentStreak)}</p>
          <StreakWeekStrip days={data.streakWeekDays} />
        </div>
        {data.currentStreak >= 3 && (
          <div className="hidden flex-col items-center rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center shadow-card sm:flex">
            <Flame className={`h-6 w-6 text-amber-500 ${data.currentStreak >= 7 ? 'animate-pulse motion-reduce:animate-none' : ''}`} />
            <span className="font-headline mt-1 text-2xl font-extrabold text-amber-700">{data.currentStreak}</span>
            <span className="text-xs font-bold uppercase tracking-wide text-amber-600">dias</span>
          </div>
        )}
      </div>
    </Card>
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
        className="hover-lift press-tactile w-full rounded-2xl border border-surface-container-high/70 bg-surface-container-lowest p-5 text-left shadow-card hover:border-primary/25 focus-ring-primary sm:p-6"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-primary">
              <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden /> Nível {data.level}
            </p>
            <p className="mt-1 text-sm font-semibold text-primary/90">{rank.name}</p>
            <p className="font-headline mt-1.5 text-2xl font-extrabold tabular-nums text-on-surface sm:text-3xl">
              {data.xpProgress.currentBandXp}
              <span className="ml-1 text-base font-bold text-on-surface-variant sm:text-lg">
                / {data.xpProgress.bandSize} XP
              </span>
            </p>
          </div>
          <p className="shrink-0 text-sm font-semibold text-on-surface-variant sm:text-right">
            {pct}% para <span className="text-on-surface">nível {data.level + 1}</span>
          </p>
        </div>
        <div className="mt-4 h-3.5 overflow-hidden rounded-full bg-surface-container-high/60">
          <div
            className="relative h-full overflow-hidden rounded-full brand-gradient transition-all duration-700 ease-ios-out"
            style={{ width: `${pct}%` }}
          >
            {pct > 0 && pct < 100 && <span className="absolute inset-0 shimmer-line" aria-hidden />}
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-1 border-t border-surface-container-high/70 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-on-surface-variant">{data.xpTotal.toLocaleString('pt-BR')} XP total acumulado</p>
          {nextRank ? (
            <p className="text-xs font-medium text-on-surface-variant">
              Próximo título em nv. {nextRank.level}: <span className="text-primary">{nextRank.name}</span>
            </p>
          ) : (
            <p className="text-xs font-medium text-amber-700">Título máximo alcançado nesta escala</p>
          )}
        </div>
        <p className="mt-2 text-xs font-medium text-primary">Ver trajetória e recompensas →</p>
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
    <div className="stagger-children grid grid-cols-2 gap-3 sm:grid-cols-4">
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
    <Card className={`hover-lift p-4 ${bg[accent] ?? ''}`}>
      <div className="flex items-center gap-1.5">{icon}<span className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">{label}</span></div>
      <p className="font-headline mt-2 text-2xl font-extrabold tabular-nums text-on-surface">{value}</p>
      <p className="text-xs text-on-surface-variant">{sub}</p>
    </Card>
  );
}

// ─── Goals ────────────────────────────────────────────────────────────────────

function GoalsSection({ progress, goal }: { progress?: UserProgress; goal?: DailyGoal }) {
  /* Fallback para pisos mínimos se o endpoint ainda não respondeu. Assim a
   * seção nunca fica em branco e mantém o contrato visual. */
  const lessonsTarget = goal?.lessons.target ?? 1;
  const exercisesTarget = goal?.exercises.target ?? 3;
  const todayLessons = goal?.lessons.current
    ?? progress?.lessons.filter((l) => l.completed && isToday(l.completedAt)).length
    ?? 0;
  const todayEx = goal?.exercises.current
    ?? progress?.exercises.filter((e) => e.solved && isToday(e.solvedAt)).length
    ?? 0;

  const adapted = !!goal && (goal.baseline.lessonsP50 > 0 || goal.baseline.exercisesP50 > 0);
  const lessonsDone = todayLessons >= lessonsTarget;
  const exercisesDone = todayEx >= exercisesTarget;
  const allDone = lessonsDone && exercisesDone;

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <Target className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-bold uppercase tracking-wide text-on-surface">Meta do dia</h2>
        {adapted && (
          <span
            className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-primary"
            title="Meta calibrada com base na sua média dos últimos 7 dias"
          >
            Adaptada
          </span>
        )}
        {allDone && (
          <span className="ml-auto text-xs font-bold text-emerald-600">Concluída! 🎉</span>
        )}
      </div>
      <ul className="space-y-3">
        <GoalItem
          label={`${lessonsTarget} ${lessonsTarget === 1 ? 'aula' : 'aulas'} hoje`}
          done={lessonsDone}
          current={Math.min(todayLessons, lessonsTarget)}
          total={lessonsTarget}
        />
        <GoalItem
          label={`${exercisesTarget} ${exercisesTarget === 1 ? 'exercício' : 'exercícios'} hoje`}
          done={exercisesDone}
          current={Math.min(todayEx, exercisesTarget)}
          total={exercisesTarget}
        />
      </ul>
    </Card>
  );
}

function GoalItem({ label, done, current, total }: { label: string; done: boolean; current: number; total: number }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <li>
      <div className="flex items-center gap-2">
        {done
          ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
          : <Circle className="h-5 w-5 shrink-0 text-surface-container-high" />
        }
        <span className={`text-sm font-medium ${done ? 'text-emerald-700 line-through' : 'text-on-surface'}`}>
          {label}
        </span>
        <span className="ml-auto text-xs font-semibold tabular-nums text-on-surface-variant">{current}/{total}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-container-high/60">
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
      <SectionHeading
        icon={<BookOpen className="h-5 w-5" />}
        title="Cursos em andamento"
        action={
          <Link to="/app/my-courses" className="text-xs font-semibold text-primary hover:underline">
            Ver todos →
          </Link>
        }
        className="mb-4"
      />

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
        <Card variant="flat" className="py-8 text-center text-sm text-on-surface-variant">
          <BookOpen className="mx-auto mb-3 h-8 w-8 text-on-surface-variant/60" />
          <p className="font-medium">Você ainda não está matriculado em nenhum curso.</p>
          <Link to="/app/courses" className="mt-3 inline-flex items-center gap-1 font-semibold text-primary hover:underline">
            Explorar cursos <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {inProgress.slice(0, 3).map((c) => <CourseCard key={c.id} course={c} />)}
          {inProgress.length === 0 && completed.length > 0 && (
            <Card className="sm:col-span-2 xl:col-span-3 border-emerald-200 bg-emerald-50 p-5 text-center text-sm">
              <p className="font-semibold text-emerald-800">Todos os cursos concluídos! 🎉 Explore mais no catálogo.</p>
            </Card>
          )}
          {inProgress.length === 0 && completed.length === 0 && enrolled.length > 0 && (
            <Card className="sm:col-span-2 xl:col-span-3 p-5 text-center text-sm text-on-surface-variant">
              <p>Matriculado em {enrolled.length} curso{enrolled.length !== 1 ? 's' : ''} sem aulas criadas ainda.</p>
            </Card>
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
      className="hover-lift group flex flex-col rounded-2xl border border-surface-container-high/70 bg-surface-container-lowest p-5 shadow-card"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Curso</p>
      <h3 className="font-headline mt-1 font-bold tracking-tight text-on-surface group-hover:text-primary">{course.title}</h3>
      {course.description && (
        <p className="mt-1 line-clamp-2 text-xs text-on-surface-variant">{course.description}</p>
      )}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs font-medium text-on-surface-variant">
          <span>{course.progress.completed}/{course.progress.total} aulas</span>
          <span className="font-bold text-on-surface">{course.progress.pct}%</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-container-high/60">
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
      <RecentBadgesStrip data={data} progress={progress} />
    </div>
  );
}

// ─── Leaderboard mini ─────────────────────────────────────────────────────────

function LeaderboardMini({ lb, myId }: { lb?: LeaderboardData; myId: string }) {
  if (!lb) {
    return (
      <Card className="p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-on-surface">
          <Medal className="h-4 w-4 text-amber-500" /> Ranking Global
        </h2>
        <div className="mt-4 animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 rounded-xl bg-surface-container-high/60" />
          ))}
        </div>
      </Card>
    );
  }

  const top5 = lb.top.slice(0, 5);
  const myEntry = lb.top.find((u) => u.id === myId);
  const myRank = lb.myRank;
  const inTop = myRank <= 5;

  const rowStyle = (rank: number, isMe: boolean) => {
    if (isMe) return 'border-2 border-primary bg-primary/5';
    if (rank === 1) return 'border border-amber-200 bg-amber-50';
    if (rank === 2) return 'border border-surface-container-high bg-surface-container-low';
    if (rank === 3) return 'border border-orange-100 bg-orange-50';
    return 'border border-transparent';
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-on-surface">
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
            <li key={u.id} className={`flex items-center gap-3 rounded-xl px-3 py-2 ${rowStyle(rank, isMe)}`}>
              <RankIndicator rank={rank} />
              <Avatar userId={u.id} displayName={u.displayName} colorKey={u.avatarColorKey} size="sm" />
              <span className={`flex-1 truncate text-sm font-semibold ${isMe ? 'text-primary' : 'text-on-surface'}`}>
                {u.displayName}{isMe && ' (você)'}
              </span>
              <span className="shrink-0 text-xs font-bold tabular-nums text-on-surface-variant">
                {u.xpTotal} XP
              </span>
            </li>
          );
        })}
      </ul>

      {!inTop && myEntry && (
        <div className="mt-3 flex items-center gap-3 rounded-xl border-2 border-primary bg-primary/5 px-3 py-2">
          <span className="w-7 shrink-0 text-center text-sm font-extrabold text-primary">#{myRank}</span>
          <Avatar userId={myId} displayName={myEntry.displayName} colorKey={myEntry.avatarColorKey} size="sm" />
          <span className="flex-1 truncate text-sm font-semibold text-primary">{myEntry.displayName} (você)</span>
          <span className="shrink-0 text-xs font-bold tabular-nums text-on-surface-variant">{myEntry.xpTotal} XP</span>
        </div>
      )}
      {!inTop && !myEntry && (
        <p className="mt-3 text-xs text-center text-on-surface-variant">Você está em #{myRank} de {lb.total}</p>
      )}
    </Card>
  );
}

/**
 * Indicador de posição no ranking. As 3 primeiras posições usam `lucide Medal`
 * com tom próprio (ouro/prata/bronze), evitando dependência de emoji que
 * renderiza com estilos diferentes em cada SO. Demais posições mostram #N.
 */
function RankIndicator({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex w-7 shrink-0 justify-center" aria-label="1º lugar">
        <Medal className="h-5 w-5 text-amber-500" strokeWidth={2.25} aria-hidden />
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex w-7 shrink-0 justify-center" aria-label="2º lugar">
        <Medal className="h-5 w-5 text-on-surface-variant" strokeWidth={2.25} aria-hidden />
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex w-7 shrink-0 justify-center" aria-label="3º lugar">
        <Medal className="h-5 w-5 text-orange-600" strokeWidth={2.25} aria-hidden />
      </span>
    );
  }
  return (
    <span className="w-7 shrink-0 text-center text-sm font-extrabold text-on-surface-variant">
      #{rank}
    </span>
  );
}

// ─── Recent badges strip ──────────────────────────────────────────────────────

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function daysAgo(iso: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return null;
  return Math.max(0, Math.floor((Date.now() - t) / (24 * 60 * 60 * 1000)));
}

function RecentBadgesStrip({ data, progress }: { data: MeProfile; progress?: UserProgress }) {
  const safeProgress: UserProgress = progress ?? { lessons: [], exercises: [] };
  const badges = computeBadges(data, safeProgress);
  const earnedCount = badges.filter((b) => b.earned).length;

  const now = Date.now();
  const recent = badges
    .filter(
      (b) => b.earned && b.unlockedAt && now - new Date(b.unlockedAt).getTime() <= SEVEN_DAYS_MS,
    )
    .sort(
      (a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime(),
    );

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-on-surface">
          <Trophy className="h-4 w-4 text-amber-500" /> Conquistas recentes
        </h2>
        <span className="text-xs font-bold text-on-surface-variant">
          {earnedCount}/{badges.length}
        </span>
      </div>

      {recent.length > 0 ? (
        <ul className="snap-shelf flex gap-3 overflow-x-auto pb-1">
          {recent.map((badge) => (
            <li key={badge.id} className="shrink-0 snap-start">
              <RecentBadgeCard badge={badge} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-surface-container-high bg-surface-container-low/60 px-4 py-6 text-center">
          <Trophy className="mx-auto mb-2 h-7 w-7 text-on-surface-variant/50" aria-hidden />
          <p className="text-sm font-semibold text-on-surface">
            Nenhuma conquista nos últimos 7 dias.
          </p>
          <p className="mt-1 text-xs text-on-surface-variant">
            Conclua uma aula ou complete exercícios para desbloquear.
          </p>
        </div>
      )}

      <Link
        to="/app/me"
        className="mt-4 flex items-center justify-center gap-1 text-xs font-semibold text-on-surface-variant hover:text-primary"
      >
        Ver todas as conquistas <ArrowRight className="h-3 w-3" />
      </Link>
    </Card>
  );
}

function RecentBadgeCard({ badge }: { badge: Badge }) {
  const d = daysAgo(badge.unlockedAt);
  const when =
    d === null ? '' : d === 0 ? 'Hoje' : d === 1 ? 'Ontem' : `Há ${d} dias`;

  return (
    <div
      className={twMerge(
        'hover-lift flex w-36 flex-col items-center rounded-2xl border p-3 text-center transition duration-300 ease-ios-out',
        RARITY_STYLE[badge.rarity],
      )}
      title={`${badge.name}: ${badge.description}`}
    >
      <span className="animate-pop text-3xl" aria-hidden>
        {badge.icon}
      </span>
      <p className="mt-2 line-clamp-2 text-xs font-bold leading-tight text-on-surface">
        {badge.name}
      </p>
      <p className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-on-surface-variant">
        {when}
      </p>
    </div>
  );
}
