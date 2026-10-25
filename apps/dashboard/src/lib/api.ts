const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';
const KEY = 'zx.session';

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) { super(message); }
}

let token: string | null = null;
try { token = localStorage.getItem(KEY); } catch { /* storage unavailable: session lasts for this tab only */ }

export const getToken = (): string | null => token;
export function setToken(t: string | null): void {
  token = t;
  try { t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY); } catch { /* ignore */ }
}

let onUnauthorized: () => void = () => {};
export const setUnauthorizedHandler = (fn: () => void): void => { onUnauthorized = fn; };

export async function api<T = any>(path: string, opts: { method?: string; body?: unknown; auth?: boolean } = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = opts;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (auth && token) headers.authorization = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError(0, 'Cannot reach ZexCore. Check your connection and try again.', 'network');
  }
  let data: any = null;
  const text = await res.text();
  if (text) { try { data = JSON.parse(text); } catch { data = { error: text.slice(0, 200) }; } }
  if (!res.ok) {
    if (res.status === 401 && auth && token) { setToken(null); onUnauthorized(); }
    const msg = data?.error ?? data?.message ?? (res.status === 429 ? 'Too many attempts. Please wait a moment.' : `Request failed (${res.status})`);
    throw new ApiError(res.status, msg, data?.code);
  }
  return data as T;
}
