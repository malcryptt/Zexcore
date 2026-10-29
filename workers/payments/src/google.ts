import type { Deps, Env } from './env';
import { b64url, enc } from './util';

async function importPkcs8(pem: string): Promise<CryptoKey> {
  const der = Uint8Array.from(atob(pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '')), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
}
async function signJwt(claims: Record<string, unknown>, key: CryptoKey, kid?: string): Promise<string> {
  const head = b64url(enc.encode(JSON.stringify({ alg: 'RS256', typ: 'JWT', ...(kid ? { kid } : {}) })));
  const body = b64url(enc.encode(JSON.stringify(claims)));
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, enc.encode(`${head}.${body}`));
  return `${head}.${body}.${b64url(sig)}`;
}

let tokenCache: { token: string; exp: number } | null = null;
export function resetTokenCache(): void { tokenCache = null; }

/** OAuth token for the service account. Scopes: Firestore, and Firebase Auth admin (only used for "sign out everywhere"). */
export async function accessToken(env: Env, d: Deps): Promise<string> {
  if (env.FIRESTORE_EMULATOR_HOST) return 'owner'; // the emulator treats "owner" as an admin that bypasses rules
  const nowS = Math.floor(d.now().getTime() / 1000);
  if (tokenCache && tokenCache.exp - 60 > nowS) return tokenCache.token;
  const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT) as { client_email: string; private_key: string; token_uri?: string };
  const assertion = await signJwt(
    { iss: sa.client_email, scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/identitytoolkit', aud: sa.token_uri ?? 'https://oauth2.googleapis.com/token', iat: nowS, exp: nowS + 3600 },
    await importPkcs8(sa.private_key),
  );
  const r = await d.fetch(sa.token_uri ?? 'https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  });
  if (!r.ok) throw new Error(`google token ${r.status}`);
  const j = (await r.json()) as { access_token: string; expires_in: number };
  tokenCache = { token: j.access_token, exp: nowS + j.expires_in };
  return j.access_token;
}
