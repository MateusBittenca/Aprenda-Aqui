import { useId, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AtSign, KeyRound } from 'lucide-react';
import { ApiError, apiFetch } from '../lib/api';
import { postLoginPath } from '../lib/redirects';
import { AuthPageShell } from '../components/AuthPageShell';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore, type AuthUser } from '../stores/authStore';

type AuthResponse = { accessToken: string; user: AuthUser };

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
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
    <AuthPageShell title="Bem-vindo de volta" subtitle="Entre para continuar aprendendo de onde parou.">
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="E-mail"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<AtSign className="h-4 w-4" />}
          placeholder="voce@exemplo.com"
        />
        <Input
          label="Senha"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<KeyRound className="h-4 w-4" />}
          placeholder="••••••••"
        />
        {err ? (
          <p id={errId} className="text-sm text-red-600" role="alert" aria-live="polite">
            {err}
          </p>
        ) : null}
        <Button type="submit" variant="brand" size="lg" loading={loading} className="mt-2 w-full">
          {loading ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-on-surface-variant">
        Novo por aqui?{' '}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          Criar conta
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-on-surface-variant/80">
        Equipe pedagógica?{' '}
        <Link to="/admin/login" className="font-semibold text-amber-700 hover:underline">
          Login administrativo
        </Link>
      </p>
    </AuthPageShell>
  );
}
