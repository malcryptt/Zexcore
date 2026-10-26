# Production database model

ZexCore isolates tenants in the database engine, not just in application code. This only holds if the
deployment follows the two-role model below. In production the API **refuses to boot** if it doesn't.

## Roles

| Role | Env var | Used for | Can |
|---|---|---|---|
| `zexcore_owner` (schema owner) | `ADMIN_DATABASE_URL` | boot-time migrations, RLS policies, security functions, module DDL | everything on the schema; never used while serving requests |
| `zexcore_app` (runtime) | `DATABASE_URL` | all request handling | read/write tenant data **only under a tenant session**; nothing else |

The runtime role is created `NOSUPERUSER NOBYPASSRLS NOCREATEROLE NOCREATEDB`, owns nothing, and has
no `CREATE` on the schema, so it cannot `DISABLE ROW LEVEL SECURITY`, drop policies/triggers, or add tables.

Create the roles once with `scripts/db-setup-roles.sql` (see the header for the managed-DB variant).
`docker compose` and `scripts/dev-db.sh` do this for you.

## What the database enforces

- **Tenant tables** (`memberships`, `content_types`, `records`, `audit_log`, every module table):
  `ENABLE` + `FORCE ROW LEVEL SECURITY`, policy `tenant_id = app.current_tenant_id`. There is no bypass
  setting. Records can only reference a content type of the same tenant (composite FK).
- **`tenants`**: the runtime role can read only its own row and cannot write. **`users`**: invisible
  to the runtime role. Login, tenant resolution and plan activation use narrow `SECURITY DEFINER`
  functions (`zex_login_lookup`, `zex_resolve_tenant`, `zex_activate_plan`).
- **`audit_log`**: append-only. The runtime role has `SELECT` only; rows are written by
  `zex_audit_append()`, which assigns the per-tenant sequence number, previous hash, timestamp and
  SHA-256 inside the database under an advisory lock. `UPDATE`/`DELETE`/`TRUNCATE` are blocked by
  triggers even for the schema owner. `zex_audit_verify()` recomputes the whole chain and reports the
  first bad or missing row.
- **Billing**: the browser never sets prices or plans. `POST /api/billing/checkout` creates a
  server-priced intent; a signature-verified gateway webhook is matched **by our reference**, the paid
  amount/currency is checked in SQL, and only then is the tenant upgraded (idempotent, audited).

## Known limits (be honest with customers)

- A party that can execute **arbitrary SQL as the runtime role** can still choose its own
  `app.current_tenant_id`. RLS protects against application bugs (missing `WHERE`, IDOR), not against full
  SQL injection with a chosen tenant; keep all queries parameterised. Per-tenant database roles
  would close this and are the next step for regulated customers.
- The schema owner (and anyone with DBA access) can drop the audit triggers or truncate with them
  disabled. The hash chain makes that **detectable**, not impossible. For stronger guarantees,
  periodically export `headSeq`/`headHash` (from `verifyAuditChain`) to an external store (object
  lock / email / second system) so tail truncation is also detectable.
- Offboarding a tenant with audit history is a DBA procedure (the audit trigger blocks cascade deletes).
