import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronRight, Radio, Search, Sparkles, UserCircle2, Users, Zap } from 'lucide-react';
import { apiFetch, requireToken } from '../lib/api';
import { useAuthHydration, useAuthStore } from '../stores/authStore';
import type { FollowListUser, OnlineUser, UserSearchHit } from '../types/social';
import { useMe } from '../hooks/useMe';
import { useOnlineUsers } from '../hooks/useOnlineUsers';
import { Avatar } from '../components/Avatar';
import { ErrorState } from '../components/ui/ErrorState';
import { PageLoader } from '../components/ui/PageLoader';

function OnlineRow({ u }: { u: OnlineUser }) {
  return (
    <li>
      <Link
        to={`/app/users/${u.id}`}
        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15"
      >
        <span className="relative shrink-0">
          <Avatar userId={u.id} displayName={u.displayName} colorKey={u.avatarColorKey} size="sm" />
          <span
            className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface-container-lowest bg-emerald-500 animate-ring-pulse"
            title="Online"
            aria-hidden
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-on-surface group-hover:text-emerald-800 dark:group-hover:text-emerald-200">
            {u.displayName}
            {u.isSelf ? (
              <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                Você
              </span>
            ) : null}
          </p>
          <p className="text-xs text-on-surface-variant">
            Nv. {u.level} · {u.xpTotal.toLocaleString('pt-BR')} XP
          </p>
        </div>
        <ChevronRight
          className="h-4 w-4 shrink-0 text-on-surface-variant transition group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
          aria-hidden
        />
      </Link>
    </li>
  );
}

function FollowingRow({ u }: { u: FollowListUser }) {
  return (
    <li>
      <Link
        to={`/app/users/${u.id}`}
        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-primary/10"
      >
        <Avatar userId={u.id} displayName={u.displayName} colorKey={u.avatarColorKey} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-on-surface group-hover:text-primary">{u.displayName}</p>
          <p className="text-xs text-on-surface-variant">
            Nv. {u.level} · {u.xpTotal.toLocaleString('pt-BR')} XP
          </p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-on-surface-variant transition group-hover:text-primary" aria-hidden />
      </Link>
    </li>
  );
}

