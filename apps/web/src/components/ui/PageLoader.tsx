import { Loader2 } from 'lucide-react';

export function PageLoader({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-500"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" aria-hidden />
      <p>{label}</p>
    </div>
  );
}
