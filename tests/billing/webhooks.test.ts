import { describe, it, expect } from 'vitest';
import Fastify from '../../apps/api/node_modules/fastify';
import crypto from 'node:crypto';
import { billingWebhooksPlugin } from '../../apps/api/src/plugins/billingWebhooks.js';

describe('Multi-Gateway Billing Webhooks', () => {
  const PAYSTACK_SECRET = 'sk_test_paystack_secret_12345';
  const FLW_SECRET = 'flw_secret_hash_98765';
  const STRIPE_SECRET = 'whsec_test_12345';

  async function buildTestServer() {
    const app = Fastify();
    await app.register(billingWebhooksPlugin, {
      paystackSecretKey: PAYSTACK_SECRET,
      flutterwaveSecretHash: FLW_SECRET,
      stripeWebhookSecret: STRIPE_SECRET,
    });
    return app;
  }

  it('normalizes Paystack charge.success webhook with HMAC verification', async () => {
    const app = await buildTestServer();

    const payload = {
      event: 'charge.success',
      data: {
        reference: 'pstk_ref_99212',
        amount: 4900000, // 49,000 NGN in kobo
        currency: 'NGN',
        status: 'success',
        customer: { email: 'business@acme.ng' },
        metadata: {
          tenantSlug: 'acme_corp',
          planTier: 'growth',
          billingCycle: 'monthly',
        },
      },
    };

    const rawBody = JSON.stringify(payload);
    const signature = crypto.createHmac('sha512', PAYSTACK_SECRET).update(rawBody).digest('hex');

    const response = await app.inject({
      method: 'POST',
      url: '/api/webhooks/billing/paystack',
      headers: {
        'x-paystack-signature': signature,
        'content-type': 'application/json',
      },
      body: rawBody,
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe('acknowledged');
    expect(body.gateway).toBe('paystack');
    expect(body.reference).toBe('pstk_ref_99212');
    expect(body.tenantSlug).toBe('acme_corp');
  });

  it('rejects Paystack webhook with invalid signature', async () => {
    const app = await buildTestServer();

    const payload = { event: 'charge.success', data: {} };
    const response = await app.inject({
      method: 'POST',
      url: '/api/webhooks/billing/paystack',
      headers: {
        'x-paystack-signature': 'invalid_forged_signature',
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    expect(response.statusCode).toBe(401);
  });

  it('normalizes Flutterwave webhook with secret hash check', async () => {
    const app = await buildTestServer();

    const payload = {
      event: 'charge.completed',
      data: {
        tx_ref: 'flw_tx_88721',
        amount: 149000,
        currency: 'NGN',
        status: 'successful',
        customer: { email: 'client@accra-hub.gh' },
        meta: {
          tenantSlug: 'accra_hub',
          planTier: 'agency',
          billingCycle: 'monthly',
        },
      },
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/webhooks/billing/flutterwave',
      headers: {
        'verif-hash': FLW_SECRET,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.gateway).toBe('flutterwave');
    expect(body.reference).toBe('flw_tx_88721');
    expect(body.tenantSlug).toBe('accra_hub');
  });

  it('normalizes Stripe webhook event', async () => {
    const app = await buildTestServer();

    const payload = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_stripe_00192',
          amount: 49900, // $499.00
          currency: 'usd',
          customer_email: 'finance@global-enterprise.com',
          metadata: {
            tenantSlug: 'global_ent',
            planTier: 'enterprise',
            billingCycle: 'monthly',
          },
        },
      },
    };

    const rawBody = JSON.stringify(payload);
    const t = Math.floor(Date.now() / 1000);
    const v1 = crypto.createHmac('sha256', STRIPE_SECRET).update(`${t}.${rawBody}`).digest('hex');
    const response = await app.inject({
      method: 'POST',
      url: '/api/webhooks/billing/stripe',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': `t=${t},v1=${v1}`,
      },
      body: rawBody,
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.gateway).toBe('stripe');
    expect(body.reference).toBe('cs_test_stripe_00192');
    expect(body.tenantSlug).toBe('global_ent');
  });

  it('rejects unsigned and forged webhooks on every gateway (fail closed)', async () => {
    const app = await buildTestServer();
    for (const gw of ['stripe', 'paystack', 'flutterwave']) {
      const r = await app.inject({
        method: 'POST',
        url: `/api/webhooks/billing/${gw}`,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ event: 'charge.success', data: { metadata: { tenantSlug: 'x', planTier: 'enterprise' } } }),
      });
      expect(r.statusCode).toBe(401);
    }
  });

  it('rejects a Flutterwave hash that differs only in length, and stale Stripe timestamps', async () => {
    const app = await buildTestServer();
    const r1 = await app.inject({ method: 'POST', url: '/api/webhooks/billing/flutterwave', headers: { 'verif-hash': FLW_SECRET + 'x', 'content-type': 'application/json' }, body: '{}' });
    expect(r1.statusCode).toBe(401);
    const raw = '{}';
    const t = Math.floor(Date.now() / 1000) - 3600;
    const v1 = crypto.createHmac('sha256', STRIPE_SECRET).update(`${t}.${raw}`).digest('hex');
    const r2 = await app.inject({ method: 'POST', url: '/api/webhooks/billing/stripe', headers: { 'stripe-signature': `t=${t},v1=${v1}`, 'content-type': 'application/json' }, body: raw });
    expect(r2.statusCode).toBe(401);
  });

  it('returns 503 when a gateway has no secret configured', async () => {
    const app = Fastify();
    await app.register(billingWebhooksPlugin, {});
    const r = await app.inject({ method: 'POST', url: '/api/webhooks/billing/paystack', headers: { 'content-type': 'application/json' }, body: '{}' });
    expect(r.statusCode).toBe(503);
  });
});