export function CommunityPage() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthHydration();
  const [q, setQ] = useState('');

  const { data: me } = useMe({});

  const search = useQuery({
    queryKey: ['users', 'search', q],
    queryFn: () => apiFetch<UserSearchHit[]>(`/users/search?q=${encodeURIComponent(q)}`, { token: requireToken(token) }),
    enabled: hydrated && !!token && q.trim().length >= 2,
  });

  const online = useOnlineUsers('all');

  const following = useQuery({
    queryKey: ['users', user?.id, 'following'],
    queryFn: () => {
      const uid = user?.id;
      if (!uid) throw new Error('Usuário não autenticado');
      return apiFetch<FollowListUser[]>(`/users/${uid}/following`, { token: requireToken(token) });
    },
    enabled: hydrated && !!token && !!user?.id,
  });

  const firstName = me?.displayName?.split(' ')[0] ?? 'estudante';

  if (!hydrated) return <PageLoader label="Carregando…" />;

  return (
    <div className="relative mx-auto max-w-5xl pb-10">
      <div
        className="pointer-events-none absolute left-1/4 top-0 h-56 w-[min(100%,28rem)] rounded-full bg-violet-400/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 top-24 h-48 w-72 rounded-full bg-indigo-400/15 dark:bg-indigo-500/10 blur-3xl"
        aria-hidden
      />

      <header className="relative mb-8 md:mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
          <Users className="h-3.5 w-3.5" aria-hidden />
          Comunidade
        </div>
        <h1 className="font-headline mt-4 font-extrabold tracking-tight text-on-surface [font-size:clamp(1.75rem,1.1rem+2.8vw,2.75rem)]">
          Pessoas e conexões
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-on-surface-variant sm:text-lg">
          Oi, <span className="font-semibold text-on-surface">{firstName}</span> — encontre colegas pelo nome e acompanhe
          quem você segue. O ranking continua disponível no menu <strong>Ranking</strong>.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/app/me"
            className="inline-flex items-center gap-2 rounded-2xl border border-surface-container-high bg-surface-container-lowest/90 px-4 py-3 text-sm font-semibold text-on-surface shadow-sm backdrop-blur transition hover:border-primary/30 hover:bg-primary/5"
          >
            <UserCircle2 className="h-5 w-5 text-primary" aria-hidden />
            Meu perfil
          </Link>
        </div>
      </header>

      {/* Presença em tempo quase real (heartbeat no app) */}
      <section className="relative mb-10 overflow-hidden rounded-[1.35rem] border border-emerald-500/25 bg-gradient-to-br from-emerald-500/5 via-surface-container-lowest to-teal-500/5 p-5 shadow-card dark:border-emerald-500/20 sm:p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
              <Radio className="h-5 w-5" aria-hidden />
              <span
                className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-surface-container-lowest bg-emerald-300"
                aria-hidden
              />
            </div>
            <div>
              <h2 className="font-headline text-lg font-bold text-on-surface">Online agora</h2>
              <p className="text-sm text-on-surface-variant">
                Quem teve o app aberto nos últimos{' '}
                <strong>{online.data?.windowMinutes ?? 3} minutos</strong> e permite aparecer na comunidade.
              </p>
            </div>
          </div>
        </div>

        {online.isLoading && <p className="py-4 text-center text-sm text-on-surface-variant">Carregando…</p>}
        {!online.isLoading && online.data && online.data.users.length === 0 && (
          <div className="rounded-xl border border-dashed border-emerald-500/30 bg-surface-container-low/80 px-4 py-8 text-center">
            <p className="text-sm font-medium text-on-surface">Ninguém na lista no momento.</p>
            <p className="mt-2 text-sm text-on-surface-variant">
              Com o app aberto você aparece aqui (se a busca na comunidade estiver ativa nas configurações).
            </p>
          </div>
        )}
        {!online.isLoading && online.data && online.data.users.length > 0 && (
          <ul className="divide-y divide-emerald-500/15 rounded-xl border border-emerald-500/20 bg-surface-container-lowest/90">
            {online.data.users.map((u) => (
              <OnlineRow key={u.id} u={u} />
            ))}
          </ul>
        )}
      </section>

      {/* Busca */}
      <section className="relative mb-10">
        <h2 className="mb-3 flex items-center gap-2 font-headline text-lg font-bold text-on-surface">
          <Search className="h-5 w-5 text-primary" aria-hidden />
          Encontrar pessoas
        </h2>
        <div className="relative rounded-2xl border border-surface-container-high/90 bg-surface-container-lowest/90 p-1 shadow-card backdrop-blur-md">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/70" />
          <input
            type="search"
            inputMode="search"
            enterKeyHint="search"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Digite pelo menos 2 letras do nome…"
            className="min-h-11 w-full rounded-[1.15rem] border-0 bg-transparent py-4 pl-14 pr-4 text-sm text-on-surface outline-none ring-0 placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/30"
            aria-label="Buscar pessoas"
          />
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-on-surface-variant">
          <Sparkles className="h-3.5 w-3.5 text-violet-500" aria-hidden />
          Só aparecem perfis com “busca na comunidade” ativada nas configurações.
        </p>

        {q.trim().length >= 2 && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-surface-container-high/90 bg-surface-container-lowest shadow-md">
            <div className="flex items-center justify-between border-b border-surface-container-high px-4 py-3">
              <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Resultados</h3>
              {search.isFetching && <span className="text-xs font-medium text-primary">Buscando…</span>}
            </div>
            {search.isError && (
              <div className="p-4">
                <ErrorState title="Erro na busca." error={search.error instanceof Error ? search.error : new Error()} />
              </div>
            )}
            {search.data && search.data.length === 0 && (
              <p className="p-6 text-center text-sm text-on-surface-variant">Nenhum usuário encontrado com esse nome.</p>
            )}
            {search.data && search.data.length > 0 && (
              <ul className="divide-y divide-surface-container-high/80">
                {search.data.map((u) => (
                  <li key={u.id}>
                    <Link
                      to={`/app/users/${u.id}`}
                      className="group flex items-center gap-3 px-4 py-3.5 transition hover:bg-primary/5"
                    >
                      <Avatar userId={u.id} displayName={u.displayName} colorKey={u.avatarColorKey} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-on-surface group-hover:text-primary">{u.displayName}</p>
                        <p className="text-xs text-on-surface-variant">
                          Nv. {u.level} · {u.xpTotal.toLocaleString('pt-BR')} XP
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                        Perfil
                        <Zap className="h-3.5 w-3.5 opacity-70" aria-hidden />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      {/* Sua rede */}
      <section className="relative overflow-hidden rounded-[1.35rem] border border-primary/15 bg-gradient-to-br from-primary/5 via-surface-container-lowest to-tertiary/5 p-5 shadow-card dark:border-primary/20 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-md">
              <Users className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="font-headline text-lg font-bold text-on-surface">Sua rede</h2>
              <p className="text-sm text-on-surface-variant">
                {following.data
                  ? following.data.length === 0
                    ? 'Ninguém ainda — use a busca acima para achar colegas e seguir pelo perfil.'
                    : `Você segue ${following.data.length} pessoa${following.data.length !== 1 ? 's' : ''}.`
                  : 'Carregando…'}
              </p>
            </div>
          </div>
        </div>

        {following.isLoading && <p className="py-6 text-center text-sm text-on-surface-variant">Carregando…</p>}
        {following.data && following.data.length === 0 && (
          <div className="rounded-xl border border-dashed border-primary/25 bg-surface-container-low/60 px-4 py-10 text-center">
            <p className="text-sm font-medium text-on-surface">Sua lista está vazia.</p>
            <p className="mt-2 text-sm text-on-surface-variant">
              Encontre pessoas na busca, abra o perfil e toque em <strong>Seguir</strong> para acompanhar o progresso delas
              por aqui.
            </p>
          </div>
        )}
        {following.data && following.data.length > 0 && (
          <ul className="divide-y divide-primary/10 rounded-xl border border-primary/15 bg-surface-container-lowest/80">
            {following.data.map((u) => (
              <FollowingRow key={u.id} u={u} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
