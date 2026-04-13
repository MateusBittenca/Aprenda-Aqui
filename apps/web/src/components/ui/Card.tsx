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
        'rounded-3xl border border-slate-200/80 bg-white shadow-soft',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
