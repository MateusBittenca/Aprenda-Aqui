import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  CircleHelp,
  Flame,
  Gem,
  LayoutDashboard,
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
import { usePresenceHeartbeat } from '../hooks/usePresenceHeartbeat';
import { OnlineFriendsHeaderMenu } from './OnlineFriendsHeaderMenu';

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
  usePresenceHeartbeat();
  const { user } = useAuth();
  const { data: me } = useMe({ syncStore: true });
  const pathname = useLocation().pathname;
  const hideGlobalStats = pathname === '/app/me' || pathname === '/app/ranking';
  const reduceMotion = useUiPreferences((s) => s.reduceMotion);

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-interface-motion', reduceMotion);
  }, [reduceMotion]);

  return (
    <div className="min-h-dvh min-w-0 overflow-x-clip bg-surface text-on-surface dot-grid">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-[max(1rem,env(safe-area-inset-left))] focus:top-[max(1rem,env(safe-area-inset-top))] focus:z-[60] focus:rounded-xl focus:bg-surface-container-lowest focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-primary focus:shadow-elevated focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Ir para o conteúdo
      </a>
      <header className="sticky top-0 z-40 border-b border-surface-container-high/80 bg-surface-container-lowest/85 shadow-elevated backdrop-blur-md">
        <div className="mx-auto flex min-w-0 max-w-7xl items-center justify-between gap-2 px-[max(1rem,env(safe-area-inset-left))] py-3 pr-[max(1rem,env(safe-area-inset-right))] sm:gap-4 sm:px-8">
          <div className="min-w-0 shrink-0">
            <BrandLogo size="sm" linkTo="/app" />
          </div>
          {user && (
            <div className="flex min-w-0 max-w-full flex-1 items-center justify-end gap-1.5 sm:max-w-none sm:gap-2">
              {/*
                Stats rolam na horizontal no mobile; amigos + avatar ficam FORA do overflow-x-auto.
                Caso contrário o dropdown absoluto do OnlineFriendsHeaderMenu é recortado (overflow
                em um eixo costuma forçar clip no outro em browsers mobile).
              */}
              <div className="nav-tabs-scroll flex min-w-0 flex-1 items-center justify-end overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:overflow-visible">
                <div className="flex flex-nowrap items-center justify-end gap-1.5 text-sm sm:gap-2">
                  {user.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 font-medium text-amber-900 transition hover:bg-amber-100 sm:min-h-0 sm:min-w-0 sm:px-3 sm:py-2"
                    >
                      <Settings2 className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="sr-only sm:not-sr-only">Admin</span>
                    </Link>
                  )}
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
                        className="hidden min-h-11 flex-col justify-center rounded-full bg-blue-50 px-2.5 py-1 sm:flex"
                      >
                        <span className="text-xs font-semibold leading-tight text-blue-700">Nv. {user.level}</span>
                        <span className="max-w-[7rem] truncate text-xs font-medium leading-tight text-blue-600/90">
                          {getRankForLevel(user.level).name}
                        </span>
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                <OnlineFriendsHeaderMenu />
                <Link
                  to="/app/me"
                  title="Ver perfil"
                  aria-label="Abrir perfil"
                  className="press-tactile inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl focus-ring-primary"
                >
                  <Avatar
                    userId={user.id}
                    displayName={user.displayName}
                    colorKey={user.avatarColorKey}
                    size="sm"
                    className="ring-2 ring-white transition duration-300 ease-ios-out hover:ring-blue-400"
                  />
                </Link>
              </div>
            </div>
          )}
        </div>
        <nav
          className="nav-tabs-scroll mx-auto flex max-w-7xl flex-nowrap gap-3 overflow-x-auto border-t border-surface-container-high/80 px-3 py-1 sm:gap-4 sm:px-6 lg:flex-wrap lg:gap-3 lg:overflow-x-visible"
          aria-label="Principal"
        >
          <AppNavLink to="/app" end icon={<LayoutDashboard className="h-4 w-4" />} label="Início" />
          <AppNavLink to="/app/my-courses" end={false} icon={<Map className="h-4 w-4" />} label="Meus cursos" />
          <AppNavLink to="/app/courses" end={false} icon={<ShoppingBag className="h-4 w-4" />} label="Cursos" />
          <AppNavLink to="/app/ranking" icon={<Medal className="h-4 w-4" />} label="Ranking" />
          <AppNavLink to="/app/community" icon={<Users className="h-4 w-4" />} label="Comunidade" />
          <AppNavLink to="/app/help" icon={<CircleHelp className="h-4 w-4" />} label="Ajuda" />
          <AppNavLink to="/app/settings" icon={<Settings2 className="h-4 w-4" />} label="Configurações" />
        </nav>
      </header>
      <main
        id="main-content"
        className="mx-auto w-full min-w-0 max-w-7xl px-[max(1rem,env(safe-area-inset-left))] py-6 pr-[max(1rem,env(safe-area-inset-right))] sm:px-8 sm:py-8 lg:px-12 lg:py-10"
        tabIndex={-1}
      >
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
      title={label}
      aria-label={label}
      className={({ isActive }) =>
        [
          /* Até lg: só ícone; texto só no nome acessível (aria-label) + a partir de lg na própria linha */
          'press-tactile inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition duration-300 ease-ios-out max-lg:justify-center max-lg:px-3.5 lg:px-3',
          'focus-ring-primary',
          isActive ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface',
        ].join(' ')
      }
    >
      {icon}
      <span className="hidden lg:inline" aria-hidden="true">
        {label}
      </span>
    </NavLink>
  );
}
