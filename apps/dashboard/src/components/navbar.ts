/**
 * ZexCore Enterprise Navigation Bar Component
 * Red & White Design System | Structured Categories & Standout CTAs
 */

export function renderNavbar(activePage: string): string {
  return `
    <header class="site-header">
      <div class="header-inner">
        <a href="#/home" class="brand-link" id="nav-brand-logo" aria-label="ZexCore Home">
          <img src="/zexcore-logo-light.png" alt="ZexCore" class="site-logo" />
        </a>

        <nav class="desktop-nav" aria-label="Main Navigation">
          <a href="#/home" class="nav-link ${activePage === 'home' ? 'active' : ''}">Home</a>

          <!-- Modules & Engines Dropdown -->
          <div class="nav-dropdown-item">
            <button class="nav-dropdown-btn ${(activePage === 'modules' || activePage === 'console') ? 'active' : ''}">
              <span>Modules</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="nav-dropdown-menu">
              <a href="#/console/iot" class="nav-dropdown-link">
                <div class="nav-dropdown-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
                </div>
                <div>
                  <div class="nav-dropdown-title">IoT Fleet &amp; Telemetry</div>
                  <div class="nav-dropdown-desc">Hardware tokens, live sensor streams &amp; edge diagnostics</div>
                </div>
              </a>
              <a href="#/console/rules" class="nav-dropdown-link">
                <div class="nav-dropdown-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                </div>
                <div>
                  <div class="nav-dropdown-title">Rules &amp; AI Authoring</div>
                  <div class="nav-dropdown-desc">Deterministic AST graphs &amp; Gemini AI rule authoring</div>
                </div>
              </a>
              <a href="#/console/crm" class="nav-dropdown-link">
                <div class="nav-dropdown-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div>
                  <div class="nav-dropdown-title">CRM &amp; WhatsApp Inbox</div>
                  <div class="nav-dropdown-desc">Omnichannel chat, Kanban deals &amp; Paystack bookings</div>
                </div>
              </a>
              <a href="#/console/compliance" class="nav-dropdown-link">
                <div class="nav-dropdown-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <div>
                  <div class="nav-dropdown-title">Compliance &amp; GDPR Vault</div>
                  <div class="nav-dropdown-desc">AES-256-GCM encryption &amp; Right-to-be-Forgotten erasure</div>
                </div>
              </a>
              <a href="#/console/audit" class="nav-dropdown-link">
                <div class="nav-dropdown-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                </div>
                <div>
                  <div class="nav-dropdown-title">Audit &amp; Financial Health</div>
                  <div class="nav-dropdown-desc">Posture checks, reconciliation &amp; evidence packs</div>
                </div>
              </a>
              <div style="border-top: 1px solid var(--border-default); margin: 6px 0; padding-top: 6px;">
                <a href="#/modules" class="nav-dropdown-link" style="padding: 6px 12px;">
                  <span style="font-size: 0.78rem; font-weight: 700; color: #E50920;">View All 6 Modules &rarr;</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Solutions Dropdown -->
          <div class="nav-dropdown-item">
            <button class="nav-dropdown-btn ${activePage === 'solutions' ? 'active' : ''}">
              <span>Solutions</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="nav-dropdown-menu">
              <a href="#/solutions#solutions-agency" class="nav-dropdown-link">
                <div class="nav-dropdown-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.26L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>
                <div>
                  <div class="nav-dropdown-title">Web &amp; Digital Agencies</div>
                  <div class="nav-dropdown-desc">Turnkey SaaS, 25 client workspaces &amp; white-labeling</div>
                </div>
              </a>
              <a href="#/solutions#solutions-regulated" class="nav-dropdown-link">
                <div class="nav-dropdown-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <div>
                  <div class="nav-dropdown-title">Regulated Verticals</div>
                  <div class="nav-dropdown-desc">Healthcare &amp; fintech compliance with AES-256 vault</div>
                </div>
              </a>
              <div style="border-top: 1px solid var(--border-default); margin: 6px 0; padding-top: 6px;">
                <a href="#/solutions" class="nav-dropdown-link" style="padding: 6px 12px;">
                  <span style="font-size: 0.78rem; font-weight: 700; color: #E50920;">Explore All Solutions &rarr;</span>
                </a>
              </div>
            </div>
          </div>

          <a href="#/platform" class="nav-link ${activePage === 'platform' ? 'active' : ''}">Platform</a>
          <a href="#/architecture" class="nav-link ${activePage === 'architecture' ? 'active' : ''}">Architecture</a>
          <a href="#/security" class="nav-link ${activePage === 'security' ? 'active' : ''}">Security</a>
          <a href="#/pricing" class="nav-link ${activePage === 'pricing' ? 'active' : ''}">Pricing</a>
          <a href="#/docs" class="nav-link ${activePage === 'docs' ? 'active' : ''}">Docs</a>
          <a href="#/about" class="nav-link ${activePage === 'about' ? 'active' : ''}">About</a>
        </nav>

        <div class="header-actions">
          <a href="#/signin" class="btn btn-secondary btn-sm" id="btn-header-signin" style="font-weight: 600;">Sign In</a>
          <a href="#/console" class="btn btn-primary" id="btn-header-launch" style="padding: 9px 18px; font-weight: 750; box-shadow: 0 4px 14px rgba(229, 9, 32, 0.28); border-radius: 6px;">
            Launch Console &rarr;
          </a>
          <button class="mobile-toggle" id="btn-mobile-menu" aria-label="Toggle navigation menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Drawer -->
      <div class="mobile-drawer" id="mobile-drawer">
        <div class="mobile-drawer-inner">
          <div class="mobile-drawer-links">
            <a href="#/home" class="mobile-nav-link ${activePage === 'home' ? 'active' : ''}">Home</a>
            
            <div style="padding: 10px 16px 4px; font-size: 0.72rem; font-weight: 800; color: #e50920; text-transform: uppercase; letter-spacing: 0.05em;">
              Platform Modules
            </div>
            <a href="#/console/iot" class="mobile-nav-link" style="padding-left: 28px;">IoT Fleet &amp; Telemetry</a>
            <a href="#/console/rules" class="mobile-nav-link" style="padding-left: 28px;">Rules &amp; AI Authoring</a>
            <a href="#/console/crm" class="mobile-nav-link" style="padding-left: 28px;">CRM &amp; WhatsApp Hub</a>
            <a href="#/console/compliance" class="mobile-nav-link" style="padding-left: 28px;">Compliance &amp; Vault</a>
            
            <div style="border-top: 1px solid var(--border-default); margin: 8px 0;"></div>
            <a href="#/solutions" class="mobile-nav-link ${activePage === 'solutions' ? 'active' : ''}">Vertical Solutions</a>
            <a href="#/platform" class="mobile-nav-link ${activePage === 'platform' ? 'active' : ''}">Platform Overview</a>
            <a href="#/architecture" class="mobile-nav-link ${activePage === 'architecture' ? 'active' : ''}">Architecture</a>
            <a href="#/security" class="mobile-nav-link ${activePage === 'security' ? 'active' : ''}">Security &amp; RLS</a>
            <a href="#/pricing" class="mobile-nav-link ${activePage === 'pricing' ? 'active' : ''}">Pricing Plans</a>
            <a href="#/docs" class="mobile-nav-link ${activePage === 'docs' ? 'active' : ''}">Developer Docs</a>
            <a href="#/about" class="mobile-nav-link ${activePage === 'about' ? 'active' : ''}">About ZexCore</a>
          </div>
          <div class="mobile-drawer-actions">
            <a href="#/signin" class="btn btn-secondary" style="width: 100%; justify-content: center; font-weight: 600;">Sign In to Workspace</a>
            <a href="#/console" class="btn btn-primary" style="width: 100%; justify-content: center; font-weight: 750;">Launch Control Console &rarr;</a>
          </div>
        </div>
      </div>
    </header>
  `;
}

export function setupNavbarEvents(): void {
  const toggleBtn = document.getElementById('btn-mobile-menu');
  const drawer = document.getElementById('mobile-drawer');

  toggleBtn?.addEventListener('click', () => {
    drawer?.classList.toggle('open');
  });

  // Close drawer upon clicking any link inside it
  drawer?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
    });
  });
}

