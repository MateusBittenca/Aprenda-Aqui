import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

type Variant = 'primary' | 'brand' | 'secondary' | 'outline' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

/**
 * Variantes alinhadas aos tokens (`primary`, `surface*`, `outline`, `error`).
 * `brand` é reservada para CTAs em destaque (gradient da marca + glow suave).
 */
const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-white shadow-soft hover:bg-primary-dim disabled:opacity-60',
  brand:
    'brand-gradient text-white shadow-glow hover:brightness-110 disabled:opacity-60',
  secondary:
    'border border-surface-container-high bg-surface-container-lowest text-on-surface hover:bg-surface-container-low disabled:opacity-60',
  outline:
    'border border-surface-container-high bg-transparent text-on-surface hover:bg-surface-container-low disabled:opacity-60',
  danger:
    'bg-error text-white hover:bg-[#8e1319] disabled:opacity-60',
  ghost:
    'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface disabled:opacity-60',
};

const sizes: Record<Size, string> = {
  sm: 'min-h-9 px-3 py-1.5 text-xs',
  md: 'min-h-11 px-4 py-2.5 text-sm sm:min-h-10',
  lg: 'min-h-12 px-6 py-3 text-base',
};

const radius: Record<Variant, string> = {
  primary: 'rounded-full',
  brand: 'rounded-full',
  secondary: 'rounded-xl',
  outline: 'rounded-xl',
  danger: 'rounded-xl',
  ghost: 'rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  loading,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-semibold',
        'transition duration-300 ease-ios-out active:scale-[0.97] disabled:active:scale-100',
        'focus-ring-primary',
        sizes[size],
        radius[variant],
        variants[variant],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : leftIcon ? (
        <span className="inline-flex shrink-0" aria-hidden>
          {leftIcon}
        </span>
      ) : null}
      {children}
      {!loading && rightIcon ? (
        <span className="inline-flex shrink-0" aria-hidden>
          {rightIcon}
        </span>
      ) : null}
    </button>
  );
}
