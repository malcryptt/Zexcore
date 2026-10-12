/**
 * ZexCore Security & Compliance Page
 * Rigorous Enterprise Security Model & Cryptographic Guarantees
 */

import { renderNavbar } from '../components/navbar';
import { renderFooter } from '../components/footer';

export function renderSecurityPage(): string {
  return `
    <div class="page-wrapper">
      ${renderNavbar('security')}

      <main>
        <!-- Page Header -->
        <section class="section-white page-intro-section">
          <div class="site-container">
            <div class="page-intro-header">
              <div class="section-eyebrow">ENTERPRISE ASSURANCE</div>
              <h1 class="page-intro-title">Security Model &amp; Hardened Invariants</h1>
              <p class="page-intro-desc">
                Tenant isolation and data privacy are not marketing claims in ZexCore. They are mathematically verifiable properties enforced by the PostgreSQL 17 engine and cryptographic primitives.
              </p>
            </div>
          </div>
        </section>

        <!-- ── SECTION 1: POSTGRES RLS DEFENSE IN DEPTH ─────────────────── -->
        <section class="section-gray section-padded" id="rls">
          <div class="site-container split-feature-row">
            <div class="split-col-text">
              <div class="cap-badge">LAYER 1 &mdash; DATABASE ENGINE</div>
              <h2 class="split-heading">PostgreSQL Row-Level Security Defense-in-Depth</h2>
              <p class="split-p">
                Application-level tenant filtering (such as injecting <code>where tenant_id = x</code> in ORM queries) is prone to developer oversight. ZexCore offloads tenant isolation entirely to the PostgreSQL engine:
              </p>
              <ul class="bullet-feature-list">
                <li>
                  <strong>FORCE ROW LEVEL SECURITY:</strong> Mandated on all tenant-scoped tables. Table owners and system functions cannot bypass policies.
                </li>
                <li>
                  <strong>Dedicated Non-Superuser Role:</strong> The application connects strictly as <code>zexcore_app</code> (<code>NOSUPERUSER</code>, <code>NOBYPASSRLS</code>).
                </li>
                <li>
                  <strong>Symmetric WITH CHECK Clauses:</strong> Insert and update policies strictly declare <code>WITH CHECK</code> matching <code>USING</code>, preventing tenant ID spoofing.
                </li>
                <li>
                  <strong>Security Invoker Views:</strong> Views declare <code>WITH (security_invoker = true)</code>, preventing elevation of privileges.
                </li>
              </ul>
            </div>

            <div class="split-col-visual">
              <div class="code-editor-card">
                <div class="code-editor-title">postgres-rls-policy.sql</div>
                <pre class="code-pre"><code>-- Enable & Force RLS on all tenant tables
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices FORCE ROW LEVEL SECURITY;

-- Enforce strict symmetric isolation policy
CREATE POLICY tenant_isolation_policy
ON devices FOR ALL
TO zexcore_app
USING (
  tenant_id = current_setting('app.current_tenant_id', true)::uuid
)
WITH CHECK (
  tenant_id = current_setting('app.current_tenant_id', true)::uuid
);</code></pre>
              </div>
            </div>
          </div>
        </section>

        <!-- ── SECTION 2: COMPOSITE KEYS & FOREIGN KEY HARDENING ────────── -->
        <section class="section-white section-padded" id="composite">
          <div class="site-container split-feature-row">
            <div class="split-col-visual">
              <div class="code-editor-card">
                <div class="code-editor-title">composite-foreign-keys.sql</div>
                <pre class="code-pre"><code>-- Parent Table
CREATE TABLE customers (
  tenant_id UUID NOT NULL,
  id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  CONSTRAINT pk_customers PRIMARY KEY (tenant_id, id)
);

-- Child Table with Composite Foreign Key
CREATE TABLE orders (
  tenant_id UUID NOT NULL,
  id UUID NOT NULL,
  customer_id UUID NOT NULL,
  CONSTRAINT pk_orders PRIMARY KEY (tenant_id, id),
  CONSTRAINT fk_orders_customer FOREIGN KEY (tenant_id, customer_id)
    REFERENCES customers (tenant_id, id)
    ON DELETE CASCADE
);</code></pre>
              </div>
            </div>

            <div class="split-col-text">
              <div class="cap-badge">LAYER 2 &mdash; RELATIONAL INTEGRITY</div>
              <h2 class="split-heading">Cross-Tenant Foreign Key Hardening</h2>
              <p class="split-p">
                Because foreign key validation in relational databases runs outside RLS, a poorly configured schema allows Tenant A to reference Tenant B's primary keys.
              </p>
              <ul class="bullet-feature-list">
                <li>
                  <strong>Composite Primary Keys:</strong> Tables enforce <code>(tenant_id, id)</code> as the primary key.
                </li>
                <li>
                  <strong>Composite Foreign Keys:</strong> Child tables must include <code>tenant_id</code> in the foreign key reference, making cross-tenant linking physically impossible.
                </li>
                <li>
                  <strong>Leading Tenant Index:</strong> Every composite index places <code>tenant_id</code> as the first indexed column, maximizing query performance and ensuring index-only scans.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <!-- ── SECTION 3: IMMUTABLE AUDIT TRAIL ─────────────────────────── -->
        <section class="section-gray section-padded" id="audit">
          <div class="site-container split-feature-row">
            <div class="split-col-text">
              <div class="cap-badge">LAYER 3 &mdash; NON-REPUDIATION</div>
              <h2 class="split-heading">Cryptographic Append-Only Audit Trail</h2>
              <p class="split-p">
                In regulated environments, proving that audit records were not manipulated is paramount. ZexCore implements double protection:
              </p>
              <ul class="bullet-feature-list">
                <li>
                  <strong>Database Privilege Revocation:</strong>
                  <code>REVOKE UPDATE, DELETE ON audit_log FROM zexcore_app;</code>
                  The application role is physically blocked from altering or deleting history.
                </li>
                <li>
                  <strong>Cryptographic Hash-Chaining:</strong>
                  Each entry stores <code>prev_hash</code> and <code>hash</code>:
                  <code>SHA-256(prev_hash + tenant_id + action + entity + entity_id + changes + timestamp)</code>.
                  Any modification or missing record immediately breaks the mathematical chain.
                </li>
              </ul>
            </div>

            <div class="split-col-visual">
              <div class="code-editor-card">
                <div class="code-editor-title">audit-hasher.ts (Hash-Chained Nonce)</div>
                <pre class="code-pre"><code>export function computeAuditHash(entry: {
  prevHash: string;
  tenantId: string;
  action: string;
  entityId: string;
  changes: string;
  timestamp: string;
}): string {
  const content = [
    entry.prevHash,
    entry.tenantId,
    entry.action,
    entry.entityId,
    entry.changes,
    entry.timestamp
  ].join('|');

  return crypto.createHash('sha256').update(content).digest('hex');
}</code></pre>
              </div>
            </div>
          </div>
        </section>

        <!-- ── SECTION 4: CRYPTOGRAPHY & GDPR PRIVACY ───────────────────── -->
        <section class="section-white section-padded" id="crypto">
          <div class="site-container">
            <div class="section-header-block">
              <div class="section-eyebrow">LAYER 4 &mdash; ENVELOPE ENCRYPTION &amp; GDPR</div>
              <h2 class="section-title">Cryptographic Privacy &amp; Blind Indexing</h2>
              <p class="section-desc">
                How ZexCore stores sensitive PII securely while maintaining searchability and automated Right-to-be-Forgotten workflows.
              </p>
            </div>

            <div class="capabilities-editorial-grid">
              <div class="cap-card">
                <div class="cap-badge">AES-256-GCM</div>
                <h3 class="cap-title">Envelope Encryption</h3>
                <p class="cap-desc">
                  Data fields are encrypted with unique tenant data encryption keys using AES-256 in Galois/Counter Mode. Formatted as <code>enc:v1:&lt;iv&gt;:&lt;tag&gt;:&lt;ciphertext&gt;</code> with authenticated integrity tags.
                </p>
              </div>

              <div class="cap-card">
                <div class="cap-badge">HMAC-SHA256</div>
                <h3 class="cap-title">Blind Indexing</h3>
                <p class="cap-desc">
                  Enables exact search queries on encrypted fields (emails, phone numbers) without decrypting records in memory. Formatted as <code>blind:&lt;hmac_hash&gt;</code>.
                </p>
              </div>

              <div class="cap-card">
                <div class="cap-badge">GDPR ARTICLE 17</div>
                <h3 class="cap-title">Right to be Forgotten</h3>
                <p class="cap-desc">
                  1-click automated erasure pipeline permanently pseudonymizes PII records to <code>[REDACTED]</code>, revokes active consent grants, and records a hash-chained audit proof.
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- ── SECTION 5: SSRF & NETWORK DEFENSES ───────────────────────── -->
        <section class="section-gray section-padded" id="ssrf">
          <div class="site-container split-feature-row">
            <div class="split-col-text">
              <div class="cap-badge">LAYER 5 &mdash; NETWORK BOUNDARY</div>
              <h2 class="split-heading">SSRF &amp; Outgoing Webhook Defenses</h2>
              <p class="split-p">
                When tenant rules configure outbound webhooks or integrations, ZexCore enforces strict network isolation:
              </p>
              <ul class="bullet-feature-list">
                <li>
                  <strong>Private Range Blocking:</strong> Rejects calls to loopback and private networks (<code>127.0.0.0/8</code>, <code>10.0.0.0/8</code>, <code>172.16.0.0/12</code>, <code>192.168.0.0/16</code>).
                </li>
                <li>
                  <strong>Cloud Metadata Defense:</strong> Rejects calls targeting cloud metadata services (<code>169.254.169.254</code>).
                </li>
                <li>
                  <strong>DNS Re-Resolution Checks:</strong> Verifies the resolved IP address immediately before socket creation to prevent DNS rebinding attacks.
                </li>
                <li>
                  <strong>HMAC Signatures:</strong> All outgoing payloads include cryptographic HMAC headers (<code>X-ZexCore-Signature</code>).
                </li>
              </ul>
            </div>

            <div class="split-col-visual">
              <div class="framed-photo-box">
                <img
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80"
                  alt="Security engineer reviewing network telemetry and firewall logs"
                  class="framed-photo"
                  loading="lazy"
                />
                <div class="photo-caption-bar">
                  <span>SSRF Egress Gateway &mdash; Filter Active</span>
                  <span class="status-indicator-dot"></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section class="section-white final-cta-section">
          <div class="site-container final-cta-inner">
            <h2 class="final-cta-headline">Audit ZexCore in the Live Control Console</h2>
            <p class="final-cta-subtext">
              Test AES-256-GCM envelope encryption, examine the append-only audit stream, and execute GDPR erasures live in the console.
            </p>
            <div class="final-cta-buttons">
              <a href="#/console" class="btn btn-primary btn-lg">
                Open Control Console &rarr;
              </a>
              <a href="#/docs" class="btn btn-secondary btn-lg">
                View Security Documentation
              </a>
            </div>
          </div>
        </section>
      </main>

      ${renderFooter()}
    </div>
  `;
}
