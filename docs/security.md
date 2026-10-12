# ZexCore Security Model & Hardened Invariants

## 1. Multi-Tenancy & Postgres RLS Defense-in-Depth

Tenant isolation is the make-or-break foundation of ZexCore. We use multi-layered defense-in-depth:

### A. RLS Engine Rules
1. **`FORCE ROW LEVEL SECURITY`**: Table owners bypass RLS by default. All tenant-scoped tables must have `FORCE ROW LEVEL SECURITY` enabled.
2. **Non-Superuser Runtime Role (`zexcore_app`)**: The application connects using a dedicated role with `NOSUPERUSER` and `NOBYPASSRLS`. Tests and runtime queries must never run as `postgres`.
3. **Explicit `WITH CHECK` Clauses**: Write policies must explicitly declare `WITH CHECK` matching `USING` to prevent spoofing tenant IDs on inserts and updates.
4. **Views**: Must specify `WITH (security_invoker = true)` (Postgres 15+) to prevent views from executing with view-owner privileges and bypassing RLS.
5. **Security Definer Functions**: Always set `SET search_path = public, pg_temp` explicitly.

### B. Cross-Tenant Foreign Key & Unique Constraint Hardening
Foreign key checks in PostgreSQL run **outside** RLS. To prevent a tenant from referencing another tenant’s rows:
- **Composite Primary & Unique Keys**: Referenced tables must define composite unique constraints `(tenant_id, id)`.
- **Composite Foreign Keys**: Foreign keys must reference `(tenant_id, foreign_id) REFERENCES parent(tenant_id, id) ON DELETE CASCADE`.
- **Unique Indexes**: Always place `tenant_id` as the **first column** in composite unique indexes and performance indexes.

---

## 2. Cryptographic Append-Only Audit Trail

The audit log is an immutable record of all state mutations:
1. **Database Grant Enforcement**:
   ```sql
   REVOKE UPDATE, DELETE ON audit_log FROM zexcore_app;
   ```
   The application role can only `INSERT` and `SELECT` audit logs.
2. **Cryptographic Hash-Chaining**:
   Each audit entry stores `prev_hash` and `hash` (`SHA-256(prev_hash + tenant_id + action + entity + entity_id + changes + timestamp)`). Any deletion or mutation of historical audit rows is mathematically detectable.

---

## 3. Dynamic Rules & Formula Execution Security

- **No Arbitrary Code Execution**: Tenant rules, expressions, and formulas must **NEVER** run as JavaScript (`eval`, `new Function`, and `vm2` are strictly forbidden).
- **Deterministic DSL / AST Interpreter**: Evaluator is an AST interpreter (or CEL sandbox) with strict runtime limits:
  - Step counter limit (max 10,000 instructions)
  - Time limit (max 50ms execution timeout)
  - Memory ceiling

---

## 4. SSRF & Network Action Defenses

Tenant-configured webhooks and outgoing HTTP actions:
1. **Private Range Filtering**: Rejects requests targeting private, loopback, or link-local ranges:
   - `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`
   - `169.254.169.254` (Cloud metadata service)
   - IPv6 link-local (`fe80::/10`) and loopback (`::1`)
2. **DNS Re-resolution Check**: Verifies resolved IP address right before socket creation to prevent DNS rebinding attacks.
3. **Signed Payloads**: All outgoing webhooks include HMAC signatures (`X-ZexCore-Signature`) using tenant-specific signing secrets.

---

## 5. Content Security & XSS Mitigation

1. **Rich-Text Sanitization**: Sanitized on write using strict HTML tag and attribute allowlists.
2. **Cross-Origin Separation**: Public sites and tenant admin panels must be served from separate subdomains / origins.
3. **SVG File Restrictions**: SVGs are treated as binary attachments or sanitized before rendering to eliminate embedded scripts.
4. **Media Uploads**:
   - Content-type verified by file magic bytes (not file extension).
   - EXIF metadata stripped on image ingestion.
   - Upload size limits enforced at gateway level.

---

## 6. Authentication & Principal Protections

- **Password Hashing**: `crypto.scrypt` with unique 16-byte random salts per password, with upgrade path to `argon2id`.
- **API Keys & Device Tokens**: Displayed only once at generation time; stored as salted cryptographic hashes.
- **MFA Required**: Enforced for all `platform_admin` and `tenant_admin` principals.
- **Login Rate Limiting**: Per-IP and per-account exponential backoff on authentication failures.

---

## 7. Hardened Clinic Tier & Data Privacy Compliance

For healthcare tenants (`tier: "hardened_clinic"`):
- **Envelope Encryption**: Field data encrypted using tenant-specific Data Encryption Keys (DEKs) via AES-256-GCM.
- **Authenticated Additional Data (AAD)**: Encrypted fields use `(tenant_id, record_id, field_key)` as AAD to prevent ciphertext swapping.
- **Blind Indexing**: Searchable encrypted fields use HMAC-SHA256 blind indexes.
- **Regulatory Compliance**: Aligned with Nigeria Data Protection Act (NDPA 2023) and UK/EU GDPR requirements for data processors (Article 28 DPA, consent logging, and export-on-exit).
