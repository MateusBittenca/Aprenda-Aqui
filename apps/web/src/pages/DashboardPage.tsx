import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Flame, Gem, Sparkles } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

type Me = {
  displayName: string;
  xpTotal: number;
  level: number;
  gems: number;
  currentStreak: number;
  longestStreak: number;
  xpProgress: { level: number; currentBandXp: number; bandSize: number };
};

export function DashboardPage() {
  const token = useAuthStore((s) => s.token);
  const patchUser = useAuthStore((s) => s.patchUser);

  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<Me>('/me', { token: token! }),
    enabled: !!token,
  });

  useEffect(() => {
    if (!data) return;
    patchUser({
      xpTotal: data.xpTotal,
      level: data.level,
      gems: data.gems,
      currentStreak: data.currentStreak,
      longestStreak: data.longestStreak,
    });
  }, [data, patchUser]);

  if (isLoading || !data) {
    return <p className="text-center text-slate-500">Carregando seu painel…</p>;
  }

  const pct =
    data.xpProgress.bandSize > 0
      ? Math.min(100, Math.round((data.xpProgress.currentBandXp / data.xpProgress.bandSize) * 100))
      : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Olá, {data.displayName.split(' ')[0]}!
        </h1>
        <p className="mt-1 text-slate-600">Continue de onde parou e mantenha o ritmo.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Sparkles className="h-5 w-5 text-blue-500" />}
          label="Nível"
          value={String(data.level)}
          sub={`${data.xpTotal} XP total`}
        />
        <StatCard
          icon={<Flame className="h-5 w-5 text-orange-500" />}
          label="Sequência"
          value={`${data.currentStreak} dias`}
          sub={`Recorde: ${data.longestStreak}`}
        />
        <StatCard
          icon={<Gem className="h-5 w-5 text-sky-500" />}
          label="Gemas"
          value={String(data.gems)}
          sub="Use em recursos futuros"
        />
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Progresso no nível</h2>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-slate-600">
          {data.xpProgress.currentBandXp} / {data.xpProgress.bandSize} XP neste nível
        </p>
      </div>

      <Link
        to="/app/tracks"
        className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700"
      >
        Explorar trilhas
      </Link>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{sub}</p>
    </div>
  );
}
