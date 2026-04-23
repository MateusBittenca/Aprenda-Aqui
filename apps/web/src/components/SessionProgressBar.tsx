import clsx from 'clsx';
import { CheckCircle2, Target } from 'lucide-react';

type Props = {
  current: number;
  total: number;
  className?: string;
};

export function SessionProgressBar({ current, total, className }: Props) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  const done = total > 0 && current >= total;

  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-2xl border border-indigo-100/80 bg-indigo-50/60 p-4 shadow-inner shadow-indigo-500/5',
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span
          className={clsx(
            'inline-flex items-center gap-2 text-sm font-bold',
            done ? 'text-emerald-700' : 'text-slate-700',
          )}
        >
          {done ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />
              Missão cumprida nesta aula!
            </>
          ) : (
            <>
              <Target className="h-4 w-4 text-indigo-500" aria-hidden />
              Desafios da aula
            </>
          )}
        </span>
        <span
          className={clsx(
            'rounded-full px-2.5 py-0.5 text-xs font-black tabular-nums',
            done ? 'bg-emerald-100 text-emerald-800' : 'bg-white/80 text-slate-600 ring-1 ring-slate-200/80',
          )}
        >
          {current}/{total}
        </span>
      </div>
      <div
        className={clsx(
          'relative h-3 overflow-hidden rounded-full ring-1',
          done ? 'bg-emerald-100 ring-emerald-200/60' : 'bg-slate-200/80 ring-slate-200/50',
        )}
      >
        <div
          className={clsx(
            'relative h-full overflow-hidden rounded-full transition-all duration-700 ease-ios-out',
            done ? 'bg-emerald-500' : 'bg-indigo-600',
          )}
          style={{ width: `${pct}%` }}
        >
          {!done && pct > 0 && (
            <span className="absolute inset-0 shimmer-line" aria-hidden />
          )}
        </div>
      </div>
    </div>
  );
}
