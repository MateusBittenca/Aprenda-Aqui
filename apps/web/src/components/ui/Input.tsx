import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

type Variant = 'light' | 'dark';

/**
 * Input padronizado com label, ícone à esquerda opcional e mensagem de erro.
 * Mantém a mesma densidade dos botões (min-h-11 no mobile) e o foco padrão
 * (`focus-ring-primary`), corrigindo divergências entre os formulários atuais.
 */
export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    hint?: string;
    errorText?: string;
    leftIcon?: ReactNode;
    variant?: Variant;
  }
>(function Input(
  { id, label, hint, errorText, leftIcon, variant = 'light', className, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const descId = hint || errorText ? `${inputId}-desc` : undefined;

  const base = variant === 'dark'
    ? 'bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-slate-500'
    : 'bg-surface-container-lowest border border-surface-container-high text-on-surface placeholder:text-on-surface-variant/70';

  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <label
          htmlFor={inputId}
          className={clsx(
            'text-sm font-medium',
            variant === 'dark' ? 'text-slate-300' : 'text-on-surface',
          )}
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden>
            {leftIcon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          aria-describedby={descId}
          aria-invalid={errorText ? true : undefined}
          className={clsx(
            'min-h-11 w-full rounded-xl px-3 py-2.5 text-sm outline-none transition',
            'focus:border-primary focus:ring-2 focus:ring-primary/25',
            leftIcon && 'pl-10',
            base,
            errorText && 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
            className,
          )}
          {...props}
        />
      </div>
      {errorText ? (
        <p id={descId} className="text-xs font-medium text-red-600" role="alert">
          {errorText}
        </p>
      ) : hint ? (
        <p id={descId} className={clsx('text-xs', variant === 'dark' ? 'text-slate-500' : 'text-on-surface-variant')}>
          {hint}
        </p>
      ) : null}
    </div>
  );
});
