import { useCallback, useEffect, useState } from 'react';
import {
  Award,
  Gift,
  Lock,
  Sparkles,
  Star,
  Trophy,
  X,
} from 'lucide-react';
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

export function XpTrajectoryModal({ open, onClose, xpTotal, level }: Props) {
  const [selectedStep, setSelectedStep] = useState<TrajectoryStep | null>(null);

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

  if (!open) return null;

  const steps = buildTrajectory(xpTotal, level, 14);
  const currentIdx = steps.findIndex((s) => s.isCurrent);
  const fillPct =
    steps.length > 0 ? Math.min(100, ((currentIdx + 0.5) / steps.length) * 100) : 0;

  const currentBandXp = Math.max(0, xpTotal - xpAtStartOfLevel(level));
  const bandSize = bandSizeForLevel(level);
  const pctInBand = bandSize > 0 ? Math.min(100, Math.round((currentBandXp / bandSize) * 100)) : 0;

  const nextTitle = getNextRankThreshold(level);

  return (
    <>
      <div
        className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="xp-traj-title"
      >
        <button
          type="button"
          className="absolute inset-0 bg-[#282b51]/40 backdrop-blur-[2px]"
          onClick={onClose}
          aria-label="Fechar"
        />
        <div className="relative z-10 flex max-h-[min(92dvh,820px)] w-full max-w-xl flex-col rounded-t-[1.5rem] border border-[#d9daff]/80 bg-[#f8f5ff] shadow-2xl sm:rounded-2xl">
          {/* Header */}
          <header className="flex shrink-0 items-start justify-between gap-3 border-b border-[#e0e0ff]/80 px-5 py-4 sm:px-6">
            <div className="flex min-w-0 items-start gap-3">
              <div className="hidden rounded-xl bg-primary/10 p-2 text-primary sm:flex" aria-hidden>
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p id="xp-traj-title" className="font-headline text-lg font-bold tracking-tight text-[#282b51] sm:text-xl">
                  Sua trajetória de níveis
                </p>
                <p className="mt-1 text-sm text-[#555881]">
                  Próximos marcos, XP necessário e recompensas a cada 5 níveis.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-xl p-2 text-primary transition hover:bg-white/80"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-6">
            {/* Timeline */}
            <div className="relative">
              <div
                className="absolute bottom-0 left-[1.125rem] top-4 w-1 rounded-full bg-[#a7aad7]/35"
                aria-hidden
              />
              <div
                className="absolute left-[1.125rem] top-4 w-1 rounded-full bg-primary transition-all duration-500"
                style={{ height: `${fillPct}%`, maxHeight: 'calc(100% - 1rem)' }}
                aria-hidden
              />

              <div className="relative space-y-12">
                {steps.map((step) => {
                  const rank = getRankForLevel(step.level);
                  const unlock = titleUnlockLine(step.level);
                  const isMilestonePreview =
                    !step.isCurrent &&
                    isRankStart(step.level, rank) &&
                    step.level > level;
                  const isNextLocked = step.level === level + 1 && !step.isCurrent;

                  return (
                    <div key={step.level} className="relative flex gap-6 sm:gap-8">
                      {/* Node */}
                      <div className="z-10 flex shrink-0 justify-center">
                        {step.isCurrent ? (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-md ring-8 ring-primary-container/25">
                            {step.level}
                          </div>
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#a7aad7]/40 bg-[#d9daff] text-sm font-bold text-[#555881]">
                            {step.level}
                          </div>
                        )}
                      </div>

                      {/* Card */}
                      <div className="min-w-0 flex-1 pt-0.5">
                        {step.isCurrent ? (
                          <button
                            type="button"
                            onClick={() => setSelectedStep(step)}
                            className="relative w-full overflow-hidden rounded-xl bg-white p-6 text-left shadow-[0_20px_40px_rgba(40,43,81,0.06)] ring-1 ring-[#e0e0ff]/60 transition hover:ring-primary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <div className="absolute right-0 top-0 rounded-bl-xl bg-[#7b9cff]/90 px-4 py-1.5 backdrop-blur-sm">
                              <span className="text-xs font-bold uppercase tracking-widest text-[#001e5a]">
                                Você
                              </span>
                            </div>
                            <h3 className="font-headline mb-4 pr-16 text-2xl font-bold text-[#282b51]">{rank.name}</h3>
                            <div className="space-y-2">
                              <div className="mb-1 flex items-end justify-between">
                                <span className="text-xs font-bold uppercase tracking-widest text-[#71749e]">
                                  XP atual
                                </span>
                                <span className="text-xs font-bold text-primary">
                                  {currentBandXp.toLocaleString('pt-BR')} / {bandSize.toLocaleString('pt-BR')}
                                </span>
                              </div>
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#d9daff]">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{ width: `${pctInBand}%` }}
                                />
                              </div>
                            </div>
                            <p className="mt-3 text-xs text-[#555881]">Toque para ver detalhes deste nível</p>
                          </button>
                        ) : isMilestonePreview ? (
                          <button
                            type="button"
                            onClick={() => setSelectedStep(step)}
                            className="relative w-full rounded-xl border border-[#a7aad7]/20 bg-white p-6 text-left shadow-sm ring-1 ring-[#e0e0ff]/40 transition hover:ring-primary/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <h3 className="font-headline mb-4 text-xl font-bold text-[#282b51]">{rank.name}</h3>
                            <div className="flex flex-wrap gap-3">
                              {unlock && (
                                <span className="inline-flex items-center gap-2 rounded-full bg-[#69f6b8] px-4 py-2 text-xs font-bold uppercase tracking-tight text-[#005a3c]">
                                  <Trophy className="h-4 w-4" aria-hidden />
                                  Novo título
                                </span>
                              )}
                              <span className="inline-flex items-center gap-2 rounded-full bg-[#e7e6ff] px-4 py-2 text-xs font-bold uppercase tracking-tight text-[#555881]">
                                <Gift className="h-4 w-4 text-primary" aria-hidden />
                                +{step.bandXp} XP na faixa
                              </span>
                            </div>
                            <Star className="pointer-events-none absolute bottom-4 right-4 h-8 w-8 text-[#d9daff]/80" aria-hidden />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedStep(step)}
                            className="w-full rounded-xl bg-[#f1efff] p-6 text-left ring-1 ring-[#e0e0ff]/50 transition hover:bg-[#e7e6ff]/80 hover:ring-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <p className="text-sm leading-relaxed text-[#555881]">
                              Faltam{' '}
                              <span className="font-bold text-primary">
                                {step.xpRemainingFrom.toLocaleString('pt-BR')} XP
                              </span>{' '}
                              para alcançar o início deste nível
                            </p>
                            {isNextLocked && (
                              <div className="mt-4 flex items-center gap-2 opacity-60">
                                <Lock className="h-4 w-4 text-[#555881]" aria-hidden />
                                <span className="text-xs font-bold uppercase tracking-widest text-[#555881]">
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

            {/* Próxima grande conquista */}
            {nextTitle && (
              <section className="mt-12">
                <div className="relative overflow-hidden rounded-xl bg-[#282b51] p-8">
                  <div className="pointer-events-none absolute -bottom-8 -right-8 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
                  <div className="relative z-10 max-w-[280px]">
                    <h4 className="font-headline mb-2 text-xl font-bold text-white">Próxima grande conquista</h4>
                    <p className="mb-6 text-sm text-[#9799c6]">
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

            <p className="mt-6 rounded-xl border border-[#e0e0ff] bg-white/60 px-4 py-3 text-center text-xs leading-relaxed text-[#555881]">
              Continue completando aulas e exercícios para ganhar XP. A cada faixa de 5 níveis você desbloqueia um
              novo título no perfil.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de detalhe do nível */}
      {selectedStep && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-[#282b51]/50 backdrop-blur-sm"
            onClick={() => setSelectedStep(null)}
            aria-label="Fechar detalhes"
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-[#e0e0ff] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-headline text-lg font-bold text-[#282b51]">
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
                className="rounded-lg p-1.5 text-[#555881] hover:bg-[#f1efff]"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-sm font-semibold text-primary">{getRankForLevel(selectedStep.level).name}</p>
            <p className="mt-1 text-sm text-[#555881]">{getRankForLevel(selectedStep.level).description}</p>
            <dl className="mt-4 space-y-2 border-t border-[#e0e0ff] pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#71749e]">XP para entrar neste nível</dt>
                <dd className="font-semibold tabular-nums text-[#282b51]">
                  {selectedStep.xpRequiredTotal.toLocaleString('pt-BR')}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#71749e]">XP na faixa deste nível</dt>
                <dd className="font-semibold tabular-nums text-[#282b51]">
                  {selectedStep.bandXp.toLocaleString('pt-BR')}
                </dd>
              </div>
              {!selectedStep.isCurrent && selectedStep.xpRemainingFrom > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-[#71749e]">Falta para você</dt>
                  <dd className="font-semibold text-primary">
                    {selectedStep.xpRemainingFrom.toLocaleString('pt-BR')} XP
                  </dd>
                </div>
              )}
            </dl>
            {titleUnlockLine(selectedStep.level) && (
              <p className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/80">
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
}
