import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Volta ao topo ao navegar — evita páginas “presas” no scroll anterior. */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
