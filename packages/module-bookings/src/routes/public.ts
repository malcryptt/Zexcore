import type { FastifyInstance, FastifyReply } from 'fastify';
import { resolveTenant, sql, withTenantDb, logAuditEvent } from '@zexcore/core';
import { BLOCKING_SQL, BookingError, createBooking, loadSettings, rows } from '../lib/booking.js';
import { generateSlotStarts, localMidnightUtc, normalizePhone } from '../lib/slots.js';

/**
 * Unauthenticated customer-facing API. Every handler resolves the tenant from the URL slug and then only
 * touches that tenant's rows (RLS). Responses never include other customers' data.
 */
export function registerPublicRoutes(server: FastifyInstance): void {
  async function tenantFor(slug: string, reply: FastifyReply) {
    const t = /^[a-z0-9][a-z0-9-]{1,62}$/.test(slug) ? await resolveTenant({ slug }) : undefined;
    if (!t) { reply.status(404).send({ error: 'Business not found' }); return undefined; }
    return t;
  }
  const fail = (reply: FastifyReply, e: unknown) => {
    if (e instanceof BookingError) return reply.status(e.status).send({ error: e.message, code: e.code });
    throw e;
  };

  server.get<{ Params: { slug: string } }>('/api/public/:slug', async (request, reply) => {
    const t = await tenantFor(request.params.slug, reply);
    if (!t) return;
    const data = await withTenantDb(t.id, async (tx) => {
      const s = await loadSettings(tx, t.id);
      const [tn] = await rows<any>(tx, sql`SELECT name FROM tenants WHERE id = ${t.id}::uuid`);
      const services = await rows(tx, sql`SELECT id, name, description, duration_min, price_minor FROM bk_services WHERE active ORDER BY position, created_at`);
      const staff = await rows(tx, sql`SELECT id, name, title FROM bk_staff WHERE active ORDER BY created_at`);
      return { s, name: tn?.name as string, services, staff };
    });
    return reply.send({
      business: { slug: t.slug, name: data.s.public_name || data.name, type: data.s.business_type, phone: data.s.phone, address: data.s.address },
      currency: data.s.currency,
      deposit: { enabled: data.s.deposit_enabled && Number(data.s.deposit_minor) > 0, amountMinor: Number(data.s.deposit_minor) },
      hours: { openMinutes: data.s.open_minutes, closeMinutes: data.s.close_minutes, daysOpen: data.s.days_open, utcOffsetMinutes: data.s.utc_offset_minutes, maxDaysAhead: data.s.max_days_ahead },
      paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || null,
      services: data.services.map((x: any) => ({ id: x.id, name: x.name, description: x.description, durationMin: Number(x.duration_min), priceMinor: Number(x.price_minor) })),
      staff: data.staff.map((x: any) => ({ id: x.id, name: x.name, title: x.title })),
    });
  });

  server.get<{ Params: { slug: string }; Querystring: { date: string; serviceId: string; staffId?: string } }>('/api/public/:slug/availability', {
    schema: { querystring: { type: 'object', required: ['date', 'serviceId'], properties: {
      date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' }, serviceId: { type: 'string', format: 'uuid' }, staffId: { type: 'string', format: 'uuid' } } } },
  }, async (request, reply) => {
    const t = await tenantFor(request.params.slug, reply);
    if (!t) return;
    const { date, serviceId, staffId } = request.query;
    const out = await withTenantDb(t.id, async (tx) => {
      const s = await loadSettings(tx, t.id);
      const [svc] = await rows<any>(tx, sql`SELECT duration_min FROM bk_services WHERE id = ${serviceId}::uuid AND active`);
      if (!svc) return null;
      const dur = Number(svc.duration_min);
      const starts = generateSlotStarts(date, dur, s);
      const staffRows = await rows<{ id: string }>(tx, sql`SELECT id FROM bk_staff WHERE active`);
      const resources: (string | null)[] = staffId ? staffRows.filter((r) => r.id === staffId).map((r) => r.id) : staffRows.length ? staffRows.map((r) => r.id) : [null];
      const base = localMidnightUtc(date, s.utc_offset_minutes)!;
      const busy = await rows<any>(tx, sql`SELECT b.staff_id, b.starts_at, b.ends_at FROM bk_bookings b
        WHERE ${BLOCKING_SQL} AND b.starts_at < ${new Date(base + 86_400_000 + 86_400_000).toISOString()}::timestamptz
          AND b.ends_at > ${new Date(base).toISOString()}::timestamptz`);
      const slots = starts.map((st) => {
        const en = st + dur * 60_000;
        const free = resources.some((r) => !busy.some((b: any) => (b.staff_id ?? null) === r && Date.parse(b.starts_at) < en && Date.parse(b.ends_at) > st));
        return { startsAt: new Date(st).toISOString(), available: free };
      });
      return { date, offset: s.utc_offset_minutes, slots };
    });
    if (!out) return reply.status(404).send({ error: 'Service not found' });
    return reply.send(out);
  });

  server.post<{ Params: { slug: string } }>('/api/public/:slug/bookings', {
    schema: { body: { type: 'object', additionalProperties: false, required: ['serviceId', 'customerName', 'customerPhone', 'startsAt'], properties: {
      serviceId: { type: 'string', format: 'uuid' }, staffId: { type: ['string', 'null'], format: 'uuid' },
      customerName: { type: 'string', minLength: 2, maxLength: 160 }, customerPhone: { type: 'string', minLength: 5, maxLength: 32 },
      customerEmail: { type: ['string', 'null'], format: 'email', maxLength: 255 }, startsAt: { type: 'string', format: 'date-time' },
      notes: { type: ['string', 'null'], maxLength: 500 },
    } } },
  }, async (request, reply) => {
    const t = await tenantFor(request.params.slug, reply);
    if (!t) return;
    const body = request.body as any;
    try {
      const out = await withTenantDb(t.id, async (tx) => {
        const s = await loadSettings(tx, t.id);
        if (s.deposit_enabled && Number(s.deposit_minor) > 0 && !body.customerEmail) {
          throw new BookingError('email_required', 'An email address is required to pay the deposit and receive your receipt');
        }
        return createBooking(tx, { id: t.id, slug: t.slug }, { ...body, source: 'public' });
      });
      await logAuditEvent({ tenantId: t.id, principalType: 'public', action: 'bookings.created', entity: 'booking', entityId: out.booking.id, changes: { ref: out.booking.ref, source: 'public' } });
      const b = out.booking;
      return reply.status(201).send({
        booking: { ref: b.ref, status: b.status, startsAt: new Date(b.starts_at).toISOString(), serviceName: out.service.name },
        payment: b.payment_reference
          ? { reference: b.payment_reference, amountMinor: Number(b.deposit_minor), currency: b.currency, email: b.customer_email }
          : null,
      });
    } catch (e) { return fail(reply, e); }
  });

  // Look up a booking by its (unguessable) payment reference: used by payment links and post-checkout polling.
  server.get<{ Params: { slug: string; reference: string } }>('/api/public/:slug/payments/:reference', async (request, reply) => {
    const t = await tenantFor(request.params.slug, reply);
    if (!t) return;
    if (!/^bk_[a-z0-9-]+_[0-9a-f]{18}$/.test(request.params.reference)) return reply.status(404).send({ error: 'Payment not found' });
    const [b] = await withTenantDb(t.id, (tx) => rows<any>(tx, sql`
      SELECT b.ref, b.status, b.deposit_status, b.deposit_minor, b.currency, b.customer_email, b.starts_at, s.name AS service_name
        FROM bk_bookings b JOIN bk_services s ON s.id = b.service_id AND s.tenant_id = b.tenant_id
       WHERE b.payment_reference = ${request.params.reference}`));
    if (!b) return reply.status(404).send({ error: 'Payment not found' });
    return reply.send({
      ref: b.ref, status: b.status, depositStatus: b.deposit_status, amountMinor: Number(b.deposit_minor), currency: b.currency,
      email: b.customer_email, startsAt: new Date(b.starts_at).toISOString(), serviceName: b.service_name,
      paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || null,
    });
  });

  server.post<{ Params: { slug: string } }>('/api/public/:slug/messages', {
    schema: { body: { type: 'object', additionalProperties: false, required: ['name', 'phone', 'body'], properties: {
      name: { type: 'string', minLength: 2, maxLength: 160 }, phone: { type: 'string', minLength: 5, maxLength: 32 }, body: { type: 'string', minLength: 1, maxLength: 1000 } } } },
  }, async (request, reply) => {
    const t = await tenantFor(request.params.slug, reply);
    if (!t) return;
    const b = request.body as any;
    const phone = normalizePhone(b.phone);
    if (!phone) return reply.status(400).send({ error: 'Enter a valid phone number' });
    await withTenantDb(t.id, (tx) => tx.execute(sql`INSERT INTO bk_messages (tenant_id, customer_name, customer_phone, direction, kind, body)
      VALUES (${t.id}::uuid, ${b.name.trim()}, ${phone}, 'in', 'text', ${b.body.trim()})`));
    return reply.status(201).send({ ok: true });
  });
}
