import { useId, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ApiError, apiFetch } from '../lib/api';
import { postLoginPath } from '../lib/redirects';
import { AuthPageShell } from '../components/AuthPageShell';
import { useAuthStore, type AuthUser } from '../stores/authStore';

type AuthResponse = { accessToken: string; user: AuthUser };

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const emailId = useId();
  const passwordId = useId();
  const errId = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = postLoginPath((location.state as { from?: string } | null)?.from);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setSession(res.accessToken, res.user);
      if (res.user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Falha ao entrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell>
      <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 shadow-soft">
        <h1 className="text-2xl font-bold text-slate-900">Entrar</h1>
        <p className="mt-1 text-sm text-slate-500">Entre para continuar aprendendo.</p>
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
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-blue-400 focus:ring-2"
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
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-blue-400 focus:ring-2"
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
            className="rounded-2xl bg-blue-600 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Novo por aqui?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:underline">
            Criar conta
          </Link>
        </p>
        <p className="mt-3 text-center text-xs text-slate-500">
          Equipe pedagógica?{' '}
          <Link to="/admin/login" className="font-semibold text-amber-700 hover:underline">
            Login administrativo
          </Link>
        </p>
      </div>
    </AuthPageShell>
  );
}
