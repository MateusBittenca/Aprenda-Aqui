import type { ReactNode } from 'react';
import { clsx } from 'clsx';

type Tone = 'neutral' | 'amber' | 'sky' | 'emerald' | 'violet' | 'primary';

/**
 * Chip compacto para métricas rápidas (streak, gemas, XP, nível).
 * Unifica a repetição de `inline-flex rounded-full bg-*-50 text-*-600 px-2…`
 * usada em AppLayout, DashboardPage e ProfilePage.
 *
 * A cor é semântica: `amber` = streak, `sky` = gemas, `primary` = nível/XP,
 * `emerald` = progresso positivo, `violet` = exercícios.
 */
const tones: Record<Tone, string> = {
  neutral: 'bg-surface-container-low text-on-surface-variant',
  amber: 'bg-amber-50 text-amber-700',
  sky: 'bg-sky-50 text-sky-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  violet: 'bg-violet-50 text-violet-700',
  primary: 'bg-primary/10 text-primary',
};

export function StatChip({
  icon,
  label,
  value,
  tone = 'neutral',
  title,
  className,
}: {
  icon?: ReactNode;
  label?: ReactNode;
  value: ReactNode;
  tone?: Tone;
  title?: string;
  className?: string;
}) {
  return (
    <span
      title={title}
      className={clsx(
        'inline-flex min-h-8 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm font-semibold',
        tones[tone],
        className,
      )}
    >
      {icon ? (
        <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden>
          {icon}
        </span>
      ) : null}
      {label ? <span className="text-xs font-semibold">{label}</span> : null}
      <span className="tabular-nums">{value}</span>
    </span>
  );
}
