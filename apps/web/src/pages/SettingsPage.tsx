import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch, ApiError } from '../lib/api';
import { useMe } from '../hooks/useMe';
import { useAuthStore } from '../stores/authStore';
import type { MeProfile } from '../types/user';
import { ErrorState } from '../components/ui/ErrorState';
import { PageLoader } from '../components/ui/PageLoader';

export function SettingsPage() {
  const queryClient = useQueryClient();
  const patchUser = useAuthStore((s) => s.patchUser);
  const token = useAuthStore((s) => s.token);
  const { data, isLoading, isError, error, hydrated } = useMe({});

  const save = useMutation({
    mutationFn: async (body: {
      displayName?: string;
      timezone?: string;
      bio?: string;
      showInSearch?: boolean;
    }) => {
      return apiFetch<MeProfile>('/me', { method: 'PATCH', token: token!, body: JSON.stringify(body) });
    },
    onSuccess: (profile) => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      patchUser({
        displayName: profile.displayName,
      });
      toast.success('Preferências salvas.');
    },
    onError: (e) => {
      const msg = e instanceof ApiError ? e.message : 'Não foi possível salvar.';
      toast.error(msg);
    },
  });

  if (!hydrated || isLoading) return <PageLoader label="Carregando…" />;
  if (isError || !data) {
    return <ErrorState title="Não foi possível carregar as configurações." error={error ?? new Error()} />;
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <Link
          to="/app/me"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-indigo-600"
        >
          Perfil
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="mt-1 text-sm text-slate-600">Nome público, bio e privacidade na busca.</p>
      </div>

      <form
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const fd = new FormData(form);
          const displayName = String(fd.get('displayName') ?? '').trim();
          const timezone = String(fd.get('timezone') ?? '').trim() || 'UTC';
          const bio = String(fd.get('bio') ?? '').trim();
          const showInSearch = (form.querySelector('input[name="showInSearch"]') as HTMLInputElement)?.checked ?? false;
          if (displayName.length < 2) {
            toast.error('Nome deve ter pelo menos 2 caracteres.');
            return;
          }
          save.mutate({ displayName, timezone, bio: bio || '', showInSearch });
        }}
      >
        <div>
          <label htmlFor="displayName" className="block text-sm font-semibold text-slate-700">
            Nome exibido
          </label>
          <input
            id="displayName"
            name="displayName"
            key={data.displayName}
            defaultValue={data.displayName}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            autoComplete="nickname"
            required
            minLength={2}
            maxLength={120}
          />
        </div>
        <div>
          <label htmlFor="timezone" className="block text-sm font-semibold text-slate-700">
            Fuso horário
          </label>
          <input
            id="timezone"
            name="timezone"
            defaultValue={data.timezone}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono"
            placeholder="UTC"
          />
        </div>
        <div>
          <label htmlFor="bio" className="block text-sm font-semibold text-slate-700">
            Bio (opcional)
          </label>
          <textarea
            id="bio"
            name="bio"
            defaultValue={data.bio ?? ''}
            rows={3}
            maxLength={280}
            className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="Uma linha sobre você…"
          />
        </div>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
          <input
            type="checkbox"
            name="showInSearch"
            defaultChecked={data.showInSearch !== false}
            className="mt-1 h-4 w-4 rounded border-slate-300"
          />
          <span>
            <span className="block text-sm font-semibold text-slate-800">Aparecer na busca da comunidade</span>
            <span className="text-xs text-slate-500">
              Outros alunos podem encontrar você pelo nome. Desative para ficar fora dos resultados.
            </span>
          </span>
        </label>
        <button
          type="submit"
          disabled={save.isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          Salvar alterações
        </button>
      </form>
    </div>
  );
}
