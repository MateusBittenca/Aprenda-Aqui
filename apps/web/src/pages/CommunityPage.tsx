import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, Users } from 'lucide-react';
import { apiFetch, requireToken } from '../lib/api';
import { useAuthHydration, useAuthStore } from '../stores/authStore';
import type { FollowListUser, UserSearchHit } from '../types/social';
import { Avatar } from '../components/Avatar';
import { ErrorState } from '../components/ui/ErrorState';
import { PageLoader } from '../components/ui/PageLoader';

export function CommunityPage() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthHydration();
  const [q, setQ] = useState('');

  const search = useQuery({
    queryKey: ['users', 'search', q],
    queryFn: () => apiFetch<UserSearchHit[]>(`/users/search?q=${encodeURIComponent(q)}`, { token: requireToken(token) }),
    enabled: hydrated && !!token && q.trim().length >= 2,
  });

  const following = useQuery({
    queryKey: ['users', user?.id, 'following'],
    queryFn: () => {
      const uid = user?.id;
      if (!uid) throw new Error('Usuário não autenticado');
      return apiFetch<FollowListUser[]>(`/users/${uid}/following`, { token: requireToken(token) });
    },
    enabled: hydrated && !!token && !!user?.id,
  });

  if (!hydrated) return <PageLoader label="Carregando…" />;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Comunidade</h1>
        <p className="mt-1 text-sm text-slate-600">Busque alunos pelo nome e veja quem você segue.</p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Digite pelo menos 2 letras…"
          className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 text-sm shadow-sm outline-none ring-indigo-500/20 focus:border-indigo-300 focus:ring-4"
          aria-label="Buscar pessoas"
        />
      </div>

      {q.trim().length >= 2 && (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <h2 className="border-b border-slate-100 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
            Resultados
          </h2>
          {search.isLoading && <p className="p-4 text-sm text-slate-500">Buscando…</p>}
          {search.isError && (
            <ErrorState title="Erro na busca." error={search.error instanceof Error ? search.error : new Error()} />
          )}
          {search.data && search.data.length === 0 && (
            <p className="p-4 text-sm text-slate-500">Nenhum usuário encontrado.</p>
          )}
          {search.data && search.data.length > 0 && (
            <ul className="divide-y divide-slate-100">
              {search.data.map((u) => (
                <li key={u.id}>
                  <Link
                    to={`/app/users/${u.id}`}
                    className="flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50"
                  >
                    <Avatar userId={u.id} displayName={u.displayName} colorKey={u.avatarColorKey} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">{u.displayName}</p>
                      <p className="text-xs text-slate-500">
                        Nv. {u.level} · {u.xpTotal.toLocaleString('pt-BR')} XP
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <Users className="h-4 w-4 text-indigo-600" aria-hidden />
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">Quem você segue</h2>
        </div>
        {following.isLoading && <p className="p-4 text-sm text-slate-500">Carregando…</p>}
        {following.data && following.data.length === 0 && (
          <p className="p-4 text-sm text-slate-500">
            Você ainda não segue ninguém. Use a busca acima e abra um perfil para seguir.
          </p>
        )}
        {following.data && following.data.length > 0 && (
          <ul className="divide-y divide-slate-100">
            {following.data.map((u) => (
              <li key={u.id}>
                <Link
                  to={`/app/users/${u.id}`}
                  className="flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50"
                >
                  <Avatar userId={u.id} displayName={u.displayName} colorKey={u.avatarColorKey} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{u.displayName}</p>
                    <p className="text-xs text-slate-500">Nv. {u.level}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
