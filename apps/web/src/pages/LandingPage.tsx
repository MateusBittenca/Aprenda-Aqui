import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { BrandLogo } from '../components/BrandLogo';
import { BookOpen, Check, Clock, Code2, Flame, Gem, Sparkles, Trophy, Zap } from 'lucide-react';

export function LandingPage() {
  const token = useAuthStore((s) => s.token);

  return (
    <div className="min-h-dvh bg-surface dot-grid text-on-surface">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-surface-container-high/80 bg-surface-container-lowest/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <BrandLogo size="md" linkTo="/" />
          <nav className="hidden items-center gap-8 text-sm font-medium text-on-surface-variant md:flex">
            <a href="#recursos" className="transition hover:text-on-surface">
              Recursos
            </a>
            <a href="#como-funciona" className="transition hover:text-on-surface">
              Como funciona
            </a>
            <a href="#trilhas" className="transition hover:text-on-surface">
              Trilhas
            </a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            {token ? (
              <Link
                to="/app"
                className="rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dim"
              >
                Ir para o painel
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full px-3 py-2 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container-low"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dim"
                >
                  Começar grátis
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative overflow-hidden pt-28">
        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          <div className="absolute left-[8%] top-[12%] animate-float">
            <div className="relative">
              <div className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-amber-100 shadow-md ring-2 ring-white">
                <Flame className="m-1.5 h-5 w-5 text-orange-500" />
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-xl shadow-slate-300/35 ring-1 ring-slate-100">
                <p className="text-xs font-semibold text-slate-400">Ilustração</p>
                <p className="text-xs font-semibold text-slate-500">Sequência de estudos</p>
                <p className="mt-1 text-lg font-bold text-slate-900">Um dia de cada vez</p>
                <p className="text-xs text-emerald-600">Constância conta mais que velocidade</p>
              </div>
            </div>
          </div>

          <div className="absolute right-[6%] top-[10%] animate-float-delayed">
            <div className="rounded-2xl bg-white p-4 shadow-xl shadow-slate-300/35 ring-1 ring-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Clock className="h-4 w-4 text-blue-500" />
                Próxima meta
              </div>
              <p className="mt-2 text-sm font-medium text-slate-800">Concluir módulo HTML</p>
              <p className="mt-1 text-xs text-slate-500">Hoje · 5 min</p>
            </div>
          </div>

          <div className="absolute bottom-[18%] left-[6%] animate-float-slow">
            <div className="w-64 rounded-2xl bg-white p-4 shadow-xl shadow-slate-300/35 ring-1 ring-slate-100">
              <p className="text-xs font-semibold text-slate-400">Ilustração</p>
              <p className="text-xs font-semibold text-slate-500">Acompanhe várias trilhas</p>
              <div className="mt-3 space-y-3">
                <div>
                  <div className="mb-1 flex justify-between text-xs text-slate-600">
                    <span>Ex.: Frontend</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-3/5 rounded-full bg-blue-500" />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs text-slate-600">
                    <span>Ex.: Backend</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-2/5 rounded-full bg-violet-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-[14%] right-[8%] animate-float">
            <div className="rounded-2xl bg-white p-4 shadow-xl shadow-slate-300/35 ring-1 ring-slate-100">
              <p className="text-xs font-semibold text-slate-500">Stack em foco</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-lg font-bold shadow-inner">
                  TS
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-lg font-bold shadow-inner">
                  JS
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-lg font-bold shadow-inner">
                  {'</>'}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">Conteúdo pensado para quem estuda com pouco tempo</p>
            </div>
          </div>
        </div>

        <section className="relative z-10 mx-auto max-w-3xl px-4 pb-20 text-center">
          <div className="mb-8 flex justify-center">
            <BrandLogo size="lg" />
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Domine programação com aulas práticas
            <span className="block text-slate-500">em blocos de poucos minutos</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600">
            Leia, codifique e receba feedback na hora. Exercícios interativos e um painel simples para acompanhar seu
            ritmo — sem enrolação.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex w-full max-w-xs items-center justify-center rounded-2xl bg-primary px-8 py-4 text-base font-semibold text-white shadow-xl shadow-primary/35 transition hover:bg-primary-dim sm:w-auto"
            >
              Começar grátis
            </Link>
            <Link
              to="/login"
              className="inline-flex w-full max-w-xs items-center justify-center rounded-2xl border-2 border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 sm:w-auto"
            >
              Já tenho conta
            </Link>
          </div>
        </section>

        <section id="recursos" className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-center text-2xl font-bold text-slate-900">Por que Aprenda aqui?</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Zap,
                title: 'Microaulas rápidas',
                desc: 'Lições curtas para encaixar entre uma tarefa e outra.',
              },
              { icon: Trophy, title: 'XP e sequência', desc: 'Veja evolução no painel e mantenha o hábito.' },
              {
                icon: Code2,
                title: 'Exercícios com feedback',
                desc: 'Múltipla escolha, lacunas e editor — com correção ao enviar.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/40"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="como-funciona" className="border-y border-slate-200/80 bg-white/60 py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-center text-2xl font-bold text-slate-900">Como funciona</h2>
            <ol className="mx-auto mt-10 max-w-2xl space-y-6">
              {[
                'Escolha uma trilha (Frontend, Backend e mais).',
                'Siga as aulas na ordem e complete os exercícios.',
                'Ganhe XP e gemas ao acertar; acompanhe nível e sequência no painel.',
              ].map((step, i) => (
                <li key={step} className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="pt-1 text-left text-slate-700">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="trilhas" className="mx-auto max-w-5xl px-4 py-20 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-blue-500" />
          <h2 className="mt-4 text-2xl font-bold text-slate-900">Pronto para começar?</h2>
          <p className="mx-auto mt-2 max-w-md text-slate-600">
            Crie sua conta em segundos e entre na primeira aula gratuitamente.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-flex items-center justify-center rounded-2xl bg-primary px-10 py-4 text-base font-semibold text-white shadow-xl shadow-primary/35 transition hover:bg-primary-dim"
          >
            Criar conta grátis
          </Link>
        </section>

        <section className="lg:hidden">
          <div className="mx-auto grid max-w-md gap-4 px-4 pb-20">
            <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-100">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="font-semibold text-slate-900">Sequência de estudos</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Volte em dias seguidos para fortalecer o hábito</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Check className="h-5 w-5 text-emerald-500" />
                Progresso salvo automaticamente
              </div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Gem className="h-5 w-5 text-sky-500" />
                Gemas e níveis no seu perfil
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-200/80 bg-white/80 py-8 text-center text-sm text-slate-500">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
            <span className="flex items-center gap-2 font-semibold text-slate-700">
              <BookOpen className="h-4 w-4" aria-hidden />
              Aprenda aqui!
            </span>
            <span>Aprenda programação de forma leve e consistente.</span>
            <Link to="/admin/login" className="text-slate-400 hover:text-amber-800 hover:underline">
              Área da equipe
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
