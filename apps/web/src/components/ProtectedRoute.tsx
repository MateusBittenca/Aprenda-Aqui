import { Loader2 } from 'lucide-react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthHydration, useAuthStore } from '../stores/authStore';

export function ProtectedRoute() {
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthHydration();
  const loc = useLocation();

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm">Carregando sessão…</p>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  }
  return <Outlet />;
}
