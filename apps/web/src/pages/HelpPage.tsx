import { Link } from 'react-router-dom';
import {
  BookOpen,
  ChevronRight,
  CircleHelp,
  GraduationCap,
  LayoutDashboard,
  Map,
  Medal,
  Rocket,
  Settings2,
  ShoppingBag,
  Sparkles,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';

const cardClass =
  'rounded-2xl border border-surface-container-high/70 bg-surface-container-lowest/90 p-5 shadow-card backdrop-blur-xl transition hover:border-primary/30';

export function HelpPage() {
  return (
    <div
      className="space-y-10 pb-10 [background:radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.1),transparent_52%),radial-gradient(ellipse_at_bottom_left,rgba(129,39,207,0.06),transparent_48%)]"
    >
      <header className="relative overflow-hidden rounded-[28px] border border-surface-container-high/70 bg-surface-container-lowest/90 p-6 shadow-soft backdrop-blur-xl sm:p-10">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/15 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-primary">
              <CircleHelp className="h-4 w-4" aria-hidden />
              Central de ajuda
            </div>
            <h1 className="mt-4 font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
              Como usar a plataforma
            </h1>
            <p className="mt-3 text-base leading-relaxed text-on-surface-variant sm:text-lg">
              Guia em linguagem simples: do primeiro acesso até exercícios, progresso e comunidade. Se algo não estiver
              claro, use este texto como referência ou fale com quem administra o ambiente.
            </p>
          </div>
          <Link
            to="/app/settings"
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-2xl border border-primary/20 bg-surface-container-lowest px-5 py-3 text-sm font-bold text-primary shadow-sm transition hover:bg-primary/5"
          >
            <Settings2 className="h-4 w-4" aria-hidden />
            Configurações
          </Link>
        </div>
      </header>

      <section aria-labelledby="help-inicio">
        <h2 id="help-inicio" className="font-headline text-xl font-bold text-on-surface">
          Por onde começo?
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
          Depois de entrar na sua conta, o fluxo natural é: conhecer o <strong>Início</strong>, escolher cursos no{' '}
          <strong>catálogo</strong>, matricular-se, estudar em <strong>Meus cursos</strong> e acompanhar evolução no{' '}
          <strong>ranking</strong> e na <strong>comunidade</strong>.
        </p>
        <ol className="mt-6 space-y-4">
          {[
            {
              step: 1,
              title: 'Abra o Início (painel)',
              desc: 'Resumo do seu progresso, metas e atalhos para continuar estudando.',
              to: '/app',
              icon: LayoutDashboard,
            },
            {
              step: 2,
              title: 'Explore Cursos',
              desc: 'Veja o que cada curso oferece, leia a visão geral e matricule-se quando quiser começar.',
              to: '/app/courses',
              icon: ShoppingBag,
            },
            {
              step: 3,
              title: 'Organize em Meus cursos',
              desc: 'Lista só dos cursos em que você está matriculado, com progresso por curso e por módulo.',
              to: '/app/my-courses',
              icon: Map,
            },
            {
              step: 4,
              title: 'Estude aula por aula',
              desc: 'Leia o conteúdo e faça os desafios. O progresso é salvo quando você conclui os exercícios da aula.',
              to: '/app/my-courses',
              icon: BookOpen,
            },
          ].map((item) => (
            <li key={item.step}>
              <Link
                to={item.to}
                className={`group flex gap-4 ${cardClass} items-start p-5 sm:p-6`}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-black text-primary">
                  {item.step}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <item.icon className="h-4 w-4 text-primary/80" aria-hidden />
                    <h3 className="font-headline text-base font-bold text-on-surface">{item.title}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{item.desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:underline">
                    Ir para a área
                    <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="help-conceitos" className="grid gap-6 lg:grid-cols-2">
        <div className={cardClass}>
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-primary">
            <GraduationCap className="h-4 w-4" aria-hidden />
            Cursos e módulos
          </div>
          <h2 id="help-conceitos" className="mt-3 font-headline text-lg font-bold text-on-surface">
            O que é cada coisa?
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-on-surface-variant">
            <li>
              <strong className="text-on-surface">Curso:</strong> um pacote de módulos e aulas sobre um tema (ex.: uma
              trilha de TypeScript).
            </li>
            <li>
              <strong className="text-on-surface">Módulo:</strong> um bloco dentro do curso que agrupa aulas relacionadas.
              Abra o módulo para ver a lista de aulas e seu progresso naquele bloco.
            </li>
            <li>
              <strong className="text-on-surface">Aula:</strong> texto de estudo (e às vezes exercícios) que você abre
              pela lista do curso. Use o menu no topo da aula para voltar ao curso ou ao módulo.
            </li>
            <li>
              <strong className="text-on-surface">Matrícula:</strong> inscrição gratuita (ou conforme regras do curso) que
              libera o conteúdo para você. Sem matrícula, você só vê a prévia no catálogo.
            </li>
          </ul>
        </div>

        <div className={cardClass}>
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-violet-600">
            <Sparkles className="h-4 w-4" aria-hidden />
            Pontos, nível e sequência
          </div>
          <h3 className="mt-3 font-headline text-lg font-bold text-on-surface">Gamificação (resumo)</h3>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-on-surface-variant">
            <li className="flex gap-2">
              <Zap className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
              <span>
                <strong className="text-on-surface">XP e nível:</strong> ao resolver desafios e avançar, você ganha
                experiência e sobe de nível — aparece no topo da página quando você está logado.
              </span>
            </li>
            <li className="flex gap-2">
              <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
              <span>
                <strong className="text-on-surface">Gemas:</strong> recompensas extras exibidas ao lado da chama de
                sequência; fazem parte do incentivo do app.
              </span>
            </li>
            <li className="flex gap-2">
              <Target className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" aria-hidden />
              <span>
                <strong className="text-on-surface">Sequência (dias):</strong> dias seguidos com atividade. Ajuda a criar
                hábito; confira no painel e no topo do layout.
              </span>
            </li>
            <li className="flex gap-2">
              <Medal className="mt-0.5 h-4 w-4 shrink-0 text-primary/80" aria-hidden />
              <span>
                <strong className="text-on-surface">Ranking:</strong> comparação com outros alunos — use com espírito de
                diversão, não de pressão.
              </span>
            </li>
          </ul>
        </div>
      </section>

      <section aria-labelledby="help-dificuldade" className={cardClass}>
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-emerald-700">
          <Rocket className="h-4 w-4" aria-hidden />
          Se estiver difícil
        </div>
        <h2 id="help-dificuldade" className="mt-3 font-headline text-lg font-bold text-on-surface">
          Dicas práticas
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            'Faça um curso de cada vez até pegar o ritmo; você pode matricular em vários, mas foco reduz sobrecarga.',
            'Leia a aula com calma antes de abrir o primeiro desafio — muitas respostas estão explicadas no texto.',
            'Se travar em um exercício, anote a dúvida e volte ao parágrafo correspondente; use a comunidade se estiver disponível.',
            'Use “Continuar de onde parei” no curso para voltar exatamente à próxima aula pendente.',
            'No celular, prefira Wi‑Fi estável; exercícios com editor precisam de conexão com o servidor.',
            'Em Configurações você pode reduzir animações na interface se o movimento incomodar.',
          ].map((tip) => (
            <li
              key={tip}
              className="flex gap-3 rounded-xl border border-surface-container-high/80 bg-surface-container-low/80 p-4 text-sm leading-relaxed text-on-surface"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" aria-hidden />
              {tip}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="help-faq">
        <h2 id="help-faq" className="font-headline text-xl font-bold text-on-surface">
          Perguntas frequentes
        </h2>
        <div className="mt-4 space-y-3">
          {[
            {
              q: 'Por que não consigo abrir uma aula?',
              a: 'É preciso estar matriculado no curso. Abra Cursos, entre no curso desejado e use “Matricular-me”. Depois, use Meus cursos ou a lista do curso para abrir a aula.',
            },
            {
              q: 'O progresso não atualizou. O que faço?',
              a: 'Aulas com exercícios só contam como concluídas quando todos os desafios daquela aula são resolvidos. Se já fez isso, atualize a página ou aguarde alguns segundos — o servidor pode estar sincronizando.',
            },
            {
              q: 'Onde mudo meu nome e privacidade?',
              a: 'Em Configurações você edita nome exibido, bio, fuso horário e se aparece na busca da comunidade. O perfil detalhado (nível, conquistas) fica em “Perfil / Eu”.',
            },
            {
              q: 'O que é a comunidade?',
              a: 'Área social da plataforma para encontrar outros alunos (conforme as regras do projeto). Você controla parte da visibilidade em Configurações.',
            },
            {
              q: 'Como saio da conta?',
              a: 'Use o botão “Sair” no canto superior direito, ao lado do seu avatar.',
            },
          ].map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-surface-container-high/70 bg-surface-container-lowest/80 shadow-sm backdrop-blur-xl open:border-primary/30 open:shadow-md"
            >
              <summary className="cursor-pointer list-none px-5 py-4 font-semibold text-on-surface marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-3">
                  {item.q}
                  <ChevronRight
                    className="h-5 w-5 shrink-0 text-on-surface-variant transition group-open:rotate-90"
                    aria-hidden
                  />
                </span>
              </summary>
              <p className="border-t border-surface-container-high/80 px-5 pb-4 pt-3 text-sm leading-relaxed text-on-surface-variant">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className={`${cardClass} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
        <div className="flex items-start gap-3">
          <Users className="mt-0.5 h-10 w-10 shrink-0 rounded-xl bg-primary/10 p-2 text-primary" aria-hidden />
          <div>
            <h2 className="font-headline text-lg font-bold text-on-surface">Ainda precisa de suporte?</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Quem mantém esta instalação pode oferecer canal de contato (e-mail, grupo ou ticket). Pergunte ao seu
              professor ou administrador qual é o canal oficial desta plataforma.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/app/community"
            className="inline-flex items-center gap-2 rounded-xl bg-surface-container-highest px-5 py-3 text-sm font-bold text-on-surface shadow-md transition hover:bg-surface-container-high"
          >
            Comunidade
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
