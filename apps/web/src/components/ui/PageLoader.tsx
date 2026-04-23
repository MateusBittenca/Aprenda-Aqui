import { Loader2 } from 'lucide-react';

export function PageLoader({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-slate-500 animate-fade-in"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-primary/10 animate-pulse motion-reduce:animate-none" aria-hidden />
        <span className="absolute inset-1.5 rounded-full bg-primary/10" aria-hidden />
        <Loader2 className="relative h-7 w-7 animate-spin text-primary" aria-hidden />
      </span>
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
