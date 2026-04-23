import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

const variants: Record<Variant, string> = {
  primary:
    'bg-blue-600 text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 disabled:opacity-60',
  secondary:
    'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 disabled:opacity-60',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-60',
  ghost: 'text-slate-700 hover:bg-slate-100 disabled:opacity-60',
};

export function Button({
  variant = 'primary',
  className,
  loading,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      className={clsx(
        /* Touch target mínimo 44px no mobile (WCAG 2.5.5); desktop mantém densidade original. */
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold sm:min-h-0',
        'transition duration-300 ease-ios-out active:scale-[0.97] disabled:active:scale-100',
        'focus-ring-primary',
        variants[variant],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}
