import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError, apiFetch } from '../lib/api';
import { AuthPageShell } from '../components/AuthPageShell';
import { useAuthStore, type AuthUser } from '../stores/authStore';

type AuthResponse = { accessToken: string; user: AuthUser };

export function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await apiFetch<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ displayName, email, password }),
      });
      setSession(res.accessToken, res.user);
      navigate('/app', { replace: true });
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Não foi possível registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell>
      <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 shadow-soft">
        <h1 className="text-2xl font-bold text-slate-900">Criar conta</h1>
        <p className="mt-1 text-sm text-slate-500">Comece sua trilha em minutos.</p>
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <label className="block text-left text-sm font-medium text-slate-700">
            Nome
            <input
              required
              minLength={2}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-blue-400 focus:ring-2"
            />
          </label>
          <label className="block text-left text-sm font-medium text-slate-700">
            E-mail
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-blue-400 focus:ring-2"
            />
          </label>
          <label className="block text-left text-sm font-medium text-slate-700">
            Senha (mín. 8 caracteres)
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-blue-400 focus:ring-2"
            />
          </label>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-blue-600 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Criando…' : 'Registrar'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Já tem conta?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </AuthPageShell>
  );
}
