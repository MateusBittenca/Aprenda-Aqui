/** Após login, destino seguro dentro da área autenticada (/app). */
export function postLoginPath(fromState?: string | null): string {
  if (!fromState || fromState === '/' || fromState === '/login' || fromState === '/register') {
    return '/app';
  }
  if (fromState.startsWith('/app')) {
    return fromState;
  }
  if (
    fromState === '/me' ||
    fromState.startsWith('/courses') ||
    fromState.startsWith('/my-courses') ||
    fromState.startsWith('/lessons')
  ) {
    return `/app${fromState}`;
  }
  return '/app';
}
