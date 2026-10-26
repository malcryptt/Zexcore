import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import crypto from 'node:crypto';
import {
  getSqlClient,
  getAdminSqlClient,
  closeDatabaseConnection,
  withTenantDb,
  sql,
  logAuditEvent,
  verifyAuditChain,
  checkRuntimeRoleSafety,
  resolveTenant,
  hashPassword,
  verifyAuthToken,
  signAuthToken,
} from '../../packages/core/src/index.js';
import { createTenant } from '../helpers/db.js';

/** Runs `fn` on the RUNTIME pool inside a tx scoped to `tenantId` (what request handlers get). */
async function asRuntime<T>(tenantId: string | null, fn: (tx: any) => Promise<T>): Promise<T> {
  return (await getSqlClient().begin(async (tx) => {
    if (tenantId) await tx.unsafe(`SELECT set_config('app.current_tenant_id', $1, true)`, [tenantId]);
    return fn(tx);
  })) as T;
}

describe('Database hardening: the runtime role cannot break isolation', () => {
  let A: string;
  let B: string;
  let ctA: string;
  let ctB: string;

  beforeAll(async () => {
    const sfx = crypto.randomBytes(4).toString('hex');
    A = await createTenant(`hard-a-${sfx}`);
    B = await createTenant(`hard-b-${sfx}`);
    ctA = (await asRuntime(A, (tx) => tx.unsafe(`INSERT INTO content_types (tenant_id,slug,name,schema_json) VALUES ($1,'t','T','{}') RETURNING id`, [A])))[0].id;
    ctB = (await asRuntime(B, (tx) => tx.unsafe(`INSERT INTO content_types (tenant_id,slug,name,schema_json) VALUES ($1,'t','T','{}') RETURNING id`, [B])))[0].id;
    await asRuntime(B, (tx) =>
      tx.unsafe(`INSERT INTO records (tenant_id,content_type_id,slug,data) VALUES ($1,$2,'secret',$3)`, [B, ctB, JSON.stringify({ note: 'B-SECRET' })]),
    );
  });

  afterAll(async () => {
    await closeDatabaseConnection();
  });

  it('the old app.bypass_rls setting is inert', async () => {
    const rows = await asRuntime(A, async (tx) => {
      await tx.unsafe(`SELECT set_config('app.bypass_rls','on',true)`);
      return tx.unsafe(`SELECT * FROM records`);
    });
    expect(rows.length).toBe(0);
    const ins = asRuntime(A, async (tx) => {
      await tx.unsafe(`SELECT set_config('app.bypass_rls','on',true)`);
      return tx.unsafe(`INSERT INTO records (tenant_id,content_type_id,data) VALUES ($1,$2,'{}')`, [B, ctB]);
    });
    await expect(ins).rejects.toThrow(/row-level security|violates/i);
  });

  it('runtime role cannot disable RLS, drop policies or create objects', async () => {
    for (const stmt of [
      'ALTER TABLE records DISABLE ROW LEVEL SECURITY',
      'ALTER TABLE records NO FORCE ROW LEVEL SECURITY',
      'DROP POLICY tenant_isolation_records ON records',
      'CREATE TABLE evil (x int)',
      'DROP TRIGGER audit_log_no_mutate ON audit_log',
      'ALTER ROLE zexcore_app BYPASSRLS',
    ]) {
      await expect(asRuntime(A, (tx) => tx.unsafe(stmt)), stmt).rejects.toThrow(/must be owner|permission denied|not permitted|insufficient/i);
    }
  });

  it('runtime role cannot read users, rewrite tenants, or see other tenants', async () => {
    await expect(asRuntime(A, (tx) => tx.unsafe(`SELECT * FROM users`))).rejects.toThrow(/permission denied/i);
    await expect(asRuntime(A, (tx) => tx.unsafe(`UPDATE tenants SET tier='dedicated' WHERE id=$1`, [A]))).rejects.toThrow(/permission denied/i);
    await expect(asRuntime(A, (tx) => tx.unsafe(`INSERT INTO tenants (slug,name) VALUES ('x','x')`))).rejects.toThrow(/permission denied/i);
    const own = await asRuntime(A, (tx) => tx.unsafe(`SELECT id FROM tenants`));
    expect(own.map((r: any) => r.id)).toEqual([A]);
    const none = await asRuntime(null, (tx) => tx.unsafe(`SELECT id FROM tenants`));
    expect(none.length).toBe(0);
  });

  it('a record cannot reference another tenant\'s content type (composite FK)', async () => {
    await expect(
      asRuntime(B, (tx) => tx.unsafe(`INSERT INTO records (tenant_id,content_type_id,data) VALUES ($1,$2,'{}')`, [B, ctA])),
    ).rejects.toThrow(/foreign key|violates/i);
  });

  it('runtime role cannot call internal audit/billing primitives or forge another tenant\'s audit', async () => {
    await expect(
      asRuntime(A, (tx) => tx.unsafe(`SELECT * FROM zex_audit_append_unchecked($1::uuid,NULL,'system','x','e','1','{}'::jsonb,NULL,NULL)`, [B])),
    ).rejects.toThrow(/permission denied/i);
    await expect(
      asRuntime(A, (tx) => tx.unsafe(`SELECT * FROM zex_audit_append($1::uuid,NULL,'system','x','e','1','{}'::jsonb,NULL,NULL)`, [B])),
    ).rejects.toThrow(/does not match session tenant/i);
    await expect(
      asRuntime(A, (tx) => tx.unsafe(`UPDATE billing_payments SET status='paid'`)),
    ).rejects.toThrow(/permission denied/i);
  });

  it('role safety check passes for the runtime role', async () => {
    const report = await checkRuntimeRoleSafety();
    expect(report.problems).toEqual([]);
    expect(report.ok).toBe(true);
  });
});

