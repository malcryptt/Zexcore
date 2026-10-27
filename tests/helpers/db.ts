import { getAdminSqlClient } from '../../packages/core/src/index.js';

/**
 * Test fixtures are provisioned with the ADMIN (schema owner) connection, exactly like a real
 * onboarding job would be. Tenant-scoped tables are FORCE-RLS, so the tenant GUC is set per tx.
 */
export async function adminProvision<T>(
  tenantId: string | null,
  fn: (tx: ReturnType<typeof getAdminSqlClient>) => Promise<T>,
): Promise<T> {
  const admin = getAdminSqlClient();
  return (await admin.begin(async (tx) => {
    if (tenantId) await tx.unsafe(`SELECT set_config('app.current_tenant_id', $1, true)`, [tenantId]);
    return fn(tx as any);
  })) as T;
}

export async function createTenant(slug: string, name = slug, tier = 'standard'): Promise<string> {
  const admin = getAdminSqlClient();
  const [t] = await admin.unsafe<{ id: string }[]>(
    `INSERT INTO tenants (slug, name, tier) VALUES ($1,$2,$3) RETURNING id`,
    [slug, name, tier] as any,
  );
  return t!.id;
}

import crypto from 'node:crypto';
import { signAuthToken, createSession, type AuthTokenPayload } from '../../packages/core/src/index.js';

const asUuid = (v?: string): string => {
  if (v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)) return v;
  const h = crypto.createHash('md5').update(v ?? crypto.randomUUID()).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
};

/**
 * A token the API will accept: every token must be bound to a live server-side session, which needs a real user row.
 * Mirrors what login does, without going through password hashing.
 */
export async function testToken(p: Omit<AuthTokenPayload, 'sid'>): Promise<string> {
  const userId = asUuid(p.userId);
  const admin = getAdminSqlClient();
  await admin.unsafe(
    `INSERT INTO users (id, email, password_hash, name, email_verified_at) VALUES ($1::uuid, $2, 'x', 'Test User', now()) ON CONFLICT (id) DO NOTHING`,
    [userId, `${userId}@test.local`] as any,
  );
  const sid = await createSession(userId, { userAgent: 'vitest', ip: '127.0.0.1' });
  return signAuthToken({ ...p, userId, sid });
}
