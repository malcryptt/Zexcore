/**
 * Multi-Gateway Webhook Ingestion & Normalization Plugin
 * 
 * Supports Stripe, Paystack, and Flutterwave webhooks.
 * Validates cryptographic signatures, normalizes payment data,
 * and emits unified events to the ZexCore platform event ledger.
 */

import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'node:crypto';
import { activatePlan, settleDeposit } from '@zexcore/core';

export interface NormalizedBillingEvent {
  gateway: 'stripe' | 'paystack' | 'flutterwave';
  event: string;
  reference: string;
  tenantSlug: string;
  amount: number;
  currency: string;
  customerEmail: string;
  planTier: string;
  billingCycle: 'monthly' | 'annual';
  status: 'paid' | 'failed' | 'pending';
  amountMinor: number;
  timestamp: string;
}

function isChargeSuccessEvent(e: NormalizedBillingEvent): boolean {
  return ['charge.success', 'charge.completed', 'checkout.session.completed', 'payment_intent.succeeded'].includes(e.event);
}

export interface BillingWebhookOptions {
  stripeWebhookSecret?: string;
  paystackSecretKey?: string;
  flutterwaveSecretHash?: string;
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

function verifyStripe(raw: Buffer, header: string | undefined, secret: string, toleranceSec = 300): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(',').map((kv) => {
      const i = kv.indexOf('=');
      return [kv.slice(0, i).trim(), kv.slice(i + 1).trim()];
    }),
  );
  const t = Number(parts.t);
  if (!Number.isFinite(t) || Math.abs(Date.now() / 1000 - t) > toleranceSec) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${t}.`).update(raw).digest('hex');
  // Stripe may send several v1 signatures during secret rotation; header parsing above keeps the last.
  return header.split(',').some((kv) => kv.trim().startsWith('v1=') && safeEqual(kv.trim().slice(3), expected));
}

// NOT wrapped in fastify-plugin on purpose: the raw-body JSON parser below must stay
// scoped to the webhook route and not replace the parser for the rest of the API.
const billingWebhooksPluginCallback: FastifyPluginAsync<BillingWebhookOptions> = async (fastify, opts) => {
  fastify.addContentTypeParser('application/json', { parseAs: 'buffer' }, (req, body, done) => {
    (req as any).rawBody = body;
    try {
      done(null, body.length ? JSON.parse(body.toString('utf8')) : {});
    } catch (e) {
      (e as any).statusCode = 400;
      done(e as Error, undefined);
    }
  });

  const stripeSecret = opts.stripeWebhookSecret || process.env.STRIPE_WEBHOOK_SECRET || '';
  const paystackSecret = opts.paystackSecretKey || process.env.PAYSTACK_SECRET_KEY || '';
  const flwSecretHash = opts.flutterwaveSecretHash || process.env.FLUTTERWAVE_SECRET_HASH || '';

  // Universal Webhook Endpoint: /api/webhooks/billing/:gateway
  fastify.post('/api/webhooks/billing/:gateway', async (request: FastifyRequest<{ Params: { gateway: string } }>, reply: FastifyReply) => {
    const { gateway } = request.params;
    const raw: Buffer = (request as any).rawBody ?? Buffer.alloc(0);
    const g = gateway.toLowerCase();
    const secretFor = { stripe: stripeSecret, paystack: paystackSecret, flutterwave: flwSecretHash } as Record<string, string>;
    if (g in secretFor && !secretFor[g]) {
      // Fail closed: an unconfigured gateway must never accept events.
      fastify.log.error({ gateway }, 'Webhook received but no signing secret is configured');
      return reply.status(503).send({ error: 'Webhook not configured' });
    }

    let normalized: NormalizedBillingEvent | null = null;

    try {
      switch (gateway.toLowerCase()) {
        case 'stripe': {
          const sig = request.headers['stripe-signature'] as string | undefined;
          if (!verifyStripe(raw, sig, stripeSecret)) {
            return reply.status(401).send({ error: 'Invalid Stripe signature' });
          }

          const body = request.body as any;
          const obj = body?.data?.object || {};
          normalized = {
            gateway: 'stripe',
            event: body?.type || 'payment_intent.succeeded',
            reference: obj?.client_reference_id || obj?.metadata?.reference || obj?.id || `stripe_${Date.now()}`,
            tenantSlug: obj?.metadata?.tenantSlug || 'default',
            amount: (obj?.amount || 0) / 100,
            currency: (obj?.currency || 'usd').toUpperCase(),
            customerEmail: obj?.customer_email || obj?.receipt_email || 'hello@zexcore.com.ng',
            planTier: obj?.metadata?.planTier || 'growth',
            billingCycle: (obj?.metadata?.billingCycle as 'monthly' | 'annual') || 'monthly',
            status: obj?.payment_status === 'unpaid' ? 'pending' : 'paid',
            amountMinor: Math.round(obj?.amount_total ?? obj?.amount ?? 0),
            timestamp: new Date().toISOString(),
          };
          break;
        }

        case 'paystack': {
          const sig = request.headers['x-paystack-signature'] as string | undefined;
          const hmac = crypto.createHmac('sha512', paystackSecret).update(raw).digest('hex');
          if (!sig || !safeEqual(hmac, sig)) {
            fastify.log.warn({ gateway }, 'Paystack HMAC signature mismatch');
            return reply.status(401).send({ error: 'Invalid Paystack signature' });
          }

          const body = request.body as any;
          const data = body?.data || {};
          normalized = {
            gateway: 'paystack',
            event: body?.event || 'charge.success',
            reference: data?.reference || `pstk_${Date.now()}`,
            tenantSlug: data?.metadata?.tenantSlug || 'default',
            amount: (data?.amount || 0) / 100, // kobo to NGN
            currency: data?.currency || 'NGN',
            customerEmail: data?.customer?.email || 'customer@enterprise.ng',
            planTier: data?.metadata?.planTier || 'growth',
            billingCycle: (data?.metadata?.billingCycle as 'monthly' | 'annual') || 'monthly',
            status: data?.status === 'success' ? 'paid' : 'failed',
            amountMinor: Math.round(Number(data?.amount || 0)),
            timestamp: new Date().toISOString(),
          };
          break;
        }

        case 'flutterwave': {
          const sig = request.headers['verif-hash'] as string | undefined;
          if (!sig || !safeEqual(sig, flwSecretHash)) {
            fastify.log.warn({ gateway }, 'Flutterwave secret hash mismatch');
            return reply.status(401).send({ error: 'Invalid Flutterwave secret hash' });
          }

          const body = request.body as any;
          const data = body?.data || {};
          normalized = {
            gateway: 'flutterwave',
            event: body?.event || 'charge.completed',
            reference: data?.tx_ref || `flw_${Date.now()}`,
            tenantSlug: data?.meta?.tenantSlug || 'default',
            amount: data?.amount || 0,
            currency: data?.currency || 'NGN',
            customerEmail: data?.customer?.email || 'customer@enterprise.africa',
            planTier: data?.meta?.planTier || 'growth',
            billingCycle: (data?.meta?.billingCycle as 'monthly' | 'annual') || 'monthly',
            status: data?.status === 'successful' ? 'paid' : 'failed',
            amountMinor: Math.round(Number(data?.amount || 0) * 100),
            timestamp: new Date().toISOString(),
          };
          break;
        }

        default:
          return reply.status(400).send({ error: `Unsupported payment gateway: ${gateway}` });
      }

      fastify.log.info({ gateway: normalized.gateway, reference: normalized.reference, status: normalized.status }, 'Billing webhook verified');

      // Activation: only successful charge events, matched by OUR reference (created server-side at
      // checkout), amount/currency validated inside the database. Tenant/plan metadata sent by the
      // gateway is ignored. Duplicate deliveries are idempotent.
      let outcome: string = 'ignored';
      if (normalized.status === 'paid' && isChargeSuccessEvent(normalized)) {
        // Booking deposits use their own reference namespace ("bk_") and settle a booking, not a plan.
        const settle = normalized.reference.startsWith('bk_') ? settleDeposit : activatePlan;
        const result = await settle({
          reference: normalized.reference,
          gateway: normalized.gateway,
          paidMinor: normalized.amountMinor,
          currency: normalized.currency,
        });
        outcome = result.outcome;
        fastify.log.info({ reference: normalized.reference, outcome }, 'Plan activation result');
      }

      return reply.status(200).send({
        status: 'acknowledged',
        gateway,
        settled: outcome === 'activated' || outcome === 'duplicate',
        outcome,
        reference: normalized.reference,
        tenantSlug: normalized.tenantSlug,
      });
    } catch (err) {
      fastify.log.error(err, 'Failed to parse payment gateway webhook');
      return reply.status(500).send({ error: 'Internal webhook normalization failure' });
    }
  });
};

export const billingWebhooksPlugin = billingWebhooksPluginCallback;
