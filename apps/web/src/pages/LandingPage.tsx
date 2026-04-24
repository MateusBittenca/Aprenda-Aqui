import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { FocusTrap } from 'focus-trap-react';
import { useAuthStore } from '../stores/authStore';
import { BrandLogo } from '../components/BrandLogo';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SectionHeading } from '../components/ui/SectionHeading';
import {
  ArrowRight,
  BookOpen,
  Check,
  Code2,
  Flame,
  Gem,
  GraduationCap,
  Menu,
  Shield,
  Sparkles,
  Target,
  Trophy,
  X,
  Zap,
} from 'lucide-react';

const LANDING_ANCHORS = [
  { href: '#recursos', label: 'Recursos' },
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#cursos', label: 'Cursos' },
] as const;

const HERO_MICRO_PROOFS = [
  'Microaulas de 3 a 7 minutos',
  'Feedback imediato no editor',
  'Sem enrolação, sem pré-requisito',
] as const;

const STAT_STRIP = [
  { value: '12+', label: 'trilhas e cursos' },
  { value: '500+', label: 'aulas interativas' },
  { value: '3 a 7', label: 'min por lição' },
  { value: '100%', label: 'prática guiada' },
] as const;

const FEATURES = [
  {
    icon: Zap,
    title: 'Microaulas rápidas',
    desc: 'Lições curtas para encaixar entre uma tarefa e outra, sem perder o ritmo.',
  },
  {
    icon: Trophy,
    title: 'XP, sequência e níveis',
    desc: 'Veja sua evolução no painel e mantenha o hábito com gamificação leve.',
  },
  {
    icon: Code2,
    title: 'Exercícios com feedback',
    desc: 'Múltipla escolha, preencher lacunas e editor real — correção ao enviar.',
  },
  {
    icon: Target,
    title: 'Meta do dia adaptativa',
    desc: 'Objetivos diários calibrados pelo seu ritmo dos últimos 7 dias.',
  },
  {
    icon: GraduationCap,
    title: 'Trilhas organizadas',
    desc: 'Do HTML ao TypeScript, do banco de dados à API — na ordem certa.',
  },
  {
    icon: Shield,
    title: 'Progresso salvo sempre',
    desc: 'Volte de qualquer dispositivo e retome exatamente onde parou.',
  },
] as const;

const STEPS = [
  { title: 'Escolha um curso', desc: 'Frontend, Backend, Dados ou Fundamentos — comece por onde faz sentido para você.' },
  { title: 'Siga as aulas na ordem', desc: 'Leia, codifique e confira com o botão "Enviar". Feedback imediato em cada exercício.' },
  { title: 'Acompanhe sua evolução', desc: 'XP, gemas, sequência e nível ficam no painel. Continue um dia de cada vez.' },
] as const;

