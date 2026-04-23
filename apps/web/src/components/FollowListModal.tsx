import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { Loader2, UserPlus, Users, X } from 'lucide-react';
import { Avatar } from './Avatar';
import { useFollowList, type FollowListKind } from '../hooks/useFollowList';
import { useAuthStore } from '../stores/authStore';
import type { FollowListUser } from '../types/social';

type Props = {
  open: boolean;
  userId: string;
  /** Aba que abre selecionada. Usuário pode alternar dentro do modal. */
  initialKind: FollowListKind;
  /** Contagens usadas só para renderizar os rótulos das abas. */
  followerCount: number;
  followingCount: number;
  /** Nome do dono da lista — usado no título quando não for o próprio viewer. */
  ownerDisplayName?: string;
  onClose: () => void;
};

export function FollowListModal({
  open,
  userId,
  initialKind,
  followerCount,
  followingCount,
  ownerDisplayName,
  onClose,
}: Props) {
  const [kind, setKind] = useState<FollowListKind>(initialKind);

  /* Sincroniza a aba selecionada sempre que o modal reabrir com outro foco. */
  useEffect(() => {
    if (open) setKind(initialKind);
  }, [open, initialKind]);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleEscape);
    const { body, documentElement: html } = document;
    const prevBody = body.style.overflow;
    const prevHtml = html.style.overflow;
    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      body.style.overflow = prevBody;
      html.style.overflow = prevHtml;
    };
  }, [open, handleEscape]);

  const query = useFollowList(userId, kind, open);

  if (!open) return null;

  const title = ownerDisplayName
    ? `Rede de ${ownerDisplayName}`
    : 'Sua rede';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="follow-list-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#282b51]/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Fechar"
      />
      <div className="relative z-10 flex max-h-[min(92dvh,720px)] w-full max-w-md flex-col rounded-t-[1.5rem] border border-surface-container-high bg-surface-container-lowest shadow-2xl sm:rounded-2xl">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-surface-container-high/80 px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="hidden rounded-xl bg-primary/10 p-2 text-primary sm:flex" aria-hidden>
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p id="follow-list-title" className="font-headline text-lg font-bold tracking-tight text-on-surface">
                {title}
              </p>
              <p className="mt-0.5 text-xs text-on-surface-variant">
                Pessoas conectadas ao perfil
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl p-2 text-primary transition hover:bg-surface-container-low"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="shrink-0 border-b border-surface-container-high/80 px-5 pt-3">
          <div role="tablist" aria-label="Listas de conexões" className="flex gap-1">
            <TabButton
              active={kind === 'followers'}
              onClick={() => setKind('followers')}
              label="Seguidores"
              count={followerCount}
            />
            <TabButton
              active={kind === 'following'}
              onClick={() => setKind('following')}
              label="Seguindo"
              count={followingCount}
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3 sm:px-3">
          {query.isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
            </div>
          ) : query.isError ? (
            <p className="px-3 py-6 text-center text-sm text-on-surface-variant">
              Não foi possível carregar a lista agora.
            </p>
          ) : (query.data ?? []).length === 0 ? (
            <EmptyFollowState kind={kind} />
          ) : (
            <ul className="space-y-1">
              {(query.data ?? []).map((u) => (
                <li key={u.id}>
                  <FollowRow user={u} onNavigate={onClose} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={twMerge(
        'press-tactile focus-ring-primary inline-flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm font-semibold transition duration-300 ease-ios-out',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface',
      )}
    >
      {label}
      <span
        className={twMerge(
          'inline-flex min-w-[1.5rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[0.68rem] font-bold tabular-nums',
          active ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant',
        )}
      >
        {count}
      </span>
    </button>
  );
}

function FollowRow({ user, onNavigate }: { user: FollowListUser; onNavigate: () => void }) {
  const myId = useAuthStore((s) => s.user?.id);
  const isSelf = myId === user.id;
  const to = isSelf ? '/app/me' : `/app/users/${user.id}`;

  return (
    <Link
      to={to}
      onClick={onNavigate}
      className="press-tactile focus-ring-primary flex items-center gap-3 rounded-xl px-3 py-2.5 transition duration-300 ease-ios-out hover:bg-surface-container-low"
    >
      <Avatar
        userId={user.id}
        displayName={user.displayName}
        colorKey={user.avatarColorKey}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-on-surface">
          {user.displayName}
          {isSelf && <span className="ml-1 text-xs font-medium text-on-surface-variant">(você)</span>}
        </p>
        <p className="text-xs font-medium text-on-surface-variant">
          Nv. {user.level} · {user.xpTotal.toLocaleString('pt-BR')} XP
        </p>
      </div>
      {!isSelf && user.viewerFollowsThem && (
        <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-emerald-700">
          Seguindo
        </span>
      )}
    </Link>
  );
}

function EmptyFollowState({ kind }: { kind: FollowListKind }) {
  const title = kind === 'followers' ? 'Nenhum seguidor ainda' : 'Ainda não segue ninguém';
  const hint =
    kind === 'followers'
      ? 'Participe da comunidade para crescer sua rede.'
      : 'Explore a comunidade e siga pessoas que te inspiram.';
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
      <div className="rounded-full bg-surface-container-low p-3">
        {kind === 'followers' ? (
          <Users className="h-6 w-6 text-on-surface-variant" aria-hidden />
        ) : (
          <UserPlus className="h-6 w-6 text-on-surface-variant" aria-hidden />
        )}
      </div>
      <p className="text-sm font-semibold text-on-surface">{title}</p>
      <p className="text-xs text-on-surface-variant">{hint}</p>
      <Link
        to="/app/community"
        className="mt-3 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-dim"
      >
        Ir para comunidade
      </Link>
    </div>
  );
}
