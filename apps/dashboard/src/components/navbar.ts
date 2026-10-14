/**
 * ZexCore Enterprise Navigation Bar Component
 * Red & White Design System | Responsive with Mobile Drawer
 */

export function renderNavbar(activePage: string): string {
  const navLinks = [
    { id: 'home', label: 'Home', href: '#/home' },
    { id: 'platform', label: 'Platform', href: '#/platform' },
    { id: 'architecture', label: 'Architecture', href: '#/architecture' },
    { id: 'modules', label: 'Modules', href: '#/modules' },
    { id: 'solutions', label: 'Solutions', href: '#/solutions' },
    { id: 'security', label: 'Security', href: '#/security' },
    { id: 'docs', label: 'Docs', href: '#/docs' },
    { id: 'pricing', label: 'Pricing', href: '#/pricing' },
  ];

  return `
    <header class="site-header">
      <div class="header-inner">
        <a href="#/home" class="brand-link" id="nav-brand-logo" aria-label="ZexCore Home">
          <img src="/zexcore-logo-light.png" alt="ZexCore" class="site-logo" />
        </a>

        <nav class="desktop-nav" aria-label="Main Navigation">
          ${navLinks
            .map(
              (link) => `
            <a href="${link.href}" class="nav-link ${activePage === link.id ? 'active' : ''}">
              ${link.label}
            </a>
          `
            )
            .join('')}
        </nav>

        <div class="header-actions">
          <a href="#/signin" class="btn btn-secondary btn-sm" id="btn-header-signin">Sign In</a>
          <a href="#/console" class="btn btn-primary btn-sm" id="btn-header-launch">
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
            ${navLinks
              .map(
                (link) => `
              <a href="${link.href}" class="mobile-nav-link ${activePage === link.id ? 'active' : ''}">
                ${link.label}
              </a>
            `
              )
              .join('')}
          </div>
          <div class="mobile-drawer-actions">
            <a href="#/pricing" class="mobile-nav-link ${activePage === 'pricing' ? 'active' : ''}" style="color: var(--primary); font-weight: 600;">Pricing →</a>
            <a href="#/signin" class="btn btn-secondary" style="width: 100%; justify-content: center;">Sign In to Workspace</a>
            <a href="#/console" class="btn btn-primary" style="width: 100%; justify-content: center;">Launch Control Console &rarr;</a>
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
