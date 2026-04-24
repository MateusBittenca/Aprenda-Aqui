import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Award, Gift, Lock, Sparkles, Star, Trophy, X } from 'lucide-react';
import {
  bandSizeForLevel,
  buildTrajectory,
  xpAtStartOfLevel,
  type TrajectoryStep,
} from '../lib/levelProgress';
import { getRankForLevel, getNextRankThreshold, type LevelRank } from '../lib/levelTitles';

type Props = {
  open: boolean;
  onClose: () => void;
  xpTotal: number;
  level: number;
};

function isRankStart(level: number, rank: LevelRank): boolean {
  return rank.fromLevel === level;
}

function titleUnlockLine(level: number): string | null {
  const rank = getRankForLevel(level);
  if (level === rank.fromLevel && level > 1) {
    return `Novo título: ${rank.name}`;
  }
  return null;
}

/**
 * Largura reservada à coluna da timeline (círculos = w-9 = 2.25rem). A haste de 4px
 * fica centralizada nela — evita o desalinhamento de `left-px` aproximado.
 */
const TIMELINE_GUTTER_CLS = 'w-9 shrink-0';

export function XpTrajectoryModal({ open, onClose, xpTotal, level }: Props) {
  const [selectedStep, setSelectedStep] = useState<TrajectoryStep | null>(null);
  const [lineToCurrentPx, setLineToCurrentPx] = useState(0);

  const timelineRef = useRef<HTMLDivElement | null>(null);
  const currentNodeRef = useRef<HTMLDivElement | null>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedStep) setSelectedStep(null);
        else onClose();
      }
    },
    [onClose, selectedStep],
  );

  useEffect(() => {
    if (!open) {
      queueMicrotask(() => setSelectedStep(null));
      return;
    }
    document.addEventListener('keydown', handleEscape);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = prev;
    };
  }, [open, handleEscape]);

  const steps = buildTrajectory(xpTotal, level, 14);
  const currentIdx = steps.findIndex((s) => s.isCurrent);

  const currentBandXp = Math.max(0, xpTotal - xpAtStartOfLevel(level));
  const bandSize = bandSizeForLevel(level);
  const pctInBand = bandSize > 0 ? Math.min(100, Math.round((currentBandXp / bandSize) * 100)) : 0;

  const nextTitle = getNextRankThreshold(level);

  /** Altura exata do preenchimento da haste: centro do círculo "atual" (cards com altura variável quebram o % de altura do layout antigo). */
  useLayoutEffect(() => {
    if (!open) {
      setLineToCurrentPx(0);
      return;
    }

    const measure = () => {
      const root = timelineRef.current;
      const node = currentNodeRef.current;
      if (!root || !node) {
        setLineToCurrentPx(0);
        return;
      }
      const r = root.getBoundingClientRect();
      const n = node.getBoundingClientRect();
      setLineToCurrentPx(Math.max(0, n.top - r.top + n.height / 2));
    };

    measure();
    const raf = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    if (timelineRef.current) {
      ro.observe(timelineRef.current);
    }
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [open, level, xpTotal, steps.length, currentIdx]);

  if (!open) return null;

  const content = (
    <>
      <div
        className="fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="xp-traj-title"
      >
        <button
          type="button"
          className="absolute inset-0 bg-[#1a1e44]/70 backdrop-blur-md animate-fade-in"
          onClick={onClose}
          aria-label="Fechar"
        />
        <div className="relative z-10 flex max-h-[min(92dvh,820px)] w-full max-w-xl flex-col rounded-t-[1.5rem] border border-surface-container-high/80 bg-surface-container-lowest shadow-2xl animate-sheet-up sm:rounded-2xl">
          <header className="flex shrink-0 items-start justify-between gap-3 border-b border-surface-container-high/80 px-5 py-4 sm:px-6">
            <div className="flex min-w-0 items-start gap-3">
              <div className="hidden rounded-xl bg-primary/10 p-2 text-primary sm:flex" aria-hidden>
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p id="xp-traj-title" className="font-headline text-lg font-bold tracking-tight text-on-surface sm:text-xl">
                  Sua trajetória de níveis
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Próximos marcos, XP necessário e recompensas a cada 5 níveis.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-xl p-2 text-primary transition hover:bg-surface-container-low"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-6">
            <div className="relative" ref={timelineRef}>
              {/* Haste: fundo + progresso. Coluna w-9 alinhada aos círculos, traço no centro (translate). */}
              <div
                className={`pointer-events-none absolute bottom-0 left-0 top-0 ${TIMELINE_GUTTER_CLS} z-0`}
                aria-hidden
              >
                <div className="absolute inset-0 left-1/2 w-1 -translate-x-1/2 rounded-full bg-surface-container-high" />
                <div
                  className="absolute left-1/2 top-0 w-1 -translate-x-1/2 rounded-full bg-primary transition-[height] duration-500 ease-out"
                  style={{ height: lineToCurrentPx > 0 ? `${lineToCurrentPx}px` : 0 }}
                />
              </div>

              <div className="relative z-[1] space-y-12">
                {steps.map((step) => {
                  const rank = getRankForLevel(step.level);
                  const unlock = titleUnlockLine(step.level);
                  const isMilestonePreview =
                    !step.isCurrent && isRankStart(step.level, rank) && step.level > level;
                  const isNextLocked = step.level === level + 1 && !step.isCurrent;

                  return (
                    <div key={step.level} className="relative flex gap-4 sm:gap-6">
                      <div
                        className={`z-[2] flex ${TIMELINE_GUTTER_CLS} justify-center`}
                        ref={step.isCurrent ? currentNodeRef : undefined}
                      >
                        {step.isCurrent ? (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-md ring-4 ring-primary-container/20">
                            {step.level}
                          </div>
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary-container/40 bg-primary-container/30 text-sm font-bold text-on-surface-variant">
                            {step.level}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 pt-0.5">
                        {step.isCurrent ? (
                          <button
                            type="button"
                            onClick={() => setSelectedStep(step)}
                            className="relative w-full overflow-hidden rounded-xl bg-surface-container-low p-6 text-left shadow-[0_20px_40px_rgba(40,43,81,0.06)] ring-1 ring-primary/20 transition hover:ring-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <div className="absolute right-0 top-0 rounded-bl-xl bg-primary px-4 py-1.5 backdrop-blur-sm">
                              <span className="text-xs font-bold uppercase tracking-widest text-white">
                                Você
                              </span>
                            </div>
                            <h3 className="font-headline mb-4 pr-16 text-2xl font-bold text-on-surface">
                              {rank.name}
                            </h3>
                            <div className="space-y-2">
                              <div className="mb-1 flex items-end justify-between">
                                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                                  XP desta faixa
                                </span>
                                <span className="text-xs font-bold text-primary">
                                  {currentBandXp.toLocaleString('pt-BR')} / {bandSize.toLocaleString('pt-BR')}
                                </span>
                              </div>
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{ width: `${pctInBand}%` }}
                                />
                              </div>
                            </div>
                            <p className="mt-3 text-xs text-on-surface-variant">Toque para ver detalhes deste nível</p>
                          </button>
                        ) : isMilestonePreview ? (
                          <button
                            type="button"
                            onClick={() => setSelectedStep(step)}
                            className="relative w-full rounded-xl border border-surface-container-high/60 bg-surface-container-low p-6 text-left shadow-sm ring-1 ring-primary/10 transition hover:ring-primary/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <h3 className="font-headline mb-4 text-xl font-bold text-on-surface">{rank.name}</h3>
                            <div className="flex flex-wrap gap-3">
                              {unlock && (
                                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-bold uppercase tracking-tight text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-300">
                                  <Trophy className="h-4 w-4" aria-hidden />
                                  Novo título
                                </span>
                              )}
                              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-tight text-primary">
                                <Gift className="h-4 w-4" aria-hidden />
                                +{step.bandXp} XP na faixa
                              </span>
                            </div>
                            <Star
                              className="pointer-events-none absolute bottom-4 right-4 h-8 w-8 text-primary/20"
                              aria-hidden
                            />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedStep(step)}
                            className="w-full rounded-xl bg-surface-container-low p-6 text-left ring-1 ring-surface-container-high/50 transition hover:bg-surface-container-high/60 hover:ring-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <p className="text-sm leading-relaxed text-on-surface-variant">
                              Faltam{' '}
                              <span className="font-bold text-primary">
                                {step.xpRemainingFrom.toLocaleString('pt-BR')} XP
                              </span>{' '}
                              para o nível <span className="font-semibold text-on-surface">{step.level}</span>
                            </p>
                            {isNextLocked && (
                              <div className="mt-4 flex items-center gap-2 opacity-60">
                                <Lock className="h-4 w-4 text-on-surface-variant" aria-hidden />
                                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                                  Conteúdo bloqueado
                                </span>
                              </div>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {nextTitle && (
              <section className="mt-12">
                <div className="relative overflow-hidden rounded-xl bg-on-surface p-8">
                  <div className="pointer-events-none absolute -bottom-8 -right-8 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
                  <div className="relative z-10 max-w-[280px]">
                    <h4 className="font-headline mb-2 text-xl font-bold text-surface">Próxima grande conquista</h4>
                    <p className="mb-6 text-sm text-surface/70">
                      Ao atingir o nível {nextTitle.level}, você desbloqueia o título{' '}
                      <strong className="text-white">{nextTitle.name}</strong>.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const step = steps.find((s) => s.level === nextTitle.level);
                        if (step) setSelectedStep(step);
                      }}
                      className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-primary-dim focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:active:scale-100 active:scale-[0.98]"
                    >
                      Ver detalhes do marco
                    </button>
                  </div>
                  <Award
                    className="pointer-events-none absolute right-4 top-1/2 h-28 w-28 -translate-y-1/2 text-primary/30"
                    strokeWidth={1}
                    aria-hidden
                  />
                </div>
              </section>
            )}

            <p className="mt-6 rounded-xl border border-surface-container-high bg-surface-container-low/60 px-4 py-3 text-center text-xs leading-relaxed text-on-surface-variant">
              Continue completando aulas e exercícios para ganhar XP. A cada faixa de 5 níveis você desbloqueia um novo
              título no perfil.
            </p>
          </div>
        </div>
      </div>

      {selectedStep && (
        <div
          className="fixed inset-0 z-[210] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute inset-0 bg-[#1a1e44]/75 backdrop-blur-md animate-fade-in"
            onClick={() => setSelectedStep(null)}
            aria-label="Fechar detalhes"
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-surface-container-high bg-surface-container-lowest p-6 shadow-2xl animate-scale-in">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-headline text-lg font-bold text-on-surface">
                Nível {selectedStep.level}
                {selectedStep.isCurrent && (
                  <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold uppercase text-primary">
                    Atual
                  </span>
                )}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedStep(null)}
                className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-low"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-sm font-semibold text-primary">{getRankForLevel(selectedStep.level).name}</p>
            <p className="mt-1 text-sm text-on-surface-variant">{getRankForLevel(selectedStep.level).description}</p>
            <dl className="mt-4 space-y-2 border-t border-surface-container-high pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-on-surface-variant">XP acumulado mín. neste nível</dt>
                <dd className="font-semibold tabular-nums text-on-surface">
                  {selectedStep.xpRequiredTotal.toLocaleString('pt-BR')}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-on-surface-variant">XP necessário completo nesta faixa</dt>
                <dd className="font-semibold tabular-nums text-on-surface">
                  {selectedStep.bandXp.toLocaleString('pt-BR')}
                </dd>
              </div>
              {!selectedStep.isCurrent && selectedStep.xpRemainingFrom > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-on-surface-variant">Ainda faltam</dt>
                  <dd className="font-semibold text-primary">
                    {selectedStep.xpRemainingFrom.toLocaleString('pt-BR')} XP
                  </dd>
                </div>
              )}
            </dl>
            {titleUnlockLine(selectedStep.level) && (
              <p className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/80 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800/40">
                <Gift className="h-4 w-4 shrink-0" aria-hidden />
                {titleUnlockLine(selectedStep.level)}
              </p>
            )}
            <button
              type="button"
              onClick={() => setSelectedStep(null)}
              className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition hover:bg-[#0046bb]"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );

  return createPortal(content, document.body);
}
