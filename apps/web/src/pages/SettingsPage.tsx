import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  ChevronRight,
  CircleHelp,
  Globe2,
  Info,
  Loader2,
  Lock,
  LogOut,
  Monitor,
  Moon,
  Settings2,
  Shield,
  Sun,
  UserRound,
  Volume2,
} from 'lucide-react';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';
import { apiFetch, ApiError, requireToken } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { useMe } from '../hooks/useMe';
import { useAuthStore } from '../stores/authStore';
import { useUiPreferences } from '../stores/uiPreferencesStore';
import { useTheme } from '../hooks/useThemeContext';
import type { MeProfile } from '../types/user';
import { ErrorState } from '../components/ui/ErrorState';
import { PageLoader } from '../components/ui/PageLoader';
import { Avatar } from '../components/Avatar';
import { AVATAR_COLOR_OPTIONS, getAvatarStyle } from '../lib/avatar';

const fieldInput =
  'mt-1.5 w-full rounded-xl border border-surface-container-high bg-surface-container-lowest px-3 py-2.5 text-sm text-on-surface outline-none transition placeholder:text-on-surface-variant ring-primary/15 focus:border-primary/40 focus:ring-4';

const cardInner =
  'rounded-2xl border border-surface-container-high/70 bg-surface-container-lowest/80 p-5 sm:p-6';

type SettingsTab = 'conta' | 'aplicativo' | 'sessao' | 'sobre';

const TABS: {
  id: SettingsTab;
  label: string;
  description: string;
}[] = [
  {
    id: 'conta',
    label: 'Perfil e privacidade',
    description: 'Informações da sua conta na plataforma e quem pode encontrá-lo na comunidade.',
  },
  {
    id: 'aplicativo',
    label: 'Aplicativo',
    description: 'Preferências só neste navegador: conforto visual e como recebe avisos hoje.',
  },
  {
    id: 'sessao',
    label: 'Sessão',
    description: 'Encerrar login neste dispositivo.',
  },
  {
    id: 'sobre',
    label: 'Sobre',
    description: 'Links úteis e referência rápida.',
  },
];

