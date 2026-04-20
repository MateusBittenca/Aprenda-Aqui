import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Search, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError, apiFetch, requireToken } from '../../lib/api';
import { useAuthHydration, useAuthStore } from '../../stores/authStore';
import { PageLoader } from '../../components/ui/PageLoader';
import { ErrorState } from '../../components/ui/ErrorState';

type AdminUserRow = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  level: number;
  xpTotal: number;
  gems: number;
  currentStreak: number;
  createdAt: string;
};

const field = 'mt-1 w-full rounded-xl border border-white/[0.08] bg-[#0b0f19] px-3 py-2.5 text-white outline-none ring-amber-500/40 focus:ring-2 placeholder:text-slate-600';
const lbl = 'block text-sm font-medium text-slate-400';

export function AdminStudentsPage() {
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthHydration();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => apiFetch<AdminUserRow[]>('/admin/users', { token: requireToken(token) }),
    enabled: hydrated && !!token,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch('/admin/users/student', {
        method: 'POST',
        token: requireToken(token),
        body: JSON.stringify({ displayName: name.trim(), email: email.trim(), password }),
      }),
    onSuccess: () => {
      toast.success('Aluno criado com sucesso');
      setName(''); setEmail(''); setPassword('');
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
    onError: (e: unknown) => toast.error(e instanceof ApiError ? e.message : 'Erro ao criar aluno'),
  });

  if (!hydrated || isLoading) return <PageLoader label="Carregando alunos…" />;
  if (isError) return <ErrorState title="Não foi possível carregar os alunos." error={error} />;
  if (!data) return null;

  const students = data.filter((u) => u.role === 'USER');
  const filtered = students.filter(
    (u) =>
      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alunos</h1>
          <p className="mt-1 text-sm text-slate-400">
            {students.length} aluno{students.length !== 1 ? 's' : ''} cadastrado{students.length !== 1 ? 's' : ''}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((o) => !o)}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-900/25 transition hover:bg-amber-500"
        >
          <UserPlus className="h-4 w-4" />
          Novo aluno
        </button>
      </div>

      {/* Formulário novo aluno (colapsável) */}
      {showForm && (
        <section className="rounded-2xl border border-dashed border-amber-500/25 bg-amber-500/[0.03] p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Criar aluno</h2>
          </div>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}
          >
            <div className="sm:col-span-2">
              <label className={lbl}>Nome exibido *<input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} /></label>
            </div>
            <div>
              <label className={lbl}>E-mail *<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={field} /></label>
            </div>
            <div>
              <label className={lbl}>Senha inicial *
                <div className="relative">
                  <input
                    required
                    minLength={8}
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className={field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((o) => !o)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
                  >
                    {showPass ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
              </label>
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:opacity-50"
              >
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {createMutation.isPending ? 'Criando…' : 'Criar aluno'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-slate-400 hover:text-white">
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Busca */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou e-mail…"
          className="w-full rounded-xl border border-white/[0.08] bg-[#0f1419] py-2.5 pl-10 pr-4 text-sm text-white outline-none ring-amber-500/40 focus:ring-2 placeholder:text-slate-600"
        />
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-[#0f1419]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-semibold">Nome</th>
              <th className="px-4 py-3 font-semibold">E-mail</th>
              <th className="px-4 py-3 font-semibold text-right">Nível</th>
              <th className="px-4 py-3 font-semibold text-right">XP</th>
              <th className="px-4 py-3 font-semibold text-right">Gemas</th>
              <th className="px-4 py-3 font-semibold text-right">Sequência</th>
              <th className="px-4 py-3 font-semibold">Desde</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.map((u) => (
              <tr key={u.id} className="text-slate-300 transition hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-medium text-white">{u.displayName}</td>
                <td className="px-4 py-3 text-slate-400">{u.email}</td>
                <td className="px-4 py-3 tabular-nums text-right">{u.level}</td>
                <td className="px-4 py-3 tabular-nums text-right">{u.xpTotal}</td>
                <td className="px-4 py-3 tabular-nums text-right">{u.gems}</td>
                <td className="px-4 py-3 tabular-nums text-right">{u.currentStreak}d</td>
                <td className="px-4 py-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-slate-500">
            {search ? 'Nenhum aluno encontrado com esse filtro.' : 'Nenhum aluno cadastrado ainda.'}
          </p>
        )}
      </div>
    </div>
  );
}
