import { Link } from 'react-router-dom';

export function AuthPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 dot-grid">
      <header className="border-b border-slate-200/60 bg-white/90 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <Link to="/" className="text-sm font-semibold text-slate-600 transition hover:text-blue-600">
            Voltar ao início
          </Link>
          <Link to="/" className="text-lg font-bold text-slate-900">
            Aprenda aqui<span className="text-blue-600">!</span>
          </Link>
        </div>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">{children}</div>
    </div>
  );
}
