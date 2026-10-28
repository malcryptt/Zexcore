/** Minimal Firestore REST client authenticated as a service account (WebCrypto, no Node APIs). */
export interface ServiceAccount { client_email: string; private_key: string; token_uri?: string; project_id?: string }

const b64url = (buf: ArrayBuffer | string): string => {
  const bytes = typeof buf === 'string' ? new TextEncoder().encode(buf) : new Uint8Array(buf);
  let s = ''; for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

function pemToDer(pem: string): ArrayBuffer {
  const b64 = pem.replace(/-----[A-Z ]+-----/g, '').replace(/\s+/g, '');
  const raw = atob(b64); const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out.buffer;
}

export async function signJwt(sa: ServiceAccount, nowSec: number): Promise<string> {
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(JSON.stringify({
    iss: sa.client_email, scope: 'https://www.googleapis.com/auth/datastore',
    aud: sa.token_uri ?? 'https://oauth2.googleapis.com/token', iat: nowSec, exp: nowSec + 3300,
  }));
  const key = await crypto.subtle.importKey('pkcs8', pemToDer(sa.private_key), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(`${header}.${claims}`));
  return `${header}.${claims}.${b64url(sig)}`;
}

let cached: { token: string; exp: number } | null = null;
export async function accessToken(sa: ServiceAccount, fetchFn: typeof fetch = fetch): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cached && cached.exp > now + 60) return cached.token;
  const res = await fetchFn(sa.token_uri ?? 'https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: await signJwt(sa, now) }),
  });
  if (!res.ok) throw new Error(`token exchange failed (${res.status})`);
  const j = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: j.access_token, exp: now + j.expires_in };
  return j.access_token;
}

export type FsValue = { stringValue?: string; timestampValue?: string; integerValue?: string; booleanValue?: boolean; nullValue?: null };
export interface FsDoc { name: string; fields?: Record<string, FsValue>; updateTime?: string }

export class Firestore {
  constructor(private project: string, private token: () => Promise<string>, private fetchFn: typeof fetch = fetch) {}
  private get base() { return `https://firestore.googleapis.com/v1/projects/${this.project}/databases/(default)/documents`; }
  docName(path: string) { return `projects/${this.project}/databases/(default)/documents/${path}`; }

  async get(path: string): Promise<FsDoc | null> {
    const res = await this.fetchFn(`${this.base}/${path}`, { headers: { authorization: `Bearer ${await this.token()}` } });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`firestore get ${path} failed (${res.status})`);
    return (await res.json()) as FsDoc;
  }

  /** Atomic multi-document write. `preconditions` guard against concurrent webhook deliveries. */
  async commit(writes: unknown[]): Promise<void> {
    const res = await this.fetchFn(`${this.base}:commit`, {
      method: 'POST', headers: { authorization: `Bearer ${await this.token()}`, 'content-type': 'application/json' },
      body: JSON.stringify({ writes }),
    });
    if (res.status === 409 || res.status === 400) {
      const body = await res.text();
      if (/FAILED_PRECONDITION|ABORTED|ALREADY_EXISTS/.test(body)) throw new ConflictError(body);
      throw new Error(`firestore commit failed (${res.status}) ${body.slice(0, 200)}`);
    }
    if (!res.ok) throw new Error(`firestore commit failed (${res.status})`);
  }
}
export class ConflictError extends Error {}

export const str = (d: FsDoc | null, k: string): string | undefined => d?.fields?.[k]?.stringValue;
export const ts = (d: FsDoc | null, k: string): Date | null => { const v = d?.fields?.[k]?.timestampValue; return v ? new Date(v) : null; };
