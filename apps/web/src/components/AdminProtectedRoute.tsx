import { Loader2 } from 'lucide-react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthHydration, useAuthStore } from '../stores/authStore';

export function AdminProtectedRoute() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthHydration();
  const loc = useLocation();

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        <p className="text-sm">Carregando sessão…</p>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/admin/login" state={{ from: loc.pathname }} replace />;
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