describe('Audit log: append-only, hash-chained, tamper-evident', () => {
  let T: string;
  beforeAll(async () => {
    T = await createTenant(`audit-${crypto.randomBytes(4).toString('hex')}`);
  });
  afterAll(async () => {
    await closeDatabaseConnection();
  });

  const log = (i: number) =>
    logAuditEvent({ tenantId: T, userId: 'not-a-uuid', principalType: 'tenant_user', action: 'test.event', entity: 'thing', entityId: String(i), changes: { i, nested: { b: 2, a: 1 } } });

  it('chains concurrent appends without forks or gaps', async () => {
    await Promise.all(Array.from({ length: 25 }, (_, i) => log(i)));
    const v = await verifyAuditChain(T);
    expect(v.valid).toBe(true);
    expect(v.total).toBe(25);
    expect(v.headSeq).toBe(25);
    expect(v.headHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('runtime role cannot insert, update, delete or truncate audit_log directly', async () => {
    for (const stmt of [
      `INSERT INTO audit_log (tenant_id,principal_type,action,entity,entity_id) VALUES ('${T}','x','x','x','x')`,
      `UPDATE audit_log SET action='x'`,
      `DELETE FROM audit_log`,
      `TRUNCATE audit_log`,
    ]) {
      await expect(asRuntime(T, (tx) => tx.unsafe(stmt)), stmt).rejects.toThrow(/permission denied/i);
    }
  });

  it('even the schema owner cannot UPDATE/DELETE/TRUNCATE (trigger)', async () => {
    const admin = getAdminSqlClient();
    for (const stmt of [`UPDATE audit_log SET action='x' WHERE tenant_id='${T}'`, `DELETE FROM audit_log WHERE tenant_id='${T}'`, `TRUNCATE audit_log`]) {
      await expect(
        admin.begin(async (tx) => {
          await tx.unsafe(`SELECT set_config('app.current_tenant_id','${T}',true)`);
          await tx.unsafe(stmt);
        }),
        stmt,
      ).rejects.toThrow(/append-only/i);
    }
  });

  it('detects tampering with row content, deletion in the middle, and broken links', async () => {
    const admin = getAdminSqlClient();
    const tamper = async (stmt: string) =>
      admin.begin(async (tx) => {
        await tx.unsafe(`SELECT set_config('app.current_tenant_id','${T}',true)`);
        await tx.unsafe(`ALTER TABLE audit_log DISABLE TRIGGER audit_log_no_mutate`);
        await tx.unsafe(stmt);
        await tx.unsafe(`ALTER TABLE audit_log ENABLE TRIGGER audit_log_no_mutate`);
      });

    // 1) edit content of row 10
    await tamper(`UPDATE audit_log SET changes='{"i":999}'::jsonb WHERE tenant_id='${T}' AND seq=10`);
    let v = await verifyAuditChain(T);
    expect(v.valid).toBe(false);
    expect(v.brokenSeq).toBe(10);
    expect(v.reason).toMatch(/does not match its hash/);

    // 2) attacker also "fixes" the hash of row 10 -> next link breaks at 11
    await admin.begin(async (tx) => {
      await tx.unsafe(`SELECT set_config('app.current_tenant_id','${T}',true)`);
      await tx.unsafe(`ALTER TABLE audit_log DISABLE TRIGGER audit_log_no_mutate`);
      await tx.unsafe(
        `UPDATE audit_log SET hash = zex_audit_hash(prev_hash, tenant_id, seq, user_id, principal_type, action, entity, entity_id, changes, created_at)
          WHERE tenant_id='${T}' AND seq=10`,
      );
      await tx.unsafe(`ALTER TABLE audit_log ENABLE TRIGGER audit_log_no_mutate`);
    });
    v = await verifyAuditChain(T);
    expect(v.valid).toBe(false);
    expect(v.brokenSeq).toBe(11);

    // 3) delete a middle row -> sequence gap
    await tamper(`DELETE FROM audit_log WHERE tenant_id='${T}' AND seq=5`);
    v = await verifyAuditChain(T);
    expect(v.valid).toBe(false);
    expect(v.brokenSeq).toBe(6);
    expect(v.reason).toMatch(/sequence gap/);
  });

  it('a tenant cannot verify another tenant\'s chain', async () => {
    const other = await createTenant(`audit-other-${crypto.randomBytes(3).toString('hex')}`);
    await expect(
      asRuntime(other, (tx) => tx.unsafe(`SELECT * FROM zex_audit_verify($1::uuid)`, [T])),
    ).rejects.toThrow(/does not match session tenant/i);
    void resolveTenant; void withTenantDb; void sql; void hashPassword; void verifyAuthToken; void signAuthToken;
  });
});
