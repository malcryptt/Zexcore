/**
 * ZexCore Enterprise Homepage
 * Clean, Product-First Developer & Enterprise Foundation
 * Features:
 * - Product Showcase Hero with interactive live console tabs (Fleet, CRM, Rules, Vault)
 * - 4 Enterprise Metric Invariants (100% RLS, < 1ms engine, AES-256-GCM, Meta Business API)
 * - 3-Step 10-Minute Deployment Walkthrough
 * - 4 Modular Capability Cards with real Micro-UI previews (No stock photos)
 * - Grounded 3-Tier Sovereign Architecture Topology Diagram
 * - Real Vertical SaaS Operational Matrix
 * - Verified Compliance & Engineering Standards (NDPR, GDPR, AES-256-GCM, Paystack/Stripe)
 */

import { renderNavbar } from '../components/navbar';
import { renderFooter } from '../components/footer';

export function renderHomePage(): string {
  return `
    <div class="page-wrapper">
      ${renderNavbar('home')}

      <main>
        <!-- ═══════════════════════════════════════════════════════════════
             1. PRODUCT-FIRST ENTERPRISE HERO
             ═══════════════════════════════════════════════════════════════ -->
        <section class="hz-hero" id="home-flagship-hero">
          <div class="site-container hz-hero-site-container">

            <div class="hz-hero-copy">
              <!-- Kicker Pill -->
              <div class="hero-kicker-pill hz-anim-fade-up">
                <span class="pulse-dot"></span>
                <span>Enterprise Foundation for Vertical SaaS</span>
              </div>

              <!-- Main Title -->
              <h1 class="hz-hero-title hz-anim-fade-up" style="animation-delay: 0.1s;">
                Build &amp; Launch Industry Software.<br />
                <span class="hz-hero-red">In Days, Not Months.</span>
              </h1>

              <!-- Subtitle -->
              <p class="hz-hero-desc hz-anim-fade-up" style="animation-delay: 0.2s;">
                Database-enforced multi-tenant isolation, real-time hardware telemetry, omnichannel WhatsApp CRM, and deterministic sub-millisecond business rules — all in one unified platform.
              </p>

              <!-- Actions -->
              <div class="hz-hero-actions hz-anim-fade-up" style="animation-delay: 0.3s;">
                <a href="#/console" class="hz-btn-primary" id="btn-hero-primary">
                  Launch Console Free
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </a>
                <a href="#/architecture" class="hz-btn-outline" id="btn-hero-secondary">
                  View Architecture &amp; Security
                </a>
              </div>

              <!-- Guarantee Strip -->
              <div class="hero-guarantee-strip hz-anim-fade-up" style="animation-delay: 0.4s;">
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  100% Database RLS Isolation
                </span>
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Deterministic &lt;1ms Rules
                </span>
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  No Credit Card Required
                </span>
              </div>
            </div>

            <!-- ── PRODUCT SHOWCASE WINDOW ── -->
            <div class="hero-showcase-window hz-anim-fade-up" style="animation-delay: 0.45s;" id="hero-product-showcase">
              <!-- Window Topbar -->
              <div class="hero-window-topbar">
                <div class="hero-window-dots">
                  <span></span><span></span><span></span>
                </div>
                <div class="hero-window-url">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <span>console.zexcore.app/workspace/lagos-fleet</span>
                </div>
                <div class="hero-window-badge">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>100% Isolated Tenant</span>
                </div>
              </div>

              <!-- Window Tab Control -->
              <div class="hero-showcase-tabs">
                <button class="hero-tab-btn active" data-tab="tab-fleet">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
                  <span>Fleet &amp; Sensor Hub</span>
                </button>
                <button class="hero-tab-btn" data-tab="tab-crm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <span>WhatsApp CRM</span>
                </button>
                <button class="hero-tab-btn" data-tab="tab-rules">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                  <span>Automation Engine</span>
                </button>
                <button class="hero-tab-btn" data-tab="tab-vault">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <span>Audit &amp; Security Vault</span>
                </button>
              </div>

              <!-- Tab Panel 1: Fleet & Sensor Hub -->
              <div class="hero-tab-panel active" id="tab-fleet">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
                  
                  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                      <div>
                        <div style="font-size: 0.86rem; font-weight: 750; color: #0f172a;">Cold Chain Node #04</div>
                        <div style="font-size: 0.72rem; color: #64748b;">Pharmaceutical Vaccine Storage</div>
                      </div>
                      <span style="font-size: 0.68rem; font-weight: 700; background: #dcfce7; color: #15803d; border: 1px solid #86efac; padding: 2px 6px; border-radius: 4px;">NORMAL</span>
                    </div>
                    <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px;">
                      <span style="font-size: 1.6rem; font-weight: 850; color: #0f172a;">-18.4°C</span>
                      <span style="font-size: 0.75rem; color: #16a34a; font-weight: 600;">Optimal Range (-22°C to -15°C)</span>
                    </div>
                    <svg width="100%" height="32" viewBox="0 0 240 32" fill="none" style="display: block; margin-bottom: 10px;">
                      <path d="M0 24 Q 40 18, 80 20 T 160 14 T 240 18" stroke="#0284c7" stroke-width="2" fill="none"/>
                      <path d="M0 24 Q 40 18, 80 20 T 160 14 T 240 18 L 240 32 L 0 32 Z" fill="rgba(2, 132, 199, 0.08)"/>
                    </svg>
                    <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 8px;">
                      <span>Battery: <strong>3.82V (98%)</strong></span>
                      <span>Signal: <strong>-68 dBm</strong></span>
                      <span>Sync: <strong>1s ago</strong></span>
                    </div>
                  </div>

                  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                      <div>
                        <div style="font-size: 0.86rem; font-weight: 750; color: #0f172a;">Reefer Hauler GPS-82</div>
                        <div style="font-size: 0.72rem; color: #64748b;">Lagos &bull; Ibadan Logistics Route</div>
                      </div>
                      <span style="font-size: 0.68rem; font-weight: 700; background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; padding: 2px 6px; border-radius: 4px;">IN TRANSIT</span>
                    </div>
                    <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px;">
                      <span style="font-size: 1.6rem; font-weight: 850; color: #0f172a;">64 km/h</span>
                      <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">Engine Temp: 84°C</span>
                    </div>
                    <svg width="100%" height="32" viewBox="0 0 240 32" fill="none" style="display: block; margin-bottom: 10px;">
                      <path d="M0 16 Q 60 22, 120 12 T 240 14" stroke="#16a34a" stroke-width="2" fill="none"/>
                      <path d="M0 16 Q 60 22, 120 12 T 240 14 L 240 32 L 0 32 Z" fill="rgba(22, 163, 74, 0.08)"/>
                    </svg>
                    <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 8px;">
                      <span>Geofence: <strong>Corridor Alpha</strong></span>
                      <span>Fuel: <strong>82%</strong></span>
                      <span>Telemetry: <strong>Live</strong></span>
                    </div>
                  </div>

                </div>
              </div>

              <!-- Tab Panel 2: WhatsApp CRM -->
              <div class="hero-tab-panel" id="tab-crm">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
                  
                  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px;">
                    <div style="font-size: 0.75rem; font-weight: 750; color: #475569; text-transform: uppercase; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
                      <span>Incoming Conversation</span>
                      <span style="color: #15803d; font-weight: 700;">+234 803 491 8201</span>
                    </div>
                    
                    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px 8px 8px 2px; padding: 10px; margin-bottom: 10px; font-size: 0.8rem; color: #1e293b; line-height: 1.45;">
                      Hello, we need to schedule temperature-controlled transport for 12 cartons of diagnostic reagent to Ibadan by tomorrow 10 AM. Can we confirm booking deposit?
                      <div style="font-size: 0.65rem; color: #94a3b8; text-align: right; margin-top: 4px;">10:14 AM</div>
                    </div>

                    <div style="background: #dcf8c6; border: 1px solid #bbf7d0; border-radius: 8px 8px 2px 8px; padding: 10px; font-size: 0.8rem; color: #14532d; line-height: 1.45; margin-left: 20px;">
                      <strong>ZexCore Automated Dispatch:</strong> Booking #TK-982 confirmed. Reefer van assigned with live telemetry tracking. Deposit of <strong>$150.00</strong> verified via Paystack.
                      <div style="font-size: 0.65rem; color: #15803d; text-align: right; margin-top: 4px; display: flex; align-items: center; justify-content: flex-end; gap: 4px;">
                        <span>10:14 AM</span>
                        <svg width="12" height="10" viewBox="0 0 16 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 7l3.5 3.5L12 2"/><path d="M5 7l3.5 3.5L15 2"/></svg>
                      </div>
                    </div>
                  </div>

                  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
                    <div style="font-size: 0.82rem; font-weight: 750; color: #0f172a; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                      <span>CRM Deal Pipeline</span>
                      <span style="font-size: 0.72rem; color: #15803d; font-weight: 700; background: #dcfce7; padding: 2px 6px; border-radius: 4px;">STAGE: WON</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                      <div style="padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; color: #0f172a;">
                          <span>Metropolitan Diagnostic Labs</span>
                          <span style="color: #e11d48;">$1,800.00</span>
                        </div>
                        <div style="font-size: 0.72rem; color: #64748b; margin-top: 3px;">Refrigerated Pharma Transit &bull; 1-Click Paystack Receipt</div>
                      </div>
                      <div style="padding: 10px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; color: #0f172a;">
                          <span>Prime Logistics Enclave</span>
                          <span style="color: #475569;">$2,450.00</span>
                        </div>
                        <div style="font-size: 0.72rem; color: #64748b; margin-top: 3px;">Cold Storage Contract Renewal &bull; Awaiting Sign-off</div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <!-- Tab Panel 3: Automation Rules -->
              <div class="hero-tab-panel" id="tab-rules">
                <div style="background: #0f172a; border-radius: 8px; padding: 18px; color: #e2e8f0; font-family: var(--font-mono, monospace); font-size: 0.78rem; line-height: 1.6;">
                  <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 8px; margin-bottom: 12px; font-size: 0.72rem; color: #94a3b8;">
                    <span>RULE_ID: rule_pharma_coldchain_09</span>
                    <span style="color: #4ade80; font-weight: 700;">EXECUTION_LATENCY: 0.68ms • VERIFIED</span>
                  </div>
                  <div><span style="color: #f43f5e; font-weight: 700;">TRIGGER:</span> <span style="color: #38bdf8;">iot.telemetry.temperature_breach</span></div>
                  <div><span style="color: #f59e0b; font-weight: 700;">CONDITION:</span> <code>payload.temp &gt; -15.0 AND payload.duration_secs &gt;= 120</code></div>
                  <div style="margin-top: 6px;"><span style="color: #22c55e; font-weight: 700;">ACTIONS:</span></div>
                  <div style="padding-left: 16px; color: #cbd5e1;">
                    1. dispatch_whatsapp(to: "+2348034918201", template: "temp_warning_urgent")<br/>
                    2. notify_ops_desk(priority: "critical", auto_escalate: true)<br/>
                    3. append_audit_hash(vault: "cold_chain_compliance", tamper_proof: true)
                  </div>
                </div>
              </div>

              <!-- Tab Panel 4: Audit & Security Vault -->
              <div class="hero-tab-panel" id="tab-vault">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
                  
                  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                      <span style="font-size: 0.75rem; font-weight: 750; color: #0f172a;">CRYPTOGRAPHIC MERKLE ROOT</span>
                      <span style="font-size: 0.68rem; font-weight: 700; color: #15803d; background: #dcfce7; padding: 2px 6px; border-radius: 4px;">TAMPER-EVIDENT</span>
                    </div>
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; font-family: var(--font-mono, monospace); font-size: 0.72rem; color: #0284c7; word-break: break-all; margin-bottom: 8px;">
                      0x8f2a99d41e7804193bca512b988f01a35712e2f3d1009184ba3b612c771e
                    </div>
                    <div style="font-size: 0.74rem; color: #64748b; line-height: 1.5;">
                      Append-only hash chaining ensures no entry, deal modification, or deletion can be modified without triggering mathematical integrity failure.
                    </div>
                  </div>

                  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                      <span style="font-size: 0.75rem; font-weight: 750; color: #0f172a;">DATA ERASURE (GDPR / NDPR)</span>
                      <span style="font-size: 0.68rem; font-weight: 700; color: #0369a1; background: #e0f2fe; padding: 2px 6px; border-radius: 4px;">ARTICLE 17</span>
                    </div>
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; font-size: 0.74rem; color: #334155; line-height: 1.5; margin-bottom: 8px;">
                      Cryptographic field shredding overwrites PII with redaction tokens while preserving the tamper-evident timestamp hash on the immutable ledger.
                    </div>
                    <div style="font-size: 0.72rem; color: #16a34a; font-weight: 700; display: flex; align-items: center; gap: 4px;">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Non-repudiation verified by HMAC blind index
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════
             2. 4 CONCRETE METRIC INVARIANTS (TECHNICAL SPECIFICATIONS)
             ═══════════════════════════════════════════════════════════════ -->
        <section class="section-white" style="padding: 36px 0 48px 0; border-bottom: 1px solid var(--border-default);">
          <div class="site-container">
            <div class="hero-metrics-4col">
              
              <div class="hero-metric-card">
                <div class="metric-icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div>
                  <div class="metric-big-val">100% RLS Isolation</div>
                  <div class="metric-sub-lbl">Database-level Row-Level Security guarantee</div>
                </div>
              </div>

              <div class="hero-metric-card">
                <div class="metric-icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </div>
                <div>
                  <div class="metric-big-val">&lt; 1ms Rule Engine</div>
                  <div class="metric-sub-lbl">Deterministic in-memory condition evaluation</div>
                </div>
              </div>

              <div class="hero-metric-card">
                <div class="metric-icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div>
                  <div class="metric-big-val">AES-256-GCM Vault</div>
                  <div class="metric-sub-lbl">Hardware-isolated key destruction pipelines</div>
                </div>
              </div>

              <div class="hero-metric-card">
                <div class="metric-icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div>
                  <div class="metric-big-val">Meta &amp; Paystack Sync</div>
                  <div class="metric-sub-lbl">Official WhatsApp webhook &amp; banking sync</div>
                </div>
              </div>

            </div>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════
             3. 10-MINUTE WALKTHROUGH (CONCRETE ENGINEERING WORKFLOW)
             ═══════════════════════════════════════════════════════════════ -->
        <section class="section-tinted-red section-padded" id="onboarding-walkthrough" style="padding: 84px 0 96px;">
          <div class="site-container">

            <div style="text-align:center; max-width: 720px; margin: 0 auto 52px auto;">
              <h2 class="section-title" style="margin-bottom: 14px; font-size: 2.3rem;">
                Up and running in <span class="text-brand">ten minutes.</span>
              </h2>
              <p class="section-desc" style="font-size: 1.05rem; color: #475569; margin: 0; line-height: 1.65;">
                No empty screens. No month-long implementation hurdles. Answer one question to spin up a fully functioning vertical SaaS instance with realistic catalog data and automated WhatsApp lead capture.
              </p>
            </div>

            <div class="onboard-v2-grid">

              <!-- Step 1: Industry Blueprint -->
              <div class="onboard-v2-card">
                <div class="onboard-step-label">STEP 01</div>
                <h3 class="onboard-v2-title">Select Your Industry Blueprint</h3>
                <p class="onboard-v2-desc">
                  Choose your vertical — clinic, logistics, property, or field services. ZexCore deploys pre-configured PostgreSQL schemas, state machines, and RLS policies tailored to your domain.
                </p>
                <div class="onboard-v2-mockup">
                  <div class="onboard-v2-mockup-header">
                    <span>Industry Blueprint Preset</span>
                    <div class="onboard-v2-dots"><span></span><span></span><span></span></div>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 7px 10px; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 6px; font-size: 0.8rem; font-weight: 700; color: #991b1b;">
                      <span>Healthcare Clinic &amp; Diagnostics</span>
                      <span style="font-size: 0.7rem; background: #e11d48; color: #fff; padding: 2px 6px; border-radius: 4px;">ACTIVE</span>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 7px 10px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8rem; color: #475569;">
                      <span>Logistics Fleet &amp; Telemetry</span>
                      <span style="font-size: 0.7rem; color: #94a3b8;">Preset</span>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 7px 10px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8rem; color: #475569;">
                      <span>Real Estate &amp; Property CRM</span>
                      <span style="font-size: 0.7rem; color: #94a3b8;">Preset</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Step 2: Instant Working Showcase -->
              <div class="onboard-v2-card">
                <div class="onboard-step-label">STEP 02</div>
                <h3 class="onboard-v2-title">Instant Live Customer Portal</h3>
                <p class="onboard-v2-desc">
                  Immediately receive a live customer-facing portal loaded with realistic sample listings, booking calendars, and service fees. Fully editable and branded to your business.
                </p>
                <div class="onboard-v2-mockup">
                  <div class="onboard-v2-mockup-header">
                    <span>https://clinic.zexcore.app</span>
                    <div class="onboard-v2-dots"><span></span><span></span><span></span></div>
                  </div>
                  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                      <div style="font-size: 0.82rem; font-weight: 800; color: #0f172a;">Metropolitan Medical Center</div>
                      <span style="font-size: 0.68rem; font-weight: 700; color: #16a34a; background: #dcfce7; padding: 2px 6px; border-radius: 4px;">LIVE</span>
                    </div>
                    <div style="font-size: 0.76rem; color: #64748b; margin-bottom: 8px;">Cardiology Consultation &bull; Dr. Mensah</div>
                    <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 6px; border-top: 1px dashed #e2e8f0;">
                      <span style="font-size: 0.78rem; font-weight: 750; color: #0f172a;">$120.00 deposit</span>
                      <span style="font-size: 0.72rem; font-weight: 700; color: #e11d48;">Book Online &rarr;</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Step 3: Direct WhatsApp Leads -->
              <div class="onboard-v2-card">
                <div class="onboard-step-label">STEP 03</div>
                <h3 class="onboard-v2-title">WhatsApp Leads &amp; Instant Deposits</h3>
                <p class="onboard-v2-desc">
                  Customer bookings dispatch automated notifications directly to your WhatsApp. Accept deposits via Mobile Money or Stripe without customer friction.
                </p>
                <div class="onboard-v2-mockup">
                  <div class="onboard-v2-mockup-header">
                    <span style="color: #15803d; font-weight: 700;">WhatsApp Business Webhook</span>
                  </div>
                  <div style="background: #dcf8c6; border: 1px solid #bbf7d0; border-radius: 8px 8px 0 8px; padding: 10px; margin-left: 12px;">
                    <div style="font-size: 0.78rem; font-weight: 700; color: #14532d; margin-bottom: 4px;">New Patient Appointment #482</div>
                    <div style="font-size: 0.74rem; color: #166534; line-height: 1.4;">
                      Dr. Mensah &bull; Today, 14:30<br/>
                      Deposit paid via MoMo: <strong>$50.00</strong>
                    </div>
                    <div style="font-size: 0.65rem; color: #15803d; text-align: right; margin-top: 4px;">Delivered &bull; Just now</div>
                  </div>
                </div>
              </div>

            </div>

            <!-- Standout Call-to-Action Bar -->
            <div class="onboard-v2-cta-bar">
              <div class="onboard-v2-cta-copy">
                <h3>Experience the 10-minute setup firsthand</h3>
                <p>Launch your isolated tenant environment with sample catalog data in less time than making coffee.</p>
              </div>
              <div class="onboard-v2-cta-actions">
                <a href="#/console" class="btn btn-primary btn-lg" style="font-weight: 800;">
                  Launch Console Free &rarr;
                </a>
                <a href="#/docs#quickstart" class="btn btn-secondary btn-lg" style="font-weight: 600;">
                  View Quickstart Guide
                </a>
              </div>
            </div>

          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════
             4. FOUR MODULAR CAPABILITY CARDS (PURE UI MICRO-PREVIEWS, NO STOCK PHOTOS)
             ═══════════════════════════════════════════════════════════════ -->
        <section class="section-white section-padded whats-new-section" style="padding: 76px 0 88px 0; border-bottom: 1px solid var(--border-default);">
          <div class="site-container">
            <div class="whats-new-header text-center">
              <h2 class="whats-new-title" style="font-size: 2.25rem;">Everything Your Software Needs</h2>
              <div class="whats-new-red-bar"></div>
              <p class="whats-new-subtitle" style="font-size: 1.05rem; color: #475569; max-width: 680px; margin: 0 auto 48px auto;">
                Pre-built foundational capabilities ready to power your vertical product. Click any capability to explore its live operations console.
              </p>
            </div>

            <div class="whats-new-cards-grid">
              
              <!-- 1. Industrial IoT -->
              <div class="whats-new-card">
                <div class="micro-preview-box">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 0.72rem; font-weight: 750; color: #0f172a;">TELEMETRY STREAM</span>
                    <span style="font-size: 0.65rem; color: #16a34a; font-weight: 700; background: #dcfce7; padding: 2px 6px; border-radius: 4px;">LIVE 20Hz</span>
                  </div>
                  <div style="font-size: 1.25rem; font-weight: 850; color: #0f172a; margin-bottom: 6px;">
                    -18.4°C <span style="font-size: 0.75rem; font-weight: 600; color: #64748b;">(4.1V, 99%)</span>
                  </div>
                  <svg width="100%" height="28" viewBox="0 0 200 28" fill="none">
                    <path d="M0 20 Q 50 10, 100 16 T 200 12" stroke="#e11d48" stroke-width="2" fill="none"/>
                  </svg>
                </div>
                <div class="whats-new-content">
                  <h3 class="whats-new-card-title">Live Hardware &amp; Sensor Tracking</h3>
                  <p class="whats-new-card-desc">
                    Connect temperature monitors, vehicle GPS trackers, and physical machinery directly to your dashboard with live automated threshold alerts.
                  </p>
                  <a href="#/console/iot" class="btn btn-primary btn-sm" style="margin-top: auto; justify-content: center; font-weight: 750;">
                    Open Sensor Hub &rarr;
                  </a>
                </div>
              </div>

              <!-- 2. Deterministic Rules -->
              <div class="whats-new-card">
                <div class="micro-preview-box" style="background: #0f172a; color: #e2e8f0; font-family: var(--font-mono, monospace); font-size: 0.72rem;">
                  <div style="color: #38bdf8; margin-bottom: 4px;">// In-memory AST rule</div>
                  <div><span style="color: #f43f5e;">WHEN</span> reading &gt; 80°C</div>
                  <div><span style="color: #22c55e;">THEN</span> dispatch_alert(sms)</div>
                  <div style="color: #94a3b8; margin-top: 6px; font-size: 0.68rem;">Latency: 0.72ms &bull; 0 drops</div>
                </div>
                <div class="whats-new-content">
                  <h3 class="whats-new-card-title">Automated Decisions &amp; Alerts</h3>
                  <p class="whats-new-card-desc">
                    Create smart rules that respond automatically: dispatch WhatsApp alerts when thresholds spike, confirm bookings, or trigger payments instantly without writing code.
                  </p>
                  <a href="#/console/rules" class="btn btn-primary btn-sm" style="margin-top: auto; justify-content: center; font-weight: 750;">
                    Open Automations Studio &rarr;
                  </a>
                </div>
              </div>

              <!-- 3. Sovereign CRM -->
              <div class="whats-new-card">
                <div class="micro-preview-box">
                  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.74rem; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
                      <span>New WhatsApp Lead</span>
                      <span style="color: #16a34a;">Won ($1,400)</span>
                    </div>
                    <div style="font-size: 0.7rem; color: #64748b;">"Deposit received via Paystack"</div>
                  </div>
                </div>
                <div class="whats-new-content">
                  <h3 class="whats-new-card-title">WhatsApp CRM &amp; Lead Pipelines</h3>
                  <p class="whats-new-card-desc">
                    Turn customer conversations into revenue. Chat directly with leads on WhatsApp, manage deals through a visual pipeline, and collect deposits via Paystack or Mobile Money.
                  </p>
                  <a href="#/console/crm" class="btn btn-primary btn-sm" style="margin-top: auto; justify-content: center; font-weight: 750;">
                    Open WhatsApp CRM &rarr;
                  </a>
                </div>
              </div>

              <!-- 4. Cryptographic Compliance -->
              <div class="whats-new-card">
                <div class="micro-preview-box">
                  <div style="font-size: 0.72rem; font-weight: 750; color: #0f172a; margin-bottom: 6px;">
                    AES-256-GCM FIELD VAULT
                  </div>
                  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; font-family: var(--font-mono, monospace); font-size: 0.68rem; color: #0284c7; word-break: break-all;">
                    SHA256: 0x9f8a...4b12 [VERIFIED]
                  </div>
                </div>
                <div class="whats-new-content">
                  <h3 class="whats-new-card-title">Customer Data Privacy &amp; Vault</h3>
                  <p class="whats-new-card-desc">
                    Keep sensitive client and patient records completely secure. Built-in bank-grade encryption, privacy consent tracking, and tamper-proof audit trails.
                  </p>
                  <a href="#/console/compliance" class="btn btn-primary btn-sm" style="margin-top: auto; justify-content: center; font-weight: 750;">
                    Open Privacy Vault &rarr;
                  </a>
                </div>
              </div>

            </div>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════
             5. GROUNDED 3-TIER SOVEREIGN ARCHITECTURE TOPOLOGY
             ═══════════════════════════════════════════════════════════════ -->
        <section class="section-tinted-red section-padded" style="padding: 80px 0;">
          <div class="site-container">
            <div class="multi-tenant-split-grid">
              
              <div class="multi-tenant-copy">
                <h2 class="section-title" style="text-align: left; font-size: 2.35rem; font-weight: 850; letter-spacing: -0.04em; margin-bottom: 18px; line-height: 1.15;">
                  100% Guaranteed Client Privacy by Design
                </h2>
                <p style="font-size: 1.05rem; color: #475569; line-height: 1.7; margin-bottom: 34px; max-width: 490px;">
                  Give every business, clinic, or agency client their own dedicated workspace. Under the hood, our database engine mathematically isolates each customer’s records &mdash; making data leaks structurally impossible.
                </p>
                <a href="#/architecture" class="btn btn-primary btn-lg" style="font-weight: 800;">
                  See Security &amp; Isolation Architecture &rarr;
                </a>
              </div>

              <!-- Grounded Architecture Topology Diagram -->
              <div class="stack-illustration-col">
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.08);">
                  
                  <div style="display: flex; flex-direction: column; gap: 14px;">
                    <!-- Tier 1 -->
                    <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 14px 18px;">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <span style="font-size: 0.82rem; font-weight: 750; color: #0f172a;">TIER 1 &bull; CLIENT WORKSPACES</span>
                        <span style="font-size: 0.68rem; font-weight: 700; color: #e11d48; background: #fff1f2; padding: 2px 6px; border-radius: 4px;">ISOLATED</span>
                      </div>
                      <div style="font-size: 0.74rem; color: #64748b;">
                        Custom Domains &bull; White-Label Branding &bull; Role-Based Access Control (RBAC)
                      </div>
                    </div>

                    <div style="text-align: center; color: #94a3b8; font-size: 0.75rem;">&darr; Authenticated Session Token (JWT + Tenant ID)</div>

                    <!-- Tier 2 -->
                    <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 14px 18px;">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <span style="font-size: 0.82rem; font-weight: 750; color: #0f172a;">TIER 2 &bull; REAL-TIME ORCHESTRATION FABRIC</span>
                        <span style="font-size: 0.68rem; font-weight: 700; color: #0284c7; background: #e0f2fe; padding: 2px 6px; border-radius: 4px;">&lt; 1ms LATENCY</span>
                      </div>
                      <div style="font-size: 0.74rem; color: #64748b;">
                        WhatsApp Webhooks &bull; IoT MQTT Ingestion &bull; Deterministic Rules AST &bull; Paystack Gateway
                      </div>
                    </div>

                    <div style="text-align: center; color: #94a3b8; font-size: 0.75rem;">&darr; Row-Level Security Execution Policy</div>

                    <!-- Tier 3 -->
                    <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 14px 18px;">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <span style="font-size: 0.82rem; font-weight: 750; color: #0f172a;">TIER 3 &bull; SOVEREIGN ENCLAVE &amp; STORAGE</span>
                        <span style="font-size: 0.68rem; font-weight: 700; color: #16a34a; background: #dcfce7; padding: 2px 6px; border-radius: 4px;">BANK GRADE</span>
                      </div>
                      <div style="font-size: 0.74rem; color: #64748b;">
                        PostgreSQL Row-Level Security &bull; AES-256-GCM Field Encryption &bull; Append-Only Hash Chain
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════
             6. VERTICAL SAAS OPERATIONAL MATRIX (REPLACES REFINERY STOCK PHOTO)
             ═══════════════════════════════════════════════════════════════ -->
        <section class="section-white section-padded" style="padding: 80px 0; border-bottom: 1px solid var(--border-default);">
          <div class="site-container">
            <div style="text-align: center; max-width: 720px; margin: 0 auto 48px auto;">
              <h2 class="section-title" style="font-size: 2.2rem; margin-bottom: 12px;">
                Proven Across Critical Operational Verticals
              </h2>
              <p style="font-size: 1.05rem; color: #475569; line-height: 1.65; margin: 0;">
                ZexCore replaces fragile glued-together SaaS stacks with one pre-engineered platform designed for real-world reliability.
              </p>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px;">
              
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 24px;">
                <div style="font-size: 0.75rem; font-weight: 750; color: #e11d48; margin-bottom: 6px;">HEALTHCARE &amp; CLINICAL</div>
                <div style="font-size: 1.1rem; font-weight: 800; color: #0f172a; margin-bottom: 10px;">Diagnostic Clinics</div>
                <div style="font-size: 0.85rem; color: #475569; line-height: 1.6;">
                  Patient booking calendars, automated test-ready WhatsApp alerts, private clinical portals, and NDPR health record vaults.
                </div>
              </div>

              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 24px;">
                <div style="font-size: 0.75rem; font-weight: 750; color: #0284c7; margin-bottom: 6px;">COLD CHAIN &amp; LOGISTICS</div>
                <div style="font-size: 1.1rem; font-weight: 800; color: #0f172a; margin-bottom: 10px;">Fleet &amp; Perishables</div>
                <div style="font-size: 0.85rem; color: #475569; line-height: 1.6;">
                  Real-time GPS tracking, wireless temperature telemetry, instant threshold alerts, and driver dispatch workflows.
                </div>
              </div>

              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 24px;">
                <div style="font-size: 0.75rem; font-weight: 750; color: #16a34a; margin-bottom: 6px;">REAL ESTATE &amp; TENANCY</div>
                <div style="font-size: 1.1rem; font-weight: 800; color: #0f172a; margin-bottom: 10px;">Property Portals</div>
                <div style="font-size: 0.85rem; color: #475569; line-height: 1.6;">
                  Listing showcase sites, automated lead capture to CRM, lease document storage, and recurring rent collection.
                </div>
              </div>

              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 24px;">
                <div style="font-size: 0.75rem; font-weight: 750; color: #d97706; margin-bottom: 6px;">DIGITAL AGENCIES</div>
                <div style="font-size: 1.1rem; font-weight: 800; color: #0f172a; margin-bottom: 10px;">Multi-Tenant SaaS</div>
                <div style="font-size: 0.85rem; color: #475569; line-height: 1.6;">
                  Manage up to 25 isolated client instances under your agency brand with dedicated client subdomains and unified billing.
                </div>
              </div>

            </div>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════
             7. VERIFIED STANDARDS & COMPLIANCE (REPLACES BUZZWORD BADGES)
             ═══════════════════════════════════════════════════════════════ -->
        <section class="section-ambient-red section-padded" style="padding: 56px 0 68px 0;">
          <div class="site-container">
            <div class="trust-bar-header" style="text-align: center; margin-bottom: 32px;">
              <span class="trust-bar-title" style="font-size: 0.98rem; font-weight: 750; color: var(--text-main); letter-spacing: 0.02em;">
                Engineered to strict international data and security standards
              </span>
            </div>

            <div class="trust-badges-row">
              <div class="trust-badge-card">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e11d48" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>NDPR &amp; GDPR Art. 17</span>
              </div>

              <div class="trust-badge-card">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e11d48" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span>AES-256-GCM Vault</span>
              </div>

              <div class="trust-badge-card">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e11d48" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Sub-Millisecond Engine</span>
              </div>

              <div class="trust-badge-card">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e11d48" stroke-width="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                <span>Paystack &amp; Stripe Native</span>
              </div>
            </div>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════
             8. FINAL CONVERSION BANNER
             ═══════════════════════════════════════════════════════════════ -->
        <section class="home-final-cta-section">
          <div class="site-container">
            <div class="home-final-cta-inner">
              <h2 class="home-final-cta-title">Launch Your Business Software Today on ZexCore</h2>
              <p class="home-final-cta-desc">
                Get private client portals, live hardware tracking, instant WhatsApp alerts, and automated billing in 10 minutes. No complex setup, no vendor lock-in, free to start.
              </p>
              <div class="home-final-cta-actions">
                <a href="#/console" class="btn btn-primary btn-lg" style="padding: 14px 32px; font-size: 1.05rem; font-weight: 800;">
                  Launch Console Free &rarr;
                </a>
                <a href="#/pricing" class="btn btn-secondary btn-lg" style="padding: 14px 28px; font-size: 1.05rem; background: #ffffff; color: #17191d; border: 1.5px solid #d0d6de; font-weight: 700;">
                  See Plans &amp; Pricing
                </a>
              </div>
              <div class="home-final-cta-guarantees">
                <span class="home-final-guarantee-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e11d48" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  100% Private Client Workspaces
                </span>
                <span class="home-final-guarantee-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e11d48" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Bank-Grade Data Protection
                </span>
                <span class="home-final-guarantee-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e11d48" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  No Credit Card Required
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      ${renderFooter()}
    </div>
  `;
}

