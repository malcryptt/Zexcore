import { api, setToken, ApiError } from './api';
import { loadMe } from './session';

let clientIdP: Promise<string | null> | null = null;
export function googleClientId(): Promise<string | null> {
  clientIdP ??= api<{ clientId: string | null }>('/api/auth/google/config', { auth: false }).then((r) => r.clientId).catch(() => null);
  return clientIdP;
}

let scriptP: Promise<void> | null = null;
function loadScript(): Promise<void> {
  scriptP ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true; s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Google script blocked'));
    document.head.appendChild(s);
  });
  return scriptP;
}

export type GoogleOutcome =
  | { kind: 'signed-in' }
  | { kind: 'choose'; workspaces: { slug: string; name: string }[]; credential: string }
  | { kind: 'needs-signup'; email: string; name: string; credential: string };

/** Renders the official Google button into `host`. Hides the host if Google sign-in is not configured. */
export async function mountGoogleButton(host: HTMLElement, onResult: (o: GoogleOutcome) => void, onError: (m: string) => void): Promise<void> {
  const clientId = await googleClientId();
  if (!clientId) { host.classList.add('hidden'); host.previousElementSibling?.classList.add('hidden'); return; }
  try { await loadScript(); } catch { host.classList.add('hidden'); return; }
  const g = (window as any).google?.accounts?.id;
  if (!g) { host.classList.add('hidden'); return; }
  g.initialize({
    client_id: clientId,
    callback: async (resp: { credential: string }) => {
      try { onResult(await googleExchange(resp.credential)); }
      catch (e) { onError(e instanceof ApiError ? e.message : 'Google sign-in failed'); }
    },
  });
  g.renderButton(host, { theme: 'outline', size: 'large', text: 'continue_with', shape: 'rectangular', width: Math.min(host.clientWidth || 340, 400), logo_alignment: 'left' });
}

export async function googleExchange(credential: string, extra: { tenantName?: string; workspace?: string } = {}): Promise<GoogleOutcome> {
  const r = await api<any>('/api/auth/google', { method: 'POST', auth: false, body: { credential, ...extra } });
  if (r.token) { setToken(r.token); await loadMe(true); return { kind: 'signed-in' }; }
  if (r.workspaces) return { kind: 'choose', workspaces: r.workspaces, credential };
  return { kind: 'needs-signup', email: r.email, name: r.name, credential };
}
