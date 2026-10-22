/**
 * ZexCore Platform Architecture & Foundation Guide
 *
 * Formal and educational overview with all technical terms defined inline.
 */

import { renderNavbar } from '../components/navbar';
import { renderFooter } from '../components/footer';

export function renderAboutPage(): string {
  return `
    <div class="page-wrapper">
      ${renderNavbar('about')}

      <main>

        <!-- HERO -->
        <section class="section-white page-intro-section">
          <div class="page-hero-backdrop" style="background-image: url('/hero-engineering.jpg');"></div>
          <div class="site-container">
            <div class="page-intro-header page-hero-content-col">
              <div class="section-eyebrow">PLATFORM FOUNDATION &amp; ARCHITECTURE</div>
              <h1 class="page-intro-title" style="margin-bottom: 16px;">
                About ZexCore<br />
                <span class="text-brand">Infrastructure.</span>
              </h1>
              <p class="page-intro-desc">
                The sovereign multi-tenant operating system for vertical SaaS — built for engineers, explained for everyone. Every technical concept is defined the first time it appears.
              </p>
              <div style="display: flex; gap: 14px; flex-wrap: wrap; margin-top: 28px;">
                <a href="#/console" class="btn btn-primary" style="padding: 11px 24px; font-size: 0.93rem; font-weight: 750;">Launch Live Console &rarr;</a>
                <a href="#deployment-models" class="btn btn-secondary" style="padding: 11px 22px; font-size: 0.93rem; font-weight: 600;">View Deployment Models</a>
              </div>
            </div>
          </div>
        </section>

        <!-- ABOUT BODY -->
        <section style="background: var(--bg-page); padding: 56px 0 96px;">
        <div style="max-width: 1160px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 48px;">

          <!-- SECTION 1: WHAT IS ZEXCORE -->
          <section id="system-overview" style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: 14px; padding: 40px; box-shadow: 0 2px 12px rgba(0,0,0,0.03);">
            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 22px;">
              <div style="width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: rgba(229, 9, 32, 0.08); border: 1px solid rgba(229, 9, 32, 0.2); border-radius: 10px; overflow: hidden;">
                <img src="/favicon-transparent.png" alt="ZexCore" style="width: 28px; height: 28px; object-fit: contain;" />
              </div>
              <div>
                <h2 style="font-size: 1.5rem; font-weight: 800; margin: 0; color: #17191D;">1. What Is ZexCore, and Why Does It Exist?</h2>
                <p style="margin: 3px 0 0 0; color: var(--text-secondary); font-size: 0.88rem;">The foundational infrastructure layer for vertical industry software</p>
              </div>
            </div>

            <p style="font-size: 1.02rem; line-height: 1.7; color: #374151; margin-bottom: 18px;">
              Every serious software product built for a specific industry — such as a cold-chain logistics tracker, a clinical patient records system, or a government citizen portal — requires a common set of foundational capabilities before any domain-specific feature can be built. These include the ability to keep each customer's data completely separate and secure, to process live sensor readings from physical devices, to automate business decisions in real time, and to produce audit records that cannot be altered.
            </p>
            <p style="font-size: 1.02rem; line-height: 1.7; color: #374151; margin-bottom: 18px;">
              Building all of this from scratch is a recognised industry problem. Engineering teams routinely spend twelve to eighteen months constructing this foundational layer before they can begin work on the features that actually serve their market. This is the <strong>infrastructure bottleneck</strong>, and it costs organisations significant time, money, and competitive advantage.
            </p>
            <p style="font-size: 1.02rem; line-height: 1.7; color: #374151; margin: 0;">
              <strong>ZexCore is the pre-built foundational layer that eliminates this bottleneck.</strong> It is a <strong>micro-kernel</strong> — a tightly engineered core system — that provides multi-tenant data isolation, hardware device connectivity, automated business rule execution, encrypted data storage, verified messaging, and tamper-proof audit records as unified, ready-to-use infrastructure. Engineering teams deploy ZexCore and begin building their industry-specific features immediately, without rebuilding this common foundation.
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
                <h2 style="font-size: 1.5rem; font-weight: 800; margin: 0; color: #17191D;">2. The Traditional Approach vs. The ZexCore Model</h2>
                <p style="margin: 3px 0 0 0; color: var(--text-secondary); font-size: 0.88rem;">Understanding the systemic difference between fragmented custom builds and unified kernel infrastructure</p>
              </div>
            </div>

            <p style="font-size: 1rem; line-height: 1.7; color: #374151; margin-bottom: 22px;">
              The term <strong>multi-tenant</strong> describes a system where a single platform simultaneously serves multiple separate organisations — each called a <strong>tenant</strong> — while ensuring their data, users, and configurations remain completely isolated from one another. A tenant is comparable to a self-contained private workspace: everything within it belongs exclusively to that organisation and is invisible to all others.
            </p>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
              <div style="background: #fbfbfc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 26px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#991B1B" stroke-width="2.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  <h3 style="color: #991B1B; font-size: 1.05rem; font-weight: 750; margin: 0;">The Traditional Disjointed Stack</h3>
                </div>
                <ul style="padding-left: 20px; color: #475569; font-size: 0.92rem; line-height: 1.65; margin: 0;">
                  <li style="margin-bottom: 10px;"><strong>Tenant isolation left to developers:</strong> Each developer must manually filter queries by organisation. A single missed filter exposes one client's data to another — a critical and recurring vulnerability.</li>
                  <li style="margin-bottom: 10px;"><strong>Unsafe automation execution:</strong> Running business logic through arbitrary code execution introduces serious security risks, including the ability for a maliciously crafted rule to compromise the entire server.</li>
                  <li style="margin-bottom: 10px;"><strong>Fragmented third-party tools:</strong> Connecting separate vendors for messaging, payments, and device management introduces unpredictable failures, delays, and escalating costs.</li>
                  <li><strong>Mutable audit records:</strong> Records in standard databases can be modified or deleted by administrators, rendering them invalid for regulatory or legal purposes.</li>
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
                  <li style="margin-bottom: 10px;"><strong>Database-enforced separation:</strong> Isolation is enforced by the database engine itself using <strong>Row-Level Security (RLS)</strong> — a PostgreSQL 17 mechanism that automatically restricts what each query can see, making cross-tenant data access structurally impossible regardless of developer error.</li>
                  <li style="margin-bottom: 10px;"><strong>Safe rule execution:</strong> Business logic compiles into an <strong>Abstract Syntax Tree (AST)</strong> — a structured decision diagram — that evaluates conditions without executing arbitrary code, eliminating entire categories of security risk.</li>
                  <li style="margin-bottom: 10px;"><strong>Unified event backbone:</strong> Hardware sensors, customer messages, payments, and audit events all pass through a single internal message bus, eliminating integration fragility.</li>
                  <li><strong>Cryptographic audit chain:</strong> Every record is mathematically linked to the one before it using <strong>hash chaining</strong> — meaning any attempt to modify a past entry is detectable immediately.</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- SECTION 3: HOW EACH FEATURE WORKS -->
          <section id="core-capabilities" style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: 14px; padding: 40px; box-shadow: 0 2px 12px rgba(0,0,0,0.03);">
            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 28px;">
              <div style="width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: rgba(2, 132, 199, 0.08); border: 1px solid rgba(2, 132, 199, 0.2); border-radius: 10px; color: #0284c7;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </div>
              <div>
                <h2 style="font-size: 1.5rem; font-weight: 800; margin: 0; color: #17191D;">3. How Each Feature Works</h2>
                <p style="margin: 3px 0 0 0; color: var(--text-secondary); font-size: 0.88rem;">A plain-language explanation of every platform capability, with engineering detail where relevant</p>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 32px;">

              <!-- 3.1 Tenancy -->
              <div style="border-bottom: 1px solid var(--border-default); padding-bottom: 28px;">
                <h3 style="font-size: 1.15rem; font-weight: 750; color: #17191D; margin: 0 0 10px 0; display: flex; align-items: center; gap: 10px;">
                  <span style="color: #E50920; font-family: var(--font-mono); font-size: 0.95rem;">01.</span> Tenant Data Isolation
                </h3>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0 0 10px 0;">
                  <strong>What this means:</strong> When multiple businesses use ZexCore, their data must remain completely invisible to one another — as though each organisation operates on its own private system. This is called <strong>tenant isolation</strong>, where a "tenant" is simply an organisation's dedicated workspace within the shared platform.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0 0 10px 0;">
                  <strong>How it works:</strong> ZexCore uses a PostgreSQL 17 feature called <strong>Row-Level Security (RLS)</strong>. In a standard database, keeping data separate depends on developers correctly writing filtering instructions every time they query information — a single mistake exposes private records. With RLS, the database engine itself enforces the boundary automatically. Cross-tenant data access becomes structurally impossible.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0;">
                  <strong>Why this matters:</strong> Regulated industries — healthcare, finance, legal — require provable data separation between clients. RLS provides mathematical assurance rather than a developer promise.
                </p>
              </div>

              <!-- 3.2 IoT Telemetry -->
              <div style="border-bottom: 1px solid var(--border-default); padding-bottom: 28px;">
                <h3 style="font-size: 1.15rem; font-weight: 750; color: #17191D; margin: 0 0 10px 0; display: flex; align-items: center; gap: 10px;">
                  <span style="color: #E50920; font-family: var(--font-mono); font-size: 0.95rem;">02.</span> Industrial Hardware Hub &amp; Real-Time Sensor Data
                </h3>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0 0 10px 0;">
                  <strong>What this means:</strong> Many industries operate physical devices — temperature sensors in a cold store, voltage monitors on electrical equipment, vibration detectors on machinery. ZexCore connects to these devices and receives their live measurements, known as <strong>telemetry</strong> (automated readings sent continuously by hardware over a network).
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0 0 10px 0;">
                  <strong>How it works:</strong> Each physical device authenticates itself using a unique cryptographic token — a mathematical secret key — embedded in every request it sends. This prevents unauthorised devices from injecting false readings. ZexCore's ingestion layer processes up to 5,000 sensor readings per minute per network, and stores each measurement in a tamper-resistant time-series record.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0;">
                  <strong>Why this matters:</strong> Cold-chain logistics, pharmaceutical storage, and energy management require verifiable, continuous records of physical conditions. ZexCore provides this without custom hardware integration work.
                </p>
              </div>

              <!-- 3.3 Rules Engine -->
              <div style="border-bottom: 1px solid var(--border-default); padding-bottom: 28px;">
                <h3 style="font-size: 1.15rem; font-weight: 750; color: #17191D; margin: 0 0 10px 0; display: flex; align-items: center; gap: 10px;">
                  <span style="color: #E50920; font-family: var(--font-mono); font-size: 0.95rem;">03.</span> Automation Rules Engine
                </h3>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0 0 10px 0;">
                  <strong>What this means:</strong> Business operators need automated responses to events — for example, "if the freezer temperature exceeds 8°C for five consecutive minutes, send an alert." ZexCore provides a rules engine where these conditions can be configured without writing code.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0 0 10px 0;">
                  <strong>How it works:</strong> When a rule is saved, ZexCore converts the conditional logic into an <strong>Abstract Syntax Tree (AST)</strong> — a structured decision diagram stored as data rather than executable code. When an event occurs, the engine walks through this diagram and evaluates the conditions. Because no actual code is executed, an entire class of security risks — such as a malicious rule crashing or hijacking the server — is eliminated by design. Rules evaluate in under one millisecond.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0;">
                  <strong>Why this matters:</strong> Non-technical operators can configure complex business logic safely. The system is predictable and auditable, with no risk of accidental or intentional code injection.
                </p>
              </div>

              <!-- 3.4 CRM & Messaging -->
              <div style="border-bottom: 1px solid var(--border-default); padding-bottom: 28px;">
                <h3 style="font-size: 1.15rem; font-weight: 750; color: #17191D; margin: 0 0 10px 0; display: flex; align-items: center; gap: 10px;">
                  <span style="color: #E50920; font-family: var(--font-mono); font-size: 0.95rem;">04.</span> Customer Management &amp; Verified Messaging
                </h3>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0 0 10px 0;">
                  <strong>What this means:</strong> ZexCore includes a built-in customer relationship management (CRM) system — the module that handles sales leads, communication threads, bookings, and payment processing — so organisations do not need to integrate a separate tool.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0 0 10px 0;">
                  <strong>How it works:</strong> Inbound enquiries from web portals and messaging applications feed into a visual deal pipeline. Outbound messages carry verified delivery receipts: a single grey tick confirms the message left the platform; double grey ticks confirm the message was received by the recipient's device; and double blue ticks confirm the recipient has read it. These statuses are cryptographically tracked — the system will not report a message as "seen" unless a confirmed read receipt has been received from the recipient's device.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0;">
                  <strong>Why this matters:</strong> Inaccurate delivery statuses erode trust and cause costly miscommunication. ZexCore's verification guarantees that teams always act on accurate information about customer communications.
                </p>
              </div>

              <!-- 3.5 Compliance Vault -->
              <div style="border-bottom: 1px solid var(--border-default); padding-bottom: 28px;">
                <h3 style="font-size: 1.15rem; font-weight: 750; color: #17191D; margin: 0 0 10px 0; display: flex; align-items: center; gap: 10px;">
                  <span style="color: #E50920; font-family: var(--font-mono); font-size: 0.95rem;">05.</span> Encrypted Data Vault &amp; Privacy Compliance
                </h3>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0 0 10px 0;">
                  <strong>What this means:</strong> Personal information — names, email addresses, identification numbers — must be stored securely and, under data protection regulations such as GDPR, must be permanently and verifiably deletable upon request.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0 0 10px 0;">
                  <strong>How it works:</strong> ZexCore encrypts all personal data at rest using <strong>AES-256-GCM</strong> — an industry-standard encryption algorithm that simultaneously scrambles the data and produces a mathematical proof that it has not been tampered with. Each tenant's data is encrypted under a unique key derived specifically for that organisation.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0 0 10px 0;">
                  When a person invokes their right to erasure under GDPR Article 17, ZexCore destroys that individual's encryption key. Because the key no longer exists, the stored data — even though it may remain physically on disk — becomes permanently unreadable. This is called <strong>cryptographic erasure</strong>: verifiable deletion without the overhead of locating and physically removing every copy of the data across the system.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0;">
                  Searching over encrypted records uses a technique called <strong>blind indexing</strong> — generating a consistent but non-reversible fingerprint of a search term, allowing the system to find records by name or email without decrypting stored data first.
                </p>
              </div>

              <!-- 3.6 White-Label -->
              <div style="border-bottom: 1px solid var(--border-default); padding-bottom: 28px;">
                <h3 style="font-size: 1.15rem; font-weight: 750; color: #17191D; margin: 0 0 10px 0; display: flex; align-items: center; gap: 10px;">
                  <span style="color: #E50920; font-family: var(--font-mono); font-size: 0.95rem;">06.</span> White-Label Branding &amp; Agency Multi-Workspace Management
                </h3>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0 0 10px 0;">
                  <strong>What this means:</strong> Digital agencies and software resellers often need to deliver a fully branded platform to each of their clients — where the client sees their own logo, colour scheme, and domain name, with no visible trace of the underlying infrastructure provider. This is called <strong>white-labelling</strong>.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0 0 10px 0;">
                  <strong>How it works:</strong> Agency-tier accounts manage up to 25 client workspaces, each an isolated tenant. Agencies upload client logos directly via file upload or provide an image URL, configure brand colours, remove platform watermarks, and map custom domain names to client-facing portals — all from a single management interface.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0;">
                  <strong>Why this matters:</strong> Agencies can deliver a premium, cohesive product experience to each of their clients without building or maintaining separate systems per client.
                </p>
              </div>

              <!-- 3.7 Audit Ledger -->
              <div>
                <h3 style="font-size: 1.15rem; font-weight: 750; color: #17191D; margin: 0 0 10px 0; display: flex; align-items: center; gap: 10px;">
                  <span style="color: #E50920; font-family: var(--font-mono); font-size: 0.95rem;">07.</span> Tamper-Resistant Audit Ledger &amp; Permanent Export Registry
                </h3>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0 0 10px 0;">
                  <strong>What this means:</strong> Regulated environments require records that prove past events occurred exactly as described — and that those records have not been altered since. A standard database does not provide this guarantee: administrators can modify or delete entries without detection.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0 0 10px 0;">
                  <strong>How it works:</strong> ZexCore uses <strong>hash chaining</strong> — a technique borrowed from blockchain design — to link every audit record to the one before it. Each entry stores a mathematical fingerprint (called a <strong>cryptographic hash</strong>) of the previous entry. If any historical record is modified, every subsequent fingerprint fails to verify, making tampering immediately and automatically detectable. The ledger is append-only: records can be added but never deleted or changed.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0 0 10px 0;">
                  Every data export carries a permanent serial number, a precise timestamp accurate to the millisecond, the identity of the operator who performed the export, and an embedded watermark. These records are stored permanently and cannot be removed through the user interface.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0;">
                  Enterprise clients may additionally stream the audit event log into external monitoring platforms — referred to as <strong>SIEM systems</strong> (Security Information and Event Management tools, such as Splunk or Datadog) — for centralised compliance oversight across their organisation.
                </p>
              </div>

            </div>
          </section>

          <!-- SECTION 4: DEPLOYMENT -->
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
                <h2 style="font-size: 1.5rem; font-weight: 800; margin: 0; color: #17191D;">4. How to Access or Deploy ZexCore</h2>
                <p style="margin: 3px 0 0 0; color: var(--text-secondary); font-size: 0.88rem;">Two deployment models: immediate cloud access or dedicated on-premise installation</p>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; margin-bottom: 24px;">
              <div style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: 12px; padding: 28px; display: flex; flex-direction: column;">
                <div style="font-size: 0.76rem; font-weight: 750; color: #E50920; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">Deployment Model 1</div>
                <h3 style="font-size: 1.15rem; font-weight: 800; color: #0F172A; margin: 0 0 12px 0;">Hosted Cloud Console</h3>
                <p style="color: #4B5563; font-size: 0.92rem; line-height: 1.65; margin: 0 0 12px 0; flex: 1;">
                  Designed for agencies, software operators, and founders who want to begin operating immediately without managing any servers or cloud infrastructure. ZexCore handles all hosting, database management, and security updates.
                </p>
                <div style="background: var(--bg-muted); border-radius: 8px; padding: 16px; margin-bottom: 20px; font-size: 0.86rem; color: #374151; line-height: 1.6;">
                  1. Navigate to the <a href="#/console" style="color: #E50920; font-weight: 700;">Operations Console</a>.<br />
                  2. Select or create your organisation workspace.<br />
                  3. Choose an industry pack to pre-configure sensors, rules, and pipelines in seconds.
                </div>
                <a href="#/console" class="btn btn-primary btn-sm" style="align-self: flex-start; padding: 9px 18px; font-weight: 700;">
                  Launch Operations Console &rarr;
                </a>
              </div>

              <div style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: 12px; padding: 28px; display: flex; flex-direction: column;">
                <div style="font-size: 0.76rem; font-weight: 750; color: #E50920; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">Deployment Model 2</div>
                <h3 style="font-size: 1.15rem; font-weight: 800; color: #0F172A; margin: 0 0 12px 0;">Dedicated Enterprise On-Premise</h3>
                <p style="color: #4B5563; font-size: 0.92rem; line-height: 1.65; margin: 0 0 12px 0; flex: 1;">
                  Designed for organisations that must operate entirely within their own infrastructure — regulated healthcare facilities, financial institutions, and government agencies. ZexCore runs inside the client's private data centre or cloud account, with no data leaving their network perimeter.
                </p>
                <p style="color: #4B5563; font-size: 0.88rem; line-height: 1.6; margin: 0 0 16px 0;">
                  Installation is supported via Docker Compose (a containerised single-server setup), Kubernetes Helm (an orchestrated cluster for high-availability environments), or direct process execution for bare-metal deployments.
                </p>
                <a href="#/docs" class="btn btn-secondary btn-sm" style="align-self: flex-start; padding: 9px 18px; font-weight: 600;">
                  View Technical Setup Specifications &rarr;
                </a>
              </div>
            </div>



            <!-- Enterprise License Activation Flow -->
            <div style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: 10px; overflow: hidden;">
              <div style="background: #f8f9fb; padding: 12px 18px; border-bottom: 1px solid var(--border-default); display: flex; justify-content: space-between; align-items: center;">
                <span style="font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; color: var(--text-secondary);">Dedicated On-Premise Deployment — Licence Activation Flow</span>
                <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-muted);">HMAC-SHA256 &bull; PostgreSQL 17 &bull; Docker Compose</span>
              </div>

              <div style="padding: 24px; display: flex; flex-direction: column; gap: 20px;">

                <div style="border-left: 3px solid #E50920; padding-left: 16px;">
                  <div style="font-size: 0.78rem; font-weight: 800; color: #E50920; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Step 1 — Subscribe &amp; Receive Your Signed Licence Key</div>
                  <p style="font-size: 0.88rem; color: #374151; line-height: 1.65; margin: 0;">
                    Upon completing a Dedicated or Enterprise subscription payment, ZexCore automatically generates a cryptographically signed licence key unique to your organisation and subscription period. This key is formatted as <code>ZEX-DED.&lt;payload&gt;.&lt;signature&gt;</code> for Dedicated tiers and <code>ZEX-ENT.&lt;payload&gt;.&lt;signature&gt;</code> for Enterprise tiers. It is attached directly to your payment invoice — which you can view and download from the <a href="#/console/license" style="color: #E50920; font-weight: 700;">Licence tab</a> in the Operations Console — and is also dispatched to your registered email address.
                  </p>
                </div>

                <div style="border-left: 3px solid #0284c7; padding-left: 16px;">
                  <div style="font-size: 0.78rem; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Step 2 — Configure Your docker-compose.enterprise.yml</div>
                  <p style="font-size: 0.88rem; color: #374151; line-height: 1.6; margin: 0 0 10px 0;">
                    Your signed licence key is placed into a pre-configured Docker Compose file for your dedicated cluster. Set the <code>ZEXCORE_LICENSE_KEY</code> environment variable to your key. This single configuration file starts both the ZexCore application and its PostgreSQL 17 database:
                  </p>
                  <pre style="margin: 0; padding: 14px 16px; background: #fafbfc; border: 1px solid var(--border-default); border-radius: 8px; font-family: var(--font-mono); font-size: 0.78rem; color: #1e293b; line-height: 1.7; overflow-x: auto;"><code>services:
  zexcore-app:
    image: registry.zexcore.io/enterprise/core:v1.4-hardened
    environment:
      - ZEXCORE_LICENSE_KEY=ZEX-DED.&lt;your-signed-key&gt;
      - TENANT_ID=&lt;your-organisation-slug&gt;
      - DATABASE_URL=postgresql://zexcore_app:&lt;password&gt;@db:5432/zexcore_prod
      - CRYPTO_HEARTBEAT_ENDPOINT=https://api.zexcore.com/v1/license/heartbeat
    ports:
      - "443:3000"
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:17-alpine
    environment:
      - POSTGRES_DB=zexcore_prod
      - POSTGRES_USER=zexcore_app
      - POSTGRES_PASSWORD=&lt;password&gt;
    volumes:
      - pgdata:/var/lib/postgresql/data</code></pre>
                </div>

                <div style="border-left: 3px solid #16a34a; padding-left: 16px;">
                  <div style="font-size: 0.78rem; font-weight: 800; color: #16a34a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Step 3 — Start Your Cluster</div>
                  <p style="font-size: 0.88rem; color: #374151; line-height: 1.6; margin: 0 0 10px 0;">
                    Start the full cluster with a single command. The kernel validates your licence key on boot before accepting any requests:
                  </p>
                  <pre style="margin: 0; padding: 14px 16px; background: #fafbfc; border: 1px solid var(--border-default); border-radius: 8px; font-family: var(--font-mono); font-size: 0.78rem; color: #1e293b; line-height: 1.7; overflow-x: auto;"><code>docker compose -f docker-compose.enterprise.yml up

# Confirm licence is active and RLS is enforced
curl -s http://localhost:3000/api/health
# → {"status":"healthy","database":"connected","rlsEnforced":true,"license":"active"}</code></pre>
                </div>

                <!-- License Lifecycle Explainer -->
                <div style="background: #fafbfc; border: 1px solid var(--border-default); border-radius: 10px; padding: 20px;">
                  <div style="font-size: 0.82rem; font-weight: 800; color: #17191D; margin-bottom: 14px;">How the Licence Enforcement Works</div>
                  <div style="display: flex; flex-direction: column; gap: 12px;">

                    <div style="display: flex; gap: 12px; align-items: flex-start;">
                      <div style="width: 28px; height: 28px; flex-shrink: 0; background: rgba(229,9,32,0.07); border: 1px solid rgba(229,9,32,0.2); border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      </div>
                      <div>
                        <div style="font-size: 0.82rem; font-weight: 700; color: #17191D; margin-bottom: 2px;">Cryptographic Signature Verification</div>
                        <div style="font-size: 0.82rem; color: #4B5563; line-height: 1.55;">The key's payload is signed with HMAC-SHA256. On every boot and at each scheduled heartbeat, the engine re-verifies this signature. Any attempt to alter the key — for example, extending the expiry date manually — is immediately detected because the signature will no longer match. A tampered key is treated as invalid and the instance locks immediately.</div>
                      </div>
                    </div>

                    <div style="display: flex; gap: 12px; align-items: flex-start;">
                      <div style="width: 28px; height: 28px; flex-shrink: 0; background: rgba(2,132,199,0.07); border: 1px solid rgba(2,132,199,0.2); border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      </div>
                      <div>
                        <div style="font-size: 0.82rem; font-weight: 700; color: #17191D; margin-bottom: 2px;">Server-Clock Time Verification</div>
                        <div style="font-size: 0.82rem; color: #4B5563; line-height: 1.55;">Expiration is evaluated against ZexCore's authoritative server clock via the <code>CRYPTO_HEARTBEAT_ENDPOINT</code> — not the local clock of the machine running the software. This prevents a common bypass technique where system time is set backwards to keep a licence appearing valid. If the heartbeat endpoint cannot be reached, the kernel uses the last confirmed server timestamp for offline evaluation.</div>
                      </div>
                    </div>

                    <div style="display: flex; gap: 12px; align-items: flex-start;">
                      <div style="width: 28px; height: 28px; flex-shrink: 0; background: rgba(22,163,74,0.07); border: 1px solid rgba(22,163,74,0.2); border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <div>
                        <div style="font-size: 0.82rem; font-weight: 700; color: #17191D; margin-bottom: 2px;">Active Subscription</div>
                        <div style="font-size: 0.82rem; color: #4B5563; line-height: 1.55;">All modules are fully operational. IoT telemetry ingestion, automation rules, CRM pipelines, compliance vault, white-label branding, and the audit ledger all run without restriction. The console displays the days and hours remaining on the licence period.</div>
                      </div>
                    </div>

                    <div style="display: flex; gap: 12px; align-items: flex-start;">
                      <div style="width: 28px; height: 28px; flex-shrink: 0; background: rgba(217,119,6,0.07); border: 1px solid rgba(217,119,6,0.2); border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      </div>
                      <div>
                        <div style="font-size: 0.82rem; font-weight: 700; color: #17191D; margin-bottom: 2px;">7-Day Grace Period After Subscription Expiry</div>
                        <div style="font-size: 0.82rem; color: #4B5563; line-height: 1.55;">When the subscription period ends, the system does not shut down immediately. A 7-day grace period begins. During this window all engines continue to operate normally, and the console displays a prominent renewal notice with the exact number of grace days remaining. Renewing at any point during the grace period restores the full licence term.</div>
                      </div>
                    </div>

                    <div style="display: flex; gap: 12px; align-items: flex-start;">
                      <div style="width: 28px; height: 28px; flex-shrink: 0; background: rgba(127,29,29,0.07); border: 1px solid rgba(127,29,29,0.2); border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#991b1b" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      </div>
                      <div>
                        <div style="font-size: 0.82rem; font-weight: 700; color: #17191D; margin-bottom: 2px;">Read-Only Lock After Grace Period Lapses</div>
                        <div style="font-size: 0.82rem; color: #4B5563; line-height: 1.55;">If the grace period expires without renewal, the automation engines — rules evaluation, IoT ingestion, CRM messaging, and compliance vault writes — pause and enter read-only mode. Existing data remains intact and accessible. No data is lost. Operations resume the moment a valid renewed licence key is configured.</div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </section>


          <!-- CALL TO ACTION -->
          <section style="background: #ffffff; border: 1.5px solid var(--border-default); border-radius: 14px; padding: 48px 36px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
            <h2 style="font-size: 1.85rem; font-weight: 850; margin: 0 0 12px 0; color: #17191D;">Experience ZexCore Infrastructure</h2>
            <p style="color: #4B5563; max-width: 640px; margin: 0 auto 28px; font-size: 1.02rem; line-height: 1.65;">
              Explore the live operations console. Simulate sensor telemetry ingestion, inspect automation rules in real time, and review a tamper-proof audit ledger — no installation required.
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
        </section>
      </main>

      ${renderFooter()}
    </div>
  `;

}
