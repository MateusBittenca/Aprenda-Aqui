import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  Shield,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { PageTransition } from './ui/PageTransition';
import { useAuth } from '../hooks/useAuth';

const nav = [
  { to: '/admin', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/admin/team', label: 'Equipe admin', icon: Shield, end: false },
  { to: '/admin/students', label: 'Alunos', icon: Users, end: false },
  { to: '/admin/courses', label: 'Catálogo', icon: BookOpen, end: false },
] as const;

export function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-[#0b0f19] text-slate-200">
      {/* Mobile overlay */}
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          aria-label="Fechar menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="flex min-h-dvh">
        {/* Sidebar */}
        <aside
          className={[
            'fixed inset-y-0 left-0 z-50 flex w-[min(100%,280px)] flex-col border-r border-white/[0.06] bg-[#0f1419] shadow-2xl transition-transform will-change-transform lg:static lg:translate-x-0 lg:will-change-auto',
            mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          ].join(' ')}
        >
          <div className="flex h-16 items-center gap-2 border-b border-white/[0.06] px-5">
            <BrandLogo size="sm" linkTo="/admin" variant="dark" />
          </div>

          <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label="Administração">
            {nav.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  [
                    'flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                    isActive
                      ? 'bg-amber-500/15 text-amber-100 shadow-inner shadow-amber-500/10'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-white',
                  ].join(' ')
                }
              >
                <Icon className="h-[18px] w-[18px] shrink-0 opacity-90" aria-hidden />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-white/[0.06] p-4">
            <div className="rounded-xl bg-white/[0.03] px-3 py-2 text-xs">
              <p className="truncate font-medium text-slate-200">{user?.displayName}</p>
              <p className="truncate text-slate-500">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.05]"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sair
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col lg:pl-0">
          <header className="sticky top-0 z-30 flex min-h-14 items-center justify-between gap-3 border-b border-white/[0.06] bg-[#0b0f19]/90 px-[max(1rem,env(safe-area-inset-left))] py-2 pr-[max(1rem,env(safe-area-inset-right))] backdrop-blur-md lg:min-h-16 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-white/[0.06] hover:text-white lg:hidden"
                onClick={() => setMobileOpen((o) => !o)}
                aria-expanded={mobileOpen}
                aria-label="Abrir menu"
              >
                <PanelLeft className="h-5 w-5" aria-hidden />
              </button>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Console</p>
                <p className="font-headline truncate text-sm font-semibold text-white lg:text-base">
                  {titleForPath(location.pathname)}
                </p>
              </div>
            </div>
            <span className="hidden rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200/90 sm:inline">
              Administrador
            </span>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-6xl">
              <PageTransition>
                <Outlet />
              </PageTransition>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function titleForPath(pathname: string): string {
  if (pathname === '/admin') return 'Visão geral';
  if (pathname.startsWith('/admin/team')) return 'Equipe administrativa';
  if (pathname.startsWith('/admin/students')) return 'Alunos';
  if (pathname.startsWith('/admin/courses')) return 'Catálogo e conteúdo';
  if (pathname.startsWith('/admin/lessons')) return 'Editor de aula';
  return 'Admin';
}
