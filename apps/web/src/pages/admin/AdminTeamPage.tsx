import { useId, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';
import { ApiError, apiFetch, requireToken } from '../../lib/api';
import { useAuthHydration, useAuthStore } from '../../stores/authStore';
import { PageLoader } from '../../components/ui/PageLoader';
import { ErrorState } from '../../components/ui/ErrorState';

type AdminUserRow = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
};

export function AdminTeamPage() {
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthHydration();
  const queryClient = useQueryClient();
  const emailId = useId();
  const nameId = useId();
  const passId = useId();

  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => apiFetch<AdminUserRow[]>('/admin/users', { token: requireToken(token) }),
    enabled: hydrated && !!token,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return apiFetch<{ id: string; email: string; displayName: string }>('/admin/users/admin', {
        method: 'POST',
        token: requireToken(token),
        body: JSON.stringify({ email, password, displayName }),
      });
    },
    onSuccess: () => {
      toast.success('Administrador criado');
      setEmail('');
      setDisplayName('');
      setPassword('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
    onError: (e: unknown) => {
      toast.error(e instanceof ApiError ? e.message : 'Não foi possível criar');
    },
  });

  if (!hydrated || isLoading) {
    return <PageLoader label="Carregando…" />;
  }

  if (isError) {
    return <ErrorState title="Não foi possível carregar a equipe." error={error} />;
  }

  if (!data) return null;

  const admins = data.filter((u) => u.role === 'ADMIN');

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Equipe administrativa</h1>
        <p className="mt-1 text-sm text-slate-400">
          Contas com acesso total ao console. Novos admins recebem e-mail e senha definidos abaixo.
        </p>
      </div>

      <section className="rounded-2xl border border-white/[0.06] bg-[#0f1419] p-6">
        <div className="flex items-center gap-2 text-amber-400/90">
          <Shield className="h-5 w-5" aria-hidden />
          <h2 className="text-lg font-semibold text-white">Novo administrador</h2>
        </div>
        <form
          className="mt-6 grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
        >
          <label className="block text-sm text-slate-400 sm:col-span-2">
            Nome exibido
            <input
              id={nameId}
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/[0.08] bg-[#0b0f19] px-3 py-2.5 text-white outline-none ring-amber-500/30 focus:ring-2"
              autoComplete="name"
            />
          </label>
          <label className="block text-sm text-slate-400">
            E-mail (login)
            <input
              id={emailId}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/[0.08] bg-[#0b0f19] px-3 py-2.5 text-white outline-none ring-amber-500/30 focus:ring-2"
              autoComplete="email"
            />
          </label>
          <label className="block text-sm text-slate-400">
            Senha inicial
            <input
              id={passId}
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/[0.08] bg-[#0b0f19] px-3 py-2.5 text-white outline-none ring-amber-500/30 focus:ring-2"
              autoComplete="new-password"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-900/30 transition hover:bg-amber-500 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Criando…' : 'Criar administrador'}
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Administradores ativos</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/[0.06] bg-[#0f1419]">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">E-mail</th>
                <th className="px-4 py-3 font-semibold">Desde</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {admins.map((u) => (
                <tr key={u.id} className="text-slate-300">
                  <td className="px-4 py-3 font-medium text-white">{u.displayName}</td>
                  <td className="px-4 py-3 text-slate-400">{u.email}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {admins.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">Nenhum admin listado.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
