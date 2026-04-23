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
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-16 text-center animate-scale-in">
      {icon ? <div className="mb-4 text-slate-400">{icon}</div> : null}
      <p className="text-lg font-semibold text-slate-800">{title}</p>
      {description ? <p className="mt-2 max-w-sm text-sm text-slate-600">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
