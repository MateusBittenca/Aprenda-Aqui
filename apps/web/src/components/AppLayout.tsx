import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  CircleHelp,
  Flame,
  Gem,
  LayoutDashboard,
  LogOut,
  Map,
  Medal,
  Settings2,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { BrandLogo } from './BrandLogo';
import { Avatar } from './Avatar';
import { useAuth } from '../hooks/useAuth';
import { useMe } from '../hooks/useMe';
import { getRankForLevel } from '../lib/levelTitles';
import { useUiPreferences } from '../stores/uiPreferencesStore';

function StreakBadge({ streak, weekDays }: { streak: number; weekDays?: boolean[] }) {
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
      ? 'Nenhum dia de ofensiva ainda — acerte um exercício ou conclua uma aula hoje.'
      : streak < 7
        ? `Ofensiva: ${streak} dia${streak === 1 ? '' : 's'}. Os pontos mostram os últimos 7 dias (o último é hoje).`
        : `${streak} dias de ofensiva! Continue assim.`;

  return (
    <span
      title={title}
      className={twMerge(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium transition',
        color,
        streak >= 7 ? 'ring-1 ring-amber-300' : '',
      )}
    >
      {weekDays && weekDays.length === 7 ? (
        <span className="flex gap-0.5 pr-0.5" aria-hidden>
          {weekDays.map((on, i) => (
            <span
              key={i}
              title={on ? 'Estudou neste dia' : 'Sem estudo'}
              className={twMerge(
                'h-2 w-2 rounded-full transition-colors',
                on ? 'bg-orange-500 shadow-[0_0_0_1px_rgba(251,146,60,0.35)]' : 'bg-slate-300/80',
                i === 6 && 'ring-1 ring-orange-600 ring-offset-1 ring-offset-white',
              )}
            />
          ))}
        </span>
      ) : null}
      <Flame
        className={`h-4 w-4 shrink-0 ${streak >= 7 ? 'animate-pulse motion-reduce:animate-none' : ''}`}
        aria-hidden
      />
      <span className="tabular-nums">{streak}</span>
    </span>
  );
}

export function AppLayout() {
  const { user, logout } = useAuth();
  const { data: me } = useMe({ syncStore: true });
  const pathname = useLocation().pathname;
  const hideGlobalStats = pathname === '/app/me' || pathname === '/app/ranking';
  const reduceMotion = useUiPreferences((s) => s.reduceMotion);

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-interface-motion', reduceMotion);
  }, [reduceMotion]);

  return (
    <div className="min-h-dvh bg-surface text-on-surface dot-grid">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-surface-container-lowest focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-primary focus:shadow-elevated focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Ir para o conteúdo
      </a>
      <header className="sticky top-0 z-40 border-b border-surface-container-high/80 bg-surface-container-lowest/85 shadow-elevated backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
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
              {!hideGlobalStats && (
                <>
                  <StreakBadge streak={user.currentStreak} weekDays={me?.streakWeekDays} />
                  <span
                    title={`${user.gems} gemas`}
                    className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 font-medium text-sky-600"
                  >
                    <Gem className="h-4 w-4" aria-hidden />
                    {user.gems}
                  </span>
                  <span
                    title={getRankForLevel(user.level).description}
                    className="hidden flex-col items-end rounded-full bg-blue-50 px-2.5 py-0.5 sm:flex"
                  >
                    <span className="text-xs font-semibold leading-tight text-blue-700">Nv. {user.level}</span>
                    <span className="max-w-[7rem] truncate text-[10px] font-medium leading-tight text-blue-600/90">
                      {getRankForLevel(user.level).name}
                    </span>
                  </span>
                </>
              )}
              <Link
                to="/app/me"
                title="Ver perfil"
                aria-label="Abrir perfil"
                className="rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <Avatar
                  userId={user.id}
                  displayName={user.displayName}
                  colorKey={user.avatarColorKey}
                  size="sm"
                  className="ring-2 ring-white hover:ring-blue-400 transition"
                />
              </Link>
            </div>
          )}
        </div>
        <nav className="mx-auto flex max-w-7xl flex-wrap gap-1 border-t border-surface-container-high/80 px-2 pb-2 pt-1 sm:px-6" aria-label="Principal">
          <AppNavLink to="/app" end icon={<LayoutDashboard className="h-4 w-4" />} label="Início" />
          <AppNavLink to="/app/my-courses" end={false} icon={<Map className="h-4 w-4" />} label="Meus cursos" />
          <AppNavLink to="/app/courses" end={false} icon={<ShoppingBag className="h-4 w-4" />} label="Cursos" />
          <AppNavLink to="/app/ranking" icon={<Medal className="h-4 w-4" />} label="Ranking" />
          <AppNavLink to="/app/community" icon={<Users className="h-4 w-4" />} label="Comunidade" />
          <AppNavLink to="/app/help" icon={<CircleHelp className="h-4 w-4" />} label="Ajuda" />
          <AppNavLink to="/app/settings" icon={<Settings2 className="h-4 w-4" />} label="Configurações" />
        </nav>
      </header>
      <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 lg:px-12" tabIndex={-1}>
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
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          isActive ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface',
        ].join(' ')
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}
