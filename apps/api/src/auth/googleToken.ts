import crypto from 'node:crypto';

export interface GoogleIdentity { email: string; name: string; sub: string }
type Jwk = { kid: string; kty: string; n: string; e: string; alg?: string };

const JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
let cache: { keys: Jwk[]; at: number } | null = null;

export async function fetchGoogleKeys(): Promise<Jwk[]> {
  if (cache && Date.now() - cache.at < 3_600_000) return cache.keys;
  const res = await fetch(JWKS_URL);
  if (!res.ok) throw new Error(`Google key fetch failed (${res.status})`);
  const body = (await res.json()) as { keys: Jwk[] };
  cache = { keys: body.keys, at: Date.now() };
  return body.keys;
}

const b64 = (s: string) => Buffer.from(s, 'base64url');

/**
 * Verifies a Google Identity Services ID token locally: RS256 signature against Google's published keys,
 * issuer, audience (our client id), expiry and a verified email. Returns null for anything else.
 */
export async function verifyGoogleIdToken(
  token: string,
  opts: { clientId: string; getKeys?: () => Promise<Jwk[]>; now?: number },
): Promise<GoogleIdentity | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [h, p, s] = parts as [string, string, string];
    const header = JSON.parse(b64(h).toString('utf8'));
    if (header.alg !== 'RS256') return null;
    const keys = await (opts.getKeys ?? fetchGoogleKeys)();
    const jwk = keys.find((k) => k.kid === header.kid);
    if (!jwk) return null;
    const ok = crypto.verify('RSA-SHA256', Buffer.from(`${h}.${p}`), crypto.createPublicKey({ key: jwk as any, format: 'jwk' }), b64(s));
    if (!ok) return null;
    const c = JSON.parse(b64(p).toString('utf8'));
    const now = Math.floor((opts.now ?? Date.now()) / 1000);
    if (c.iss !== 'accounts.google.com' && c.iss !== 'https://accounts.google.com') return null;
    if (c.aud !== opts.clientId) return null;
    if (typeof c.exp !== 'number' || c.exp <= now) return null;
    if (c.email_verified !== true && c.email_verified !== 'true') return null;
    if (typeof c.email !== 'string' || typeof c.sub !== 'string') return null;
    return { email: c.email.toLowerCase(), name: typeof c.name === 'string' && c.name ? c.name : c.email.split('@')[0], sub: c.sub };
  } catch {
    return null;
  }
}
