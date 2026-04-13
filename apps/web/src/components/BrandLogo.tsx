import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

const sizes = {
  sm: { tile: 'h-9 w-9', dot: 'h-1.5 w-1.5', gap: 'gap-0.5', text: 'text-base' },
  md: { tile: 'h-10 w-10', dot: 'h-2 w-2', gap: 'gap-1', text: 'text-lg' },
  lg: { tile: 'h-14 w-14', dot: 'h-2 w-2', gap: 'gap-1', text: 'text-lg' },
} as const;

type Size = keyof typeof sizes;

function LogoMark({ size, className }: { size: Size; className?: string }) {
  const s = sizes[size];
  return (
    <div
      className={twMerge(
        'flex shrink-0 items-center justify-center rounded-2xl bg-white shadow-lg shadow-slate-300/35 ring-1 ring-slate-100',
        s.tile,
        className,
      )}
    >
      <span className={twMerge('grid grid-cols-2', s.gap)}>
        <span className={twMerge('rounded-full bg-blue-500', s.dot)} />
        <span className={twMerge('rounded-full bg-slate-300', s.dot)} />
        <span className={twMerge('rounded-full bg-slate-300', s.dot)} />
        <span className={twMerge('rounded-full bg-slate-800', s.dot)} />
      </span>
    </div>
  );
}

export function BrandLogo({
  size = 'md',
  showText = true,
  className,
  linkTo,
  variant = 'light',
}: {
  size?: Size;
  showText?: boolean;
  className?: string;
  linkTo?: string;
  /** `dark`: fundo escuro (área admin). */
  variant?: 'light' | 'dark';
}) {
  const s = sizes[size];
  const inner = (
    <>
      <LogoMark
        size={size}
        className={variant === 'dark' ? 'bg-slate-800 ring-slate-700 shadow-slate-950/50' : undefined}
      />
      {showText ? (
        <span
          className={twMerge(
            'font-bold tracking-tight',
            variant === 'dark' ? 'text-white' : 'text-slate-900',
            s.text,
          )}
        >
          Aprenda aqui
          <span className={variant === 'dark' ? 'text-amber-400' : 'text-blue-600'}>!</span>
        </span>
      ) : null}
    </>
  );

  const wrapClass = twMerge(
    'inline-flex items-center gap-2 font-semibold tracking-tight',
    variant === 'dark' ? 'text-white' : 'text-slate-900',
    className,
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className={wrapClass}>
        {inner}
      </Link>
    );
  }

  return <span className={wrapClass}>{inner}</span>;
}

export function BrandLogoIcon({ size = 'sm', className }: { size?: Size; className?: string }) {
  return <LogoMark size={size} className={className} />;
}
