import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Transição discreta entre rotas. Reaproveita a animação `fade-up` já
 * existente (via classe utilitária `.page-transition`) e troca a `key`
 * ao mudar de `pathname` para reiniciá-la. Respeita `reduce-interface-motion`.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="page-transition min-w-0">
      {children}
    </div>
  );
}
