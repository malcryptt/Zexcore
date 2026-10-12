import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  getDb,
  closeDatabaseConnection,
  initializeDatabaseSchema,
  withTenantDb,
  runWithTenant,
  getTenantContext,
  tenants,
  users,
  memberships,
  contentTypes,
  records,
  auditLog,
  eq,
  sql,
} from '../../packages/core/src/index.js';

describe('Tenant Isolation & RLS Security Attacks', () => {
  let tenantAId: string;
  let tenantBId: string;
  let userAId: string;
  let userBId: string;
  let ctAId: string;
  let ctBId: string;
  let recordAId: string;
  let recordBId: string;

  beforeAll(async () => {
    // 1. Initialize schema and RLS policies on Postgres
    await initializeDatabaseSchema();

    const db = getDb();

    // Bypass RLS during initial fixture wipe
    await db.execute(sql`SELECT set_config('app.bypass_rls', 'on', false)`);

    // 2. Create Tenant A and Tenant B with unique slugs
    const slugA = `test-tenant-alpha-${Date.now()}`;
    const slugB = `test-tenant-beta-${Date.now()}`;

    const [tA] = await db
      .insert(tenants)
      .values({
        slug: slugA,
        name: 'Alpha Corp',
        tier: 'standard',
      })
      .returning();
    tenantAId = tA!.id;

    const [tB] = await db
      .insert(tenants)
      .values({
        slug: slugB,
        name: 'Beta LLC',
        tier: 'standard',
      })
      .returning();
    tenantBId = tB!.id;

    // 3. Create Users
    const [uA] = await db
      .insert(users)
      .values({
        email: `alice-${Date.now()}@alpha.test`,
        passwordHash: 'dummy-hash',
        name: 'Alice Alpha',
      })
      .returning();
    userAId = uA!.id;

    const [uB] = await db
      .insert(users)
      .values({
        email: `bob-${Date.now()}@beta.test`,
        passwordHash: 'dummy-hash',
        name: 'Bob Beta',
      })
      .returning();
    userBId = uB!.id;

    // Memberships
    await db.insert(memberships).values([
      { tenantId: tenantAId, userId: userAId, principalType: 'tenant_admin', role: 'admin' },
      { tenantId: tenantBId, userId: userBId, principalType: 'tenant_admin', role: 'admin' },
    ]);

    // Re-lock RLS
    await db.execute(sql`SELECT set_config('app.bypass_rls', 'off', false)`);

    // 4. Create Content Type and Records for Tenant A within tenant A scope
    await withTenantDb(tenantAId, async (tx) => {
      const [ctA] = await tx
        .insert(contentTypes)
        .values({
          tenantId: tenantAId,
          slug: 'lead',
          name: 'Alpha Lead',
          schemaJson: {
            fields: [
              { key: 'company', label: 'Company', type: 'string', required: true },
              { key: 'dealSize', label: 'Deal Size', type: 'number' },
            ],
          },
        })
        .returning();
      ctAId = ctA!.id;

      const [recA] = await tx
        .insert(records)
        .values({
          tenantId: tenantAId,
          contentTypeId: ctAId,
          data: { company: 'Alpha Confidential Client', dealSize: 500000 },
          status: 'published',
        })
        .returning();
      recordAId = recA!.id;
    });

    // 5. Create Content Type and Records for Tenant B within tenant B scope
    await withTenantDb(tenantBId, async (tx) => {
      const [ctB] = await tx
        .insert(contentTypes)
        .values({
          tenantId: tenantBId,
          slug: 'lead',
          name: 'Beta Lead',
          schemaJson: {
            fields: [
              { key: 'company', label: 'Company', type: 'string', required: true },
            ],
          },
        })
        .returning();
      ctBId = ctB!.id;

      const [recB] = await tx
        .insert(records)
        .values({
          tenantId: tenantBId,
          contentTypeId: ctBId,
          data: { company: 'Beta Secret Client' },
          status: 'published',
        })
        .returning();
      recordBId = recB!.id;
    });
  });

  afterAll(async () => {
    await closeDatabaseConnection();
  });

  it('Attack 1: Scoped to Tenant B, querying records MUST NOT return Tenant A records', async () => {
    await withTenantDb(tenantBId, async (tx) => {
      // Intentionally omitting WHERE tenant_id to simulate an application filter omission bug!
      const fetchedRecords = await tx.select().from(records);

      // Only Tenant B's records can be returned by Postgres engine
      expect(fetchedRecords.length).toBe(1);
      expect(fetchedRecords[0]!.id).toBe(recordBId);
      expect(fetchedRecords.some((r) => r.id === recordAId)).toBe(false);
    });
  });

  it('Attack 2: Scoped to Tenant B, direct lookup of Tenant A record ID MUST return empty', async () => {
    await withTenantDb(tenantBId, async (tx) => {
      const result = await tx.select().from(records).where(eq(records.id, recordAId));
      expect(result.length).toBe(0);
    });
  });

  it('Attack 3: Scoped to Tenant B, attempting to UPDATE Tenant A record MUST affect 0 rows', async () => {
    await withTenantDb(tenantBId, async (tx) => {
      const updated = await tx
        .update(records)
        .set({ data: { company: 'HACKED BY TENANT B' } })
        .where(eq(records.id, recordAId))
        .returning();

      expect(updated.length).toBe(0);
    });

    // Verify Tenant A's record was not changed
    await withTenantDb(tenantAId, async (tx) => {
      const [rec] = await tx.select().from(records).where(eq(records.id, recordAId));
      expect(rec!.data).toEqual({ company: 'Alpha Confidential Client', dealSize: 500000 });
    });
  });

  it('Attack 4: Scoped to Tenant B, attempting to INSERT a row with tenant_id = Tenant A MUST fail RLS check', async () => {
    await expect(
      withTenantDb(tenantBId, async (tx) => {
        await tx.insert(records).values({
          tenantId: tenantAId, // Spoofed tenant ID!
          contentTypeId: ctBId,
          data: { company: 'Illegal Spoofed Record' },
        });
      }),
    ).rejects.toThrow(/row-level security policy/i);
  });

  it('Attack 5: Without any tenant session setting, queries MUST return 0 rows on tenant tables', async () => {
    const db = getDb();
    // Default connection session with app.current_tenant_id not set
    await db.execute(sql`SELECT set_config('app.current_tenant_id', '', false)`);
    await db.execute(sql`SELECT set_config('app.bypass_rls', 'off', false)`);

    const result = await db.select().from(records);
    expect(result.length).toBe(0);
  });

  it('Attack 6: AsyncLocalStorage context does not cross-contaminate concurrent tasks', async () => {
    const contextA = { tenantId: tenantAId, tenantSlug: 'test-tenant-alpha' };
    const contextB = { tenantId: tenantBId, tenantSlug: 'test-tenant-beta' };

    const taskA = async () => {
      return runWithTenant(contextA, async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return getTenantContext();
      });
    };

    const taskB = async () => {
      return runWithTenant(contextB, async () => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        return getTenantContext();
      });
    };

    const [resA, resB] = await Promise.all([taskA(), taskB()]);

    expect(resA?.tenantId).toBe(tenantAId);
    expect(resB?.tenantId).toBe(tenantBId);
  });
});
