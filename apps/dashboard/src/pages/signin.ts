/**
 * ZexCore Enterprise Sign-In Page
 * Split-panel: Brand showcase left, credential form right
 */

export function renderSignInPage(activeTenant: string): string {
  return `
    <div class="signin-split-page">
      <!-- LEFT: Brand Showcase Panel -->
      <div class="signin-brand-panel">
        <div class="signin-brand-panel-inner">
          <a href="#/home" class="signin-brand-back" id="signin-back-home" aria-label="Back to homepage">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to Website
          </a>

          <div class="signin-brand-content">
            <img src="/zexcore-logo-horizontal.png" alt="ZexCore" class="signin-brand-logo" />
            <h2 class="signin-brand-headline">
              The Operating System for<br />Vertical SaaS.
            </h2>
            <p class="signin-brand-subtext">
              Access your multi-tenant control console — managing IoT telemetry, deterministic rules, CRM pipeline, and cryptographic compliance from a single, RLS-enforced platform.
            </p>

            <div class="signin-platform-stats">
              <div class="signin-stat">
                <div class="signin-stat-val">100%</div>
                <div class="signin-stat-lbl">Database-enforced RLS</div>
              </div>
              <div class="signin-stat">
                <div class="signin-stat-val">&lt; 1ms</div>
                <div class="signin-stat-lbl">AST rule evaluation</div>
              </div>
              <div class="signin-stat">
                <div class="signin-stat-val">AES-256</div>
                <div class="signin-stat-lbl">Envelope encryption</div>
              </div>
            </div>

            <div class="signin-security-note">
              <span class="signin-security-dot"></span>
              <span>All sessions enforce <code>SET LOCAL app.current_tenant_id</code> — zero cross-tenant data leakage.</span>
            </div>
          </div>

          <div class="signin-brand-footer">
            <span class="tech-badge">PostgreSQL 17</span>
            <span class="tech-badge">Fastify 5</span>
            <span class="tech-badge">Drizzle ORM</span>
            <span class="tech-badge">AES-256-GCM</span>
          </div>
        </div>
      </div>

      <!-- RIGHT: Credential Form Panel -->
      <div class="signin-form-panel">
        <div class="signin-form-inner">
          <div class="signin-form-header">
            <h1 class="signin-form-title">Sign in to ZexCore Control</h1>
            <p class="signin-form-subtitle">Enter your workspace credentials to access the operational console</p>
          </div>

          <form id="auth-form" onsubmit="event.preventDefault();">
            <div class="form-group">
              <label class="form-label" for="auth-workspace">Workspace Domain</label>
              <div style="display: flex; align-items: stretch;">
                <input
                  type="text"
                  id="auth-workspace"
                  class="input"
                  value="${activeTenant}"
                  placeholder="e.g. acme_corp"
                  style="border-top-right-radius: 0; border-bottom-right-radius: 0; border-right: none; flex: 1;"
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

            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
              <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--text-secondary); cursor: pointer;">
                <input type="checkbox" checked style="accent-color: var(--primary);" />
                Remember this device for 30 days
              </label>
              <span class="status-pill" style="font-size: 0.7rem;"><span class="status-dot"></span>SSO Ready</span>
            </div>

            <button type="button" class="btn btn-primary" id="btn-submit-signin" style="width: 100%; padding: 12px; font-size: 0.95rem; justify-content: center;">
              Sign In to Workspace →
            </button>
          </form>

          <div class="auth-divider" style="margin: 28px 0 20px;">
            <span>OR CONTINUE WITH DEMO ACCESS</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            <button class="btn btn-secondary signin-demo-btn" id="btn-demo-acme" style="justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div class="signin-demo-icon">🏭</div>
                <div style="text-align: left;">
                  <div style="font-weight: 700; font-size: 0.88rem;">Acme Enterprise Corp</div>
                  <div style="font-size: 0.74rem; color: var(--text-secondary); font-family: var(--font-mono);">prod-us-east · Industrial IoT</div>
                </div>
              </div>
              <span class="tier-badge">Admin Role</span>
            </button>
            <button class="btn btn-secondary signin-demo-btn" id="btn-demo-globex" style="justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div class="signin-demo-icon">🔬</div>
                <div style="text-align: left;">
                  <div style="font-weight: 700; font-size: 0.88rem;">Globex Research</div>
                  <div style="font-size: 0.74rem; color: var(--text-secondary); font-family: var(--font-mono);">dev-eu-west · CRM Pipeline</div>
                </div>
              </div>
              <span class="tier-badge">Ops Lead</span>
            </button>
            <button class="btn btn-secondary signin-demo-btn" id="btn-demo-soylent" style="justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div class="signin-demo-icon">🌱</div>
                <div style="text-align: left;">
                  <div style="font-weight: 700; font-size: 0.88rem;">Soylent Dynamics</div>
                  <div style="font-size: 0.74rem; color: var(--text-secondary); font-family: var(--font-mono);">staging-apac · Compliance</div>
                </div>
              </div>
              <span class="tier-badge">Compliance</span>
            </button>
          </div>

          <div style="text-align: center; margin-top: 28px; padding-top: 24px; border-top: 1px solid var(--border-default);">
            <p style="font-size: 0.8rem; color: var(--text-muted);">
              Don't have an account?
              <a href="#/pricing" style="color: var(--primary); font-weight: 600; text-decoration: none; margin-left: 4px;">View Pricing →</a>
            </p>
          </div>
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
