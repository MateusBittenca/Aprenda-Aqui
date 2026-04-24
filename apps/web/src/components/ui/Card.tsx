import type { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

type Variant = 'default' | 'hero' | 'glass' | 'flat';

/**
 * Superfície padrão do app. Variantes:
 * - `default`: card elevado em branco com sombra suave (padrão das listas).
 * - `hero`: superfície com gradiente sutil + ring da marca (painéis de topo).
 * - `glass`: translúcida com blur (usada sobre fundos com gradiente forte).
 * - `flat`: sem sombra, apenas contorno — ideal para estados vazios/erros.
 *
 * `interactive` aplica o comportamento de hover lift + press-tactile já padronizado
 * no `index.css`. Mantém o mesmo border-radius dos tokens (`rounded-2xl` = cards).
 */
const variants: Record<Variant, string> = {
  default:
    'rounded-2xl border border-surface-container-high/70 bg-surface-container-lowest shadow-card',
  hero:
    'rounded-3xl border border-surface-container-high/60 hero-surface shadow-soft',
  glass:
    'rounded-2xl glass-card shadow-card',
  flat:
    'rounded-2xl border border-surface-container-high/70 bg-surface-container-lowest',
};

export function Card({
  variant = 'default',
  interactive = false,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  variant?: Variant;
  interactive?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      className={clsx(
        variants[variant],
        interactive && 'hover-lift press-tactile cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
