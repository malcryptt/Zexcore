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

          <!-- Product & Features Dropdown -->
          <div class="nav-dropdown-item">
            <button class="nav-dropdown-btn ${(activePage === 'modules' || activePage === 'platform' || activePage === 'console') ? 'active' : ''}">
              <span>Product</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="nav-dropdown-menu">
              <a href="#/console/crm" class="nav-dropdown-link">
                <div class="nav-dropdown-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div>
                  <div class="nav-dropdown-title">WhatsApp &amp; CRM Inbox</div>
                  <div class="nav-dropdown-desc">Customer chat, deal pipelines &amp; Paystack payment links</div>
                </div>
              </a>
              <a href="#/console/iot" class="nav-dropdown-link">
                <div class="nav-dropdown-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
                </div>
                <div>
                  <div class="nav-dropdown-title">Live Sensor &amp; Fleet Hub</div>
                  <div class="nav-dropdown-desc">Real-time hardware tracking, GPS &amp; temperature alerts</div>
                </div>
              </a>
              <a href="#/console/rules" class="nav-dropdown-link">
                <div class="nav-dropdown-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                </div>
                <div>
                  <div class="nav-dropdown-title">Automated Business Rules</div>
                  <div class="nav-dropdown-desc">Instant trigger actions and alerts without writing code</div>
                </div>
              </a>
              <a href="#/console/compliance" class="nav-dropdown-link">
                <div class="nav-dropdown-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <div>
                  <div class="nav-dropdown-title">Data Privacy &amp; GDPR Vault</div>
                  <div class="nav-dropdown-desc">Bank-grade encryption &amp; customer record protection</div>
                </div>
              </a>
              <a href="#/console/audit" class="nav-dropdown-link">
                <div class="nav-dropdown-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                </div>
                <div>
                  <div class="nav-dropdown-title">Audit Ledger &amp; Finance</div>
                  <div class="nav-dropdown-desc">Tamper-proof financial logs &amp; compliance evidence</div>
                </div>
              </a>
              <div style="border-top: 1px solid var(--border-default); margin: 6px 0; padding-top: 6px;">
                <a href="#/platform" class="nav-dropdown-link" style="padding: 6px 12px;">
                  <span style="font-size: 0.78rem; font-weight: 700; color: #E50920;">Overview of All Platform Capabilities &rarr;</span>
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
                  <div class="nav-dropdown-title">Web &amp; Software Agencies</div>
                  <div class="nav-dropdown-desc">White-labeled portals &amp; 25 private client workspaces</div>
                </div>
              </a>
              <a href="#/solutions#solutions-regulated" class="nav-dropdown-link">
                <div class="nav-dropdown-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <div>
                  <div class="nav-dropdown-title">Healthcare &amp; Diagnostics</div>
                  <div class="nav-dropdown-desc">Private patient records, doctor bookings &amp; HIPAA vault</div>
                </div>
              </a>
              <a href="#/solutions" class="nav-dropdown-link">
                <div class="nav-dropdown-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/></svg>
                </div>
                <div>
                  <div class="nav-dropdown-title">Cold-Chain &amp; Logistics</div>
                  <div class="nav-dropdown-desc">Live truck temperature alerts &amp; WhatsApp driver updates</div>
                </div>
              </a>
              <div style="border-top: 1px solid var(--border-default); margin: 6px 0; padding-top: 6px;">
                <a href="#/solutions" class="nav-dropdown-link" style="padding: 6px 12px;">
                  <span style="font-size: 0.78rem; font-weight: 700; color: #E50920;">Explore All Industry Blueprints &rarr;</span>
                </a>
              </div>
            </div>
          </div>

          <a href="#/pricing" class="nav-link ${activePage === 'pricing' ? 'active' : ''}">Pricing</a>

          <!-- Developers Dropdown -->
          <div class="nav-dropdown-item">
            <button class="nav-dropdown-btn ${(activePage === 'architecture' || activePage === 'security' || activePage === 'docs') ? 'active' : ''}">
              <span>Developers</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="nav-dropdown-menu">
              <a href="#/architecture" class="nav-dropdown-link">
                <div class="nav-dropdown-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
                </div>
                <div>
                  <div class="nav-dropdown-title">System Architecture</div>
                  <div class="nav-dropdown-desc">3-tier micro-kernel &amp; database design</div>
                </div>
              </a>
              <a href="#/security" class="nav-dropdown-link">
                <div class="nav-dropdown-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div>
                  <div class="nav-dropdown-title">Security &amp; RLS Whitepaper</div>
                  <div class="nav-dropdown-desc">PostgreSQL 17 session isolation &amp; proof</div>
                </div>
              </a>
              <a href="#/docs" class="nav-dropdown-link">
                <div class="nav-dropdown-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <div>
                  <div class="nav-dropdown-title">API &amp; Developer Docs</div>
                  <div class="nav-dropdown-desc">Fastify micro-kernel endpoints &amp; webhooks</div>
                </div>
              </a>
            </div>
          </div>

          <a href="#/about" class="nav-link ${activePage === 'about' ? 'active' : ''}">About</a>
          <a href="#/contact" class="nav-link ${activePage === 'contact' ? 'active' : ''}">Contact</a>
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
            <a href="#/about" class="mobile-nav-link ${activePage === 'about' ? 'active' : ''}">About ZexCore</a>
            
            <div style="padding: 10px 16px 4px; font-size: 0.72rem; font-weight: 800; color: #e50920; text-transform: uppercase; letter-spacing: 0.05em;">
              Product Capabilities
            </div>
            <a href="#/console/crm" class="mobile-nav-link" style="padding-left: 28px;">WhatsApp &amp; CRM Inbox</a>
            <a href="#/console/iot" class="mobile-nav-link" style="padding-left: 28px;">Sensor &amp; Fleet Tracking</a>
            <a href="#/console/rules" class="mobile-nav-link" style="padding-left: 28px;">Automated Business Rules</a>
            <a href="#/console/compliance" class="mobile-nav-link" style="padding-left: 28px;">Privacy &amp; GDPR Vault</a>
            <a href="#/console/audit" class="mobile-nav-link" style="padding-left: 28px;">Audit &amp; Financial Ledger</a>
            <a href="#/platform" class="mobile-nav-link" style="padding-left: 28px;">Platform Overview</a>
            
            <div style="padding: 10px 16px 4px; font-size: 0.72rem; font-weight: 800; color: #e50920; text-transform: uppercase; letter-spacing: 0.05em; border-top: 1px solid var(--border-default); margin-top: 8px;">
              Industry Solutions
            </div>
            <a href="#/solutions" class="mobile-nav-link ${activePage === 'solutions' ? 'active' : ''}">All Industry Blueprints</a>
            <a href="#/pricing" class="mobile-nav-link ${activePage === 'pricing' ? 'active' : ''}">Pricing Plans</a>

            <div style="padding: 10px 16px 4px; font-size: 0.72rem; font-weight: 800; color: #e50920; text-transform: uppercase; letter-spacing: 0.05em; border-top: 1px solid var(--border-default); margin-top: 8px;">
              Developers &amp; Engineering
            </div>
            <a href="#/architecture" class="mobile-nav-link ${activePage === 'architecture' ? 'active' : ''}" style="padding-left: 28px;">Architecture Stack</a>
            <a href="#/security" class="mobile-nav-link ${activePage === 'security' ? 'active' : ''}" style="padding-left: 28px;">Security &amp; RLS Whitepaper</a>
            <a href="#/docs" class="mobile-nav-link ${activePage === 'docs' ? 'active' : ''}" style="padding-left: 28px;">Developer Documentation</a>

            <div style="border-top: 1px solid var(--border-default); margin: 8px 0;"></div>
            <a href="#/contact" class="mobile-nav-link ${activePage === 'contact' ? 'active' : ''}">Contact Support</a>
          </div>
          <div class="mobile-drawer-actions">
            <a href="#/signin" class="btn btn-secondary" style="width: 100%; justify-content: center; font-weight: 600;">Sign In</a>
            <a href="#/console" class="btn btn-primary" style="width: 100%; justify-content: center; font-weight: 750;">Launch Live Console &rarr;</a>
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

