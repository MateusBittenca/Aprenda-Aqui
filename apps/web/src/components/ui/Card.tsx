import type { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-slate-200/60 bg-surface-container-lowest shadow-elevated',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
