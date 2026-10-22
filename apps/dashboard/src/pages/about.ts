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
                <p style="margin: 3px 0 0 0; color: var(--text-secondary); font-size: 0.88rem;">The foundational engine for vertical industry software — explained in plain English</p>
              </div>
            </div>

            <p style="font-size: 1.02rem; line-height: 1.7; color: #374151; margin-bottom: 18px;">
              Every serious software product built for an industry — whether it is tracking pharmaceutical temperature in a supply chain, managing patient records in a clinic, or handling citizen services in a municipality — requires the exact same foundational capabilities before any unique feature can be built.
            </p>
            <p style="font-size: 1.02rem; line-height: 1.7; color: #374151; margin-bottom: 18px;">
              You need bulletproof client login portals, real-time sensor connections, instant WhatsApp notifications, automated business rules, and tamper-proof financial ledgers. Building these fundamentals from scratch routinely takes engineering teams <strong>12 to 18 months</strong> before they can even speak to their first customer. This is the <strong>infrastructure bottleneck</strong>.
            </p>
            <p style="font-size: 1.02rem; line-height: 1.7; color: #374151; margin-bottom: 22px;">
              <strong>ZexCore gives you this entire foundation out of the box in 10 minutes.</strong> You deploy ZexCore, select your industry pack, and immediately focus on what makes your business unique — without spending hundreds of thousands of dollars rebuilding infrastructure.
            </p>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
              <div style="background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 10px; padding: 18px 20px;">
                <div style="font-weight: 750; color: #991b1b; font-size: 0.92rem; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 1.1rem;">⏳</span> The 18-Month Nightmare
                </div>
                <div style="font-size: 0.86rem; color: #7f1d1d; line-height: 1.55;">
                  Spending $100k+ building user logins, database security, hardware pipelines, WhatsApp bots, and audit logs before shipping your product to market.
                </div>
              </div>
              <div style="background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 10px; padding: 18px 20px;">
                <div style="font-weight: 750; color: #166534; font-size: 0.92rem; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 1.1rem;">⚡</span> The ZexCore Solution
                </div>
                <div style="font-size: 0.86rem; color: #14532d; line-height: 1.55;">
                  Launch private client workspaces, live sensor tracking, automated workflows, and verified customer communications in minutes — enterprise-ready from day one.
                </div>
              </div>
            </div>
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
                <p style="margin: 3px 0 0 0; color: var(--text-secondary); font-size: 0.88rem;">Why fragmented custom software fails, and how a unified kernel protects your business</p>
              </div>
            </div>

            <p style="font-size: 1rem; line-height: 1.7; color: #374151; margin-bottom: 22px;">
              When multiple businesses share a software system, each business must have its own private workspace (called a <strong>tenant</strong>). Everything inside belongs exclusively to that client and must remain completely invisible to all others. Here is how traditional custom builds compare to ZexCore:
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
                  <li style="margin-bottom: 12px;"><strong>High Risk of Data Leaks:</strong> Developers have to manually remember to filter client data in every single line of code. One missed filter exposes client A's confidential data to client B.</li>
                  <li style="margin-bottom: 12px;"><strong>Fragile Custom Scripts:</strong> Automation is stitched together with custom scripts. If a script fails or crashes, it can take down the entire server or expose security holes.</li>
                  <li style="margin-bottom: 12px;"><strong>Juggling 10+ Separate Subscriptions:</strong> Connecting separate vendors for WhatsApp, sensors, database, authentication, and payments leads to fragile APIs and escalating monthly fees.</li>
                  <li><strong>Modifiable Audit Records:</strong> Normal database rows can be edited or deleted by anyone with admin access, making them legally invalid during compliance audits.</li>
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
                  <li style="margin-bottom: 12px;"><strong>Guaranteed Private Workspaces (Zero Leak Risk):</strong> Data separation is enforced directly by the database engine (PostgreSQL 17 Row-Level Security). Accidental cross-tenant data access is mathematically impossible.</li>
                  <li style="margin-bottom: 12px;"><strong>Instant, Safe Visual Automation (&lt;1ms):</strong> Business rules run through an internal visual evaluation engine. It never executes raw scripts, preventing server crashes and executing in under 1 millisecond.</li>
                  <li style="margin-bottom: 12px;"><strong>One Unified Backbone:</strong> Hardware sensors, WhatsApp leads, CRM stages, and payments run on a single unified core, eliminating vendor lock-in and connection breakdowns.</li>
                  <li><strong>Bank-Grade Tamper-Proof Audit Vault:</strong> Every record is cryptographically linked to the previous one using hash chaining. Records can never be altered or erased without detection.</li>
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
                <p style="margin: 3px 0 0 0; color: var(--text-secondary); font-size: 0.88rem;">Plain-English business explanations backed by enterprise engineering</p>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 32px;">

              <!-- 3.1 Tenancy -->
              <div style="border-bottom: 1px solid var(--border-default); padding-bottom: 28px;">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
                  <h3 style="font-size: 1.15rem; font-weight: 750; color: #17191D; margin: 0; display: flex; align-items: center; gap: 10px;">
                    <span style="color: #E50920; font-family: var(--font-mono); font-size: 0.95rem;">01.</span> 100% Private Client Workspaces
                  </h3>
                  <span style="background: #f1f5f9; color: #475569; font-size: 0.75rem; padding: 3px 8px; border-radius: 4px; font-family: var(--font-mono); font-weight: 600;">PostgreSQL 17 RLS</span>
                </div>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0 0 10px 0;">
                  <strong>What this means:</strong> When multiple clients or departments use the platform, each client operates in their own private, walled-off workspace. They cannot see or touch another client's data under any circumstance.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0 0 10px 0;">
                  <strong>How it works:</strong> ZexCore uses PostgreSQL 17 <strong>Row-Level Security (RLS)</strong>. Instead of trusting a programmer to manually filter queries, the database itself refuses to return any data that doesn't belong to the active workspace. Cross-tenant leaks are physically impossible.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0;">
                  <strong>Why this matters:</strong> Essential for healthcare, government, and finance where a single accidental data exposure leads to regulatory fines and loss of reputation.
                </p>
              </div>

              <!-- 3.2 IoT Telemetry -->
              <div style="border-bottom: 1px solid var(--border-default); padding-bottom: 28px;">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
                  <h3 style="font-size: 1.15rem; font-weight: 750; color: #17191D; margin: 0; display: flex; align-items: center; gap: 10px;">
                    <span style="color: #E50920; font-family: var(--font-mono); font-size: 0.95rem;">02.</span> Live Sensor &amp; Hardware Hub
                  </h3>
                  <span style="background: #f1f5f9; color: #475569; font-size: 0.75rem; padding: 3px 8px; border-radius: 4px; font-family: var(--font-mono); font-weight: 600;">5,000 Readings / Min</span>
                </div>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0 0 10px 0;">
                  <strong>What this means:</strong> Connect physical machinery, temperature probes, GPS trackers, and electrical monitors to your platform to see real-time operational status on live dashboards.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0 0 10px 0;">
                  <strong>How it works:</strong> Each sensor connects using a secure, unique hardware key. The platform ingests up to 5,000 readings per minute per network, automatically storing them into time-series logs and triggering instant alerts if thresholds are breached.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0;">
                  <strong>Why this matters:</strong> Eliminate manual clipboards and spot checks in cold-chain logistics, food safety, and facility management with automated 24/7 monitoring.
                </p>
              </div>

              <!-- 3.3 Rules Engine -->
              <div style="border-bottom: 1px solid var(--border-default); padding-bottom: 28px;">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
                  <h3 style="font-size: 1.15rem; font-weight: 750; color: #17191D; margin: 0; display: flex; align-items: center; gap: 10px;">
                    <span style="color: #E50920; font-family: var(--font-mono); font-size: 0.95rem;">03.</span> Automated Decisions &amp; Real-Time Actions
                  </h3>
                  <span style="background: #f1f5f9; color: #475569; font-size: 0.75rem; padding: 3px 8px; border-radius: 4px; font-family: var(--font-mono); font-weight: 600;">&lt; 1ms Evaluation</span>
                </div>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0 0 10px 0;">
                  <strong>What this means:</strong> Automate your business operations with zero coding — e.g., "If warehouse freezer temperature exceeds 4°C for 3 minutes, dispatch an SMS alert and shut the backup vents."
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0 0 10px 0;">
                  <strong>How it works:</strong> Conditions are evaluated as structured decision trees (ASTs) rather than raw programming code. This prevents malicious scripts from crashing the system and guarantees lightning-fast decisions in less than 1 millisecond.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0;">
                  <strong>Why this matters:</strong> Operations teams can create, test, and adapt business rules on the fly without waiting weeks for software developers.
                </p>
              </div>

              <!-- 3.4 CRM & Messaging -->
              <div style="border-bottom: 1px solid var(--border-default); padding-bottom: 28px;">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
                  <h3 style="font-size: 1.15rem; font-weight: 750; color: #17191D; margin: 0; display: flex; align-items: center; gap: 10px;">
                    <span style="color: #E50920; font-family: var(--font-mono); font-size: 0.95rem;">04.</span> WhatsApp CRM &amp; Verified Messaging
                  </h3>
                  <span style="background: #f1f5f9; color: #475569; font-size: 0.75rem; padding: 3px 8px; border-radius: 4px; font-family: var(--font-mono); font-weight: 600;">Verified Delivery Receipts</span>
                </div>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0 0 10px 0;">
                  <strong>What this means:</strong> Close deals, answer customer inquiries, and collect payments directly where your customers already are — on WhatsApp, SMS, and client portals.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0 0 10px 0;">
                  <strong>How it works:</strong> Leads automatically appear in your sales pipeline. Outbound messages carry verified delivery receipts (single tick = sent, double grey = delivered, double blue = read). The system will never falsely claim a customer saw an alert without cryptographic device proof.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0;">
                  <strong>Why this matters:</strong> Eliminates disputes and missed communications with verifiable proof of delivery for quotes, alerts, and invoices.
                </p>
              </div>

              <!-- 3.5 Compliance Vault -->
              <div style="border-bottom: 1px solid var(--border-default); padding-bottom: 28px;">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
                  <h3 style="font-size: 1.15rem; font-weight: 750; color: #17191D; margin: 0; display: flex; align-items: center; gap: 10px;">
                    <span style="color: #E50920; font-family: var(--font-mono); font-size: 0.95rem;">05.</span> Customer Data Privacy Vault
                  </h3>
                  <span style="background: #f1f5f9; color: #475569; font-size: 0.75rem; padding: 3px 8px; border-radius: 4px; font-family: var(--font-mono); font-weight: 600;">AES-256-GCM &bull; GDPR Ready</span>
                </div>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0 0 10px 0;">
                  <strong>What this means:</strong> Keep sensitive customer data (names, IDs, phone numbers, payment records) safe from hackers and fully compliant with data privacy laws (like GDPR and NDPR).
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0 0 10px 0;">
                  <strong>How it works:</strong> Personal records are encrypted at rest using military-grade AES-256-GCM. When a user exercises their legal "Right to be Forgotten", ZexCore destroys their individual encryption key — rendering the data permanently scrambled and unreadable instantly (cryptographic erasure).
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0;">
                  <strong>Why this matters:</strong> Complies with strict international privacy mandates without expensive database rebuilds or risky manual deletions.
                </p>
              </div>

              <!-- 3.6 White-Label -->
              <div style="border-bottom: 1px solid var(--border-default); padding-bottom: 28px;">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
                  <h3 style="font-size: 1.15rem; font-weight: 750; color: #17191D; margin: 0; display: flex; align-items: center; gap: 10px;">
                    <span style="color: #E50920; font-family: var(--font-mono); font-size: 0.95rem;">06.</span> Agency White-Label &amp; Custom Branding
                  </h3>
                  <span style="background: #f1f5f9; color: #475569; font-size: 0.75rem; padding: 3px 8px; border-radius: 4px; font-family: var(--font-mono); font-weight: 600;">Custom Domains &amp; Logos</span>
                </div>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0 0 10px 0;">
                  <strong>What this means:</strong> Resellers and agencies can deliver a fully branded portal to each client — with their own logo, custom domain, and brand colors — with zero mention of ZexCore.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0 0 10px 0;">
                  <strong>How it works:</strong> Agency administrators can spin up and manage up to 25 isolated client workspaces from one central console. Upload custom logos, define brand colors, and connect custom domains seamlessly.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0;">
                  <strong>Why this matters:</strong> Agencies can build and scale a recurring SaaS revenue business without hiring dedicated backend infrastructure engineers.
                </p>
              </div>

              <!-- 3.7 Audit Ledger -->
              <div>
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
                  <h3 style="font-size: 1.15rem; font-weight: 750; color: #17191D; margin: 0; display: flex; align-items: center; gap: 10px;">
                    <span style="color: #E50920; font-family: var(--font-mono); font-size: 0.95rem;">07.</span> Tamper-Proof Financial &amp; Audit Ledger
                  </h3>
                  <span style="background: #f1f5f9; color: #475569; font-size: 0.75rem; padding: 3px 8px; border-radius: 4px; font-family: var(--font-mono); font-weight: 600;">Cryptographic Hash Chain</span>
                </div>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0 0 10px 0;">
                  <strong>What this means:</strong> Guaranteed mathematical proof of every transaction, user login, file export, and sensor alert. If anyone tries to alter a financial number or delete an action, the system flags it instantly.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0 0 10px 0;">
                  <strong>How it works:</strong> Every event stores a cryptographic fingerprint of the event before it (hash chaining, similar to blockchain design). If a past entry is changed, the entire chain breaks and triggers an immediate compliance warning.
                </p>
                <p style="color: #4B5563; font-size: 0.95rem; line-height: 1.7; margin: 0;">
                  <strong>Why this matters:</strong> Pass financial and regulatory audits with zero stress, providing incontrovertible legal records.
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
