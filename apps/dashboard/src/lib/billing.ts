/**
 * Client-Side Billing, Stripe Subscription Gateway & Feature Gating
 */

export type PlanTier = 'free' | 'starter' | 'growth' | 'agency' | 'enterprise' | 'dedicated';
export type BillingCycle = 'monthly' | 'annual';

export interface PlanMetadata {
  id: PlanTier;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  tagline: string;
  whoItsFor: string;
  mainLimits: string;
  badge?: string;
  allowedTabs: string[];
  features: string[];
  fromPrice?: boolean;
}

export const PLANS: Record<PlanTier, PlanMetadata> = {
  free: {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    tagline: 'Trying it out — 1 workspace, CMS only, 1 user.',
    whoItsFor: 'Trying it out',
    mainLimits: '1 workspace, CMS only, ZexCore subdomain, ZexCore branding, 1 user, Audit Basic included',
    allowedTabs: ['overview', 'audit'],
    features: [
      '1 workspace',
      'CMS & public site builder only',
      'ZexCore subdomain (*.zexcore.io)',
      'ZexCore branding footer',
      '1 team user',
      'Audit Basic (5 security posture checks)',
    ],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 19,
    annualPrice: 190,
    tagline: 'One small business getting started with CMS plus basic CRM.',
    whoItsFor: 'One small business',
    mainLimits: 'CMS plus basic CRM, 1 custom domain, 3 users, 1,000 contacts, Audit Basic included',
    allowedTabs: ['overview', 'crm', 'audit'],
    features: [
      'CMS plus basic CRM',
      '1 custom domain',
      '3 users',
      '1,000 contacts',
      'Lead stage tracking & notes',
      'Standard email support',
    ],
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    monthlyPrice: 49,
    annualPrice: 490,
    tagline: 'A growing business scaling appointments, automations, and omnichannel alerts.',
    whoItsFor: 'A growing business',
    mainLimits: 'Everything in Starter plus booking, automation rules, SMS and email, 10 users, 10,000 contacts, Audit Essentials included',
    badge: 'MOST POPULAR',
    allowedTabs: ['overview', 'crm', 'rules', 'audit'],
    features: [
      'Everything in Starter',
      'Booking & appointment scheduling',
      'Automation rules & event triggers',
      'SMS & email delivery',
      '10 users',
      '10,000 contacts',
      'Audit Essentials included',
    ],
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    monthlyPrice: 149,
    annualPrice: 1490,
    tagline: 'Agencies running multi-tenant ZexCore infrastructure for clients.',
    whoItsFor: 'Agencies running ZexCore for clients',
    mainLimits: 'Up to 25 client workspaces, white-label, Audit Essentials per workspace, 25,000 contacts total',
    allowedTabs: ['overview', 'crm', 'rules', 'iot', 'audit'],
    features: [
      'Growth features across client workspaces (booking, rules, SMS/email)',
      'Up to 25 client workspaces',
      '25,000 contacts total (shared across workspaces)',
      'Full white-label branding & domains',
      'Audit Essentials per workspace',
      'IoT fleet & telemetry hub',
      'Agency team collaboration',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 499,
    annualPrice: 4990,
    tagline: 'Larger organisations requiring unlimited users, SSO, and SLAs.',
    whoItsFor: 'Larger organisations',
    mainLimits: 'Unlimited users, SSO, SLA, priority support, Audit Business included, custom limits',
    fromPrice: true,
    allowedTabs: ['overview', 'crm', 'rules', 'iot', 'audit'],
    features: [
      'Unlimited users',
      'Single Sign-On (SSO / SAML)',
      '99.9% uptime SLA guarantee',
      'Priority 24/7 support',
      'Audit Business included (3-year retention & SIEM export)',
      'Custom contact & workspace limits',
    ],
  },
  dedicated: {
    id: 'dedicated',
    name: 'Dedicated / Regulated',
    monthlyPrice: 1500,
    annualPrice: 15000,
    tagline: 'Clinics, hospitals, and compliance-heavy sovereign deployments.',
    whoItsFor: 'Clinics and compliance-heavy clients',
    mainLimits: 'Dedicated instance, hardened tier, field encryption, signed agreements',
    fromPrice: true,
    allowedTabs: ['overview', 'crm', 'rules', 'iot', 'compliance', 'audit'],
    features: [
      'Dedicated cloud instance',
      'Hardened security tier',
      'Field-level AES-256-GCM encryption & blind indexes',
      'Data deletion tools (Cryptographic PII erasure & ledger proof)',
      'Signed agreements (BAA, DPA & custom SLA)',
      'Dedicated compliance engineer',
    ],
  },
};

const PLAN_STORAGE_KEY = 'zexcore_tenant_plan_v1';
const CYCLE_STORAGE_KEY = 'zexcore_tenant_billing_cycle_v1';

export function getTenantPlan(tenantSlug = 'default'): PlanTier {
  try {
    const raw = localStorage.getItem(`${PLAN_STORAGE_KEY}_${tenantSlug}`);
    if (raw && (raw in PLANS)) return raw as PlanTier;
    // Default to starter so soft paywalls and upgrade paths are immediately demonstrated
    return 'starter';
  } catch {
    return 'starter';
  }
}

export function setTenantPlan(plan: PlanTier, tenantSlug = 'default'): void {
  try {
    localStorage.setItem(`${PLAN_STORAGE_KEY}_${tenantSlug}`, plan);
  } catch (err) {
    console.warn('Could not store tenant plan:', err);
  }
}

export function getBillingCycle(): BillingCycle {
  try {
    return (localStorage.getItem(CYCLE_STORAGE_KEY) as BillingCycle) || 'monthly';
  } catch {
    return 'monthly';
  }
}

export function setBillingCycle(cycle: BillingCycle): void {
  try {
    localStorage.setItem(CYCLE_STORAGE_KEY, cycle);
  } catch (err) {
    console.warn('Could not store billing cycle:', err);
  }
}

export function isTabLocked(tabId: string, currentPlan: PlanTier): boolean {
  const plan = PLANS[currentPlan] || PLANS.starter;
  return !plan.allowedTabs.includes(tabId);
}

export type AuditLevel = 'basic' | 'essentials' | 'business' | 'enterprise';

export function getAuditTierForPlan(plan: PlanTier): AuditLevel {
  switch (plan) {
    case 'free':
    case 'starter':
      return 'basic';
    case 'growth':
    case 'agency':
      return 'essentials';
    case 'enterprise':
      return 'business';
    case 'dedicated':
      return 'enterprise';
    default:
      return 'basic';
  }
}

export function getRequiredPlanForTab(tabId: string): PlanTier {
  if (tabId === 'compliance') return 'dedicated';
  if (tabId === 'iot') return 'agency';
  if (tabId === 'rules') return 'growth';
  if (tabId === 'crm') return 'starter';
  if (tabId === 'audit') return 'free';
  return 'free';
}

export function getTabLockedInfo(tabId: string): { title: string; subtitle: string; icon: string; minPlan: PlanTier } {
  switch (tabId) {
    case 'compliance':
      return {
        title: 'Cryptographic Compliance Vault & Field Encryption',
        subtitle: 'Dedicated instances, hardened security tier, AES-256-GCM field encryption, and signed compliance agreements (NDPR / GDPR / HIPAA).',
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
        minPlan: 'dedicated',
      };
    case 'iot':
      return {
        title: 'IoT Fleet Telemetry & Multi-Client Hub',
        subtitle: 'Manage client hardware fleets across up to 25 workspaces with white-label branding, automated device rotation, and sensor streams.',
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
        minPlan: 'agency',
      };
    case 'rules':
      return {
        title: 'Automation Rules & Omnichannel Engine',
        subtitle: 'Automate booking reminders, deterministic multi-event triggers, and SMS/Email messaging workflows with Audit Essentials.',
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/></svg>`,
        minPlan: 'growth',
      };
    case 'crm':
      return {
        title: 'CRM Sales Pipeline & Contact Management',
        subtitle: 'Manage up to 1,000 customer contacts, track deals through pipeline stages, and connect your custom domain.',
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
        minPlan: 'starter',
      };
    default:
      return {
        title: 'Advanced Module Access',
        subtitle: 'Upgrade to unlock advanced platform capabilities.',
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/></svg>`,
        minPlan: 'growth',
      };
  }
}

export type PaymentGateway = 'stripe' | 'paystack' | 'flutterwave';

/**
 * Opens an interactive multi-gateway Checkout modal supporting Stripe, Paystack, and Flutterwave.
 */
export function openStripeCheckoutModal(
  targetPlan: PlanTier,
  initialCycle: BillingCycle = 'monthly',
  onSuccess?: (newPlan: PlanTier) => void
): void {
  // Remove any existing modal
  const existing = document.getElementById('stripe-checkout-modal-wrap');
  if (existing) existing.remove();

  const plan = PLANS[targetPlan] || PLANS.growth;
  let currentCycle = initialCycle;
  let currentGateway: PaymentGateway = 'stripe';
  let paystackChannel: 'card' | 'bank_transfer' | 'ussd' = 'card';
  let flwNetwork: 'mpesa' | 'mtn' | 'airtel' = 'mpesa';

  const modalWrap = document.createElement('div');
  modalWrap.id = 'stripe-checkout-modal-wrap';
  modalWrap.className = 'stripe-modal-overlay';

  function renderModalHtml(): string {
    const price = currentCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
    const billedLabel = currentCycle === 'annual'
      ? (plan.annualPrice === 0 ? 'Free forever' : `billed annually ($${plan.annualPrice}/yr)`)
      : (plan.monthlyPrice === 0 ? 'Free tier' : 'billed monthly');
    const ngnPrice = price * 1500;
    const kesPrice = price * 130;

    let gatewayContent = '';

    if (currentGateway === 'stripe') {
      gatewayContent = `
        <div class="stripe-form-group">
          <label>Email Address</label>
          <input type="email" id="checkout-input-email" required value="engineer@enterprise.io" class="stripe-input" />
        </div>

        <div class="stripe-form-group">
          <label>Card Information (Stripe Global)</label>
          <div class="stripe-card-field-wrap">
            <div class="stripe-card-input-row">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              <input type="text" id="stripe-input-card" value="4242 4242 4242 4242" class="stripe-card-number-input" required maxlength="19" />
              <span class="stripe-card-brand">VISA</span>
            </div>
            <div class="stripe-card-meta-row">
              <input type="text" id="stripe-input-exp" value="12/28" placeholder="MM/YY" class="stripe-meta-input" required maxlength="5" />
              <input type="text" id="stripe-input-cvc" value="382" placeholder="CVC" class="stripe-meta-input" required maxlength="4" />
            </div>
          </div>
        </div>

        <div class="stripe-form-group">
          <label>Country or Region</label>
          <select class="stripe-input" id="stripe-input-country">
            <option value="US" selected>United States (USD)</option>
            <option value="GB">United Kingdom (GBP)</option>
            <option value="EU">European Union (EUR)</option>
            <option value="CA">Canada (CAD)</option>
            <option value="AU">Australia (AUD)</option>
          </select>
        </div>

        <button type="submit" class="stripe-submit-btn" id="stripe-submit-btn">
          <span>Pay $${price} &amp; Activate ${plan.name}</span>
        </button>

        <div class="stripe-secure-note">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Encrypted via Stripe PCI-DSS Level 1 compliance. Cancel anytime.
        </div>
      `;
    } else if (currentGateway === 'paystack') {
      gatewayContent = `
        <div style="background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 0.74rem; font-weight: 700; color: #0f766e; text-transform: uppercase;">Paystack NGN Conversion</div>
            <div style="font-size: 1.15rem; font-weight: 900; color: #042f2e;">₦${ngnPrice.toLocaleString()} <span style="font-size: 0.75rem; font-weight: 500; color: #0f766e;">/ mo (1 USD = ₦1,500)</span></div>
          </div>
          <span style="font-weight: 900; color: #00C3F7; font-size: 1.1rem; letter-spacing: -0.04em;">paystack</span>
        </div>

        <div style="display: flex; gap: 6px; margin-bottom: 14px;">
          <button type="button" class="btn btn-sm ${paystackChannel === 'card' ? 'btn-primary' : 'btn-secondary'}" id="ps-chan-card" style="flex: 1; font-size: 0.74rem;">Card / Verve</button>
          <button type="button" class="btn btn-sm ${paystackChannel === 'bank_transfer' ? 'btn-primary' : 'btn-secondary'}" id="ps-chan-transfer" style="flex: 1; font-size: 0.74rem;">Bank Transfer</button>
          <button type="button" class="btn btn-sm ${paystackChannel === 'ussd' ? 'btn-primary' : 'btn-secondary'}" id="ps-chan-ussd" style="flex: 1; font-size: 0.74rem;">USSD (*737#)</button>
        </div>

        ${paystackChannel === 'bank_transfer' ? `
          <div style="background: #ffffff; border: 1.5px dashed #00C3F7; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
            <div style="font-size: 0.74rem; font-weight: 700; color: #64748b; margin-bottom: 4px;">Paystack Dedicated Virtual Account:</div>
            <div style="font-size: 1.25rem; font-weight: 900; font-family: var(--font-mono); color: #0f172a; margin-bottom: 4px;">9920 1488 21</div>
            <div style="font-size: 0.78rem; color: #334155;"><strong>Bank:</strong> Wema Bank / Titan Trust &bull; <strong>Name:</strong> ZexCore Cloud [${plan.name}]</div>
            <div style="font-size: 0.72rem; color: #16a34a; margin-top: 6px; display: flex; align-items: center; gap: 5px;">
              <span class="status-dot green"></span> Live webhook listener waiting for transfer
            </div>
          </div>
        ` : `
          <div class="stripe-form-group">
            <label>Nigerian Phone &amp; Email</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <input type="text" id="ps-phone" value="+234 803 892 1104" class="stripe-input" required />
              <input type="email" id="checkout-input-email" value="billing@africonnect.ng" class="stripe-input" required />
            </div>
          </div>

          <div class="stripe-form-group">
            <label>Card Details (Verve / Mastercard / Visa)</label>
            <div class="stripe-card-field-wrap">
              <div class="stripe-card-input-row">
                <input type="text" id="stripe-input-card" value="5061 0244 8812 9012" class="stripe-card-number-input" required maxlength="19" />
                <span class="stripe-card-brand" style="background:#f0fdfa; color:#0f766e; border-color:#ccfbf1;">VERVE</span>
              </div>
              <div class="stripe-card-meta-row">
                <input type="text" id="stripe-input-exp" value="09/27" placeholder="MM/YY" class="stripe-meta-input" required />
                <input type="text" id="stripe-input-cvc" value="819" placeholder="CVV" class="stripe-meta-input" required />
              </div>
            </div>
          </div>
        `}

        <button type="submit" class="stripe-submit-btn" id="stripe-submit-btn" style="background: #00C3F7;">
          <span>Pay ₦${ngnPrice.toLocaleString()} with Paystack</span>
        </button>

        <div class="stripe-secure-note">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Secured by Paystack (a Stripe company). Instant automated NGN activation.
        </div>
      `;
    } else {
      // Flutterwave
      gatewayContent = `
        <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 0.74rem; font-weight: 700; color: #b45309; text-transform: uppercase;">Flutterwave Mobile Money</div>
            <div style="font-size: 1.15rem; font-weight: 900; color: #78350f;">KES ${kesPrice.toLocaleString()} <span style="font-size: 0.75rem; font-weight: 500; color: #b45309;">/ mo ($${price} USD)</span></div>
          </div>
          <span style="font-weight: 900; color: #F5A623; font-size: 1.1rem; letter-spacing: -0.04em;">Flutterwave</span>
        </div>

        <div style="display: flex; gap: 6px; margin-bottom: 14px;">
          <button type="button" class="btn btn-sm ${flwNetwork === 'mpesa' ? 'btn-primary' : 'btn-secondary'}" id="flw-net-mpesa" style="flex: 1; font-size: 0.74rem;">M-Pesa (KE)</button>
          <button type="button" class="btn btn-sm ${flwNetwork === 'mtn' ? 'btn-primary' : 'btn-secondary'}" id="flw-net-mtn" style="flex: 1; font-size: 0.74rem;">MTN MoMo (GH)</button>
          <button type="button" class="btn btn-sm ${flwNetwork === 'airtel' ? 'btn-primary' : 'btn-secondary'}" id="flw-net-airtel" style="flex: 1; font-size: 0.74rem;">Airtel Money (UG)</button>
        </div>

        <div class="stripe-form-group">
          <label>Mobile Money Wallet Phone Number</label>
          <input type="text" id="flw-phone" value="${flwNetwork === 'mpesa' ? '+254 712 908 112' : flwNetwork === 'mtn' ? '+233 24 551 9021' : '+256 77 123 4567'}" class="stripe-input" required />
          <div style="font-size: 0.72rem; color: #64748b; margin-top: 5px;">
            An automated STK Push notification will appear on your phone to authorize this subscription.
          </div>
        </div>

        <div class="stripe-form-group">
          <label>Full Name &amp; Work Email</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <input type="text" id="flw-name" value="Kofi Mensah" class="stripe-input" required />
            <input type="email" id="checkout-input-email" value="kofi@pan-african.io" class="stripe-input" required />
          </div>
        </div>

        <button type="submit" class="stripe-submit-btn" id="stripe-submit-btn" style="background: #F5A623;">
          <span>Authorize KES ${kesPrice.toLocaleString()} with Flutterwave</span>
        </button>

        <div class="stripe-secure-note">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Secured by Flutterwave ISO 27001 &amp; PCI Level 1 gateway.
        </div>
      `;
    }

    return `
      <div class="stripe-modal-box">
        <!-- Stripe Header -->
        <div class="stripe-header">
          <div class="stripe-brand-left">
            <img src="/zexcore-logo-horizontal.png" alt="ZexCore" class="stripe-merchant-logo" />
          </div>
          <div class="stripe-brand-right">
            <div class="stripe-powered-pill">
              <span>Powered by</span>
              <svg width="48" height="20" viewBox="0 0 60 25" fill="#635BFF" xmlns="http://www.w3.org/2000/svg" style="display:inline-block; vertical-align: middle;">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M59.64 14.28c0-4.48-2.18-8-6.43-8-4.28 0-6.87 3.52-6.87 8 0 5.28 3.12 7.94 7.45 7.94 2.11 0 3.7-.48 4.9-.99v-3.32c-1.2.48-2.52.8-3.99.8-1.74 0-3.23-.74-3.41-2.69h8.28c.03-.4.07-1.34.07-1.74zm-8.35-1.57c0-1.75 1.07-2.48 2.22-2.48 1.12 0 2.15.73 2.15 2.48h-4.37zM38.8 6.28c-1.68 0-2.77.78-3.35 1.33l-.22-1.05h-4.3v21.57l4.77-1.02.01-4.73c.59.48 1.54 1.12 3.03 1.12 3.18 0 6.07-2.54 6.07-8.58 0-5.74-2.97-8.64-6.01-8.64zm-1.12 12.39c-1.04 0-1.92-.37-2.46-.96v-5.91c.56-.63 1.45-1.01 2.46-1.01 1.76 0 2.87 1.62 2.87 3.93 0 2.37-1.1 3.95-2.87 3.95zM25.76 5.23l4.79-1.03v-4.2H25.76v5.23zm0 1.33h4.79v15.17h-4.79V6.56zm-4.75 3.06l-.26-3.06h-4.3v15.17h4.76V12.9c1.13-1.48 3.04-1.2 3.65-1.01V7.55c-.64-.24-2.72-.6-3.85 2.07zM10.99 8.04c0-.79.65-1.1 1.72-1.1 1.54 0 3.49.48 5.01 1.31V3.91c-1.66-.67-3.33-.91-5.01-.91-4.14 0-6.9 2.17-6.9 5.8 0 5.68 7.82 4.77 7.82 7.22 0 .93-.81 1.24-1.94 1.24-1.69 0-3.88-.7-5.59-1.66v4.44c1.88.81 3.81 1.15 5.59 1.15 4.25 0 7.15-2.11 7.15-5.83 0-6.04-7.85-4.99-7.85-7.32z"/>
              </svg>
            </div>
            <button class="stripe-modal-close" id="btn-close-stripe-modal" title="Close">&times;</button>
          </div>
        </div>

        <div class="stripe-modal-body">
          <!-- Plan Summary Column -->
          <div class="stripe-plan-summary">
            <div class="stripe-plan-kicker">SUBSCRIBE TO ZEXCORE</div>
            <h3 class="stripe-plan-name">${plan.name}</h3>
            <p class="stripe-plan-tagline">${plan.tagline}</p>

            <div class="stripe-price-display">
              <span class="stripe-currency">$</span>
              <span class="stripe-amount">${price}</span>
              <span class="stripe-term">/ month</span>
            </div>
            <div class="stripe-billed-note">${billedLabel}</div>

            <!-- Billing Cycle Switcher inside modal -->
            <div class="stripe-cycle-toggle">
              <button type="button" class="stripe-cycle-btn ${currentCycle === 'monthly' ? 'active' : ''}" id="stripe-btn-monthly">Monthly</button>
              <button type="button" class="stripe-cycle-btn ${currentCycle === 'annual' ? 'active' : ''}" id="stripe-btn-annual">Annual (Save 10%)</button>
            </div>

            <div class="stripe-plan-features-list">
              <div class="stripe-features-heading">Included with your subscription:</div>
              ${plan.features.map(f => `<div class="stripe-feat-item"><span class="stripe-feat-check">✓</span><span>${f}</span></div>`).join('')}
            </div>
          </div>

          <!-- Checkout Card Column -->
          <div class="stripe-payment-form">
            <!-- Gateway Picker -->
            <div style="font-size: 0.78rem; font-weight: 750; color: #334155; margin-bottom: 8px;">Select Payment Gateway</div>
            <div class="checkout-gateway-tabs" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 18px;">
              <button type="button" class="gateway-tab-btn ${currentGateway === 'stripe' ? 'active' : ''}" id="tab-gw-stripe">
                <span style="font-weight: 800; color: #635bff;">Stripe</span>
                <span class="gw-badge-sub">Global Cards</span>
              </button>
              <button type="button" class="gateway-tab-btn ${currentGateway === 'paystack' ? 'active' : ''}" id="tab-gw-paystack">
                <span style="font-weight: 800; color: #00C3F7;">Paystack</span>
                <span class="gw-badge-sub">NGN / Bank</span>
              </button>
              <button type="button" class="gateway-tab-btn ${currentGateway === 'flutterwave' ? 'active' : ''}" id="tab-gw-flutterwave">
                <span style="font-weight: 800; color: #F5A623;">Flutterwave</span>
                <span class="gw-badge-sub">MoMo / Africa</span>
              </button>
            </div>

            <form id="stripe-checkout-form">
              ${gatewayContent}
            </form>
          </div>
        </div>
      </div>
    `;
  }

  modalWrap.innerHTML = renderModalHtml();
  document.body.appendChild(modalWrap);

  // Attach dynamic handlers
  function attachModalEvents() {
    document.getElementById('btn-close-stripe-modal')?.addEventListener('click', () => {
      modalWrap.remove();
    });

    document.getElementById('stripe-btn-monthly')?.addEventListener('click', () => {
      currentCycle = 'monthly';
      setBillingCycle('monthly');
      modalWrap.innerHTML = renderModalHtml();
      attachModalEvents();
    });

    document.getElementById('stripe-btn-annual')?.addEventListener('click', () => {
      currentCycle = 'annual';
      setBillingCycle('annual');
      modalWrap.innerHTML = renderModalHtml();
      attachModalEvents();
    });

    // Gateway tabs
    document.getElementById('tab-gw-stripe')?.addEventListener('click', () => {
      currentGateway = 'stripe';
      modalWrap.innerHTML = renderModalHtml();
      attachModalEvents();
    });

    document.getElementById('tab-gw-paystack')?.addEventListener('click', () => {
      currentGateway = 'paystack';
      modalWrap.innerHTML = renderModalHtml();
      attachModalEvents();
    });

    document.getElementById('tab-gw-flutterwave')?.addEventListener('click', () => {
      currentGateway = 'flutterwave';
      modalWrap.innerHTML = renderModalHtml();
      attachModalEvents();
    });

    // Paystack channel buttons
    document.getElementById('ps-chan-card')?.addEventListener('click', () => {
      paystackChannel = 'card';
      modalWrap.innerHTML = renderModalHtml();
      attachModalEvents();
    });
    document.getElementById('ps-chan-transfer')?.addEventListener('click', () => {
      paystackChannel = 'bank_transfer';
      modalWrap.innerHTML = renderModalHtml();
      attachModalEvents();
    });
    document.getElementById('ps-chan-ussd')?.addEventListener('click', () => {
      paystackChannel = 'ussd';
      modalWrap.innerHTML = renderModalHtml();
      attachModalEvents();
    });

    // Flutterwave network buttons
    document.getElementById('flw-net-mpesa')?.addEventListener('click', () => {
      flwNetwork = 'mpesa';
      modalWrap.innerHTML = renderModalHtml();
      attachModalEvents();
    });
    document.getElementById('flw-net-mtn')?.addEventListener('click', () => {
      flwNetwork = 'mtn';
      modalWrap.innerHTML = renderModalHtml();
      attachModalEvents();
    });
    document.getElementById('flw-net-airtel')?.addEventListener('click', () => {
      flwNetwork = 'airtel';
      modalWrap.innerHTML = renderModalHtml();
      attachModalEvents();
    });

    modalWrap.addEventListener('click', (e) => {
      if (e.target === modalWrap) modalWrap.remove();
    });

    const form = document.getElementById('stripe-checkout-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = document.getElementById('stripe-submit-btn') as HTMLButtonElement | null;
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="stripe-spinner"></span> Authorizing via ${currentGateway.toUpperCase()}...`;
      }

      setTimeout(() => {
        // Upgrade active tenant
        setTenantPlan(targetPlan);

        // Remove modal
        modalWrap.remove();

        // Trigger callback
        if (onSuccess) onSuccess(targetPlan);
      }, 900);
    });
  }

  attachModalEvents();
}
