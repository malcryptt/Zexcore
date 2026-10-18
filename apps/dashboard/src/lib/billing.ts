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
    allowedTabs: ['overview', 'crm', 'rules', 'iot', 'audit', 'whitelabel'],
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
    allowedTabs: ['overview', 'crm', 'rules', 'iot', 'audit', 'whitelabel'],
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
    allowedTabs: ['overview', 'crm', 'rules', 'iot', 'compliance', 'audit', 'whitelabel'],
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
  if (tabId === 'whitelabel') return 'agency';
  if (tabId === 'iot') return 'agency';
  if (tabId === 'rules') return 'growth';
  if (tabId === 'crm') return 'starter';
  if (tabId === 'audit') return 'free';
  return 'free';
}

export function getTabLockedInfo(tabId: string): { title: string; subtitle: string; icon: string; minPlan: PlanTier } {
  switch (tabId) {
    case 'whitelabel':
      return {
        title: 'Agency White-Label Branding Studio',
        subtitle: 'Provision up to 25 isolated client workspaces under your custom CNAME domain, upload agency logos, configure brand colors, and remove all ZexCore watermarks.',
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E50920" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.26L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
        minPlan: 'agency',
      };
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

export type PaymentMethod = 'card' | 'transfer';

/**
 * Modern Clean Multi-Method Checkout Modal
 * Inspired by streamlined African & global fintech checkout flows.
 * Supports Card and Direct Bank Transfer with zero third-party watermark badges.
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
  let activeMethod: PaymentMethod = 'card';
  const tenantEmail = 'engineer@enterprise.io';

  const modalWrap = document.createElement('div');
  modalWrap.id = 'stripe-checkout-modal-wrap';
  modalWrap.className = 'stripe-modal-overlay';

  function renderModalHtml(): string {
    const price = currentCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
    const ngnPrice = price * 1500;
    const formattedPrice = `$${price}.00`;
    const formattedNgn = `₦${ngnPrice.toLocaleString()}`;

    return `
      <div class="stripe-modal-box" style="max-width: 680px; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
        <!-- Top Clean Merchant Bar -->
        <div style="background: #ffffff; border-bottom: 1px solid #f1f5f9; padding: 14px 22px; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 28px; height: 28px; border-radius: 6px; background: #E50920; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 900; font-size: 0.85rem;">
              Z
            </div>
            <div>
              <span style="font-weight: 800; font-size: 0.92rem; color: #0f172a; letter-spacing: -0.01em;">ZexCore Checkout</span>
              <span style="font-size: 0.72rem; color: #64748b; margin-left: 6px; font-weight: 600;">(${plan.name} Tier)</span>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="text-align: right; line-height: 1.35; margin-right: 4px;">
              <div style="font-size: 0.72rem; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin-bottom: 2px;">${tenantEmail}</div>
              <div style="font-size: 0.86rem; font-weight: 850; color: #0f172a;">
                Pay <span style="color: #0d9488;">${formattedPrice}</span>
              </div>
            </div>
            <button class="stripe-modal-close" id="btn-close-checkout-modal" title="Close" style="font-size: 1.4rem; padding: 0 6px; line-height: 1; color: #94a3b8; background: transparent; border: none; cursor: pointer;">&times;</button>
          </div>
        </div>

        <!-- Main Modal Body: Left "PAY WITH" & Right Content -->
        <div style="display: grid; grid-template-columns: 190px 1fr; min-height: 440px; background: #ffffff;">
          
          <!-- Left Sidebar: PAY WITH Options -->
          <div style="background: #f8fafc; border-right: 1px solid #f1f5f9; padding: 20px 12px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 0.68rem; font-weight: 800; color: #94a3b8; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px; padding-left: 8px;">
                PAY WITH
              </div>

              <div style="display: flex; flex-direction: column; gap: 6px;">
                <!-- Option 1: Card -->
                <button type="button" class="btn-checkout-method ${activeMethod === 'card' ? 'active' : ''}" id="btn-method-card" style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid ${activeMethod === 'card' ? '#cbd5e1' : 'transparent'}; background: ${activeMethod === 'card' ? '#ffffff' : 'transparent'}; color: ${activeMethod === 'card' ? '#0f172a' : '#64748b'}; font-weight: ${activeMethod === 'card' ? '750' : '600'}; font-size: 0.84rem; cursor: pointer; text-align: left; transition: all 0.15s ease; ${activeMethod === 'card' ? 'box-shadow: 0 2px 6px rgba(0,0,0,0.04); border-left: 3px solid #0d9488;' : ''}">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${activeMethod === 'card' ? '#0d9488' : 'currentColor'}" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  <span>Card</span>
                </button>

                <!-- Option 2: Transfer -->
                <button type="button" class="btn-checkout-method ${activeMethod === 'transfer' ? 'active' : ''}" id="btn-method-transfer" style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid ${activeMethod === 'transfer' ? '#cbd5e1' : 'transparent'}; background: ${activeMethod === 'transfer' ? '#ffffff' : 'transparent'}; color: ${activeMethod === 'transfer' ? '#0f172a' : '#64748b'}; font-weight: ${activeMethod === 'transfer' ? '750' : '600'}; font-size: 0.84rem; cursor: pointer; text-align: left; transition: all 0.15s ease; ${activeMethod === 'transfer' ? 'box-shadow: 0 2px 6px rgba(0,0,0,0.04); border-left: 3px solid #0d9488;' : ''}">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${activeMethod === 'transfer' ? '#0d9488' : 'currentColor'}" stroke-width="2"><path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 6l7-3 7 3"/><path d="M4 10v11"/><path d="M20 10v11"/><path d="M8 14v4"/><path d="M12 14v4"/><path d="M16 14v4"/></svg>
                  <span>Transfer</span>
                </button>
              </div>
            </div>

            <!-- Left Sidebar Footer: Plan & Billing Cycle -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; font-size: 0.74rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-weight: 700; color: #0f172a;">${plan.name}</span>
                <span style="font-weight: 800; color: #0d9488;">${formattedPrice}</span>
              </div>
              <div style="display: flex; gap: 4px; background: #f1f5f9; padding: 2px; border-radius: 4px; margin-bottom: 6px;">
                <button type="button" id="btn-checkout-cycle-monthly" style="flex: 1; border: none; padding: 3px 6px; font-size: 0.68rem; font-weight: 700; border-radius: 3px; cursor: pointer; background: ${currentCycle === 'monthly' ? '#fff' : 'transparent'}; color: ${currentCycle === 'monthly' ? '#0f172a' : '#64748b'};">Mo</button>
                <button type="button" id="btn-checkout-cycle-annual" style="flex: 1; border: none; padding: 3px 6px; font-size: 0.68rem; font-weight: 700; border-radius: 3px; cursor: pointer; background: ${currentCycle === 'annual' ? '#fff' : 'transparent'}; color: ${currentCycle === 'annual' ? '#0f172a' : '#64748b'};">Yr (-10%)</button>
              </div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-align: center;">Cancel subscription anytime</div>
            </div>
          </div>

          <!-- Right Content Area -->
          <div style="padding: 28px 32px; display: flex; flex-direction: column; justify-content: space-between;">
            
            ${activeMethod === 'transfer' ? `
              <!-- Transfer View (Inspired by second screenshot) -->
              <div>
                <div style="font-size: 0.95rem; font-weight: 800; color: #0f172a; margin-bottom: 2px;">
                  Transfer ${formattedPrice} to ZEXCORE CHECKOUT
                </div>
                <div style="font-size: 0.76rem; color: #64748b; margin-bottom: 18px;">
                  Equivalent: <strong style="color: #0f172a;">${formattedNgn} NGN</strong> &bull; Automated webhook settlement
                </div>

                <!-- Account Box -->
                <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 18px 20px; margin-bottom: 16px;">
                  <div style="margin-bottom: 14px;">
                    <div style="font-size: 0.68rem; font-weight: 750; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">BANK NAME</div>
                    <div style="font-size: 1rem; font-weight: 850; color: #0f172a;">Titan Trust Bank / Wema</div>
                  </div>

                  <div style="margin-bottom: 14px;">
                    <div style="font-size: 0.68rem; font-weight: 750; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">ACCOUNT NUMBER</div>
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                      <span style="font-family: var(--font-mono); font-size: 1.3rem; font-weight: 900; color: #0f172a; letter-spacing: 0.05em;">9983826819</span>
                      <button type="button" id="btn-copy-account-num" style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px 10px; font-size: 0.72rem; font-weight: 700; color: #0f172a; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        <span id="copy-text-account">Copy</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <div style="font-size: 0.68rem; font-weight: 750; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">AMOUNT</div>
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                      <span style="font-family: var(--font-mono); font-size: 1.15rem; font-weight: 850; color: #0d9488;">${formattedPrice} (${formattedNgn})</span>
                      <button type="button" id="btn-copy-amount" style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px 10px; font-size: 0.72rem; font-weight: 700; color: #0f172a; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        <span id="copy-text-amount">Copy</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div style="font-size: 0.75rem; color: #64748b; line-height: 1.45; margin-bottom: 20px;">
                  Use this account for this transaction only. This account is dedicated to your workspace and expires in <strong style="color: #0d9488;">29:48</strong>.
                </div>
              </div>

              <div>
                <button type="button" class="btn btn-primary" id="btn-confirm-transfer" style="width: 100%; padding: 13px; font-weight: 800; font-size: 0.92rem; border-radius: 6px; justify-content: center; background: #0f172a; border-color: #0f172a;">
                  I've sent the money
                </button>

                <div style="font-size: 0.7rem; color: #94a3b8; text-align: center; margin-top: 10px; display: flex; align-items: center; justify-content: center; gap: 5px;">
                  <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #16a34a;"></span>
                  <span>Automated Bank Transfer Listener Active &bull; Instant Activation</span>
                </div>
              </div>
            ` : `
              <!-- Card View -->
              <form id="checkout-card-form" style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
                <div>
                  <div style="font-size: 0.95rem; font-weight: 800; color: #0f172a; margin-bottom: 2px;">
                    Enter your card details to pay
                  </div>
                  <div style="font-size: 0.76rem; color: #64748b; margin-bottom: 18px;">
                    Enter your card information below to continue
                  </div>

                  <div style="margin-bottom: 14px;">
                    <label style="display: block; font-size: 0.76rem; font-weight: 700; color: #334155; margin-bottom: 6px;">CARD NUMBER</label>
                    <input type="text" id="card-input-number" class="input" value="4242 4242 4242 4242" required maxlength="19" style="width: 100%; font-family: var(--font-mono); font-size: 0.88rem; padding: 10px 12px; border-radius: 6px;" />
                  </div>

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
                    <div>
                      <label style="display: block; font-size: 0.76rem; font-weight: 700; color: #334155; margin-bottom: 6px;">CARD EXPIRY</label>
                      <input type="text" id="card-input-expiry" class="input" value="12/28" placeholder="MM / YY" required maxlength="5" style="width: 100%; font-family: var(--font-mono); font-size: 0.88rem; padding: 10px 12px; border-radius: 6px;" />
                    </div>
                    <div>
                      <label style="display: block; font-size: 0.76rem; font-weight: 700; color: #334155; margin-bottom: 6px;">CVV</label>
                      <input type="text" id="card-input-cvv" class="input" value="382" placeholder="123" required maxlength="4" style="width: 100%; font-family: var(--font-mono); font-size: 0.88rem; padding: 10px 12px; border-radius: 6px;" />
                    </div>
                  </div>

                  <div style="margin-bottom: 18px;">
                    <label style="display: block; font-size: 0.76rem; font-weight: 700; color: #334155; margin-bottom: 6px;">BILLING EMAIL</label>
                    <input type="email" id="card-input-email" class="input" value="${tenantEmail}" required style="width: 100%; font-size: 0.84rem; padding: 10px 12px; border-radius: 6px;" />
                  </div>
                </div>

                <div>
                  <button type="submit" class="btn btn-primary" id="btn-submit-card" style="width: 100%; padding: 13px; font-weight: 800; font-size: 0.92rem; border-radius: 6px; justify-content: center;">
                    Pay ${formattedPrice} &amp; Activate ${plan.name}
                  </button>

                  <div style="font-size: 0.7rem; color: #94a3b8; text-align: center; margin-top: 10px; display: flex; align-items: center; justify-content: center; gap: 5px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    <span>256-bit Encrypted Checkout &bull; PCI-DSS Compliant &bull; Instant Activation</span>
                  </div>
                </div>
              </form>
            `}

          </div>
        </div>
      </div>
    `;
  }

  modalWrap.innerHTML = renderModalHtml();
  document.body.appendChild(modalWrap);

  // Attach dynamic handlers
  function attachModalEvents() {
    // Close button & overlay click
    document.getElementById('btn-close-checkout-modal')?.addEventListener('click', () => {
      modalWrap.remove();
    });

    modalWrap.addEventListener('click', (e) => {
      if (e.target === modalWrap) modalWrap.remove();
    });

    // Method Switchers (Card vs Transfer)
    document.getElementById('btn-method-card')?.addEventListener('click', () => {
      activeMethod = 'card';
      modalWrap.innerHTML = renderModalHtml();
      attachModalEvents();
    });

    document.getElementById('btn-method-transfer')?.addEventListener('click', () => {
      activeMethod = 'transfer';
      modalWrap.innerHTML = renderModalHtml();
      attachModalEvents();
    });

    // Billing Cycle Switchers
    document.getElementById('btn-checkout-cycle-monthly')?.addEventListener('click', () => {
      currentCycle = 'monthly';
      setBillingCycle('monthly');
      modalWrap.innerHTML = renderModalHtml();
      attachModalEvents();
    });

    document.getElementById('btn-checkout-cycle-annual')?.addEventListener('click', () => {
      currentCycle = 'annual';
      setBillingCycle('annual');
      modalWrap.innerHTML = renderModalHtml();
      attachModalEvents();
    });

    // Copy Account Number button
    document.getElementById('btn-copy-account-num')?.addEventListener('click', () => {
      navigator.clipboard?.writeText('9983826819');
      const text = document.getElementById('copy-text-account');
      if (text) {
        text.innerText = 'Copied!';
        setTimeout(() => {
          if (text) text.innerText = 'Copy';
        }, 1800);
      }
    });

    // Copy Amount button
    document.getElementById('btn-copy-amount')?.addEventListener('click', () => {
      const price = currentCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
      navigator.clipboard?.writeText(price.toString());
      const text = document.getElementById('copy-text-amount');
      if (text) {
        text.innerText = 'Copied!';
        setTimeout(() => {
          if (text) text.innerText = 'Copy';
        }, 1800);
      }
    });

    // Transfer Payment submission ("I've sent the money")
    document.getElementById('btn-confirm-transfer')?.addEventListener('click', () => {
      const btn = document.getElementById('btn-confirm-transfer') as HTMLButtonElement | null;
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="stripe-spinner"></span> Checking transfer confirmation...`;
      }

      setTimeout(() => {
        setTenantPlan(targetPlan);
        modalWrap.remove();
        if (onSuccess) onSuccess(targetPlan);
      }, 900);
    });

    // Card Form submission
    const cardForm = document.getElementById('checkout-card-form');
    cardForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-submit-card') as HTMLButtonElement | null;
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="stripe-spinner"></span> Authorizing card payment...`;
      }

      setTimeout(() => {
        setTenantPlan(targetPlan);
        modalWrap.remove();
        if (onSuccess) onSuccess(targetPlan);
      }, 900);
    });
  }

  attachModalEvents();
}

/**
 * Self-Serve Plan Upgrade Modal
 * Frictionless tier selector allowing operators to inspect all 6 tiers
 * and launch instant Stripe / Paystack / Flutterwave activation.
 */
export function openSelfServeUpgradeModal(
  currentPlan: PlanTier,
  onSuccess?: (newPlan: PlanTier) => void
): void {
  document.getElementById('self-serve-upgrade-modal-wrap')?.remove();

  let activeCycle: BillingCycle = 'monthly';

  const modalWrap = document.createElement('div');
  modalWrap.id = 'self-serve-upgrade-modal-wrap';
  modalWrap.className = 'stripe-modal-backdrop';

  const renderContent = () => {
    const tierCards: Array<{
      id: PlanTier;
      name: string;
      price: number;
      tagline: string;
      badge?: string;
      isCurrent: boolean;
      features: string[];
      cta: string;
      color: string;
    }> = [
      {
        id: 'free',
        name: 'Free Sandbox',
        price: 0,
        tagline: 'Evaluation & local sandbox development',
        isCurrent: currentPlan === 'free',
        features: ['1 User & 500 records', 'Audit Basic (5 checks)', 'Postgres RLS sandbox', 'Standard telemetry test'],
        cta: 'Active Plan',
        color: '#64748b',
      },
      {
        id: 'starter',
        name: 'Starter',
        price: activeCycle === 'annual' ? 190 : 19,
        tagline: 'Solopreneurs & micro-operations',
        isCurrent: currentPlan === 'starter',
        features: ['1,000 Contacts & CRM', 'Audit Basic (5 checks)', 'Custom domain support', 'Email support'],
        cta: currentPlan === 'starter' ? 'Current Tier' : 'Select Starter',
        color: '#0284c7',
      },
      {
        id: 'growth',
        name: 'Growth',
        price: activeCycle === 'annual' ? 490 : 49,
        tagline: 'Growing businesses with booking & automation',
        badge: 'MOST POPULAR',
        isCurrent: currentPlan === 'growth',
        features: ['10 Team users & 10k contacts', 'Client booking & slot deposits', 'Rules AST Engine & triggers', 'Audit Essentials (90 days)'],
        cta: currentPlan === 'growth' ? 'Current Tier' : 'Upgrade to Growth',
        color: '#e11d48',
      },
      {
        id: 'agency',
        name: 'Agency',
        price: activeCycle === 'annual' ? 1490 : 149,
        tagline: 'Web agencies managing client portals',
        badge: 'BEST FOR AGENCIES',
        isCurrent: currentPlan === 'agency',
        features: ['25 Client workspaces', 'White-label customisation & CNAME', 'Audit Essentials per workspace', 'IoT fleet & sensor hub'],
        cta: currentPlan === 'agency' ? 'Current Tier' : 'Deploy Agency',
        color: '#0d9488',
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: activeCycle === 'annual' ? 4990 : 499,
        tagline: 'High volume & mission-critical teams',
        isCurrent: currentPlan === 'enterprise',
        features: ['Unlimited users & SSO/SAML', 'Audit Business (3-yr & SIEM)', '99.9% Uptime SLA', 'Priority 24/7 dedicated desk'],
        cta: currentPlan === 'enterprise' ? 'Current Tier' : 'Upgrade Enterprise',
        color: '#4f46e5',
      },
      {
        id: 'dedicated',
        name: 'Dedicated / Regulated',
        price: activeCycle === 'annual' ? 15000 : 1500,
        tagline: 'Healthcare, fintech & regulated sovereign',
        badge: 'REGULATED',
        isCurrent: currentPlan === 'dedicated',
        features: ['Dedicated cloud instance', 'AES-256-GCM Vault & blind index', 'Signed BAA, DPA & SLA', 'Right-to-be-Forgotten deletion'],
        cta: currentPlan === 'dedicated' ? 'Current Tier' : 'Deploy Dedicated',
        color: '#1e293b',
      },
    ];

    return `
      <div class="stripe-modal-card" style="max-width: 980px; width: 95vw; max-height: 90vh; overflow-y: auto; padding: 28px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="badge" style="background: rgba(229, 9, 32, 0.1); color: var(--primary); font-weight: 800;">SELF-SERVE UPGRADE</span>
              <span style="font-size: 0.8rem; color: var(--text-secondary);">Instant Activation &bull; No Contract Lock-in</span>
            </div>
            <h2 style="margin: 6px 0 2px; font-size: 1.45rem; font-weight: 850; color: var(--text-main);">
              Choose Your Production Tier
            </h2>
            <p style="margin: 0; font-size: 0.86rem; color: var(--text-secondary);">
              Current Workspace Tier: <strong style="color: var(--primary);">${currentPlan.toUpperCase()}</strong>
            </p>
          </div>
          <button class="stripe-close-btn" id="btn-selfserve-close">&times;</button>
        </div>

        <!-- Billing Cycle Switcher -->
        <div style="display: flex; justify-content: center; margin-bottom: 24px;">
          <div style="display: inline-flex; background: #f1f5f9; padding: 4px; border-radius: 8px; border: 1px solid var(--border-default); gap: 4px;">
            <button id="btn-cycle-monthly" class="btn btn-sm ${activeCycle === 'monthly' ? 'btn-primary' : 'btn-secondary'}" style="border: none; padding: 6px 16px;">
              Monthly Billing
            </button>
            <button id="btn-cycle-annual" class="btn btn-sm ${activeCycle === 'annual' ? 'btn-primary' : 'btn-secondary'}" style="border: none; padding: 6px 16px;">
              Yearly (2 Months Free)
            </button>
          </div>
        </div>

        <!-- Grid of Plans -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px;">
          ${tierCards
            .map((c) => `
            <div style="border: 2px solid ${c.isCurrent ? 'var(--primary)' : 'var(--border-default)'}; border-radius: 10px; padding: 20px; background: ${c.isCurrent ? '#fff9f9' : '#fff'}; display: flex; flex-direction: column; justify-content: space-between; position: relative;">
              ${c.badge ? `<span style="position: absolute; top: -10px; right: 14px; background: ${c.color}; color: #fff; font-size: 0.65rem; font-weight: 800; padding: 2px 8px; border-radius: 10px; letter-spacing: 0.04em;">${c.badge}</span>` : ''}
              <div>
                <div style="font-weight: 800; font-size: 1.05rem; color: var(--text-main); margin-bottom: 2px;">${c.name}</div>
                <div style="font-size: 0.74rem; color: var(--text-secondary); min-height: 32px; margin-bottom: 12px;">${c.tagline}</div>
                <div style="display: flex; align-items: baseline; gap: 4px; margin-bottom: 14px;">
                  <span style="font-size: 1.6rem; font-weight: 900; color: var(--text-main);">$${c.price}</span>
                  <span style="font-size: 0.75rem; color: var(--text-secondary);">${activeCycle === 'annual' ? '/ year' : '/ month'}</span>
                </div>
                <ul style="list-style: none; padding: 0; margin: 0 0 16px; font-size: 0.76rem; color: var(--text-secondary); line-height: 1.8;">
                  ${c.features.map(f => `<li style="display: flex; align-items: center; gap: 6px;"><span style="color: ${c.color}; font-weight: 800;">✓</span> ${f}</li>`).join('')}
                </ul>
              </div>
              <button
                class="btn btn-sm ${c.isCurrent ? 'btn-secondary' : 'btn-primary'}"
                data-tier="${c.id}"
                style="width: 100%; justify-content: center; font-weight: 700; ${c.isCurrent ? 'opacity: 0.7; cursor: default;' : ''}"
                ${c.isCurrent ? 'disabled' : ''}
              >
                ${c.cta}
              </button>
            </div>
          `).join('')}
        </div>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-default); display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem; color: var(--text-secondary);">
          <div style="display: flex; align-items: center; gap: 14px;">
            <span>Supported Channels:</span>
            <strong>Card</strong>
            <span>&bull;</span>
            <strong>Transfer</strong>
          </div>
          <span>Instant upgrade with zero downtime &bull; Postgres 17 RLS Enforced</span>
        </div>
      </div>
    `;
  };

  const attachEvents = () => {
    modalWrap.querySelector('#btn-selfserve-close')?.addEventListener('click', () => modalWrap.remove());
    modalWrap.addEventListener('click', (e) => {
      if (e.target === modalWrap) modalWrap.remove();
    });

    modalWrap.querySelector('#btn-cycle-monthly')?.addEventListener('click', () => {
      activeCycle = 'monthly';
      modalWrap.innerHTML = renderContent();
      attachEvents();
    });

    modalWrap.querySelector('#btn-cycle-annual')?.addEventListener('click', () => {
      activeCycle = 'annual';
      modalWrap.innerHTML = renderContent();
      attachEvents();
    });

    modalWrap.querySelectorAll<HTMLButtonElement>('button[data-tier]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTier = btn.getAttribute('data-tier') as PlanTier;
        if (!targetTier || targetTier === currentPlan) return;
        modalWrap.remove();
        openStripeCheckoutModal(targetTier, activeCycle, onSuccess);
      });
    });
  };

  modalWrap.innerHTML = renderContent();
  document.body.appendChild(modalWrap);
  attachEvents();
}
