import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Flame, Gem, LayoutDashboard, LogOut, Map, User } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export function AppLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);

  const logout = () => {
    clear();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900 dot-grid">
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/85 backdrop-blur-md shadow-sm shadow-slate-200/40">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link
            to="/app"
            className="flex items-center gap-2 font-semibold tracking-tight text-slate-900"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-lg shadow-md shadow-blue-500/25">
              <span className="grid grid-cols-2 gap-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
              </span>
            </span>
            <span>
              Aprenda aqui<span className="text-blue-600">!</span>
            </span>
          </Link>
          {user && (
            <div className="flex flex-wrap items-center justify-end gap-3 text-sm">
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5 text-slate-600 transition hover:bg-slate-100"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 font-medium text-orange-600">
                <Flame className="h-4 w-4" />
                {user.currentStreak}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 font-medium text-sky-600">
                <Gem className="h-4 w-4" />
                {user.gems}
              </span>
              <span className="hidden sm:inline text-slate-600">
                Nv. {user.level} · {user.xpTotal} XP
              </span>
            </div>
          )}
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 border-t border-slate-100 px-2 pb-2 pt-1">
          <AppNavLink to="/app" end icon={<LayoutDashboard className="h-4 w-4" />} label="Início" />
          <AppNavLink to="/app/tracks" icon={<Map className="h-4 w-4" />} label="Trilhas" />
          <AppNavLink to="/app/me" icon={<User className="h-4 w-4" />} label="Perfil" />
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

function AppNavLink({ to, icon, label, end }: { to: string; icon: React.ReactNode; label: string; end?: boolean }) {
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
