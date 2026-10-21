/**
 * ZexCore Platform Architecture & Foundation Guide
 * 
 * Formal and educational overview:
 * - Enterprise mission, purpose, and problem definition
 * - The architectural contrast between custom plumbing and kernel-level infrastructure
 * - Functional breakdown of core engines and security mechanisms
 * - Deployment methodologies: Instant Cloud and Enterprise On-Premise
 * - Technical Glossary & Architectural Definitions
 */

import { renderNavbar } from '../components/navbar';
import { renderFooter } from '../components/footer';

export function renderAboutPage(): string {
  return `
    <div class="site-wrapper">
      ${renderNavbar('about')}

      <main class="page-content" style="padding-top: 48px; padding-bottom: 96px;">
        <!-- Hero Section -->
        <section class="about-hero" style="max-width: 1160px; margin: 0 auto; padding: 48px 24px 36px; text-align: center;">
          <h1 style="font-size: clamp(2.2rem, 4.8vw, 3.4rem); font-weight: 850; line-height: 1.15; color: #17191D; letter-spacing: -0.03em; margin: 0 0 20px 0;">
            About ZexCore Infrastructure<br />
            <span style="color: #E50920;">The Sovereign Multi-Tenant Operating System for Vertical SaaS.</span>
          </h1>

          <p style="max-width: 840px; margin: 0 auto 36px; font-size: 1.15rem; color: #4B5563; line-height: 1.65;">
            An educational guide to the engineering principles, architectural invariants, and security foundations powering ZexCore. Understand how the micro-kernel enforces tenant isolation, handles hardware telemetry, guarantees deterministic automation, and deploys across sovereign cloud or enterprise infrastructure.
          </p>

          <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
            <a href="#/console" class="btn btn-primary" style="padding: 12px 28px; font-size: 0.95rem; font-weight: 750;">
              Launch Live Console &rarr;
            </a>
            <a href="#deployment-models" class="btn btn-secondary" style="padding: 12px 24px; font-size: 0.95rem; font-weight: 600;">
              View Deployment Models
            </a>
          </div>
        </section>

        <div style="max-width: 1160px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 48px;">
          
          <!-- SECTION 1: SYSTEM OVERVIEW & PROBLEM STATEMENT -->
          <section id="system-overview" style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: 14px; padding: 40px; box-shadow: 0 2px 12px rgba(0,0,0,0.03);">
            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 22px;">
              <div style="width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: rgba(229, 9, 32, 0.08); border: 1px solid rgba(229, 9, 32, 0.2); border-radius: 10px; color: #E50920;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                  <line x1="9" y1="22" x2="9" y2="22.01"/>
                  <line x1="15" y1="22" x2="15" y2="22.01"/>
                  <line x1="8" y1="6" x2="8" y2="6.01"/>
                  <line x1="16" y1="6" x2="16" y2="6.01"/>
                  <line x1="8" y1="10" x2="8" y2="10.01"/>
                  <line x1="16" y1="10" x2="16" y2="10.01"/>
                  <line x1="8" y1="14" x2="8" y2="14.01"/>
                  <line x1="16" y1="14" x2="16" y2="14.01"/>
                </svg>
              </div>
              <div>
                <h2 style="font-size: 1.5rem; font-weight: 800; margin: 0; color: #17191D;">1. Executive Summary &amp; Architecture Foundations</h2>
                <p style="margin: 3px 0 0 0; color: var(--text-secondary); font-size: 0.88rem;">The foundational infrastructure layer for vertical industry software</p>
              </div>
            </div>

            <p style="font-size: 1.02rem; line-height: 1.7; color: #374151; margin-bottom: 18px;">
              When enterprises, startups, or digital agencies engineer vertical software-as-a-service (SaaS)—such as cold-chain refrigerated logistics, clinical healthcare workflows, industrial telemetry hubs, or sovereign citizen portals—engineering teams consistently encounter the <strong>18-month plumbing bottleneck</strong>.
            </p>
            <p style="font-size: 1.02rem; line-height: 1.7; color: #374151; margin-bottom: 18px;">
              Building multi-tenant infrastructure from the ground up requires solving identical foundational challenges repeatedly: guaranteeing strict data boundary isolation across distinct corporate tenants, handling hardware telemetry at high ingress rates, compiling business logic into deterministic rule execution pipelines, implementing field-level envelope encryption, and providing tamper-resistant audit trails for regulatory compliance.
            </p>
            <p style="font-size: 1.02rem; line-height: 1.7; color: #374151; margin: 0;">
              <strong>ZexCore is the micro-kernel that unifies this foundational layer.</strong> By providing mathematical database isolation, asynchronous message routing, hardware device authentication, and deterministic state execution out of the box, engineering organizations bypass two years of infrastructure development and focus exclusively on vertical domain logic.
            </p>
          </section>

          <!-- SECTION 2: COMPARATIVE ARCHITECTURE -->
          <section id="comparative-architecture" style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: 14px; padding: 40px; box-shadow: 0 2px 12px rgba(0,0,0,0.03);">
            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 24px;">
              <div style="width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: rgba(22, 163, 74, 0.08); border: 1px solid rgba(22, 163, 74, 0.2); border-radius: 10px; color: #16a34a;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"/>
                  <line x1="10" y1="21" x2="14" y2="21"/>
                </svg>
              </div>
              <div>
                <h2 style="font-size: 1.5rem; font-weight: 800; margin: 0; color: #17191D;">2. Architectural Paradigm: Fragmented Stacks vs. Unified Kernel</h2>
                <p style="margin: 3px 0 0 0; color: var(--text-secondary); font-size: 0.88rem;">Evaluating systemic trade-offs between ad-hoc engineering and kernel-enforced invariants</p>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
              <div style="background: #fbfbfc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 26px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#991B1B" stroke-width="2.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  <h3 style="color: #991B1B; font-size: 1.05rem; font-weight: 750; margin: 0;">Traditional Disjointed Stack</h3>
                </div>
                <ul style="padding-left: 20px; color: #475569; font-size: 0.92rem; line-height: 1.65; margin: 0;">
                  <li style="margin-bottom: 8px;"><strong>Application-Level Filtering:</strong> Relying on individual developers to append <code>WHERE tenant_id = x</code> creates significant vulnerability to cross-tenant data leaks.</li>
                  <li style="margin-bottom: 8px;"><strong>Non-Deterministic Scripting:</strong> Evaluating automation through arbitrary JavaScript <code>eval()</code> runtimes introduces Remote Code Execution (RCE) and prototype pollution risks.</li>
                  <li style="margin-bottom: 8px;"><strong>Fragmented Integration Tax:</strong> Connecting disjoint third-party SaaS vendors introduces latency spikes, brittle webhook relays, and compounding API costs.</li>
                  <li><strong>Unverifiable Audit Records:</strong> Standard database tables allow administrative alteration and deletion, preventing tamper-proof regulatory verification.</li>
                </ul>
              </div>

              <div style="background: #ffffff; border: 1.5px solid #d1d5db; border-radius: 12px; padding: 26px; box-shadow: 0 4px 16px rgba(0,0,0,0.02);">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <h3 style="color: #166534; font-size: 1.05rem; font-weight: 750; margin: 0;">The ZexCore Kernel Model</h3>
                </div>
                <ul style="padding-left: 20px; color: #334155; font-size: 0.92rem; line-height: 1.65; margin: 0;">
                  <li style="margin-bottom: 8px;"><strong>Mathematical Database Enforcement:</strong> PostgreSQL 17 Row-Level Security (RLS) is forced at the database engine level, making cross-tenant data access structurally impossible.</li>
                  <li style="margin-bottom: 8px;"><strong>Deterministic AST Execution:</strong> Business rules compile into pure Abstract Syntax Tree graphs executing in under 1ms with mathematical safety and zero <code>eval()</code> vulnerabilities.</li>
                  <li style="margin-bottom: 8px;"><strong>Unified Event Fabric:</strong> Hardware ingestion, CRM messaging, cryptographic vaults, and billing settle across a single shared asynchronous broker.</li>
                  <li><strong>Cryptographic Hash Chains:</strong> Every export, state transition, and reading is sealed with HMAC signatures and sequential hash chaining that cannot be mutated or deleted.</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- SECTION 3: FUNCTIONAL CAPABILITIES -->
          <section id="core-capabilities" style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: 14px; padding: 40px; box-shadow: 0 2px 12px rgba(0,0,0,0.03);">
            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 28px;">
              <div style="width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: rgba(2, 132, 199, 0.08); border: 1px solid rgba(2, 132, 199, 0.2); border-radius: 10px; color: #0284c7;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </div>
              <div>
                <h2 style="font-size: 1.5rem; font-weight: 800; margin: 0; color: #17191D;">3. Architectural Capabilities &amp; Engine Mechanics</h2>
                <p style="margin: 3px 0 0 0; color: var(--text-secondary); font-size: 0.88rem;">Detailed operational specifications across the platform modules</p>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 28px;">
              
              <!-- 3.1 Tenancy -->
              <div style="border-bottom: 1px solid var(--border-default); padding-bottom: 24px;">
                <h3 style="font-size: 1.15rem; font-weight: 750; color: #17191D; margin: 0 0 8px 0; display: flex; align-items: center; gap: 10px;">
                  <span style="color: #E50920; font-family: var(--font-mono); font-size: 0.95rem;">01.</span> Sovereign Multi-Tenant Isolation (PostgreSQL 17 RLS)
                </h3>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.65; margin: 0 0 8px 0;">
                  <strong>Core Mechanism:</strong> Every database transaction initiates with <code>set_config('app.current_tenant_id', tenantId, true)</code> scoped strictly to the current database connection. The database table definitions enforce <code>FORCE ROW LEVEL SECURITY</code>.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.65; margin: 0;">
                  <strong>Security Guarantee:</strong> Even in the event of flawed application queries omitting tenancy parameters, the underlying database engine rejects access to rows not belonging to the active transaction session. Cross-tenant leakage is prevented mathematically.
                </p>
              </div>

              <!-- 3.2 IoT Telemetry -->
              <div style="border-bottom: 1px solid var(--border-default); padding-bottom: 24px;">
                <h3 style="font-size: 1.15rem; font-weight: 750; color: #17191D; margin: 0 0 8px 0; display: flex; align-items: center; gap: 10px;">
                  <span style="color: #E50920; font-family: var(--font-mono); font-size: 0.95rem;">02.</span> Industrial Hardware Hub &amp; High-Throughput Ingestion
                </h3>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.65; margin: 0 0 8px 0;">
                  <strong>Core Mechanism:</strong> Edge hardware nodes authenticate via <code>SHA-256</code> pre-shared hardware tokens supplied in request headers. Telemetry streams (temperature, humidity, voltage, vibration, pressure) are received by high-speed Fastify ingest endpoints.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.65; margin: 0;">
                  <strong>Operational Reliability:</strong> Ingestion pipelines operate with sliding-window rate limiters supporting up to 5,000 requests per minute per IP. Telemetry is simultaneously dispatched to the asynchronous event broker and stored in hash-chained time-series records.
                </p>
              </div>

              <!-- 3.3 AST Rules -->
              <div style="border-bottom: 1px solid var(--border-default); padding-bottom: 24px;">
                <h3 style="font-size: 1.15rem; font-weight: 750; color: #17191D; margin: 0 0 8px 0; display: flex; align-items: center; gap: 10px;">
                  <span style="color: #E50920; font-family: var(--font-mono); font-size: 0.95rem;">03.</span> Deterministic Automation Rules &amp; Abstract Syntax Trees (AST)
                </h3>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.65; margin: 0 0 8px 0;">
                  <strong>Core Mechanism:</strong> Complex conditional logic (e.g. <code>temperature &gt; 8 AND duration &gt;= 300</code>) is compiled into a recursive Abstract Syntax Tree. Operators evaluate strictly against typed leaf nodes.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.65; margin: 0;">
                  <strong>Zero-Eval Invariant:</strong> The evaluation runtime contains no JavaScript <code>eval()</code> or function constructors. Prototype pollution vectors (<code>__proto__</code>, <code>constructor</code>) are blocked, and regular expressions are capped to prevent ReDoS denial-of-service vulnerabilities.
                </p>
              </div>

              <!-- 3.4 CRM & Messaging -->
              <div style="border-bottom: 1px solid var(--border-default); padding-bottom: 24px;">
                <h3 style="font-size: 1.15rem; font-weight: 750; color: #17191D; margin: 0 0 8px 0; display: flex; align-items: center; gap: 10px;">
                  <span style="color: #E50920; font-family: var(--font-mono); font-size: 0.95rem;">04.</span> Multi-Channel CRM, Booking &amp; Verified Messaging Delivery
                </h3>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.65; margin: 0 0 8px 0;">
                  <strong>Core Mechanism:</strong> Inbound leads from digital web portals and WhatsApp webhooks feed into an isolated Kanban deal pipeline linked to tenant payment gateways (Paystack and Stripe).
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.65; margin: 0;">
                  <strong>Delivery Verification:</strong> Outbound customer communications feature cryptographically verified status tracking. Messages display single grey checkmarks upon dispatch, double grey checkmarks upon carrier delivery receipt, and double blue checkmarks exclusively upon confirmed recipient read receipt.
                </p>
              </div>

              <!-- 3.5 Compliance Vault -->
              <div style="border-bottom: 1px solid var(--border-default); padding-bottom: 24px;">
                <h3 style="font-size: 1.15rem; font-weight: 750; color: #17191D; margin: 0 0 8px 0; display: flex; align-items: center; gap: 10px;">
                  <span style="color: #E50920; font-family: var(--font-mono); font-size: 0.95rem;">05.</span> Cryptographic Privacy Vault &amp; GDPR Article 17 Crypto-Erasure
                </h3>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.65; margin: 0 0 8px 0;">
                  <strong>Core Mechanism:</strong> Personally Identifiable Information (PII) is encrypted at rest using <code>AES-256-GCM</code> authenticated envelope encryption with 96-bit random IVs and 128-bit authentication tags. Tenant subkeys are derived via <code>HMAC-SHA256(masterKey, "tenant:" + tenantId)</code>.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.65; margin: 0;">
                  <strong>Right to be Forgotten:</strong> When an erasure request is executed under GDPR Article 17, the subject's cryptographic key material is destroyed. Ciphertext stored across persistent disk arrays becomes permanently and irreversibly unrecoverable. Exact-match searching operates over blind index HMACs without column decryption.
                </p>
              </div>

              <!-- 3.6 White-Label Branding -->
              <div style="border-bottom: 1px solid var(--border-default); padding-bottom: 24px;">
                <h3 style="font-size: 1.15rem; font-weight: 750; color: #17191D; margin: 0 0 8px 0; display: flex; align-items: center; gap: 10px;">
                  <span style="color: #E50920; font-family: var(--font-mono); font-size: 0.95rem;">06.</span> Agency White-Label Branding &amp; Multi-Tenant Workspace Studio
                </h3>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.65; margin: 0 0 8px 0;">
                  <strong>Core Mechanism:</strong> Agency tier accounts manage up to 25 sovereign client workspaces under individual tenant schemas.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.65; margin: 0;">
                  <strong>Branding Sovereignty:</strong> Agencies upload corporate logos via direct file upload or URL, customize primary visual brand tokens, remove platform watermarks, and route custom domain hostnames to client portals.
                </p>
              </div>

              <!-- 3.7 Tamper-Proof Audit -->
              <div>
                <h3 style="font-size: 1.15rem; font-weight: 750; color: #17191D; margin: 0 0 8px 0; display: flex; align-items: center; gap: 10px;">
                  <span style="color: #E50920; font-family: var(--font-mono); font-size: 0.95rem;">07.</span> Tamper-Resistant Audit Ledger &amp; Non-Deletable Export Registry
                </h3>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.65; margin: 0 0 8px 0;">
                  <strong>Core Mechanism:</strong> System status transitions, administrative approvals, and data exports are sequentially linked through an append-only hash chain. Each entry incorporates the cryptographic digest of its predecessor.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.65; margin: 0;">
                  <strong>Audit Non-Repudiation:</strong> Exported datasets receive a permanent serial number (e.g. <code>EXP-20261021-XXXXXX</code>), ISO 8601 millisecond UTC timestamps, operator identities, and embedded watermarks. Records stored in the export ledger are permanent and cannot be deleted or modified via the user interface.
                </p>
              </div>

            </div>
          </section>

          <!-- SECTION 4: DEPLOYMENT METHODOLOGIES -->
          <section id="deployment-models" style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: 14px; padding: 40px; box-shadow: 0 2px 12px rgba(0,0,0,0.03);">
            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 24px;">
              <div style="width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: rgba(229, 9, 32, 0.08); border: 1px solid rgba(229, 9, 32, 0.2); border-radius: 10px; color: #E50920;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                  <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
                  <line x1="9" y1="12" x2="12" y2="15"/>
                </svg>
              </div>
              <div>
                <h2 style="font-size: 1.5rem; font-weight: 800; margin: 0; color: #17191D;">4. Deployment Methodologies &amp; Runtime Environments</h2>
                <p style="margin: 3px 0 0 0; color: var(--text-secondary); font-size: 0.88rem;">Production deployment models for sovereign cloud and dedicated on-premise infrastructure</p>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; margin-bottom: 24px;">
              <!-- Option A: Cloud Web Console -->
              <div style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: 12px; padding: 28px; display: flex; flex-direction: column;">
                <div style="font-size: 0.76rem; font-weight: 750; color: #E50920; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">Deployment Model 1</div>
                <h3 style="font-size: 1.15rem; font-weight: 800; color: #0F172A; margin: 0 0 12px 0;">SaaS Cloud Web Console</h3>
                <p style="color: #4B5563; font-size: 0.92rem; line-height: 1.65; margin: 0 0 16px 0; flex: 1;">
                  Designed for agencies, software operators, and vertical SaaS founders seeking instant multi-tenant operations without managing underlying virtual machines or cloud hardware.
                </p>
                <div style="background: var(--bg-muted); border-radius: 8px; padding: 16px; margin-bottom: 20px; font-size: 0.86rem; color: #374151; line-height: 1.6;">
                  1. Navigate directly to the <a href="#/console" style="color: #E50920; font-weight: 700;">Operations Console</a>.<br />
                  2. Select your tenant organization schema.<br />
                  3. Deploy a vertical industry pack to initialize telemetry streams, rules, and sales pipelines in seconds.
                </div>
                <a href="#/console" class="btn btn-primary btn-sm" style="align-self: flex-start; padding: 9px 18px; font-weight: 700;">
                  Launch Operations Console &rarr;
                </a>
              </div>

              <!-- Option B: Enterprise On-Premise -->
              <div style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: 12px; padding: 28px; display: flex; flex-direction: column;">
                <div style="font-size: 0.76rem; font-weight: 750; color: #E50920; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">Deployment Model 2</div>
                <h3 style="font-size: 1.15rem; font-weight: 800; color: #0F172A; margin: 0 0 12px 0;">Dedicated Enterprise On-Premise</h3>
                <p style="color: #4B5563; font-size: 0.92rem; line-height: 1.65; margin: 0 0 16px 0; flex: 1;">
                  Designed for regulated healthcare facilities, clinical laboratories, defense contractors, and financial institutions requiring single-tenant sovereignty within private VPCs or bare-metal air-gapped data centers.
                </p>
                <div style="background: var(--bg-muted); border-radius: 8px; padding: 16px; margin-bottom: 20px; font-size: 0.86rem; color: #374151; line-height: 1.6;">
                  Deploy via Docker Compose, Kubernetes Helm, or direct Fastify micro-kernel processes against PostgreSQL 17 with hardware security module (HSM) key isolation.
                </div>
                <a href="#/docs" class="btn btn-secondary btn-sm" style="align-self: flex-start; padding: 9px 18px; font-weight: 600;">
                  View Technical Setup Specs &rarr;
                </a>
              </div>
            </div>

            <!-- Terminal Code Block (Clean Enterprise Gray) -->
            <div style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: 10px; overflow: hidden;">
              <div style="background: #f8f9fb; padding: 12px 18px; border-bottom: 1px solid var(--border-default); display: flex; justify-content: space-between; align-items: center;">
                <span style="font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; color: var(--text-secondary);">Enterprise Workspace Orchestration Commands</span>
                <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-muted);">PostgreSQL 17 &bull; Fastify &bull; TypeScript</span>
              </div>
              <pre style="margin: 0; padding: 20px; background: #fafbfc; font-family: var(--font-mono); font-size: 0.84rem; color: #1e293b; line-height: 1.7; overflow-x: auto;"><code># 1. Clone sovereign repository
git clone https://github.com/malcryptt/Zexcore.git && cd ZexCore

# 2. Provision dependencies across workspace
pnpm install

# 3. Initialize PostgreSQL 17 RLS database container
docker compose up -d postgres
pnpm db:migrate && pnpm db:seed

# 4. Execute micro-kernel API (Port 3000) & Control Interface (Port 5173)
pnpm --filter @zexcore/api dev
pnpm --filter @zexcore/dashboard dev

# 5. Verify database invariant enforcement
curl -s http://localhost:3000/health | jq .
# Expected: {"status":"healthy","database":"connected","rlsEnforced":true}</code></pre>
            </div>
          </section>

          <!-- SECTION 5: TECHNICAL GLOSSARY -->
          <section id="technical-glossary" style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: 14px; padding: 40px; box-shadow: 0 2px 12px rgba(0,0,0,0.03);">
            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 24px;">
              <div style="width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: rgba(13, 148, 136, 0.08); border: 1px solid rgba(13, 148, 136, 0.2); border-radius: 10px; color: #0d9488;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              </div>
              <div>
                <h2 style="font-size: 1.5rem; font-weight: 800; margin: 0; color: #17191D;">5. Technical Glossary &amp; Architectural Definitions</h2>
                <p style="margin: 3px 0 0 0; color: var(--text-secondary); font-size: 0.88rem;">Precise engineering definitions of core domain concepts</p>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 18px;">
              
              <div style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: 10px; padding: 20px;">
                <div style="font-weight: 800; color: #E50920; font-size: 0.95rem; margin-bottom: 6px;">Tenant</div>
                <div style="color: #4B5563; font-size: 0.88rem; line-height: 1.6;">
                  An isolated logical organization schema. All devices, users, automation rules, cryptographic subkeys, and audit transactions remain strictly contained within this boundary.
                </div>
              </div>

              <div style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: 10px; padding: 20px;">
                <div style="font-weight: 800; color: #E50920; font-size: 0.95rem; margin-bottom: 6px;">Row-Level Security (RLS)</div>
                <div style="color: #4B5563; font-size: 0.88rem; line-height: 1.6;">
                  A database-level access control mechanism enforced inside PostgreSQL 17 that restricts record visibility based on transaction configuration parameters, independent of application code logic.
                </div>
              </div>

              <div style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: 10px; padding: 20px;">
                <div style="font-weight: 800; color: #E50920; font-size: 0.95rem; margin-bottom: 6px;">Telemetry</div>
                <div style="color: #4B5563; font-size: 0.88rem; line-height: 1.6;">
                  Automated metric and diagnostic readings emitted by connected hardware nodes across network protocols, representing environmental conditions, electrical parameters, or operational status.
                </div>
              </div>

              <div style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: 10px; padding: 20px;">
                <div style="font-weight: 800; color: #E50920; font-size: 0.95rem; margin-bottom: 6px;">Abstract Syntax Tree (AST)</div>
                <div style="color: #4B5563; font-size: 0.88rem; line-height: 1.6;">
                  A hierarchical, typed tree structure representing conditional expressions. Enables safe, deterministic evaluation of user-defined automation logic without arbitrary code execution.
                </div>
              </div>

              <div style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: 10px; padding: 20px;">
                <div style="font-weight: 800; color: #E50920; font-size: 0.95rem; margin-bottom: 6px;">AES-256-GCM AEAD</div>
                <div style="color: #4B5563; font-size: 0.88rem; line-height: 1.6;">
                  Advanced Encryption Standard in Galois/Counter Mode providing both confidentiality and cryptographic authenticity verification via a 128-bit authentication tag.
                </div>
              </div>

              <div style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: 10px; padding: 20px;">
                <div style="font-weight: 800; color: #E50920; font-size: 0.95rem; margin-bottom: 6px;">Blind Indexing</div>
                <div style="color: #4B5563; font-size: 0.88rem; line-height: 1.6;">
                  A cryptographic mechanism calculating deterministic HMAC hashes over normalized plaintext attributes, facilitating exact-match database queries over encrypted records without decryption.
                </div>
              </div>

              <div style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: 10px; padding: 20px;">
                <div style="font-weight: 800; color: #E50920; font-size: 0.95rem; margin-bottom: 6px;">Hash Chaining</div>
                <div style="color: #4B5563; font-size: 0.88rem; line-height: 1.6;">
                  An immutable data structure where each audit entry incorporates the cryptographic hash of the preceding entry, providing mathematical proof of chronological ordering and integrity.
                </div>
              </div>

              <div style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: 10px; padding: 20px;">
                <div style="font-weight: 800; color: #E50920; font-size: 0.95rem; margin-bottom: 6px;">Security Information &amp; Event Management (SIEM)</div>
                <div style="color: #4B5563; font-size: 0.88rem; line-height: 1.6;">
                  Enterprise monitoring platforms (such as Splunk, Datadog, or IBM QRadar) ingesting real-time audit event streams formatted in NDJSON or Syslog RFC 5424 specifications.
                </div>
              </div>

            </div>
          </section>

          <!-- FORMAL CALL TO ACTION (RED & WHITE ENTERPRISE STYLE) -->
          <section style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: 14px; padding: 48px 36px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
            <h2 style="font-size: 1.85rem; font-weight: 850; margin: 0 0 12px 0; color: #17191D;">Experience ZexCore Infrastructure</h2>
            <p style="color: #4B5563; max-width: 620px; margin: 0 auto 28px; font-size: 1.02rem; line-height: 1.65;">
              Explore the operations console in real time. Simulate edge telemetry ingestion, inspect deterministic automation rules, and review tamper-proof audit trails.
            </p>
            <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
              <a href="#/console" class="btn btn-primary" style="padding: 12px 28px; font-size: 0.95rem; font-weight: 750;">
                Launch Live Console &rarr;
              </a>
              <a href="#/pricing" class="btn btn-secondary" style="padding: 12px 24px; font-size: 0.95rem; font-weight: 600;">
                View Platform Tiers
              </a>
            </div>
            <p style="margin-top: 24px; font-size: 0.88rem; color: var(--text-secondary);">
              Enterprise Inquiries &amp; Dedicated Deployment Support: <a href="mailto:hello@zexcore.com.ng" style="color: #E50920; text-decoration: underline; font-weight: 700;">hello@zexcore.com.ng</a>
            </p>
          </section>

        </div>
      </main>

      ${renderFooter()}
    </div>
  `;
}
