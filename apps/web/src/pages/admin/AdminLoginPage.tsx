import { useId, useState } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AtSign, KeyRound, Shield } from 'lucide-react';
import { ApiError, apiFetch } from '../../lib/api';
import { AuthPageShell } from '../../components/AuthPageShell';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthHydration, useAuthStore, type AuthUser } from '../../stores/authStore';

type AuthResponse = { accessToken: string; user: AuthUser };

export function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const hydrated = useAuthHydration();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
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
    <AuthPageShell title="Login administrativo" subtitle="Acesso restrito a contas com perfil de administrador.">
      <div className="mb-5 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
        <Shield className="h-4 w-4 shrink-0" aria-hidden /> Área da equipe
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="E-mail"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<AtSign className="h-4 w-4" />}
        />
        <Input
          label="Senha"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<KeyRound className="h-4 w-4" />}
        />
        {err ? (
          <p id={errId} className="text-sm text-red-600" role="alert" aria-live="polite">
            {err}
          </p>
        ) : null}
        <Button
          type="submit"
          size="lg"
          loading={loading}
          className="mt-2 w-full !bg-amber-600 hover:!bg-amber-700"
        >
          {loading ? 'Entrando…' : 'Entrar como admin'}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-on-surface-variant">
        É aluno?{' '}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Login de aluno
        </Link>
      </p>
    </AuthPageShell>
  );
}
