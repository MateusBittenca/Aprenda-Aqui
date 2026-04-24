import type { ReactNode } from 'react';

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-container-high bg-surface-container-lowest px-6 py-16 text-center animate-scale-in">
      {icon ? <div className="mb-4 text-on-surface-variant/70">{icon}</div> : null}
      <p className="text-lg font-semibold text-on-surface">{title}</p>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-on-surface-variant">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
