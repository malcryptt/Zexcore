/**
 * ZexCore Enterprise Authentication & Sign-In Page
 * Workspace Domain Resolution, SSO Ready, 1-Click Pre-Authenticated Roles
 */

export function renderSignInPage(activeTenant: string): string {
  return `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <a href="#/home">
            <img src="/zexcore-logo-horizontal.png" alt="ZexCore" class="auth-logo" />
          </a>
          <h2 class="auth-title">Sign in to ZexCore Control</h2>
          <p class="auth-subtitle">Access your enterprise workspace and operational control console</p>
        </div>

        <form id="auth-form" onsubmit="event.preventDefault();">
          <div class="form-group">
            <label class="form-label" for="auth-workspace">Workspace Domain</label>
            <div style="display: flex; align-items: center;">
              <input
                type="text"
                id="auth-workspace"
                class="input"
                value="${activeTenant}"
                placeholder="e.g. acme_corp"
                style="border-top-right-radius: 0; border-bottom-right-radius: 0;"
              />
              <span class="input-suffix-badge">.zexcore.io</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="auth-email">Work Email</label>
            <input
              type="email"
              id="auth-email"
              class="input"
              value="admin@${activeTenant}.com"
              placeholder="name@company.com"
            />
          </div>

          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <label class="form-label" for="auth-password" style="margin-bottom: 0;">Password</label>
              <a href="javascript:void(0)" style="font-size: 0.75rem; color: var(--primary); text-decoration: none;">Forgot password?</a>
            </div>
            <input
              type="password"
              id="auth-password"
              class="input"
              value="••••••••••••"
              placeholder="Enter password"
            />
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--text-secondary); cursor: pointer;">
              <input type="checkbox" checked style="accent-color: var(--primary);" /> Remember this device
            </label>
            <span class="status-pill" style="font-size: 0.7rem;"><span class="status-dot"></span>SSO Ready</span>
          </div>

          <button type="button" class="btn btn-primary" id="btn-submit-signin" style="width: 100%; padding: 11px; font-size: 0.92rem; justify-content: center;">
            Sign In to Workspace &rarr;
          </button>
        </form>

        <div class="auth-divider">
          <span>OR 1-CLICK DEMO ACCESS</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button class="btn btn-secondary" id="btn-demo-acme" style="justify-content: space-between; font-size: 0.82rem;">
            <span>🏢 <strong>Acme Enterprise Corp</strong></span>
            <span class="tier-badge">Admin Role</span>
          </button>
          <button class="btn btn-secondary" id="btn-demo-globex" style="justify-content: space-between; font-size: 0.82rem;">
            <span>🔬 <strong>Globex Research</strong></span>
            <span class="tier-badge">Ops Lead</span>
          </button>
          <button class="btn btn-secondary" id="btn-demo-soylent" style="justify-content: space-between; font-size: 0.82rem;">
            <span>🌱 <strong>Soylent Dynamics</strong></span>
            <span class="tier-badge">Compliance</span>
          </button>
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <a href="#/home" id="link-back-home" style="font-size: 0.84rem; color: var(--text-secondary); text-decoration: none;">
            &larr; Return to Public Website
          </a>
        </div>
      </div>
    </div>
  `;
}

export function setupSignInEvents(onSuccess: (tenant: string) => void): void {
  document.getElementById('btn-submit-signin')?.addEventListener('click', () => {
    const slug = (document.getElementById('auth-workspace') as HTMLInputElement)?.value || 'acme_corp';
    const cleanTenant = slug.replace(/[^a-zA-Z0-9_]/g, '_');
    onSuccess(cleanTenant);
  });

  document.getElementById('btn-demo-acme')?.addEventListener('click', () => {
    onSuccess('acme_corp');
  });

  document.getElementById('btn-demo-globex')?.addEventListener('click', () => {
    onSuccess('globex_corp');
  });

  document.getElementById('btn-demo-soylent')?.addEventListener('click', () => {
    onSuccess('soylent_ind');
  });
}
