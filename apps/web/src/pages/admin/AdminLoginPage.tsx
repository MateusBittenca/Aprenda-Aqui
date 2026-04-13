import { useId, useState } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ApiError, apiFetch } from '../../lib/api';
import { AuthPageShell } from '../../components/AuthPageShell';
import { useAuthHydration, useAuthStore, type AuthUser } from '../../stores/authStore';

type AuthResponse = { accessToken: string; user: AuthUser };

export function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const hydrated = useAuthHydration();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const emailId = useId();
  const passwordId = useId();
  const errId = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/admin';

  if (hydrated && token && user?.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.user.role !== 'ADMIN') {
        setErr('Esta conta não tem permissão de administrador. Use o login de aluno.');
        return;
      }
      setSession(res.accessToken, res.user);
      navigate(from.startsWith('/admin') ? from : '/admin', { replace: true });
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Falha ao entrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell>
      <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 shadow-soft">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-700">Equipe</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Login administrativo</h1>
        <p className="mt-1 text-sm text-slate-500">
          Acesso restrito a contas com perfil de administrador.
        </p>
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4" noValidate>
          <div>
            <label htmlFor={emailId} className="block text-left text-sm font-medium text-slate-700">
              E-mail
            </label>
            <input
              id={emailId}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-amber-500/30 focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor={passwordId} className="block text-left text-sm font-medium text-slate-700">
              Senha
            </label>
            <input
              id={passwordId}
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-amber-500/30 focus:ring-2"
            />
          </div>
          {err ? (
            <p id={errId} className="text-sm text-red-600" role="alert" aria-live="polite">
              {err}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-amber-600 py-3 font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:bg-amber-700 disabled:opacity-60"
          >
            {loading ? 'Entrando…' : 'Entrar como admin'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          É aluno?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">
            Login de aluno
          </Link>
        </p>
      </div>
    </AuthPageShell>
  );
}
