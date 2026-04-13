import { useEffect, useId, useRef } from 'react';
import { FocusTrap } from 'focus-trap-react';
import clsx from 'clsx';
import { Gem, Star, Trophy, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { SubmitResult } from './ExerciseRunner';
import { fireLevelUpConfetti, fireConfetti } from '../lib/confetti';

type Props = {
  open: boolean;
  result: SubmitResult | null;
  onClose: () => void;
};

const SUCCESS_MESSAGES = [
  'Arrasou! 🎯',
  'Mandou bem! ✨',
  'Perfeito! 🔥',
  'Isso aí! 💪',
  'Correto! 🚀',
];

const RETRY_MESSAGES = [
  'Quase! Releia e tente de novo.',
  'Não foi dessa vez — reveja a dica.',
  'Continue tentando, você chega lá!',
  'Analise a explicação com calma.',
];

function pickMessage(arr: string[], seed: number) {
  return arr[seed % arr.length];
}

export function FeedbackDrawer({ open, result, onClose }: Props) {
  const titleId = useId();
  const seedRef = useRef(0);

  useEffect(() => {
    if (!open || !result) return;
    seedRef.current = Date.now();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    if (result.correct) {
      if (result.leveledUp) {
        fireLevelUpConfetti();
      } else if (result.lessonCompleted || result.rewardsApplied) {
        fireConfetti();
      }
    }

    return () => window.removeEventListener('keydown', onKey);
  }, [open, result, onClose]);

  if (!open || !result) return null;
  const ok = result.correct;
  const seed = seedRef.current;

  return (
    <FocusTrap focusTrapOptions={{ initialFocus: false, clickOutsideDeactivates: false }}>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
        <button
          type="button"
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          aria-label="Fechar diálogo"
          onClick={onClose}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={clsx(
            'relative z-10 w-full max-w-lg rounded-t-3xl p-6 shadow-2xl sm:rounded-3xl',
            ok
              ? result.leveledUp
                ? 'bg-amber-500 text-white ring-2 ring-amber-700/30'
                : 'bg-emerald-600 text-white ring-2 ring-emerald-800/30'
              : 'bg-white text-slate-900 ring-1 ring-slate-200',
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {ok ? (
                result.leveledUp ? (
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl">
                    <Trophy className="h-6 w-6 text-yellow-200" />
                  </span>
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl">
                    <Star className="h-6 w-6 text-yellow-200" />
                  </span>
                )
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                  🤔
                </span>
              )}
              <div>
                <h3 id={titleId} className="text-lg font-bold">
                  {ok
                    ? result.leveledUp
                      ? `Subiu para nível ${result.newLevel}! 🏆`
                      : result.lessonCompleted
                        ? 'Aula concluída! 🎉'
                        : pickMessage(SUCCESS_MESSAGES, seed)
                    : pickMessage(RETRY_MESSAGES, seed)}
                </h3>
                {ok && result.rewardsApplied && (
                  <div className="mt-1 flex items-center gap-3 text-sm font-semibold opacity-90">
                    <span className="flex items-center gap-1">
                      <Zap className="h-4 w-4" aria-hidden />
                      +{result.xpGained} XP
                    </span>
                    {result.gemsGained > 0 && (
                      <span className="flex items-center gap-1">
                        <Gem className="h-4 w-4" aria-hidden />
                        +{result.gemsGained}
                      </span>
                    )}
                  </div>
                )}
                {ok && result.alreadySolved && (
                  <p className="mt-1 text-sm opacity-80">Você já havia resolvido este exercício.</p>
                )}
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div
            className={clsx(
              'mt-4 rounded-2xl p-4 text-sm',
              ok
                ? 'bg-white/15 prose prose-invert prose-p:my-1 max-w-none prose-sm'
                : 'bg-slate-50 text-slate-700 prose prose-slate max-w-none prose-sm',
            )}
          >
            <ReactMarkdown>{result.explanation}</ReactMarkdown>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={onClose}
            className={clsx(
              'mt-5 w-full rounded-2xl py-3 text-sm font-bold tracking-wide transition active:scale-[0.98]',
              ok
                ? 'bg-white/20 hover:bg-white/30 text-white ring-1 ring-white/30'
                : 'bg-slate-900 text-white hover:bg-slate-800',
            )}
          >
            {ok && result.lessonCompleted ? 'Continuar' : ok ? 'Próximo' : 'Tentar novamente'}
          </button>
        </div>
      </div>
    </FocusTrap>
  );
}
