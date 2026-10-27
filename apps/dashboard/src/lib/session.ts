import { api, getToken, setToken, ApiError } from './api';

export interface Me {
  user: { id: string; email: string | null; name: string | null; emailVerified?: boolean };
  tenant: { id: string; slug: string; name: string; tier: string; plan_cycle: string | null; plan_expires_at: string | null };
  role: 'owner' | 'admin' | 'member' | 'viewer' | null;
  isPlatformAdmin: boolean;
}

let me: Me | null = null;
export const current = (): Me | null => me;
export const isSignedIn = (): boolean => !!getToken();
export const canManage = (): boolean => !!me && (me.role === 'owner' || me.role === 'admin' || me.role === 'member' || me.isPlatformAdmin);
export const canAdmin = (): boolean => !!me && (me.role === 'owner' || me.role === 'admin' || me.isPlatformAdmin);

export async function loadMe(force = false): Promise<Me | null> {
  if (!getToken()) { me = null; return null; }
  if (me && !force) return me;
  try {
    me = await api<Me>('/api/auth/me');
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 400 || e.status === 403)) { setToken(null); me = null; return null; }
    throw e;
  }
  return me;
}

export type LoginResult = { ok: true } | { ok: false; workspaces: { slug: string; name: string }[] };

export async function login(email: string, password: string, tenantSlug?: string): Promise<LoginResult> {
  const r = await api<{ token?: string; workspaces?: { slug: string; name: string }[] }>('/api/auth/login', {
    method: 'POST', auth: false, body: { email, password, ...(tenantSlug ? { tenantSlug } : {}) },
  });
  if (!r.token) return { ok: false, workspaces: r.workspaces ?? [] };
  setToken(r.token); me = null;
  await loadMe(true);
  return { ok: true };
}

export async function register(input: { tenantName: string; name: string; email: string; password: string; tenantSlug?: string }): Promise<void> {
  const r = await api<{ token: string }>('/api/auth/register', { method: 'POST', auth: false, body: input });
  setToken(r.token); me = null;
  await loadMe(true);
}

export function logout(): void {
  // Revoke the session on the server first (best effort), so a copied token stops working immediately.
  if (getToken()) void api('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
  setToken(null); me = null;
}
