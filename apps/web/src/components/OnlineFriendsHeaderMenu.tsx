import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, UsersRound } from 'lucide-react';
import { useOnlineUsers } from '../hooks/useOnlineUsers';
import { Avatar } from './Avatar';

/**
 * Menu no header: amigos que você segue e estão “online” (heartbeat recente).
 * Bolinha verde só quando há pelo menos um; sem bolinha > lista vazia ou carregando.
 */
export function OnlineFriendsHeaderMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useOnlineUsers('following');
  const friends = data?.users ?? [];
  const hasOnline = friends.length > 0;
  const windowM = data?.windowMinutes ?? 3;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={
          hasOnline
            ? `${friends.length} ${friends.length === 1 ? 'amigo online' : 'amigos online'}. Abrir lista`
            : 'Amigos online. Abrir lista'
        }
        className="relative inline-flex h-11 w-11 items-center justify-center p-0 text-indigo-600 transition-colors hover:text-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <UsersRound className="h-5 w-5 shrink-0" strokeWidth={2.25} aria-hidden />
        {hasOnline ? (
          <span
            className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-surface-container-lowest bg-emerald-500"
            title="Alguém que você segue está online"
            aria-hidden
          />
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Amigos online"
          className="absolute right-0 top-[calc(100%+0.35rem)] z-[50] w-[min(calc(100vw-2rem),18rem)] overflow-hidden rounded-2xl border border-slate-200/90 bg-surface-container-lowest py-2 shadow-elevated"
        >
          <div className="border-b border-slate-100 px-4 pb-2 pt-1">
            <p className="text-sm font-bold text-slate-900">Amigos online</p>
            <p className="text-xs text-slate-500">
              Quem você segue, com o app aberto nos últimos {windowM} min.
            </p>
          </div>

          <div className="max-h-[min(70vh,20rem)] overflow-y-auto px-1 py-1">
            {isLoading && <p className="px-3 py-4 text-center text-sm text-slate-500">Carregando…</p>}
            {!isLoading && friends.length === 0 && (
              <p className="px-3 py-4 text-center text-sm leading-relaxed text-slate-600">
                Ninguém que você segue está online agora. Quando estiverem com o app aberto, aparecem aqui com o
                indicador verde.
              </p>
            )}
            {!isLoading &&
              friends.map((u) => (
                <Link
                  key={u.id}
                  role="menuitem"
                  to={`/app/users/${u.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-emerald-50/80"
                >
                  <span className="relative shrink-0">
                    <Avatar userId={u.id} displayName={u.displayName} colorKey={u.avatarColorKey} size="sm" />
                    <span
                      className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"
                      aria-hidden
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-slate-900">{u.displayName}</span>
                    <span className="text-xs text-slate-500">
                      Nv. {u.level} · {u.xpTotal.toLocaleString('pt-BR')} XP
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                </Link>
              ))}
          </div>

          <div className="border-t border-slate-100 px-2 pb-1 pt-2">
            <Link
              role="menuitem"
              to="/app/community"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-center text-sm font-semibold text-primary transition hover:bg-primary/5"
            >
              Ir para Comunidade
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
