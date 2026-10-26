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