export function LandingPage() {
  const token = useAuthStore((s) => s.token);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const mobileNavTitleId = useId();

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileNavOpen]);

  return (
    <div className="min-h-dvh min-w-0 overflow-x-clip bg-surface text-on-surface">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-surface-container-high/80 bg-surface-container-lowest/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex min-w-0 max-w-6xl items-center justify-between gap-3 px-[max(1rem,env(safe-area-inset-left))] py-3 pr-[max(1rem,env(safe-area-inset-right))] sm:gap-4 sm:py-4 wide:max-w-7xl">
          <BrandLogo size="md" linkTo="/" alwaysShowText />
          <nav
            className="hidden items-center gap-6 text-sm font-medium text-on-surface-variant md:flex lg:gap-8"
            aria-label="Seções da página"
          >
            {LANDING_ANCHORS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="rounded-lg px-2 py-2 transition hover:text-on-surface focus-ring-primary"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-surface-container-high bg-surface-container-lowest text-on-surface shadow-sm md:hidden focus-ring-primary"
              aria-expanded={mobileNavOpen}
              aria-controls="landing-mobile-nav"
              onClick={() => setMobileNavOpen((o) => !o)}
            >
              {mobileNavOpen ? (
                <X className="h-6 w-6" aria-hidden />
              ) : (
                <Menu className="h-6 w-6" aria-hidden />
              )}
              <span className="sr-only">{mobileNavOpen ? 'Fechar menu' : 'Abrir menu de seções'}</span>
            </button>
            {token ? (
              <Link to="/app" className="inline-flex">
                <Button variant="brand" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Ir para o painel
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="inline-flex">
                  <Button variant="ghost" size="md">
                    Entrar
                  </Button>
                </Link>
                <Link to="/register" className="inline-flex">
                  <Button variant="brand" size="md">
                    Começar grátis
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {mobileNavOpen ? (
        <FocusTrap
          focusTrapOptions={{
            initialFocus: false,
            clickOutsideDeactivates: true,
            onDeactivate: () => setMobileNavOpen(false),
          }}
        >
          <div className="fixed inset-0 z-40 md:hidden" id="landing-mobile-nav">
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              aria-label="Fechar menu"
              onClick={() => setMobileNavOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={mobileNavTitleId}
              className="absolute inset-y-0 right-0 flex w-[min(100%,20rem)] flex-col border-l border-surface-container-high bg-surface-container-lowest shadow-2xl will-change-transform"
              style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              <div className="border-b border-surface-container-high px-4 py-3">
                <p id={mobileNavTitleId} className="text-sm font-semibold text-on-surface">
                  Navegação
                </p>
              </div>
              <nav className="flex flex-col p-2" aria-label="Seções da página">
                {LANDING_ANCHORS.map(({ href, label }) => (
                  <a
                    key={href}
                    href={href}
                    className="min-h-11 rounded-xl px-4 py-3 text-base font-medium text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface"
                    onClick={() => setMobileNavOpen(false)}
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </FocusTrap>
      ) : null}

      <main className="relative overflow-x-hidden overflow-y-visible pt-24 sm:pt-28">
        {/* Hero split */}
        <section className="relative mx-auto max-w-6xl px-4 pb-16 sm:pb-20 lg:pb-28 wide:max-w-7xl">
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            aria-hidden
          >
            <div className="absolute left-1/2 top-0 h-72 w-[120%] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute right-[10%] top-20 h-40 w-40 rounded-full bg-tertiary/20 blur-3xl" />
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                <Sparkles className="h-3.5 w-3.5" aria-hidden /> Aprendizado guiado e gamificado
              </span>
              <h1 className="font-headline text-balance mt-5 font-extrabold leading-[1.08] tracking-tight text-on-surface [font-size:clamp(2rem,1rem+4.6vw,4rem)]">
                Programe de verdade, <span className="bg-clip-text text-transparent brand-gradient animate-gradient-pan">um minuto de cada vez.</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-on-surface-variant sm:text-lg lg:mx-0">
                Aulas curtas, editor interativo e feedback imediato. Acompanhe XP, sequência e metas diárias — tudo num painel simples e elegante.
              </p>

              <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row lg:justify-start">
                <Link to="/register" className="inline-flex">
                  <Button variant="brand" size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                    Começar grátis
                  </Button>
                </Link>
                <Link to="/login" className="inline-flex">
                  <Button variant="outline" size="lg">
                    Já tenho conta
                  </Button>
                </Link>
              </div>

              <ul className="mt-8 grid gap-2 text-sm text-on-surface-variant sm:grid-cols-3 lg:text-left">
                {HERO_MICRO_PROOFS.map((p) => (
                  <li key={p} className="inline-flex items-center justify-center gap-2 lg:justify-start">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Check className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <DashboardPreview />
            </div>
          </div>
        </section>

        {/* Faixa de números / prova */}
        <section className="relative mx-auto max-w-6xl px-4 wide:max-w-7xl" aria-label="Números">
          <Card variant="glass" className="grid grid-cols-2 gap-y-6 p-6 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-surface-container-high/70 sm:p-8">
            {STAT_STRIP.map((s) => (
              <div key={s.label} className="flex flex-col items-center justify-center gap-1 text-center sm:px-4">
                <p className="font-headline text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">{s.value}</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">{s.label}</p>
              </div>
            ))}
          </Card>
        </section>

        {/* Recursos */}
        <section id="recursos" className="mx-auto max-w-6xl px-4 py-20 wide:max-w-7xl">
          <SectionHeading
            eyebrow="Por que Aprenda aqui"
            title={<>Tudo que você precisa para <span className="bg-clip-text text-transparent brand-gradient">criar o hábito</span></>}
            description="Ferramentas simples para estudar hoje e voltar amanhã — sem fricção."
            level="page"
            className="mx-auto max-w-3xl text-center md:flex-col md:items-center md:justify-center md:text-center [&>div]:items-center [&>div]:text-center"
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="p-6">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="font-headline mt-4 text-lg font-bold tracking-tight text-on-surface">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Como funciona */}
        <section id="como-funciona" className="border-y border-surface-container-high/70 bg-surface-container-lowest/60 py-20">
          <div className="mx-auto max-w-6xl px-4 wide:max-w-7xl">
            <SectionHeading
              eyebrow="Como funciona"
              title="Três passos para começar hoje"
              description="Sem cadastro complicado. Leva menos de um minuto."
              level="page"
              className="mx-auto max-w-3xl text-center md:flex-col md:items-center md:justify-center [&>div]:items-center [&>div]:text-center"
            />
            <ol className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.title}>
                  <Card className="relative h-full p-6">
                    <span className="font-headline absolute -top-3 left-6 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-sm font-extrabold text-white shadow-soft">
                      {i + 1}
                    </span>
                    <h3 className="font-headline mt-4 text-lg font-bold tracking-tight text-on-surface">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{s.desc}</p>
                  </Card>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Cursos / CTA final */}
        <section id="cursos" className="mx-auto max-w-6xl px-4 py-24 wide:max-w-7xl">
          <Card variant="hero" className="relative overflow-hidden p-8 text-center sm:p-14">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-tertiary/20 blur-3xl" aria-hidden />
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden /> Pronto para começar?
            </span>
            <h2 className="font-headline text-balance mx-auto mt-5 max-w-2xl text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
              Sua próxima aula está a um clique.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-on-surface-variant">
              Crie sua conta em segundos e entre na primeira aula gratuitamente. Sem cartão, sem planos.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
              <Link to="/register" className="inline-flex justify-center">
                <Button variant="brand" size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                  Criar conta grátis
                </Button>
              </Link>
              <Link to="/login" className="inline-flex justify-center">
                <Button variant="outline" size="lg">
                  Entrar
                </Button>
              </Link>
            </div>
          </Card>
        </section>

        <footer className="border-t border-surface-container-high/80 bg-surface-container-lowest/80 py-8 text-center text-sm text-on-surface-variant">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
            <span className="flex items-center gap-2 font-semibold text-on-surface">
              <BookOpen className="h-4 w-4" aria-hidden />
              Aprenda aqui!
            </span>
            <span>Aprenda programação de forma leve e consistente.</span>
            <Link to="/admin/login" className="text-on-surface-variant/80 hover:text-amber-800 hover:underline">
              Área da equipe
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

/* ─── Preview composto do painel (hero) ─────────────────────────────────────── */

function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      {/* Chip flutuante — topo esquerdo */}
      <div
        className="absolute -left-4 -top-6 hidden animate-float sm:block"
        aria-hidden
      >
        <Card variant="glass" className="px-3 py-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-2 text-orange-700">
            <Flame className="h-4 w-4" /> 7 dias em chamas
          </span>
        </Card>
      </div>

      {/* Chip flutuante — canto direito */}
      <div
        className="absolute -right-4 bottom-10 hidden animate-float-delayed sm:block"
        aria-hidden
      >
        <Card variant="glass" className="px-3 py-2 text-xs font-semibold text-emerald-700">
          <span className="inline-flex items-center gap-2">
            <Check className="h-4 w-4" /> Aula concluída · +10 XP
          </span>
        </Card>
      </div>

      <Card
        variant="hero"
        className="shine-sweep group relative overflow-hidden p-6 shadow-soft sm:p-7"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl brand-gradient text-white font-bold shadow-glow">
            AA
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Bom dia,</p>
            <p className="font-headline truncate text-lg font-bold text-on-surface">Ana!</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
            <Flame className="h-3.5 w-3.5" /> 7d
          </span>
        </div>

        <div className="mt-5 rounded-2xl border border-surface-container-high/60 bg-surface-container-lowest/70 p-4">
          <div className="flex items-end justify-between">
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-primary">
                <Sparkles className="h-3 w-3" /> Nível 12
              </span>
              <p className="mt-2 text-2xl font-extrabold tabular-nums text-on-surface">
                480<span className="ml-1 text-sm font-bold text-on-surface-variant">/ 600 XP</span>
              </p>
            </div>
            <p className="text-xs font-semibold text-on-surface-variant">80%</p>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface-container-high/70">
            <div
              className="relative h-full rounded-full brand-gradient"
              style={{ width: '80%' }}
            >
              <span className="absolute inset-0 shimmer-line" aria-hidden />
            </div>
          </div>
        </div>

        <ul className="mt-4 space-y-2">
          {[
            { title: 'TypeScript Essencial', pct: 72, tone: 'bg-primary' },
            { title: 'APIs com Node', pct: 40, tone: 'bg-tertiary' },
          ].map((c) => (
            <li key={c.title} className="rounded-xl border border-surface-container-high/50 bg-surface-container-lowest px-3 py-2.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="truncate text-on-surface">{c.title}</span>
                <span className="tabular-nums text-on-surface-variant">{c.pct}%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-container-high/60">
                <div className={`h-full rounded-full ${c.tone}`} style={{ width: `${c.pct}%` }} />
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-surface-container-low/70 px-3 py-2.5">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
            <Gem className="h-4 w-4 text-sky-500" /> 320 gemas · Meta do dia <span className="ml-1 font-bold text-emerald-600">concluída</span>
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
            Continuar <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </Card>
    </div>
  );
}
