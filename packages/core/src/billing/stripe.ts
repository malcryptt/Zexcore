/**
 * Stripe Billing Gateway Integration for ZexCore
 */

import { getPlanConfig, type PlanTier, type BillingCycle } from './plans.js';

export interface StripeBillingConfig {
  secretKey?: string;
  publishableKey?: string;
  webhookSecret?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutSessionParams {
  tenantId: string;
  tenantSlug: string;
  planId: PlanTier;
  cycle: BillingCycle;
  userEmail?: string;
  customerId?: string;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
  isSimulated?: boolean;
}

/**
 * Creates a Stripe checkout session for subscribing a tenant to a plan.
 * Falls back to simulation mode if STRIPE_SECRET_KEY is not configured in environment.
 */
export async function createCheckoutSession(
  config: StripeBillingConfig,
  params: CreateCheckoutSessionParams
): Promise<CheckoutSessionResult> {
  const plan = getPlanConfig(params.planId);
  const amount = params.cycle === 'annual' ? plan.annualPrice * 12 : plan.monthlyPrice;

  // Real Stripe Integration if secret key is present
  if (config.secretKey && !config.secretKey.includes('placeholder')) {
    try {
      // @ts-ignore - Optional dependency, resolved dynamically if installed
      const { default: Stripe } = await import('stripe');
      const stripe = new Stripe(config.secretKey, {
        apiVersion: '2025-02-24.acacia' as any,
      });

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: params.userEmail,
        client_reference_id: params.tenantId,
        metadata: {
          tenantId: params.tenantId,
          tenantSlug: params.tenantSlug,
          planId: params.planId,
          cycle: params.cycle,
        },
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `ZexCore ${plan.name} Plan`,
                description: plan.tagline,
              },
              unit_amount: amount * 100, // In cents
              recurring: {
                interval: params.cycle === 'annual' ? 'year' : 'month',
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${config.successUrl}?session_id={CHECKOUT_SESSION_ID}&plan=${params.planId}`,
        cancel_url: config.cancelUrl,
      });

      return {
        sessionId: session.id,
        url: session.url || config.successUrl,
        isSimulated: false,
      };
    } catch (err) {
      console.warn('[stripe] Stripe API call failed, falling back to simulation:', err);
    }
  }

  // Simulation mode: instantaneous checkout for local testing and zero-friction demos
  const simSessionId = `sim_cs_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const simUrl = `${config.successUrl}?session_id=${simSessionId}&plan=${params.planId}&simulated=true`;

  return {
    sessionId: simSessionId,
    url: simUrl,
    isSimulated: true,
  };
}

/**
 * Creates a Customer Portal session for managing an active subscription.
 */
export async function createCustomerPortalSession(
  config: StripeBillingConfig,
  customerId: string,
  returnUrl: string
): Promise<{ url: string }> {
  if (config.secretKey && !config.secretKey.includes('placeholder')) {
    // @ts-ignore - Optional dependency, resolved dynamically if installed
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(config.secretKey, {
      apiVersion: '2025-02-24.acacia' as any,
    });

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return { url: portal.url };
  }

  return { url: returnUrl };
}
