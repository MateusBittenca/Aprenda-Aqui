const API_BASE = import.meta.env.VITE_API_BASE ?? '/api/v1';

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
