import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import type { SubmitResult } from './ExerciseRunner';

type Props = {
  open: boolean;
  result: SubmitResult | null;
  onClose: () => void;
};

export function FeedbackDrawer({ open, result, onClose }: Props) {
  if (!open || !result) return null;
  const ok = result.correct;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div
        className={clsx(
          'relative w-full max-w-lg rounded-t-3xl p-6 shadow-2xl sm:rounded-3xl',
          ok ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white' : 'bg-white text-slate-900 ring-1 ring-slate-200',
        )}
      >
        <h3 className="text-lg font-bold">{ok ? 'Muito bem!' : 'Quase lá'}</h3>
        <p className="mt-2 text-sm opacity-90">
          {ok
            ? result.rewardsApplied
              ? `+${result.xpGained} XP · +${result.gemsGained} gemas`
              : result.alreadySolved
                ? 'Você já havia resolvido este exercício.'
                : 'Resposta correta.'
            : 'Revise a explicação abaixo e tente de novo.'}
        </p>
        <div
          className={clsx(
            'mt-4 rounded-2xl p-4 text-sm',
            ok ? 'bg-white/15 prose prose-invert prose-p:my-1 max-w-none' : 'bg-slate-50 text-slate-700 prose prose-slate max-w-none',
          )}
        >
          <ReactMarkdown>{result.explanation}</ReactMarkdown>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={clsx(
            'mt-6 w-full rounded-2xl py-3 text-sm font-bold uppercase tracking-wide',
            ok ? 'bg-white text-emerald-700' : 'bg-slate-900 text-white',
          )}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
