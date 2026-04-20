import { GraduationCap, Sparkles, Zap } from 'lucide-react';
import type { CourseCatalogDetail, UserCourseCatalogItem } from '../types/catalog';

type Props = {
  data: CourseCatalogDetail;
  heroImage: string | null;
  catalogEntry: UserCourseCatalogItem | undefined;
  enrollBlock: React.ReactNode;
};

export function CourseCatalogLanding({
  data,
  heroImage,
  catalogEntry,
  enrollBlock,
}: Props) {
  return (
    <section className="relative">
      <div
        className={[
          'relative overflow-hidden rounded-[32px] border border-white/60 bg-white/85 p-6 shadow-[0_25px_60px_-20px_rgba(30,27,75,0.14)] backdrop-blur-xl',
          'md:p-10 lg:p-12',
        ].join(' ')}
      >
        {heroImage ? (
          <div
            className="pointer-events-none absolute right-0 top-0 hidden h-full w-1/3 opacity-[0.09] md:block"
            aria-hidden
          >
            {/* Uma única URL hoje; com variantes de densidade/largura, usar srcset + sizes */}
            <img src={heroImage} alt="" className="h-full max-w-full object-cover" />
          </div>
        ) : null}

        <div className="relative z-10 max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-indigo-900">
            <GraduationCap className="h-4 w-4 text-indigo-600" aria-hidden />
            {data.isFree ? 'Curso gratuito' : 'Curso premium'}
          </div>

          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-indigo-950 sm:text-4xl md:text-5xl md:leading-[1.12]">
            {data.title}
          </h1>

          <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
            {data.description?.trim() ||
              data.tagline?.trim() ||
              'Explore o programa abaixo e matricule-se para liberar as aulas e os exercícios.'}
          </p>

          {catalogEntry && !data.isFree ? (
            <p className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm font-medium text-amber-900">
              <Zap className="h-4 w-4 shrink-0" aria-hidden />
              Curso pago — matrícula conforme regras da plataforma
            </p>
          ) : (
            <p className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-500">
              <Sparkles className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />
              Exercícios interativos no navegador após a matrícula
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="min-w-0 flex-1 sm:flex-none sm:max-w-md">{enrollBlock}</div>
            <a
              href="#programa"
              className={[
                'inline-flex items-center justify-center rounded-2xl border border-indigo-200/80 bg-white/90 px-6 py-3.5 text-center text-sm font-bold text-indigo-700 shadow-sm',
                'transition hover:border-indigo-300 hover:bg-white active:scale-[0.98]',
              ].join(' ')}
            >
              Ver programa
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
