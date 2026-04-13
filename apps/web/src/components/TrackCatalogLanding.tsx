import ReactMarkdown from 'react-markdown';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  GraduationCap,
  Layers,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { TrackCatalogItem, TrackDetail } from '../types/catalog';
import type { TrackVisual } from '../config/trackVisuals';

function formatPeople(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')} mi`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')} mil`;
  return new Intl.NumberFormat('pt-BR').format(n);
}

function formatMinutes(m: number): string {
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const r = m % 60;
    return r > 0 ? `${h} h ${r} min` : `${h} h`;
  }
  return `${m} min`;
}

type Props = {
  data: TrackDetail;
  visual: TrackVisual;
  heroImage: string | null;
  catalogEntry: TrackCatalogItem | undefined;
  overviewMd: string;
  enrollBlock: React.ReactNode;
};

export function TrackCatalogLanding({
  data,
  visual,
  heroImage,
  catalogEntry,
  overviewMd,
  enrollBlock,
}: Props) {
  const TrackIcon = visual.Icon;
  const students = data.enrollmentCount ?? 0;
  const stats = data.stats ?? {
    lessonCount: 0,
    totalMinutes: 0,
    exerciseCount: 0,
  };

  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 shadow-2xl shadow-slate-900/15">
        <div className="absolute inset-0">
          {heroImage ? (
            <>
              <img
                src={heroImage}
                alt=""
                className="h-full w-full object-cover"
                loading="eager"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/75 to-slate-900/35"
                aria-hidden
              />
            </>
          ) : (
            <div
              className={`h-full min-h-[280px] w-full bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-900 sm:min-h-[320px]`}
              aria-hidden
            />
          )}
        </div>

        <div className="relative px-5 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          <div className="mx-auto flex max-w-4xl flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1 text-white">
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-white/80">
                <GraduationCap className="h-4 w-4 text-amber-300" aria-hidden />
                Trilha · aprendizado guiado
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl md:leading-[1.1]">
                {data.title}
              </h1>
              {data.tagline && (
                <p className="mt-3 max-w-2xl text-lg font-semibold text-indigo-100 sm:text-xl">{data.tagline}</p>
              )}
              {data.description && (
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-200/95 sm:text-lg">
                  {data.description}
                </p>
              )}
            </div>

            <div
              className={`flex w-full shrink-0 flex-col gap-4 rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-md sm:max-w-sm ${heroImage ? '' : 'bg-white/15'}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg ${visual.iconBg} ${visual.iconColor}`}
                >
                  <TrackIcon className="h-8 w-8" strokeWidth={2} aria-hidden />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Incluso na plataforma</p>
                  <p className="text-lg font-black text-white">Acesso gratuito</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-2xl bg-white/10 px-3 py-2.5 text-white">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-white/70">
                    <Users className="h-3.5 w-3.5" aria-hidden />
                    Alunos
                  </span>
                  <span className="mt-1 block text-xl font-black tabular-nums">{formatPeople(students)}</span>
                  <span className="text-[11px] text-white/60">matriculados</span>
                </div>
                <div className="rounded-2xl bg-white/10 px-3 py-2.5 text-white">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-white/70">
                    <Layers className="h-3.5 w-3.5" aria-hidden />
                    Aulas
                  </span>
                  <span className="mt-1 block text-xl font-black tabular-nums">{stats.lessonCount}</span>
                  <span className="text-[11px] text-white/60">no programa</span>
                </div>
                <div className="rounded-2xl bg-white/10 px-3 py-2.5 text-white">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-white/70">
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    Carga
                  </span>
                  <span className="mt-1 block text-lg font-black leading-tight">
                    {formatMinutes(stats.totalMinutes)}
                  </span>
                  <span className="text-[11px] text-white/60">estimada</span>
                </div>
                <div className="rounded-2xl bg-white/10 px-3 py-2.5 text-white">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-white/70">
                    <Code2 className="h-3.5 w-3.5" aria-hidden />
                    Exercícios
                  </span>
                  <span className="mt-1 block text-xl font-black tabular-nums">{stats.exerciseCount}</span>
                  <span className="text-[11px] text-white/60">com feedback</span>
                </div>
              </div>

              {catalogEntry && catalogEntry.paidCourseCount > 0 ? (
                <p className="rounded-xl bg-amber-500/20 px-3 py-2 text-center text-xs font-semibold text-amber-100">
                  <Zap className="mr-1 inline h-3.5 w-3.5" aria-hidden />
                  Inclui {catalogEntry.freeCourseCount} curso{catalogEntry.freeCourseCount !== 1 ? 's' : ''} gratuito
                  {catalogEntry.paidCourseCount > 0
                    ? ` e ${catalogEntry.paidCourseCount} conteúdo${catalogEntry.paidCourseCount !== 1 ? 's' : ''} adicional`
                    : ''}
                </p>
              ) : (
                <p className="text-center text-xs font-medium text-white/75">
                  <Sparkles className="mr-1 inline h-3.5 w-3.5 text-amber-300" aria-hidden />
                  Exercícios interativos no navegador
                </p>
              )}

              <div className="pt-1">{enrollBlock}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo longo + destaque código */}
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px] lg:items-start">
        <article className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-10">
          <h2 className="flex items-center gap-2 text-lg font-black text-slate-900">
            <BookOpen className="h-5 w-5 text-indigo-600" aria-hidden />
            Sobre o programa
          </h2>
          <div className="prose prose-slate mt-6 max-w-none prose-headings:scroll-mt-24 prose-headings:font-bold prose-h2:text-xl prose-h3:text-base prose-p:leading-relaxed prose-a:text-indigo-600 prose-blockquote:border-indigo-200 prose-blockquote:bg-indigo-50/50 prose-blockquote:py-0.5 prose-strong:text-slate-900 prose-code:rounded-md prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-semibold prose-code:text-rose-700 prose-pre:rounded-2xl prose-pre:border prose-pre:border-slate-800 prose-pre:bg-slate-900 prose-pre:text-slate-100">
            <ReactMarkdown>{overviewMd}</ReactMarkdown>
          </div>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-lg shadow-indigo-500/10">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-indigo-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
              Por que estudar aqui
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              {visual.hints.map((hint) => (
                <li key={hint} className="flex gap-2.5">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${visual.hintDot}`} aria-hidden />
                  {hint}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50/90 p-5 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">Transparência</p>
            <p className="mt-2 leading-relaxed">
              Você vê o programa completo abaixo antes de se matricular. Depois, o progresso fica em{' '}
              <strong>Minhas trilhas</strong>.
            </p>
            <Link
              to="/app/tracks"
              className="mt-3 inline-flex items-center gap-1 font-bold text-indigo-600 hover:underline"
            >
              Voltar ao catálogo
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
