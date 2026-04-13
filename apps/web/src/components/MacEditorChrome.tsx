import type { ReactNode } from 'react';

type Props = {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
};

/** Barra de título estilo janela macOS (semáforo + título centralizado). */
export function MacEditorChrome({ title, children, footer }: Props) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-slate-300/90 bg-[#ececec] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.22)]">
      <div className="relative flex h-10 shrink-0 items-center border-b border-black/[0.08] bg-[#E5E5E5] px-3">
        <div className="flex gap-2" aria-hidden>
          <span className="h-3 w-3 rounded-full bg-[#FF5F57] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]" />
          <span className="h-3 w-3 rounded-full bg-[#FEBC2E] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]" />
          <span className="h-3 w-3 rounded-full bg-[#28C840] shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]" />
        </div>
        <span className="pointer-events-none absolute left-1/2 top-1/2 max-w-[65%] -translate-x-1/2 -translate-y-1/2 truncate text-center text-[13px] font-medium tracking-tight text-slate-600">
          {title}
        </span>
      </div>
      {children}
      {footer}
    </div>
  );
}
