import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  GraduationCap,
  Layers,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';
import { apiFetch, requireToken } from '../../lib/api';
import { useAuthHydration, useAuthStore } from '../../stores/authStore';
import { PageLoader } from '../../components/ui/PageLoader';
import { ErrorState } from '../../components/ui/ErrorState';

type AdminStats = {
  users: number;
  admins: number;
  courses: number;
  lessons: number;
};

export function AdminDashboardPage() {
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthHydration();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => apiFetch<AdminStats>('/admin/stats', { token: requireToken(token) }),
    enabled: hydrated && !!token,
  });

  if (!hydrated || isLoading) {
    return <PageLoader label="Carregando painel…" />;
  }

  if (isError) {
    return <ErrorState title="Não foi possível carregar o painel admin." error={error} />;
  }

  if (!data) return null;

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0f1419] p-6 shadow-xl shadow-black/40 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{today}</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Painel de controle
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Gerencie alunos, equipe administrativa e o catálogo de cursos. Métricas atualizadas em tempo real.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          icon={<Users className="h-5 w-5" />}
          label="Usuários"
          value={data.users}
          hint="contas na plataforma"
          accent="bg-blue-500/10"
        />
        <Kpi
          icon={<Shield className="h-5 w-5" />}
          label="Administradores"
          value={data.admins}
          hint="acesso ao console"
          accent="bg-amber-500/15"
        />
        <Kpi
          icon={<Layers className="h-5 w-5" />}
          label="Cursos"
          value={data.courses}
          hint="no catálogo"
          accent="bg-emerald-500/10"
        />
        <Kpi
          icon={<GraduationCap className="h-5 w-5" />}
          label="Aulas"
          value={data.lessons}
          hint="publicadas"
          accent="bg-sky-500/10"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/[0.06] bg-[#0f1419] p-6">
          <div className="flex items-center gap-2 text-amber-400/90">
            <Sparkles className="h-5 w-5" aria-hidden />
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Ações rápidas</h2>
          </div>
          <ul className="mt-4 space-y-2">
            <QuickLink to="/admin/team" title="Convidar administrador" desc="Crie outra conta com perfil ADMIN" />
            <QuickLink to="/admin/courses" title="Editar catálogo" desc="Cursos, módulos e aulas" />
            <QuickLink to="/admin/students" title="Ver alunos" desc="Lista completa e progresso" />
          </ul>
        </section>

        <section className="rounded-2xl border border-white/[0.06] bg-[#0f1419] p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Resumo operacional</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li className="flex justify-between gap-4 border-b border-white/[0.04] pb-3">
              <span>Proporção admin / usuários</span>
              <span className="font-mono text-slate-200">
                {data.admins} / {data.users}
              </span>
            </li>
            <li className="flex justify-between gap-4 border-b border-white/[0.04] pb-3">
              <span>Média de aulas por curso</span>
              <span className="font-mono text-slate-200">
                {data.courses > 0 ? (data.lessons / data.courses).toFixed(1) : '—'}
              </span>
            </li>
            <li className="flex justify-between gap-4">
              <span>Cursos no catálogo</span>
              <span className="font-mono text-slate-200">{data.courses}</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint: string;
  accent: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0f1419] p-5 shadow-lg shadow-black/20`}
    >
      <div className={`pointer-events-none absolute inset-0 opacity-50 ${accent}`} aria-hidden />
      <div className="relative text-amber-400/90">{icon}</div>
      <p className="relative mt-3 text-3xl font-bold tabular-nums tracking-tight text-white">{value}</p>
      <p className="relative text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="relative mt-1 text-xs text-slate-600">{hint}</p>
    </div>
  );
}

function QuickLink({ to, title, desc }: { to: string; title: string; desc: string }) {
  return (
    <li>
      <Link
        to={to}
        className="group flex items-center justify-between gap-3 rounded-xl border border-transparent px-3 py-3 transition hover:border-white/[0.08] hover:bg-white/[0.03]"
      >
        <div>
          <p className="font-medium text-white">{title}</p>
          <p className="text-xs text-slate-500">{desc}</p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-amber-400" />
      </Link>
    </li>
  );
}
