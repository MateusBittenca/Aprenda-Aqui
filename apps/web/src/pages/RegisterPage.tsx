import { useId, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AtSign, KeyRound, User } from 'lucide-react';
import { ApiError, apiFetch } from '../lib/api';
import { postLoginPath } from '../lib/redirects';
import { AuthPageShell } from '../components/AuthPageShell';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore, type AuthUser } from '../stores/authStore';

type AuthResponse = { accessToken: string; user: AuthUser };

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const errId = useId();
  const [displayName, setDisplayName] = useState('');
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
      const res = await apiFetch<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ displayName, email, password }),
      });
      setSession(res.accessToken, res.user);
      navigate(from, { replace: true });
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Não foi possível registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell title="Crie sua conta" subtitle="Leva menos de um minuto — sem cartão, sem planos.">
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Nome"
          required
          minLength={2}
          autoComplete="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          leftIcon={<User className="h-4 w-4" />}
          placeholder="Como podemos te chamar?"
        />
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
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<KeyRound className="h-4 w-4" />}
          hint="Mínimo 8 caracteres."
          placeholder="••••••••"
        />
        {err ? (
          <p id={errId} className="text-sm text-red-600" role="alert" aria-live="polite">
            {err}
          </p>
        ) : null}
        <Button type="submit" variant="brand" size="lg" loading={loading} className="mt-2 w-full">
          {loading ? 'Criando…' : 'Criar conta grátis'}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-on-surface-variant">
        Já tem conta?{' '}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </AuthPageShell>
  );
}
