import type { FastifyInstance } from 'fastify';
import crypto from 'node:crypto';
import { withTenantDb, sql, logAuditEvent } from '@zexcore/core';
import { expectedAmountMinor, isPlanTier, ngnPerUsd, SERVER_PLANS, type BillingCycle, type Currency } from './plans.js';

/**
 * POST /api/billing/checkout  (tenant admin/owner)
 * Creates a server-priced payment INTENT and returns its reference + exact amount. The browser must
 * pay using this reference; the signed gateway webhook later matches the reference, validates the
 * amount/currency and only then upgrades the tenant (see zex_activate_plan). Gateway metadata
 * (tenant, plan) in webhooks is never trusted.
 */
export function registerBillingRoutes(server: FastifyInstance): void {
  // Public price list: the single source of truth for the pricing page and checkout.
  server.get('/api/billing/plans', async (_request, reply) => {
    return reply.send({
      currencyRates: { NGN_PER_USD: ngnPerUsd() },
      paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || null,
      plans: Object.entries(SERVER_PLANS).map(([tier, p]) => ({ tier, monthlyUsd: p.monthlyUsd, annualUsd: p.annualUsd })),
    });
  });

  // Payment history for the signed-in tenant
  server.get('/api/billing/payments', { preHandler: [server.authenticate, server.requireCapability('tenant:settings')] }, async (request, reply) => {
    const tenant = (request as any).tenant;
    if (!tenant?.id) return reply.status(400).send({ error: 'Tenant context required' });
    const rows = await withTenantDb(tenant.id, async (tx) =>
      (await tx.execute(sql`
        SELECT reference, tier, cycle, currency, amount_minor, paid_minor, status, gateway, created_at, paid_at
          FROM billing_payments ORDER BY created_at DESC LIMIT 100
      `)) as unknown as any[],
    );
    return reply.send({ payments: rows });
  });

  server.post<{ Body: { tier?: string; cycle?: string; currency?: string } }>(
    '/api/billing/checkout',
    { preHandler: [server.authenticate, server.requireCapability('tenant:settings')] },
    async (request, reply) => {
      const tenant = (request as any).tenant;
      if (!tenant?.id) return reply.status(400).send({ error: 'Tenant context required' });

      const { tier, cycle = 'monthly', currency = 'NGN' } = request.body ?? {};
      if (!isPlanTier(tier)) return reply.status(400).send({ error: 'Unknown plan tier' });
      if (cycle !== 'monthly' && cycle !== 'annual') return reply.status(400).send({ error: 'Invalid billing cycle' });
      if (currency !== 'NGN' && currency !== 'USD') return reply.status(400).send({ error: 'Unsupported currency' });

      const amountMinor = expectedAmountMinor(tier, cycle as BillingCycle, currency as Currency);
      const reference = `zx_${tenant.slug}_${Date.now().toString(36)}_${crypto.randomBytes(6).toString('hex')}`.slice(0, 128);
      const userId = (request as any).user?.userId;

      await withTenantDb(tenant.id, async (tx) => {
        await tx.execute(sql`
          INSERT INTO billing_payments (tenant_id, reference, tier, cycle, currency, amount_minor, status, created_by)
          VALUES (${tenant.id}::uuid, ${reference}, ${tier}, ${cycle}, ${currency}, ${amountMinor}, 'pending',
                  ${/^[0-9a-f-]{36}$/i.test(userId ?? '') ? userId : null}::uuid)
        `);
      });

      await logAuditEvent({
        tenantId: tenant.id,
        userId,
        principalType: (request as any).user?.principalType ?? 'tenant_user',
        action: 'billing.checkout_created',
        entity: 'billing_payment',
        entityId: reference,
        changes: { tier, cycle, currency, amountMinor },
      });

      return reply.status(201).send({ reference, tier, cycle, currency, amountMinor });
    },
  );
}
