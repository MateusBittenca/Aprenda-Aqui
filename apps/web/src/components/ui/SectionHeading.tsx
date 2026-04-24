import type { ReactNode } from 'react';
import { clsx } from 'clsx';

/**
 * Cabeçalho padrão de seção/página. Substitui a repetição de
 * `<div class="mb-4 flex items-end justify-between">…` espalhada
 * em dashboard, catálogo, perfil, ranking e comunidade.
 *
 * `level` define o papel semântico:
 *  - `page` → `<h1>` grande com tracking tight (título de rota);
 *  - `section` → `<h2>` menor (seções internas da página).
 *
 * Usa sempre `font-headline` para alinhar a hierarquia tipográfica.
 */
export function SectionHeading({
  icon,
  eyebrow,
  title,
  description,
  action,
  level = 'section',
  accent = 'primary',
  className,
}: {
  icon?: ReactNode;
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  level?: 'page' | 'section';
  accent?: 'primary' | 'neutral';
  className?: string;
}) {
  const iconWrap = accent === 'primary'
    ? 'bg-primary/10 text-primary ring-1 ring-primary/15'
    : 'bg-surface-container-low text-on-surface-variant ring-1 ring-surface-container-high';

  const titleClass = level === 'page'
    ? 'font-headline text-balance text-3xl font-bold tracking-tight text-on-surface sm:text-4xl'
    : 'font-headline text-balance text-lg font-bold tracking-tight text-on-surface sm:text-xl';

  const Heading = level === 'page' ? 'h1' : 'h2';

  return (
    <div
      className={clsx(
        'flex min-w-0 flex-col gap-4 md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {icon ? (
          <span
            className={clsx(
              'mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
              iconWrap,
            )}
            aria-hidden
          >
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              {eyebrow}
            </p>
          ) : null}
          <Heading className={titleClass}>{title}</Heading>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-on-surface-variant sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
