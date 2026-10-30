import { ApiError } from './core';
import { fb, paymentsUrl } from './firebase';

/** Calls the ZexCore Worker with the signed-in user's Firebase ID token. */
export async function worker<T = Record<string, unknown>>(path: string, opts: { method?: 'GET' | 'POST'; body?: unknown; query?: Record<string, string>; auth?: boolean } = {}): Promise<T> {
  const base = paymentsUrl();
  if (!base) throw new ApiError(503, 'This feature is not switched on yet.', 'unavailable');
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers['content-type'] = 'application/json';
  if (opts.auth !== false) {
    const token = await fb().auth.currentUser?.getIdToken();
    if (!token) throw new ApiError(401, 'Sign in again to continue.', 'unauthenticated');
    headers.authorization = `Bearer ${token}`;
  }
  const qs = opts.query ? '?' + new URLSearchParams(opts.query).toString() : '';
  let res: Response;
  try { res = await fetch(`${base}${path}${qs}`, { method: opts.method ?? (opts.body !== undefined ? 'POST' : 'GET'), headers, body: opts.body === undefined ? undefined : JSON.stringify(opts.body) }); }
  catch { throw new ApiError(0, 'Cannot reach the ZexCore service. Check your connection and try again.', 'network'); }
  const j = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
  if (!res.ok) throw new ApiError(res.status, j.error ?? 'Something went wrong.', j.code);
  return j as T;
}
