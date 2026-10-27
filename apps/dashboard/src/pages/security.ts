/**
 * ZexCore Security Page
 * Matches reference design: 2x2 card grid with PostgreSQL RLS code card, 3 feature bullet cards, and Security Principles bar
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
          <div class="page-hero-backdrop" style="background-image: url('/heroes/hero-security.jpg');"></div>
          <div class="site-container">
            <div class="page-intro-header page-hero-content-col">
              <div class="section-eyebrow">ENTERPRISE ASSURANCE</div>
              <h1 class="page-intro-title">Security Model &amp; Hardened Invariants</h1>
              <p class="page-intro-desc">
                Protecting tenant boundaries and sensitive data through layered authorization, database controls, cryptographic safeguards, and auditable operations.
              </p>
            </div>
          </div>
        </section>

        <!-- ── 2x2 SECURITY GRID ─────────────────────────────────────────── -->
        <section class="section-white section-padded" style="padding: 48px 0 64px 0;">
          <div class="site-container">
            <div class="security-2x2-grid">

              <!-- Card 1: PostgreSQL Row-Level Security (with SQL Code block) -->
              <div class="sec-card sec-card-code">
                <div class="sec-card-header">
                  <div class="sec-card-icon-wrap">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                      <ellipse cx="12" cy="5" rx="9" ry="3"/>
                      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="sec-card-title">PostgreSQL Row-Level Security</h3>
                    <p class="sec-card-subtitle">Tenant-scoped access with enforced RLS policies and session context.</p>
                  </div>
                </div>

                <div class="sec-sql-box">
                  <pre class="sec-sql-pre"><code><span style="color:#d71920;font-weight:700;">CREATE POLICY</span> tenant_isolation <span style="color:#d71920;font-weight:700;">ON</span> documents
  <span style="color:#d71920;font-weight:700;">FOR ALL TO</span> app_user
  <span style="color:#d71920;font-weight:700;">USING</span> (tenant_id = current_setting(
    <span style="color:#86efac;">'app.current_tenant_id'</span>, <span style="color:#93c5fd;">true</span>
  ));</code></pre>
                </div>

                <div class="sec-card-action">
                  <a href="#/docs#rls" class="btn btn-outline btn-sm">View Full Sample &rarr;</a>
                </div>
              </div>

              <!-- Card 2: Authentication & Authorization -->
              <div class="sec-card">
                <div class="sec-card-header">
                  <div class="sec-card-icon-wrap">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="sec-card-title">Authentication &amp; Authorization</h3>
                  </div>
                </div>
                <ul class="sec-bullet-list">
                  <li><span class="sec-bullet-dot"></span> JWT-based authentication</li>
                  <li><span class="sec-bullet-dot"></span> Role-based access control</li>
                  <li><span class="sec-bullet-dot"></span> Tenant membership validation</li>
                  <li><span class="sec-bullet-dot"></span> Capability checks</li>
                  <li><span class="sec-bullet-dot"></span> Secure token handling</li>
                </ul>
              </div>

              <!-- Card 3: Cryptographic Privacy Vault -->
              <div class="sec-card">
                <div class="sec-card-header">
                  <div class="sec-card-icon-wrap">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="sec-card-title">Cryptographic Privacy Vault</h3>
                  </div>
                </div>
                <ul class="sec-bullet-list">
                  <li><span class="sec-bullet-dot"></span> AES-256-GCM encryption</li>
                  <li><span class="sec-bullet-dot"></span> Tenant-specific key isolation</li>
                  <li><span class="sec-bullet-dot"></span> Authenticated encryption</li>
                  <li><span class="sec-bullet-dot"></span> Sensitive data handling</li>
                </ul>
              </div>

              <!-- Card 4: Auditing & Compliance -->
              <div class="sec-card">
                <div class="sec-card-header">
                  <div class="sec-card-icon-wrap">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10 9 9 9 8 9"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="sec-card-title">Auditing &amp; Compliance</h3>
                  </div>
                </div>
                <ul class="sec-bullet-list">
                  <li><span class="sec-bullet-dot"></span> Tenant-scoped audit events</li>
                  <li><span class="sec-bullet-dot"></span> Administrative action logs</li>
                  <li><span class="sec-bullet-dot"></span> Sensitive data access records</li>
                  <li><span class="sec-bullet-dot"></span> Privacy workflows</li>
                </ul>
              </div>

            </div>

            <!-- ── SECURITY PRINCIPLES ──────────────────────────────────── -->
            <div class="sec-principles-section" style="margin-top: 56px;">
              <h3 class="sec-principles-title">Security Principles</h3>
              <div class="sec-principles-grid">
                <div class="sec-principle-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <span>Defense in Depth</span>
                </div>
                <div class="sec-principle-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                  <span>Least Privilege</span>
                </div>
                <div class="sec-principle-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="3" y1="9" x2="21" y2="9"/>
                    <line x1="9" y1="21" x2="9" y2="9"/>
                  </svg>
                  <span>Tenant Boundaries</span>
                </div>
                <div class="sec-principle-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                  <span>Secure Defaults</span>
                </div>
                <div class="sec-principle-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                  <span>Auditable Ops</span>
                </div>
                <div class="sec-principle-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                  </svg>
                  <span>SoD</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        <!-- CTA Section -->
        <section class="section-tinted-red final-cta-section">
          <div class="site-container final-cta-inner">
            <h2 class="final-cta-headline">Audit ZexCore in Your Security Sandbox</h2>
            <p class="final-cta-subtext">
              Inspect active cryptographic keys, audit logs, and verified row-level policies directly in the control console.
            </p>
            <div class="final-cta-buttons">
              <a href="#/console" class="btn btn-primary btn-lg">
                Launch Control Console &rarr;
              </a>
              <a href="#/docs" class="btn btn-secondary btn-lg">
                Read Security Whitepaper
              </a>
            </div>
          </div>
        </section>
      </main>

      ${renderFooter()}
    </div>
  `;
}
