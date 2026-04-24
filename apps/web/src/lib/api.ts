/**
 * Base da API: em dev costuma ser relativo `/api/v1` (proxy do Vite).
 * Em produção: URL absoluta com `VITE_API_BASE` (ex.: https://xxx.railway.app/api/v1).
 */
function normaliseApiBase(raw: string | undefined): string {
  if (raw == null || raw === '') return '/api/v1';
  const b = String(raw).trim();
  if (b.startsWith('/')) {
    return b.replace(/\/+$/, '') || '/';
  }
  const withProtocol = /^https?:\/\//i.test(b) ? b : `https://${b}`;
  return withProtocol.replace(/\/+$/, '');
}

const API_BASE = normaliseApiBase(import.meta.env.VITE_API_BASE);

export type ApiErrorBody = { message?: string | string[]; statusCode?: number };

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    super(typeof body.message === 'string' ? body.message : 'Erro na requisição');
    this.status = status;
    this.body = body;
  }
}

/** Para queryFn/mutations onde `enabled` garante sessão; falha explícita se o invariante quebrar. */
export function requireToken(token: string | null | undefined): string {
  if (!token) throw new Error('Sessão necessária para esta requisição');
  return token;
}

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;
  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  const h = new Headers(headers);
  h.set('Accept', 'application/json');
  if (rest.body && !(rest.body instanceof FormData) && !h.has('Content-Type')) {
    h.set('Content-Type', 'application/json');
  }
  if (token) {
    h.set('Authorization', `Bearer ${token}`);
  }
  const res = await fetch(url, { ...rest, headers: h });
  const data = (await parseJson(res)) as ApiErrorBody | T;
  if (!res.ok) {
    const b = (data as ApiErrorBody) ?? {};
    const msg = Array.isArray(b.message) ? b.message.join(', ') : b.message;
    throw new ApiError(res.status, { ...b, message: msg ?? res.statusText });
  }
  return data as T;
}
