import { useEffect, useId, useMemo, useState } from 'react';
import { FocusTrap } from 'focus-trap-react';
import clsx from 'clsx';
import { Gem, Loader2, Star, Trophy, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import type { SubmitResult } from './ExerciseRunner';
import { fireLevelUpConfetti, fireConfetti } from '../lib/confetti';
import { playCorrect, playLevelUp, playWrong } from '../lib/sounds';
import { apiFetch, ApiError } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { useUiPreferences } from '../stores/uiPreferencesStore';

type Props = {
  open: boolean;
  result: SubmitResult | null;
  /** Exercício em que o feedback foi disparado (para desbloquear explicação com gema). */
  exerciseId?: string | null;
  onClose: () => void;
  /** Após POST reveal-explanation: atualiza explicação no estado e gemas no perfil. */
  onExplanationUnlocked?: (payload: {
    explanation: string;
    gemsRemaining: number;
  }) => void;
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

export function FeedbackDrawer({
  open,
  result,
  exerciseId,
  onClose,
  onExplanationUnlocked,
}: Props) {
  const titleId = useId();
  const token = useAuthStore((s) => s.token);
  const soundEnabled = useUiPreferences((s) => s.soundEnabled);
  const [revealLoading, setRevealLoading] = useState(false);
  const messageSeed = useMemo(() => {
    if (!open || !result) return 0;
    const s = `${result.correct}-${result.xpGained}-${result.gemsGained}-${result.lessonCompleted}-${result.leveledUp}-${result.explanation.slice(0, 80)}`;
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  }, [open, result]);

  useEffect(() => {
    if (!open) setRevealLoading(false);
  }, [open]);

  useEffect(() => {
    if (!open || !result) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    /**
     * Trava scroll do body enquanto o drawer está aberto. Importante no mobile:
     * sem isso o body "pula" quando o usuário arrasta dentro do sheet e alcança
     * a borda, além de deixar o fundo visualmente estático sob o backdrop.
     */
    const { body, documentElement: html } = document;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;
    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';

    if (result.correct) {
      if (result.leveledUp) {
        fireLevelUpConfetti();
        if (soundEnabled) playLevelUp();
      } else if (result.lessonCompleted || result.rewardsApplied) {
        fireConfetti();
        if (soundEnabled) playCorrect();
      } else if (soundEnabled) {
        playCorrect();
      }
    } else if (soundEnabled) {
      playWrong();
    }

    return () => {
      window.removeEventListener('keydown', onKey);
      body.style.overflow = prevBodyOverflow;
      html.style.overflow = prevHtmlOverflow;
    };
  }, [open, result, onClose, soundEnabled]);

  if (!open || !result) return null;
  const ok = result.correct;
  const seed = messageSeed;

  return (
    <FocusTrap focusTrapOptions={{ initialFocus: false, clickOutsideDeactivates: false }}>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
        <button
          type="button"
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
          aria-label="Fechar diálogo"
          onClick={onClose}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={clsx(
            'relative z-10 w-full max-w-lg rounded-t-3xl p-6 shadow-2xl sm:rounded-3xl animate-sheet-up',
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
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl animate-pop">
                    <Trophy className="h-6 w-6 text-yellow-200" />
                  </span>
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl animate-pop">
                    <Star className="h-6 w-6 text-yellow-200" />
                  </span>
                )
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl animate-scale-in">
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

          {/* Detalhe do ambiente (sintaxe / execução) */}
          {!ok && result.evaluatorDetail ? (
            <div className="mt-4 rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <p className="font-semibold text-amber-900">Detalhe técnico</p>
              <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-xs text-amber-950/90">
                {result.evaluatorDetail}
              </pre>
            </div>
          ) : null}

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

          {!ok && result.requiresGemForFullExplanation && exerciseId && token ? (
            <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50/90 p-4">
              <p className="text-sm font-semibold text-sky-950">
                Quer ver a explicação completa?
              </p>
              <button
                type="button"
                disabled={revealLoading}
                onClick={async () => {
                  setRevealLoading(true);
                  try {
                    const data = await apiFetch<{
                      explanation: string;
                      gemsRemaining: number;
                      alreadyUnlocked?: boolean;
                    }>(`/exercises/${exerciseId}/reveal-explanation`, {
                      method: 'POST',
                      token,
                      body: JSON.stringify({}),
                    });
                    onExplanationUnlocked?.(data);
                    toast.success(
                      data.alreadyUnlocked
                        ? 'Explicação disponível.'
                        : '1 gema utilizada. Explicação desbloqueada!',
                    );
                  } catch (e) {
                    const msg =
                      e instanceof ApiError
                        ? e.message
                        : 'Não foi possível desbloquear. Tente de novo.';
                    toast.error(msg);
                  } finally {
                    setRevealLoading(false);
                  }
                }}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 py-3 text-sm font-bold text-white transition hover:bg-sky-700 disabled:opacity-60"
              >
                {revealLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Gem className="h-4 w-4" aria-hidden />
                )}
                Gastar 1 gema e ver a explicação
              </button>
            </div>
          ) : null}

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