/**
 * Attaches interactive handlers for the hero showcase tabs
 */
export function setupHomePageEvents(): void {
  const showcaseEl = document.getElementById('hero-product-showcase');
  if (!showcaseEl) return;

  const tabBtns = showcaseEl.querySelectorAll<HTMLButtonElement>('.hero-tab-btn');
  const panels = showcaseEl.querySelectorAll<HTMLElement>('.hero-tab-panel');

  if (tabBtns.length === 0 || panels.length === 0) return;

  // Clear any legacy timer
  if ((window as any).__zexcore_hero_timer) {
    clearInterval((window as any).__zexcore_hero_timer);
    (window as any).__zexcore_hero_timer = null;
  }

  function activateTab(tabId: string) {
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });
    panels.forEach(panel => {
      panel.classList.toggle('active', panel.id === tabId);
    });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // User manual click stops auto-cycling
      if ((window as any).__zexcore_hero_timer) {
        clearInterval((window as any).__zexcore_hero_timer);
        (window as any).__zexcore_hero_timer = null;
      }
      const tabId = btn.getAttribute('data-tab');
      if (tabId) activateTab(tabId);
    });
  });

  // Smooth auto-cycle between tabs every 6 seconds until user interacts
  const tabIds = Array.from(tabBtns).map(b => b.getAttribute('data-tab')!).filter(Boolean);
  let currentIndex = 0;

  (window as any).__zexcore_hero_timer = setInterval(() => {
    currentIndex = (currentIndex + 1) % tabIds.length;
    activateTab(tabIds[currentIndex]);
  }, 6000);
}