export function SettingsPage() {
  const queryClient = useQueryClient();
  const patchUser = useAuthStore((s) => s.patchUser);
  const token = useAuthStore((s) => s.token);
  const { logout } = useAuth();
  const { data, isLoading, isError, error, hydrated } = useMe({});
  const timezoneRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useUiPreferences((s) => s.reduceMotion);
  const setReduceMotion = useUiPreferences((s) => s.setReduceMotion);
  const soundEnabled = useUiPreferences((s) => s.soundEnabled);
  const setSoundEnabled = useUiPreferences((s) => s.setSoundEnabled);
  const { colorScheme, setColorScheme } = useTheme();
  const [tab, setTab] = useState<SettingsTab>('conta');
  const [avatarColorKey, setAvatarColorKey] = useState('auto');

  useEffect(() => {
    if (data?.avatarColorKey == null) return;
    const next = data.avatarColorKey;
    queueMicrotask(() => setAvatarColorKey(next));
  }, [data?.avatarColorKey]);

  const save = useMutation({
    mutationFn: async (body: {
      displayName?: string;
      timezone?: string;
      bio?: string;
      showInSearch?: boolean;
      avatarColorKey?: string;
    }) => {
      return apiFetch<MeProfile>('/me', { method: 'PATCH', token: requireToken(token), body: JSON.stringify(body) });
    },
    onSuccess: (profile) => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      patchUser({
        displayName: profile.displayName,
        avatarColorKey: profile.avatarColorKey,
      });
      toast.success('Alterações salvas no servidor.');
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

  const activeMeta = TABS.find((t) => t.id === tab) ?? TABS[0];

  return (
    <div className="mx-auto max-w-3xl pb-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
            <Settings2 className="h-3.5 w-3.5" aria-hidden />
            Ajustes
          </div>
          <h1 className="mt-3 font-headline text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
            Configurações
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-on-surface-variant">
            Escolha uma área abaixo. Cada aba agrupa um tipo de opção — assim fica mais fácil achar o que precisa.
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-wrap gap-2">
          <Link
            to="/app/me"
            className="rounded-xl border border-surface-container-high bg-surface-container-lowest px-3 py-2 text-sm font-medium text-on-surface shadow-sm transition hover:border-primary/30 hover:text-primary"
          >
            Meu perfil
          </Link>
          <Link
            to="/app/help"
            className="inline-flex items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
          >
            <CircleHelp className="h-4 w-4" aria-hidden />
            Ajuda
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-surface-container-high/80 bg-surface-container-lowest/90 shadow-card backdrop-blur-sm">
        <div className="border-b border-surface-container-high/80 px-3 pt-3 sm:px-4 sm:pt-4">
          <div
            className="flex gap-1 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Áreas de configuração"
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                id={`settings-tab-${t.id}`}
                aria-controls={`settings-panel-${t.id}`}
                onClick={() => setTab(t.id)}
                className={twMerge(
                  'shrink-0 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold transition sm:px-4',
                  tab === t.id
                    ? 'bg-primary text-white shadow-md shadow-primary/25'
                    : 'bg-surface-container-low/90 text-on-surface-variant hover:bg-surface-container-high/80 hover:text-on-surface',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-b border-surface-container-high/60 bg-surface-container-low/80 px-5 py-4 sm:px-6">
          <p className="text-sm font-medium text-on-surface">{activeMeta.label}</p>
          <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{activeMeta.description}</p>
        </div>

        <div className="p-5 sm:p-6">
          {tab === 'conta' && (
            <div
              role="tabpanel"
              id="settings-panel-conta"
              aria-labelledby="settings-tab-conta"
              className="space-y-6"
            >
              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const fd = new FormData(form);
                  const displayName = String(fd.get('displayName') ?? '').trim();
                  const timezone = String(fd.get('timezone') ?? '').trim() || 'UTC';
                  const bio = String(fd.get('bio') ?? '').trim();
                  const showInSearch =
                    (form.querySelector('input[name="showInSearch"]') as HTMLInputElement)?.checked ?? false;
                  if (displayName.length < 2) {
                    toast.error('Nome deve ter pelo menos 2 caracteres.');
                    return;
                  }
                  save.mutate({
                    displayName,
                    timezone,
                    bio: bio || '',
                    showInSearch,
                    avatarColorKey,
                  });
                }}
              >
                <div className={twMerge(cardInner, 'border-primary/15 bg-primary/5')}>
                  <h2 className="flex items-center gap-2 text-base font-bold text-on-surface">
                    <UserRound className="h-5 w-5 text-primary" aria-hidden />
                    Identidade
                  </h2>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Como você aparece para outros alunos no ranking, comunidade e perfil.
                  </p>
                  <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Avatar
                      userId={data.id}
                      displayName={data.displayName}
                      colorKey={avatarColorKey}
                      size="lg"
                      className="ring-2 ring-surface-container-lowest shadow-sm"
                    />
                    <p className="text-sm text-on-surface-variant">
                      O avatar usa as iniciais do <strong className="text-on-surface">nome exibido</strong>. Depois de
                      salvar, o menu do topo atualiza o nome.
                    </p>
                  </div>
                  <div className="mt-5 space-y-3">
                    <p className="text-sm font-semibold text-on-surface">Cor do avatar</p>
                    <p className="text-xs text-on-surface-variant">
                      Automática escolhe uma cor estável a partir do seu id; ou fixe uma cor abaixo.
                    </p>
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Cor do avatar">
                      {AVATAR_COLOR_OPTIONS.map((opt) => {
                        const selected = avatarColorKey === opt.key;
                        const preview =
                          opt.key === 'auto'
                            ? 'bg-gradient-to-br from-surface-container-high via-outline/80 to-on-surface-variant/50'
                            : getAvatarStyle(data.id, opt.key).bg;
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => setAvatarColorKey(opt.key)}
                            title={opt.label}
                            aria-pressed={selected}
                            className={twMerge(
                              'flex h-10 w-10 items-center justify-center rounded-xl border-2 transition',
                              preview,
                              selected
                                ? 'border-primary ring-2 ring-primary/40'
                                : 'border-surface-container-high hover:border-primary/50',
                            )}
                          >
                            <span className="sr-only">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <p className="mt-4 rounded-xl bg-surface-container-low/80 px-3 py-2 text-xs text-on-surface-variant ring-1 ring-surface-container-high/80">
                    E-mail da conta:{' '}
                    <span className="font-mono font-medium text-on-surface">{data.email}</span>
                    <span className="text-on-surface-variant"> — não pode ser alterado aqui.</span>
                  </p>

                  <div className="mt-6 space-y-5">
                    <div>
                      <label htmlFor="displayName" className="text-sm font-semibold text-on-surface">
                        Nome exibido
                      </label>
                      <p className="text-xs text-on-surface-variant">Obrigatório, mínimo 2 caracteres.</p>
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
                      <label htmlFor="bio" className="text-sm font-semibold text-on-surface">
                        Bio <span className="font-normal text-on-surface-variant">(opcional)</span>
                      </label>
                      <p className="text-xs text-on-surface-variant">Até 280 caracteres.</p>
                      <textarea
                        id="bio"
                        name="bio"
                        defaultValue={data.bio ?? ''}
                        rows={4}
                        maxLength={280}
                        className={`${fieldInput} resize-none leading-relaxed`}
                        placeholder="Uma linha sobre você ou o que está estudando."
                      />
                    </div>
                  </div>
                </div>

                <div className={cardInner}>
                  <h2 className="flex items-center gap-2 text-base font-bold text-on-surface">
                    <Globe2 className="h-5 w-5 text-primary" aria-hidden />
                    Região e horários
                  </h2>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Fuso IANA para datas e metas fazerem sentido no seu dia (ex.: lembretes e “esta semana”).
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      ['America/Sao_Paulo', 'Brasil (SP)'],
                      ['America/Fortaleza', 'Nordeste'],
                      ['America/Manaus', 'Manaus'],
                      ['UTC', 'UTC'],
                      ['Europe/Lisbon', 'Lisboa'],
                    ].map(([tz, label]) => (
                      <button
                        key={tz}
                        type="button"
                        onClick={() => {
                          if (timezoneRef.current) timezoneRef.current.value = tz;
                          toast.info(`Fuso: ${tz}`);
                        }}
                        className="rounded-lg border border-surface-container-high bg-surface-container-lowest px-3 py-1.5 text-xs font-semibold text-on-surface transition hover:border-primary/40 hover:text-primary"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <input
                    ref={timezoneRef}
                    id="timezone"
                    name="timezone"
                    defaultValue={data.timezone}
                    className={`${fieldInput} mt-3 font-mono text-sm`}
                    placeholder="America/Sao_Paulo"
                    autoComplete="off"
                  />
                </div>

                <div className={cardInner}>
                  <h2 className="flex items-center gap-2 text-base font-bold text-on-surface">
                    <Shield className="h-5 w-5 text-emerald-600" aria-hidden />
                    Privacidade na comunidade
                  </h2>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Só afeta busca e listagens sociais — não o seu progresso nos cursos.
                  </p>
                  <label className="mt-5 flex cursor-pointer gap-4 rounded-xl border border-surface-container-high bg-surface-container-lowest p-4 transition hover:border-emerald-500/30 hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-low text-on-surface-variant">
                      <Lock className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-sm font-semibold text-on-surface">Aparecer na busca da comunidade</span>
                        <input
                          type="checkbox"
                          name="showInSearch"
                          defaultChecked={data.showInSearch !== false}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-surface-container-high text-primary focus:ring-primary"
                        />
                      </div>
                      <p className="mt-2 text-sm text-on-surface-variant">
                        Desligado = seu nome não entra nos resultados de busca de alunos.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex flex-col gap-3 rounded-2xl border border-surface-container-high bg-surface-container-low p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-on-surface-variant">
                    O botão abaixo envia <strong>identidade</strong>, <strong>bio</strong>, <strong>fuso</strong> e{' '}
                    <strong>privacidade</strong> para o servidor.
                  </p>
                  <button
                    type="submit"
                    disabled={save.isPending}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-primary-dim disabled:opacity-60 sm:w-auto"
                  >
                    {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                    Salvar perfil e privacidade
                  </button>
                </div>
              </form>
            </div>
          )}

          {tab === 'aplicativo' && (
            <div
              role="tabpanel"
              id="settings-panel-aplicativo"
              aria-labelledby="settings-tab-aplicativo"
              className="space-y-6"
            >
              {/* ── Aparência ─────────────────────────────────────────── */}
              <div className={cardInner}>
                <h2 className="flex items-center gap-2 text-base font-bold text-on-surface">
                  <Moon className="h-5 w-5 text-primary" aria-hidden />
                  Aparência
                </h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Escolha o tema visual preferido. A opção "Sistema" segue a preferência do seu dispositivo.
                </p>
                <div className="mt-4 flex gap-2 rounded-2xl border border-surface-container-high bg-surface-container-low p-1.5">
                  {(
                    [
                      { id: 'light', label: 'Claro', icon: <Sun className="h-4 w-4" /> },
                      { id: 'dark', label: 'Escuro', icon: <Moon className="h-4 w-4" /> },
                      { id: 'system', label: 'Sistema', icon: <Monitor className="h-4 w-4" /> },
                    ] as const
                  ).map(({ id, label, icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setColorScheme(id);
                        toast.success(`Tema ${label.toLowerCase()} ativado.`);
                      }}
                      className={twMerge(
                        'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold transition',
                        colorScheme === id
                          ? 'bg-surface-container-lowest text-primary shadow-soft'
                          : 'text-on-surface-variant hover:text-on-surface',
                      )}
                    >
                      {icon}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={cardInner}>
                <h2 className="flex items-center gap-2 text-base font-bold text-on-surface">
                  <Monitor className="h-5 w-5 text-violet-600" aria-hidden />
                  Conforto visual
                </h2>
                <p className="mt-1 text-sm text-on-surface-variant">Vale só para este navegador — não precisa salvar com o botão da aba anterior.</p>
                <label className="mt-5 flex cursor-pointer gap-4 rounded-xl border border-surface-container-high bg-surface-container-lowest p-4 transition hover:border-violet-300">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                    <Monitor className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm font-semibold text-on-surface">Reduzir animações</span>
                      <input
                        type="checkbox"
                        checked={reduceMotion}
                        onChange={(e) => {
                          setReduceMotion(e.target.checked);
                          toast.success(e.target.checked ? 'Menos movimento na interface.' : 'Animações normais.');
                        }}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-surface-container-high text-primary focus:ring-primary"
                      />
                    </div>
                    <p className="mt-2 text-sm text-on-surface-variant">
                      Menos transições e efeitos (além da configuração do sistema, se você já usa).
                    </p>
                  </div>
                </label>

                <label className="mt-3 flex cursor-pointer gap-4 rounded-xl border border-surface-container-high bg-surface-container-lowest p-4 transition hover:border-sky-300">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
                    <Volume2 className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm font-semibold text-on-surface">Sons de gamificação</span>
                      <input
                        type="checkbox"
                        checked={soundEnabled}
                        onChange={async (e) => {
                          const next = e.target.checked;
                          setSoundEnabled(next);
                          if (next) {
                            /**
                             * Toca um tom curto no próprio gesto de habilitar — garante que o
                             * AudioContext saia do estado suspended em navegadores com política
                             * de autoplay estrita (Safari/iOS).
                             */
                            const { playCorrect } = await import('../lib/sounds');
                            playCorrect();
                            toast.success('Sons ativados.');
                          } else {
                            toast.success('Sons desativados.');
                          }
                        }}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-surface-container-high text-primary focus:ring-primary"
                      />
                    </div>
                    <p className="mt-2 text-sm text-on-surface-variant">
                      Tons curtos em acerto, erro e subida de nível. Gerados no navegador, sem baixar arquivos.
                    </p>
                  </div>
                </label>

                <p className="mt-4 text-sm text-on-surface-variant">
                  <span className="font-semibold text-on-surface">Idioma:</span> Português (Brasil). Outros idiomas podem
                  ser adicionados no futuro.
                </p>
              </div>

              <div className={cardInner}>
                <h2 className="flex items-center gap-2 text-base font-bold text-on-surface">
                  <Bell className="h-5 w-5 text-amber-600" aria-hidden />
                  Avisos e lembretes
                </h2>
                <p className="mt-1 text-sm text-on-surface-variant">Como a plataforma fala com você hoje.</p>
                <div className="mt-4 rounded-xl border border-amber-200/90 bg-amber-50/90 p-4 text-sm text-amber-950 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-100">
                  <p className="font-semibold">Por enquanto, tudo na tela</p>
                  <p className="mt-2 leading-relaxed text-amber-900/95 dark:text-amber-100/90">
                    Mensagens de exercícios, toasts e o painel mostram seu progresso <strong>enquanto você usa o site</strong>.
                    Não há lista de e-mails ou push configurável nesta tela.
                  </p>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-on-surface-variant">
                  <li className="flex gap-2">
                    <span className="text-primary" aria-hidden>
                      •
                    </span>
                    Concluir desafios: feedback na hora e barra de progresso atualizada.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary" aria-hidden>
                      •
                    </span>
                    Metas semanais: veja no <Link to="/app" className="font-semibold text-primary hover:underline">Início</Link>.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {tab === 'sessao' && (
            <div
              role="tabpanel"
              id="settings-panel-sessao"
              aria-labelledby="settings-tab-sessao"
              className="space-y-4"
            >
              <div className={cardInner}>
                <h2 className="text-base font-bold text-on-surface">Encerrar sessão</h2>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  Você sai desta conta neste dispositivo. Para entrar de novo, use e-mail e senha na tela de login. Se
                  notar algo estranho, saia e troque a senha (ou fale com o administrador da plataforma).
                </p>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-rose-200 bg-rose-50 px-6 py-3.5 text-sm font-bold text-rose-900 transition hover:bg-rose-100 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-100 dark:hover:bg-rose-950/60 sm:w-auto"
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                  Sair da conta
                </button>
              </div>
            </div>
          )}

          {tab === 'sobre' && (
            <div role="tabpanel" id="settings-panel-sobre" aria-labelledby="settings-tab-sobre" className="space-y-4">
              <div className={cardInner}>
                <h2 className="flex items-center gap-2 text-base font-bold text-on-surface">
                  <Info className="h-5 w-5 text-sky-600" aria-hidden />
                  Referência rápida
                </h2>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Plataforma de cursos com módulos, aulas e exercícios. O passo a passo completo está na central de
                  ajuda.
                </p>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <Link
                    to="/app/help"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dim"
                  >
                    Abrir central de ajuda
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </Link>
                  <Link
                    to="/"
                    className="rounded-xl border border-surface-container-high bg-surface-container-lowest px-4 py-2.5 text-center text-sm font-medium text-on-surface transition hover:border-surface-container-highest"
                  >
                    Site público
                  </Link>
                  <Link
                    to="/app"
                    className="rounded-xl border border-surface-container-high bg-surface-container-lowest px-4 py-2.5 text-center text-sm font-medium text-on-surface transition hover:border-surface-container-highest"
                  >
                    Painel (início)
                  </Link>
                  <Link
                    to="/app/community"
                    className="rounded-xl border border-surface-container-high bg-surface-container-lowest px-4 py-2.5 text-center text-sm font-medium text-on-surface transition hover:border-surface-container-highest"
                  >
                    Comunidade
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
