/**
 * ZexCore Solutions & Industry Packs Page
 * Real Industry Visuals, Authentic Manifest Declarations, and Use Cases
 */

import { renderNavbar } from '../components/navbar';
import { renderFooter } from '../components/footer';

export function renderSolutionsPage(): string {
  return `
    <div class="page-wrapper">
      ${renderNavbar('solutions')}

      <main>
        <!-- Page Header -->
        <section class="section-white page-intro-section">
          <div class="site-container">
            <div class="page-intro-header">
              <div class="section-eyebrow">VERTICAL DOMAIN ARCHITECTURE</div>
              <h1 class="page-intro-title">Industry Solutions &amp; Packs</h1>
              <p class="page-intro-desc">
                How ZexCore configures vertical SaaS backends using declarative industry packs. Build domain-specific products without rewriting database isolation or core infrastructure.
              </p>
            </div>
          </div>
        </section>

        <!-- Solution 1: Industrial IoT -->
        <section class="section-gray section-padded" id="industrial">
          <div class="site-container split-feature-row">
            <div class="split-col-text">
              <div class="cap-badge">ACTIVE INDUSTRY PACK</div>
              <h2 class="split-heading">Industrial IoT &amp; Connected Manufacturing</h2>
              <p class="split-p">
                Industrial equipment manufacturers and plant operators need reliable, token-authenticated sensor telemetry ingestion with sub-millisecond threshold alerting and automated incident dispatch.
              </p>
              <div class="solution-pack-info">
                <div class="pack-badge-title">Pack Manifest: <code>packs/industrial-iot</code></div>
                <ul class="bullet-feature-list">
                  <li><strong>Device Ingest Token:</strong> Single-use SHA-256 hashed hardware tokens (<code>X-Device-Token</code>).</li>
                  <li><strong>Telemetry Metrics:</strong> Ingests temperature, humidity, vibration, and supply voltage.</li>
                  <li><strong>Threshold Rules:</strong> High-temperature triggers (>75&deg;C) dispatch critical alerts to plant operators.</li>
                  <li><strong>Hardware Commands:</strong> Bidirectional dispatch of reboot, firmware upgrade, and setpoint updates.</li>
                </ul>
              </div>
            </div>

            <div class="split-col-visual">
              <div class="framed-photo-box">
                <img
                  src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80"
                  alt="Automated manufacturing robotic arm with IoT sensors"
                  class="framed-photo"
                  loading="lazy"
                />
                <div class="photo-caption-bar">
                  <span>Factory Edge Probe Node 01 &mdash; 24.8&deg;C Normal</span>
                  <span class="status-indicator-dot"></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Solution 2: Logistics & Fleet -->
        <section class="section-white section-padded" id="logistics">
          <div class="site-container split-feature-row">
            <div class="split-col-visual">
              <div class="framed-photo-box">
                <img
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"
                  alt="Modern logistics distribution warehouse and fleet operations"
                  class="framed-photo"
                  loading="lazy"
                />
                <div class="photo-caption-bar">
                  <span>Cold Chain Chiller B &mdash; -4.2&deg;C Verified</span>
                  <span class="status-indicator-dot"></span>
                </div>
              </div>
            </div>

            <div class="split-col-text">
              <div class="cap-badge">ACTIVE INDUSTRY PACK</div>
              <h2 class="split-heading">Cold-Chain Logistics &amp; Fleet Depots</h2>
              <p class="split-p">
                Pharmaceutical distribution and temperature-sensitive food transport require unforgeable custody tracking and continuous chiller probe monitoring.
              </p>
              <div class="solution-pack-info">
                <div class="pack-badge-title">Pack Manifest: <code>packs/logistics-fleet</code></div>
                <ul class="bullet-feature-list">
                  <li><strong>Depot Gateway Routing:</strong> Gateway nodes aggregate local trailer probes and push time-series logs.</li>
                  <li><strong>Chiller Breach Alerts:</strong> Rules engine detects temperature drift outside strict range (-20&deg;C to -2&deg;C).</li>
                  <li><strong>Cryptographic Custody:</strong> Handoff events recorded in append-only SHA-256 audit ledger.</li>
                  <li><strong>Cross-Depot Isolation:</strong> Multi-tenant RLS prevents logistics subcontractors from viewing unassigned shipments.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <!-- Solution 3: Sovereign CRM -->
        <section class="section-gray section-padded" id="crm">
          <div class="site-container split-feature-row">
            <div class="split-col-text">
              <div class="cap-badge">ACTIVE INDUSTRY PACK</div>
              <h2 class="split-heading">Sovereign Enterprise CRM &amp; Sales Pipelines</h2>
              <p class="split-p">
                B2B technology companies handling high-value multi-currency enterprise contracts need sovereign data isolation and automated deal velocity alerts.
              </p>
              <div class="solution-pack-info">
                <div class="pack-badge-title">Pack Manifest: <code>packs/enterprise-crm</code></div>
                <ul class="bullet-feature-list">
                  <li><strong>Kanban Lifecycle Stages:</strong> Configurable stages (New, Qualified, Proposal, Negotiation, Won).</li>
                  <li><strong>Automated VIP Lead Assignment:</strong> AST rules trigger executive notifications on deals &gt; $50,000.</li>
                  <li><strong>Multi-Currency Normalization:</strong> Unified pipeline analytics supporting USD, EUR, GBP, and JPY.</li>
                  <li><strong>Capability-Gated Access:</strong> Reps access only authorized accounts governed by composite foreign keys.</li>
                </ul>
              </div>
            </div>

            <div class="split-col-visual">
              <div class="code-editor-card">
                <div class="code-editor-title">packs/enterprise-crm/manifest.json</div>
                <pre class="code-pre"><code>{
  "packId": "enterprise-crm",
  "version": "1.0.0",
  "entities": {
    "Lead": {
      "fields": {
        "title": { "type": "string", "required": true },
        "company": { "type": "string", "required": true },
        "value": { "type": "number", "required": true },
        "currency": { "type": "string", "default": "USD" },
        "stage": { "type": "string", "enum": ["New", "Qualified", "Proposal", "Negotiation", "Closed Won"] }
      }
    }
  },
  "rules": [
    {
      "trigger": "crm.lead.created",
      "condition": "lead.value >= 50000",
      "action": "emit: crm.vip_lead.assigned"
    }
  ]
}</code></pre>
              </div>
            </div>
          </div>
        </section>

        <!-- Solution 4: Regulated Data Vault -->
        <section class="section-white section-padded" id="vault">
          <div class="site-container split-feature-row">
            <div class="split-col-visual">
              <div class="code-editor-card">
                <div class="code-editor-title">packs/regulated-vault/manifest.json</div>
                <pre class="code-pre"><code>{
  "packId": "regulated-vault",
  "version": "1.0.0",
  "cryptography": {
    "envelopeCipher": "AES-256-GCM",
    "blindIndexHash": "HMAC-SHA256",
    "keyDerivation": "per-tenant-dek"
  },
  "privacy": {
    "gdprRightToBeForgotten": true,
    "erasurePseudonym": "[REDACTED]",
    "consentTracking": true
  }
}</code></pre>
              </div>
            </div>

            <div class="split-col-text">
              <div class="cap-badge">ACTIVE INDUSTRY PACK</div>
              <h2 class="split-heading">Regulated Healthcare &amp; Fintech Data Vault</h2>
              <p class="split-p">
                Healthcare platforms and fintech applications managing Personally Identifiable Information (PII) must meet strict GDPR Article 17 and NDPR mandates.
              </p>
              <div class="solution-pack-info">
                <div class="pack-badge-title">Pack Manifest: <code>packs/regulated-vault</code></div>
                <ul class="bullet-feature-list">
                  <li><strong>Envelope Encryption:</strong> Encrypts sensitive fields with AES-256-GCM before writing to the database.</li>
                  <li><strong>Blind Index Queries:</strong> Allows exact searching on email/phone without storing plaintext.</li>
                  <li><strong>Lawful Basis Consent Registry:</strong> Timestamps and tracks contractual, consent, and legitimate interest grants.</li>
                  <li><strong>1-Click Subject Erasure:</strong> Sanitizes records to <code>[REDACTED]</code> and records hash-chained audit proof.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section class="section-gray final-cta-section">
          <div class="site-container final-cta-inner">
            <h2 class="final-cta-headline">Deploy an Industry Pack in ZexCore Control</h2>
            <p class="final-cta-subtext">
              Log into the control console and interact with active IoT device nodes, rule triggers, and compliance vaults.
            </p>
            <div class="final-cta-buttons">
              <a href="#/console" class="btn btn-primary btn-lg">
                Launch Control Console &rarr;
              </a>
              <a href="#/docs" class="btn btn-secondary btn-lg">
                Read Pack Specification Docs
              </a>
            </div>
          </div>
        </section>
      </main>

      ${renderFooter()}
    </div>
  `;
}
