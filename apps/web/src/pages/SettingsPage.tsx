import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  FileText,
  Globe2,
  Loader2,
  Lock,
  Settings2,
  Shield,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch, ApiError } from '../lib/api';
import { useMe } from '../hooks/useMe';
import { useAuthStore } from '../stores/authStore';
import type { MeProfile } from '../types/user';
import { ErrorState } from '../components/ui/ErrorState';
import { PageLoader } from '../components/ui/PageLoader';
import { Avatar } from '../components/Avatar';

const fieldInput =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ring-indigo-500/15 focus:border-indigo-300 focus:ring-4';

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
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          to="/app/me"
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"
        >
          Perfil
        </Link>
        <Link
          to="/app/community"
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"
        >
          Comunidade
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-soft">
        <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
          <div className="flex min-w-0 flex-1 gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700 shadow-inner shadow-blue-900/5"
              aria-hidden
            >
              <Settings2 className="h-7 w-7" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Configurações</h1>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                Ajuste como seu nome, bio e visibilidade aparecem para outros alunos na plataforma.
              </p>
            </div>
          </div>
          <Link
            to="/app/me"
            className="inline-flex shrink-0 items-center gap-1 self-start text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            Ver perfil público
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>

      <form
        className="space-y-6"
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
        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-soft">
          <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4 sm:px-8">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
              <UserRound className="h-4 w-4 text-blue-600" aria-hidden />
              Perfil público
            </div>
            <p className="mt-1 text-sm text-slate-600">Informações exibidas no seu perfil e nas interações na comunidade.</p>
          </div>

          <div className="space-y-6 p-6 sm:p-8">
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:items-center">
              <Avatar userId={data.id} displayName={data.displayName} size="lg" className="ring-2 ring-white shadow-sm" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pré-visualização</p>
                <p className="mt-1 text-sm text-slate-600">
                  A foto é gerada a partir do seu nome. Altere o nome abaixo para atualizar as iniciais no avatar após salvar.
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="displayName" className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <UserRound className="h-4 w-4 text-slate-400" aria-hidden />
                Nome exibido
              </label>
              <p className="mt-0.5 text-xs text-slate-500">Como outros alunos veem você em ranking, comunidade e no seu perfil.</p>
              <input
                id="displayName"
                name="displayName"
                key={data.displayName}
                defaultValue={data.displayName}
                className={fieldInput}
                autoComplete="nickname"
                required
                minLength={2}
                maxLength={120}
              />
            </div>

            <div>
              <label htmlFor="bio" className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <FileText className="h-4 w-4 text-slate-400" aria-hidden />
                Bio
                <span className="font-normal text-slate-400">(opcional)</span>
              </label>
              <p className="mt-0.5 text-xs text-slate-500">Até 280 caracteres. Uma linha curta ajuda na comunidade.</p>
              <textarea
                id="bio"
                name="bio"
                defaultValue={data.bio ?? ''}
                rows={4}
                maxLength={280}
                className={`${fieldInput} resize-none leading-relaxed`}
                placeholder="Ex.: Estudando TypeScript e construindo projetos reais."
              />
            </div>

            <div>
              <label htmlFor="timezone" className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Globe2 className="h-4 w-4 text-slate-400" aria-hidden />
                Fuso horário
              </label>
              <p className="mt-0.5 text-xs text-slate-500">
                Use um identificador IANA (ex.: <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-slate-700">America/Sao_Paulo</code>,{' '}
                <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-slate-700">UTC</code>) para datas e lembretes consistentes.
              </p>
              <input
                id="timezone"
                name="timezone"
                defaultValue={data.timezone}
                className={`${fieldInput} font-mono text-sm`}
                placeholder="UTC"
                autoComplete="off"
              />
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-soft">
          <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4 sm:px-8">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
              <Shield className="h-4 w-4 text-emerald-600" aria-hidden />
              Privacidade
            </div>
            <p className="mt-1 text-sm text-slate-600">Controle se o seu perfil pode ser encontrado por outros na busca da comunidade.</p>
          </div>

          <div className="p-6 sm:p-8">
            <label className="group flex cursor-pointer gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:bg-indigo-50/30">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-white group-hover:text-indigo-600">
                <Lock className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm font-semibold text-slate-900">Aparecer na busca da comunidade</span>
                  <input
                    type="checkbox"
                    name="showInSearch"
                    defaultChecked={data.showInSearch !== false}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Quando ativado, outros alunos podem encontrar você pelo nome nos resultados de busca. Desative para permanecer fora dessa lista.
                </p>
              </div>
            </label>
          </div>
        </section>

        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/80 p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-xs leading-relaxed text-slate-500 sm:max-w-md">
            As alterações são aplicadas na hora após salvar. Se algo não atualizar no menu, recarregue a página — o servidor já terá os dados novos.
          </p>
          <button
            type="submit"
            disabled={save.isPending}
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-md shadow-indigo-900/10 transition hover:bg-indigo-700 disabled:opacity-60 sm:w-auto"
          >
            {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            Salvar alterações
          </button>
        </div>
      </form>
    </div>
  );
}
