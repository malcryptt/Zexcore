// The dashboard talks to Firebase (Auth + Firestore) through this one function. The route table in ./fb/router.ts keeps the
// original endpoint names so every view stays unchanged; there is no application server behind it.
import { ApiError } from './fb/core';
import { dispatch } from './fb/router';

export { ApiError };
const KEY = 'zx.session';

// A synchronous "was signed in" hint so route guards do not wait on Firebase; loadMe() confirms it against Firebase Auth.
let token: string | null = null;
try { token = localStorage.getItem(KEY); } catch { /* storage unavailable: session lasts for this tab only */ }

export const getToken = (): string | null => token;
export function setToken(t: string | null): void {
  token = t ? '1' : null;
  try { token ? localStorage.setItem(KEY, token) : localStorage.removeItem(KEY); } catch { /* ignore */ }
}

let onUnauthorized: () => void = () => {};
export const setUnauthorizedHandler = (fn: () => void): void => { onUnauthorized = fn; };

export async function api<T = any>(path: string, opts: { method?: string; body?: unknown; auth?: boolean } = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = opts;
  try {
    return (await dispatch(path, method, body)) as T;
  } catch (e) {
    if (e instanceof ApiError && e.status === 401 && auth && token && !path.startsWith('/api/auth/')) { setToken(null); onUnauthorized(); }
    throw e;
  }
}
