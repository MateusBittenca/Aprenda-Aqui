import { Link } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';

export function AuthPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface dot-grid text-on-surface">
      <header className="border-b border-surface-container-high/80 bg-surface-container-lowest/90 px-4 py-4 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <Link to="/" className="text-sm font-semibold text-on-surface-variant transition hover:text-primary">
            Voltar ao início
          </Link>
          <BrandLogo size="sm" linkTo="/" />
        </div>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">{children}</div>
    </div>
  );
}
