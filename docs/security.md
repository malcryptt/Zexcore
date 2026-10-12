# ZexCore Security Model

## 1. Multi-Tenancy & Data Isolation

Data isolation between tenants is the highest security priority in ZexCore. We use a **defense-in-depth** strategy:

1. **Application-Level Isolation**:
   - `AsyncLocalStorage` holds the active `TenantContext` for each asynchronous execution tree.
   - All Drizzle queries in business logic explicitly filter by `where(eq(table.tenantId, currentTenantId))`.
2. **Database-Level Isolation (Row Level Security - RLS)**:
   - PostgreSQL RLS policies are enabled on all multi-tenant tables.
   - Connection executes:
     ```sql
     SET LOCAL app.current_tenant_id = '<current_tenant_id>';
     ```
   - Policies enforce:
     ```sql
     CREATE POLICY tenant_isolation_policy ON <table>
       USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
     ```
   - Even if an application bug omits a tenant filter, the database will refuse to return or update rows from another tenant.

---

## 2. Authentication & Credential Storage

- **Password Hashing**: Passwords are saved with cryptographically secure, memory-hard hashing (`crypto.scrypt` with high N/r/p parameters and unique cryptographically random salts per password).
- **Session Tokens**: Stateless signed JWTs with short expiry (e.g. 24h), strictly bound to tenant and user ID.
- **Revocation**: Supported via user versioning / session invalidation counters in Redis or DB.

---

## 3. Capability-Based Access Control (CBAC)

Instead of hardcoded roles throughout the business logic, ZexCore evaluates **capabilities**:
- Roles (`owner`, `admin`, `member`, `viewer`) map to a set of capabilities (`records:create`, `records:delete`, `cms:pages:publish`, etc.).
- Custom roles and per-user permission overrides can grant or revoke specific capabilities.
- Every route handler specifies `requireCapability(name)`.

---

## 4. Audit Logging

Every state-changing mutation generates a tamper-evident audit record:
- Records include `tenant_id`, `user_id`, `action`, `entity_type`, `entity_id`, `changes_json`, `ip_address`, and `user_agent`.
- Audit logs are append-only. No UPDATE or DELETE operations are permitted on the `audit_log` table by application roles.

---

## 5. Threat Model

| Threat | Mitigation |
| :--- | :--- |
| **Tenant Data Leakage** | PostgreSQL RLS + AsyncLocalStorage application tenant filters. |
| **Privilege Escalation** | Capability-based middleware verified on every request; role changes require `tenant:admin` capability. |
| **Cross-Module Tampering** | Module boundaries enforced by repository topology and ESLint `no-restricted-imports`. Modules share state solely via the event bus. |
| **Injection Attacks** | Fully parameterized SQL queries via Drizzle ORM; runtime request payload validation using Zod schemas. |
