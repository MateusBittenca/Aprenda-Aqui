import type { ReactNode } from 'react';

export function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-surface-container-high/60 bg-surface-container-lowest p-4 shadow-elevated">
      <div className="flex items-center gap-2 text-on-surface-variant">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-on-surface">{value}</p>
      <p className="text-sm text-on-surface-variant">{sub}</p>
    </div>
  );
}
