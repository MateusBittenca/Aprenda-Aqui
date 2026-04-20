import { Link } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';

export function AuthPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh min-w-0 flex-col overflow-x-clip bg-surface dot-grid text-on-surface">
      <header className="border-b border-surface-container-high/80 bg-surface-container-lowest/90 px-[max(1rem,env(safe-area-inset-left))] py-4 pr-[max(1rem,env(safe-area-inset-right))] shadow-sm backdrop-blur-md">
        <div className="mx-auto flex min-w-0 max-w-md items-center justify-between gap-3">
          <Link
            to="/"
            className="min-w-0 text-sm font-semibold text-on-surface-variant transition hover:text-primary"
          >
            Voltar ao início
          </Link>
          <BrandLogo size="sm" linkTo="/" alwaysShowText />
        </div>
      </header>
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-[max(1rem,env(safe-area-inset-left))] py-10 pr-[max(1rem,env(safe-area-inset-right))]">
        {children}
      </div>
    </div>
  );
}
