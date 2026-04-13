import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  Flame,
  Gem,
  LayoutDashboard,
  LogOut,
  Map,
  Medal,
  Settings2,
  ShoppingBag,
  User,
  Users,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { Avatar } from './Avatar';
import { useAuth } from '../hooks/useAuth';

function StreakBadge({ streak }: { streak: number }) {
  const color =
    streak === 0
      ? 'bg-slate-100 text-slate-500'
      : streak < 3
        ? 'bg-orange-50 text-orange-600'
        : streak < 7
          ? 'bg-orange-100 text-orange-700'
          : 'bg-amber-100 text-amber-700';

  const title =
    streak === 0
      ? 'Nenhum dia de sequência ainda'
      : streak < 7
        ? `${streak} dias de sequência`
        : `${streak} dias em chamas! 🔥`;

  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium transition ${color} ${streak >= 7 ? 'ring-1 ring-amber-300' : ''}`}
    >
      <Flame className={`h-4 w-4 ${streak >= 7 ? 'animate-pulse' : ''}`} aria-hidden />
      {streak}
    </span>
  );
}

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900 dot-grid">
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/90 backdrop-blur-md shadow-sm shadow-slate-200/40">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <BrandLogo size="sm" linkTo="/app" />
          {user && (
            <div className="flex flex-wrap items-center justify-end gap-2 text-sm">
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="hidden items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 font-medium text-amber-900 transition hover:bg-amber-100 sm:inline-flex"
                >
                  <Settings2 className="h-4 w-4" aria-hidden />
                  Admin
                </Link>
              )}
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5 text-slate-600 transition hover:bg-slate-100"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Sair</span>
              </button>
              <StreakBadge streak={user.currentStreak} />
              <span
                title={`${user.gems} gemas`}
                className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 font-medium text-sky-600"
              >
                <Gem className="h-4 w-4" aria-hidden />
                {user.gems}
              </span>
              <span className="hidden rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 sm:inline">
                Nv. {user.level}
              </span>
              <Link to="/app/me" title="Ver perfil">
                <Avatar userId={user.id} displayName={user.displayName} size="sm" className="ring-2 ring-white hover:ring-blue-400 transition" />
              </Link>
            </div>
          )}
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 border-t border-slate-100 px-2 pb-2 pt-1" aria-label="Principal">
          <AppNavLink to="/app" end icon={<LayoutDashboard className="h-4 w-4" />} label="Início" />
          <AppNavLink to="/app/my-tracks" end={false} icon={<Map className="h-4 w-4" />} label="Minhas trilhas" />
          <AppNavLink to="/app/tracks" end={false} icon={<ShoppingBag className="h-4 w-4" />} label="Trilhas" />
          <AppNavLink to="/app/ranking" icon={<Medal className="h-4 w-4" />} label="Ranking" />
          <AppNavLink to="/app/community" icon={<Users className="h-4 w-4" />} label="Comunidade" />
          <AppNavLink to="/app/me" icon={<User className="h-4 w-4" />} label="Perfil" />
          <AppNavLink to="/app/settings" icon={<Settings2 className="h-4 w-4" />} label="Configurações" />
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

function AppNavLink({
  to,
  icon,
  label,
  end = true,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition',
          isActive ? 'bg-blue-50 text-blue-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        ].join(' ')
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}
