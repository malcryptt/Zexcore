/**
 * ZexCore Enterprise Sign-In Page
 * Split-panel: Brand showcase left, Credential + Firebase auth form right
 */

import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  sendPasswordReset,
  loginDemoTenant,
  type AuthUserProfile,
} from '../lib/firebase';

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

            <div class="signin-architecture-mini" aria-hidden="true">
              <div class="signin-layer signin-layer-top"><span></span><span></span><span></span></div>
              <div class="signin-layer signin-layer-mid"><span></span><span></span><span></span></div>
              <div class="signin-layer signin-layer-base"><span></span><span></span><span></span></div>
              <div class="signin-layer-caption"><b>ZexCore Core</b><small>Tenant isolation · RBAC · Sovereign Auth</small></div>
            </div>


          </div>
        </div>
      </div>

      <!-- RIGHT: Credential & Auth Form Panel -->
      <div class="signin-form-panel">
        <div class="signin-form-inner">
          <div class="signin-form-header">
            <div class="signin-form-kicker">SECURE WORKSPACE ACCESS</div>
            <h1 class="signin-form-title" id="auth-title">Welcome back.</h1>
            <p class="signin-form-subtitle" id="auth-subtitle">Sign in to your ZexCore workspace.</p>
          </div>

          <!-- Auth Mode Switcher Tab -->
          <div class="auth-mode-tabs" style="display: flex; background: #f1f3f7; border-radius: 8px; padding: 4px; margin-bottom: 22px; gap: 4px;">
            <button type="button" class="auth-tab-btn active" id="tab-mode-signin" style="flex: 1; border: none; background: #fff; color: #17191d; font-weight: 700; font-size: 0.82rem; padding: 8px 12px; border-radius: 6px; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.06); transition: all .15s ease;">
              Sign In
            </button>
            <button type="button" class="auth-tab-btn" id="tab-mode-signup" style="flex: 1; border: none; background: transparent; color: #64748b; font-weight: 600; font-size: 0.82rem; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: all .15s ease;">
              Create Account
            </button>
          </div>

          <!-- Alert / Status Banner -->
          <div id="auth-alert-box" style="display: none; padding: 10px 14px; border-radius: 6px; margin-bottom: 18px; font-size: 0.82rem; line-height: 1.4;"></div>

          <!-- Google Social Sign-In -->
          <button type="button" class="btn" id="btn-google-auth" style="width: 100%; min-height: 46px; background: #ffffff; color: #1f2937; border: 1px solid #d1d5db; font-size: 0.88rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 10px; border-radius: 7px; cursor: pointer; transition: background .15s, border-color .15s; margin-bottom: 18px;">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Continue with Google
          </button>

          <div class="auth-divider" style="margin: 16px 0 20px; display: flex; align-items: center; text-align: center; color: #8a93a1; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.05em;">
            <span style="flex: 1; border-bottom: 1px solid #e5e7eb;"></span>
            <span style="padding: 0 10px;">OR WORK EMAIL</span>
            <span style="flex: 1; border-bottom: 1px solid #e5e7eb;"></span>
          </div>

          <form id="auth-form" onsubmit="event.preventDefault();">
            <div class="form-group" id="group-name" style="display: none; margin-bottom: 16px;">
              <label class="form-label" for="auth-name">Full Name</label>
              <input
                type="text"
                id="auth-name"
                class="input"
                placeholder="Ada Lovelace"
              />
            </div>

            <div class="form-group" style="margin-bottom: 16px;">
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

            <div class="form-group" style="margin-bottom: 16px;">
              <label class="form-label" for="auth-email">Work Email</label>
              <input
                type="email"
                id="auth-email"
                class="input"
                value="admin@${activeTenant}.com"
                placeholder="name@company.com"
                required
              />
            </div>

            <div class="form-group" style="margin-bottom: 18px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label class="form-label" for="auth-password" style="margin-bottom: 0;">Password</label>
                <a href="javascript:void(0)" id="link-forgot-password" style="font-size: 0.75rem; color: #e50920; text-decoration: none; font-weight: 600;">Forgot password?</a>
              </div>
              <input
                type="password"
                id="auth-password"
                class="input"
                placeholder="Enter your password (min 6 chars)"
                required
              />
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px;">
              <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: #64748b; cursor: pointer;">
                <input type="checkbox" id="auth-remember" checked style="accent-color: #e50920;" />
                Remember this device for 30 days
              </label>
            </div>

            <button type="submit" class="btn btn-primary" id="btn-submit-signin" style="width: 100%; padding: 12px; font-size: 0.95rem; justify-content: center; background: #e50920; border-color: #e50920;">
              Sign In to Workspace →
            </button>
          </form>

          <div class="auth-divider" style="margin: 28px 0 18px; display: flex; align-items: center; text-align: center; color: #8a93a1; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em;">
            <span style="flex: 1; border-bottom: 1px solid #e5e7eb;"></span>
            <span style="padding: 0 10px;">QUICK DEMO WORKSPACES</span>
            <span style="flex: 1; border-bottom: 1px solid #e5e7eb;"></span>
          </div>

          <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 8px;">
            <button type="button" class="btn btn-secondary" id="btn-demo-acme" style="width: 100%; padding: 11px 20px; justify-content: center; font-size: 0.88rem; font-weight: 700; border: 1.5px solid #d1d5db; border-radius: 7px;">
              Launch Demo Workspace &rarr;
            </button>
            <button type="button" id="btn-superadmin-login" style="width: 100%; padding: 9px 16px; justify-content: center; font-size: 0.82rem; font-weight: 700; background: #fff5f7; border: 1px dashed #E50920; color: #E50920; border-radius: 7px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Direct Superadmin Sign-In (hello@zexlabs.com.ng)
            </button>
          </div>

          <div style="text-align: center; margin-top: 28px; padding-top: 24px; border-top: 1px solid var(--border-default);">
            <p style="font-size: 0.8rem; color: var(--text-muted);">
              Need a custom deployment or dedicated cluster?
              <a href="#/pricing" style="color: var(--primary); font-weight: 600; text-decoration: none; margin-left: 4px;">View Enterprise Plans →</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function setupSignInEvents(onSuccess: (tenant: string, user: AuthUserProfile) => void): void {
  let isSignUpMode = false;

  const tabSignIn = document.getElementById('tab-mode-signin');
  const tabSignUp = document.getElementById('tab-mode-signup');
  const groupName = document.getElementById('group-name');
  const authTitle = document.getElementById('auth-title');
  const authSubtitle = document.getElementById('auth-subtitle');
  const btnSubmit = document.getElementById('btn-submit-signin') as HTMLButtonElement | null;
  const alertBox = document.getElementById('auth-alert-box');

  const showAlert = (message: string, isError = true) => {
    if (!alertBox) return;
    alertBox.style.display = 'block';
    alertBox.style.background = isError ? '#fef2f2' : '#f0fdf4';
    alertBox.style.color = isError ? '#991b1b' : '#166534';
    alertBox.style.border = `1px solid ${isError ? '#fecaca' : '#bbf7d0'}`;
    alertBox.textContent = message;
  };

  const hideAlert = () => {
    if (alertBox) alertBox.style.display = 'none';
  };

  // Switch between Sign In and Sign Up
  const setMode = (signUp: boolean) => {
    isSignUpMode = signUp;
    hideAlert();
    if (signUp) {
      tabSignUp?.classList.add('active');
      tabSignUp?.setAttribute('style', 'flex: 1; border: none; background: #fff; color: #17191d; font-weight: 700; font-size: 0.82rem; padding: 8px 12px; border-radius: 6px; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.06); transition: all .15s ease;');
      tabSignIn?.classList.remove('active');
      tabSignIn?.setAttribute('style', 'flex: 1; border: none; background: transparent; color: #64748b; font-weight: 600; font-size: 0.82rem; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: all .15s ease;');

      if (groupName) groupName.style.display = 'block';
      if (authTitle) authTitle.textContent = 'Create your account.';
      if (authSubtitle) authSubtitle.textContent = 'Get started with ZexCore Enterprise platform and your dedicated tenant.';
      if (btnSubmit) btnSubmit.textContent = 'Create Enterprise Account →';
    } else {
      tabSignIn?.classList.add('active');
      tabSignIn?.setAttribute('style', 'flex: 1; border: none; background: #fff; color: #17191d; font-weight: 700; font-size: 0.82rem; padding: 8px 12px; border-radius: 6px; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.06); transition: all .15s ease;');
      tabSignUp?.classList.remove('active');
      tabSignUp?.setAttribute('style', 'flex: 1; border: none; background: transparent; color: #64748b; font-weight: 600; font-size: 0.82rem; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: all .15s ease;');

      if (groupName) groupName.style.display = 'none';
      if (authTitle) authTitle.textContent = 'Welcome back.';
      if (authSubtitle) authSubtitle.textContent = 'Sign in to your ZexCore control console.';
      if (btnSubmit) btnSubmit.textContent = 'Sign In to Workspace →';
    }
  };

  tabSignIn?.addEventListener('click', () => setMode(false));
  tabSignUp?.addEventListener('click', () => setMode(true));

  // Form submit handler
  document.getElementById('auth-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const slug = (document.getElementById('auth-workspace') as HTMLInputElement)?.value.trim() || 'acme_corp';
    const cleanTenant = slug.replace(/[^a-zA-Z0-9_]/g, '_');
    const email = (document.getElementById('auth-email') as HTMLInputElement)?.value.trim();
    const pass = (document.getElementById('auth-password') as HTMLInputElement)?.value;
    const name = (document.getElementById('auth-name') as HTMLInputElement)?.value.trim();

    if (!email || !pass) {
      showAlert('Please enter both your work email and password.');
      return;
    }

    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.textContent = isSignUpMode ? 'Creating account...' : 'Authenticating...';
    }

    try {
      let user: AuthUserProfile;
      if (isSignUpMode) {
        user = await registerWithEmail(email, pass, name, cleanTenant);
        showAlert('Account created successfully! Redirecting...', false);
      } else {
        user = await loginWithEmail(email, pass, cleanTenant);
        showAlert('Authentication verified! Loading workspace...', false);
      }

      if (user?.email) {
        localStorage.setItem('zexcore_user_email', user.email.toLowerCase().trim());
      }

      setTimeout(() => {
        onSuccess(cleanTenant, user);
      }, 350);
    } catch (err: unknown) {
      console.error('Auth error:', err);
      let msg = 'Authentication failed. Please check your credentials.';
      if (err instanceof Error) {
        const raw = err.message;
        if (raw.includes('auth/invalid-credential') || raw.includes('wrong-password') || raw.includes('user-not-found')) {
          msg = 'Invalid email or password. Please verify and try again.';
        } else if (raw.includes('auth/email-already-in-use')) {
          msg = 'An account with this email already exists. Switch to Sign In.';
        } else if (raw.includes('auth/weak-password')) {
          msg = 'Password is too weak. Please use at least 6 characters.';
        } else if (raw.includes('auth/invalid-email')) {
          msg = 'Please enter a valid work email address.';
        } else {
          msg = raw;
        }
      }
      showAlert(msg, true);
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = isSignUpMode ? 'Create Enterprise Account →' : 'Sign In to Workspace →';
      }
    }
  });

  // Google sign in handler
  document.getElementById('btn-google-auth')?.addEventListener('click', async () => {
    hideAlert();
    const slug = (document.getElementById('auth-workspace') as HTMLInputElement)?.value.trim() || 'acme_corp';
    const cleanTenant = slug.replace(/[^a-zA-Z0-9_]/g, '_');

    try {
      const user = await loginWithGoogle(cleanTenant);
      if (user?.email) {
        localStorage.setItem('zexcore_user_email', user.email.toLowerCase().trim());
      }
      showAlert(`Welcome ${user.displayName || user.email}! Launching console...`, false);
      setTimeout(() => {
        onSuccess(cleanTenant, user);
      }, 400);
    } catch (err: unknown) {
      console.error('Google Auth error:', err);
      if (err instanceof Error && !err.message.includes('popup-closed-by-user')) {
        showAlert('Google sign-in error: ' + err.message, true);
      }
    }
  });

  // Forgot Password handler
  document.getElementById('link-forgot-password')?.addEventListener('click', async () => {
    const email = (document.getElementById('auth-email') as HTMLInputElement)?.value.trim();
    if (!email) {
      showAlert('Enter your email in the box below first, then click "Forgot password?".');
      return;
    }
    try {
      await sendPasswordReset(email);
      showAlert(`Password reset link sent to ${email}. Check your inbox.`, false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not send reset link.';
      showAlert('Password reset error: ' + msg, true);
    }
  });

  // Direct Superadmin Access (hello@zexlabs.com.ng - Zero Paywall)
  document.getElementById('btn-superadmin-login')?.addEventListener('click', () => {
    localStorage.setItem('zexcore_user_email', 'hello@zexlabs.com.ng');
    const user: AuthUserProfile = {
      uid: 'superadmin_zexlabs_master',
      email: 'hello@zexlabs.com.ng',
      displayName: 'ZexCore Superadmin',
      photoURL: null,
      tenantSlug: 'default',
      isDemo: false
    };
    localStorage.setItem('zexcore_auth_session', JSON.stringify(user));
    onSuccess('default', user);
  });

  // Quick Demo Access buttons
  document.getElementById('btn-demo-acme')?.addEventListener('click', () => {
    const user = loginDemoTenant('acme_corp', 'Acme Enterprise Corp');
    onSuccess('acme_corp', user);
  });

  document.getElementById('btn-demo-globex')?.addEventListener('click', () => {
    const user = loginDemoTenant('globex_corp', 'Globex Research');
    onSuccess('globex_corp', user);
  });

  document.getElementById('btn-demo-soylent')?.addEventListener('click', () => {
    const user = loginDemoTenant('soylent_ind', 'Soylent Dynamics');
    onSuccess('soylent_ind', user);
  });
}
