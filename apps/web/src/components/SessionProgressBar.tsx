import clsx from 'clsx';

type Props = {
  current: number;
  total: number;
  className?: string;
};

export function SessionProgressBar({ current, total, className }: Props) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  return (
    <div className={clsx('w-full', className)}>
      <div className="mb-1 flex justify-between text-xs font-medium text-slate-500">
        <span>Progresso da sessão</span>
        <span>
          {current}/{total}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-200/80">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
