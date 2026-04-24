import { Link } from 'react-router-dom';
import { Check, Flame, Sparkles, Zap } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

/**
 * Shell de autenticação split: coluna esquerda com marca/valor (só em `lg+`),
 * coluna direita com o formulário em um `Card` centralizado. No mobile, a
 * marca aparece no topo enxuto e o formulário ocupa o resto da viewport.
 */
export function AuthPageShell({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh min-w-0 overflow-x-clip bg-surface text-on-surface">
      {/* Topbar mobile + tablet */}
      <header className="lg:hidden border-b border-surface-container-high/80 bg-surface-container-lowest/90 px-[max(1rem,env(safe-area-inset-left))] py-4 pr-[max(1rem,env(safe-area-inset-right))] shadow-sm backdrop-blur-md">
        <div className="mx-auto flex min-w-0 max-w-md items-center justify-between gap-3">
          <Link
            to="/"
            className="min-w-0 text-sm font-semibold text-on-surface-variant transition hover:text-primary focus-ring-primary rounded-lg px-1"
          >
            Voltar ao início
          </Link>
          <BrandLogo size="sm" linkTo="/" alwaysShowText />
        </div>
      </header>

      <div className="grid min-h-dvh lg:grid-cols-2">
        {/* Painel de marca — só lg+ */}
        <aside className="relative hidden overflow-hidden lg:block">
          <div className="brand-gradient animate-gradient-pan absolute inset-0" aria-hidden />
          <div
            className="absolute inset-0 opacity-[0.08]"
            aria-hidden
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23ffffff'/%3E%3C/svg%3E\")",
            }}
          />
          <div className="relative flex h-full flex-col justify-between p-12 text-white">
            <BrandLogo size="md" linkTo="/" alwaysShowText variant="dark" />

            <div className="max-w-md">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" aria-hidden /> Aprendizado em microaulas
              </span>
              <h2 className="font-headline text-balance mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight">
                Um minuto de estudo hoje vale mais que uma hora amanhã.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/85">
                Leia, pratique e receba feedback — tudo num painel simples, com XP, sequência e meta do dia.
              </p>

              <ul className="mt-8 space-y-3 text-sm">
                {[
                  { icon: Zap, text: 'Aulas de 3 a 7 minutos' },
                  { icon: Flame, text: 'Ofensiva diária e gemas' },
                  { icon: Check, text: 'Progresso salvo automaticamente' },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 text-white/90">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-white/70">
              © {new Date().getFullYear()} Aprenda aqui. Aprenda programação de forma leve e consistente.
            </p>
          </div>
        </aside>

        {/* Coluna do formulário */}
        <div className="flex min-w-0 items-center justify-center px-[max(1rem,env(safe-area-inset-left))] py-10 pr-[max(1rem,env(safe-area-inset-right))] lg:py-12">
          <div className="w-full max-w-md">
            {title ? (
              <div className="mb-6 text-center lg:text-left">
                <h1 className="font-headline text-balance text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="mt-2 text-sm text-on-surface-variant sm:text-base">{subtitle}</p>
                ) : null}
              </div>
            ) : null}
            <div className="rounded-2xl border border-surface-container-high/70 bg-surface-container-lowest p-6 shadow-card sm:p-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
