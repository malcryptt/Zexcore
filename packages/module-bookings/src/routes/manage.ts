import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import crypto from 'node:crypto';
import { sql, withTenantDb, logAuditEvent } from '@zexcore/core';
import { BOOKINGS_CAPABILITIES as CAP } from '../permissions.js';
import { BLOCKING_SQL, BookingError, createBooking, loadSettings, rows } from '../lib/booking.js';
import { localDateOf, localMidnightUtc, normalizePhone, formatLocal } from '../lib/slots.js';

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'] as const;
const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function fail(reply: FastifyReply, e: unknown) {
  if (e instanceof BookingError) return reply.status(e.status).send({ error: e.message, code: e.code });
  throw e;
}

function mapBooking(b: any) {
  return {
    id: b.id, ref: b.ref, status: b.status,
    serviceId: b.service_id, serviceName: b.service_name ?? undefined, durationMin: b.duration_min ? Number(b.duration_min) : undefined,
    staffId: b.staff_id, staffName: b.staff_name ?? null,
    customerName: b.customer_name, customerPhone: b.customer_phone, customerEmail: b.customer_email,
    startsAt: new Date(b.starts_at).toISOString(), endsAt: new Date(b.ends_at).toISOString(),
    currency: b.currency, priceMinor: Number(b.price_minor), depositMinor: Number(b.deposit_minor),
    depositStatus: b.deposit_status, paymentReference: b.payment_reference, paidAt: b.paid_at,
    notes: b.notes, source: b.source, createdAt: b.created_at,
  };
}
const BOOKING_SELECT = sql`
  SELECT b.*, s.name AS service_name, s.duration_min, st.name AS staff_name
    FROM bk_bookings b
    JOIN bk_services s ON s.id = b.service_id AND s.tenant_id = b.tenant_id
    LEFT JOIN bk_staff st ON st.id = b.staff_id AND st.tenant_id = b.tenant_id`;

export function registerManageRoutes(server: FastifyInstance): void {
  const read = { preHandler: [server.authenticate, server.requireCapability(CAP.READ)] };
  const manage = { preHandler: [server.authenticate, server.requireCapability(CAP.MANAGE)] };
  const admin = { preHandler: [server.authenticate, server.requireCapability(CAP.SETTINGS)] };

  const audit = (request: FastifyRequest, action: string, entityId: string, changes: Record<string, unknown>) =>
    logAuditEvent({
      tenantId: request.tenant.id, userId: (request.user as any)?.userId,
      principalType: (request.user as any)?.principalType ?? 'tenant_user',
      action, entity: 'booking', entityId, changes,
    });

  // ── Settings ───────────────────────────────────────────────────────────────
  const settingsOut = (s: any) => ({
    businessType: s.business_type, publicName: s.public_name, phone: s.phone, address: s.address, currency: s.currency,
    depositEnabled: s.deposit_enabled, depositMinor: Number(s.deposit_minor),
    openMinutes: s.open_minutes, closeMinutes: s.close_minutes, slotMinutes: s.slot_minutes, daysOpen: s.days_open,
    utcOffsetMinutes: s.utc_offset_minutes, leadMinutes: s.lead_minutes, maxDaysAhead: s.max_days_ahead, onboarded: s.onboarded,
  });

  server.get('/api/bookings/settings', read, async (request, reply) => {
    const s = await withTenantDb(request.tenant.id, (tx) => loadSettings(tx, request.tenant.id));
    return reply.send({ settings: settingsOut(s), tenant: { slug: request.tenant.slug } });
  });

  server.put('/api/bookings/settings', {
    ...admin,
    schema: {
      body: {
        type: 'object', additionalProperties: false,
        properties: {
          businessType: { type: 'string', enum: ['clinic', 'real_estate', 'salon', 'delivery', 'retail', 'other'] },
          publicName: { type: 'string', maxLength: 255 },
          phone: { type: 'string', maxLength: 32 },
          address: { type: 'string', maxLength: 500 },
          depositEnabled: { type: 'boolean' },
          depositMinor: { type: 'integer', minimum: 0, maximum: 100_000_000_00 },
          openMinutes: { type: 'integer', minimum: 0, maximum: 1439 },
          closeMinutes: { type: 'integer', minimum: 1, maximum: 1440 },
          slotMinutes: { type: 'integer', minimum: 5, maximum: 240 },
          daysOpen: { type: 'array', items: { type: 'integer', minimum: 0, maximum: 6 }, maxItems: 7 },
          leadMinutes: { type: 'integer', minimum: 0, maximum: 10080 },
          maxDaysAhead: { type: 'integer', minimum: 1, maximum: 365 },
          onboarded: { type: 'boolean' },
        },
      },
    },
  }, async (request, reply) => {
    const b = request.body as Record<string, any>;
    const t = request.tenant.id;
    try {
      const s = await withTenantDb(t, async (tx) => {
        const cur = await loadSettings(tx, t);
        const open = b.openMinutes ?? cur.open_minutes, close = b.closeMinutes ?? cur.close_minutes;
        if (close <= open) throw new BookingError('invalid_hours', 'Closing time must be after opening time');
        let phone = cur.phone;
        if (b.phone !== undefined) {
          phone = b.phone ? normalizePhone(b.phone) : null;
          if (b.phone && !phone) throw new BookingError('invalid_phone', 'Enter a valid phone number');
        }
        await tx.execute(sql`
          UPDATE bk_settings SET
            business_type = ${b.businessType ?? cur.business_type},
            public_name = ${b.publicName !== undefined ? b.publicName.trim() || null : cur.public_name},
            phone = ${phone}, address = ${b.address !== undefined ? b.address.trim() || null : cur.address},
            deposit_enabled = ${b.depositEnabled ?? cur.deposit_enabled},
            deposit_minor = ${b.depositMinor ?? Number(cur.deposit_minor)},
            open_minutes = ${open}, close_minutes = ${close},
            slot_minutes = ${b.slotMinutes ?? cur.slot_minutes},
            days_open = ${`{${(b.daysOpen ?? cur.days_open).join(',')}}`}::smallint[],
            lead_minutes = ${b.leadMinutes ?? cur.lead_minutes}, max_days_ahead = ${b.maxDaysAhead ?? cur.max_days_ahead},
            onboarded = ${b.onboarded ?? cur.onboarded}, updated_at = now()
          WHERE tenant_id = ${t}::uuid`);
        return loadSettings(tx, t);
      });
      await audit(request, 'bookings.settings_updated', t, { fields: Object.keys(b) });
      return reply.send({ settings: settingsOut(s) });
    } catch (e) { return fail(reply, e); }
  });

  // ── Services ───────────────────────────────────────────────────────────────
  const svcOut = (s: any) => ({ id: s.id, name: s.name, description: s.description, durationMin: Number(s.duration_min), priceMinor: Number(s.price_minor), active: s.active });
  const svcBody = {
    type: 'object', additionalProperties: false,
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 120 }, description: { type: 'string', maxLength: 500 },
      durationMin: { type: 'integer', minimum: 5, maximum: 480 }, priceMinor: { type: 'integer', minimum: 0, maximum: 100_000_000_00 },
      active: { type: 'boolean' },
    },
  };

  server.get('/api/bookings/services', read, async (request, reply) => {
    const r = await withTenantDb(request.tenant.id, (tx) => rows(tx, sql`SELECT * FROM bk_services ORDER BY active DESC, position, created_at`));
    return reply.send({ services: r.map(svcOut) });
  });
  server.post('/api/bookings/services', { ...admin, schema: { body: { ...svcBody, required: ['name', 'durationMin'] } } }, async (request, reply) => {
    const b = request.body as any;
    const [row] = await withTenantDb(request.tenant.id, (tx) => rows(tx, sql`
      INSERT INTO bk_services (tenant_id, name, description, duration_min, price_minor, position)
      VALUES (${request.tenant.id}::uuid, ${b.name.trim()}, ${b.description?.trim() || null}, ${b.durationMin}, ${b.priceMinor ?? 0},
              (SELECT COALESCE(MAX(position), 0) + 1 FROM bk_services))
      RETURNING *`));
    return reply.status(201).send({ service: svcOut(row) });
  });
  server.patch<{ Params: { id: string } }>('/api/bookings/services/:id', { ...admin, schema: { body: svcBody } }, async (request, reply) => {
    if (!uuidRe.test(request.params.id)) return reply.status(404).send({ error: 'Service not found' });
    const b = request.body as any;
    const [row] = await withTenantDb(request.tenant.id, (tx) => rows(tx, sql`
      UPDATE bk_services SET name = COALESCE(${b.name?.trim() ?? null}, name),
        description = CASE WHEN ${b.description !== undefined} THEN ${b.description?.trim() || null} ELSE description END,
        duration_min = COALESCE(${b.durationMin ?? null}, duration_min), price_minor = COALESCE(${b.priceMinor ?? null}, price_minor),
        active = COALESCE(${b.active ?? null}, active)
      WHERE id = ${request.params.id}::uuid RETURNING *`));
    if (!row) return reply.status(404).send({ error: 'Service not found' });
    return reply.send({ service: svcOut(row) });
  });

  // ── Staff ──────────────────────────────────────────────────────────────────
  const staffOut = (s: any) => ({ id: s.id, name: s.name, title: s.title, active: s.active });
  const staffBody = {
    type: 'object', additionalProperties: false,
    properties: { name: { type: 'string', minLength: 1, maxLength: 120 }, title: { type: 'string', maxLength: 120 }, active: { type: 'boolean' } },
  };
  server.get('/api/bookings/staff', read, async (request, reply) => {
    const r = await withTenantDb(request.tenant.id, (tx) => rows(tx, sql`SELECT * FROM bk_staff ORDER BY active DESC, created_at`));
    return reply.send({ staff: r.map(staffOut) });
  });
  server.post('/api/bookings/staff', { ...admin, schema: { body: { ...staffBody, required: ['name'] } } }, async (request, reply) => {
    const b = request.body as any;
    const [row] = await withTenantDb(request.tenant.id, (tx) => rows(tx, sql`
      INSERT INTO bk_staff (tenant_id, name, title) VALUES (${request.tenant.id}::uuid, ${b.name.trim()}, ${b.title?.trim() || null}) RETURNING *`));
    return reply.status(201).send({ staff: staffOut(row) });
  });
  server.patch<{ Params: { id: string } }>('/api/bookings/staff/:id', { ...admin, schema: { body: staffBody } }, async (request, reply) => {
    if (!uuidRe.test(request.params.id)) return reply.status(404).send({ error: 'Staff member not found' });
    const b = request.body as any;
    const [row] = await withTenantDb(request.tenant.id, (tx) => rows(tx, sql`
      UPDATE bk_staff SET name = COALESCE(${b.name?.trim() ?? null}, name),
        title = CASE WHEN ${b.title !== undefined} THEN ${b.title?.trim() || null} ELSE title END,
        active = COALESCE(${b.active ?? null}, active)
      WHERE id = ${request.params.id}::uuid RETURNING *`));
    if (!row) return reply.status(404).send({ error: 'Staff member not found' });
    return reply.send({ staff: staffOut(row) });
  });

  // ── Bookings ───────────────────────────────────────────────────────────────
  server.get('/api/bookings', {
    ...read,
    schema: { querystring: { type: 'object', properties: {
      status: { type: 'string', maxLength: 80 }, from: { type: 'string', format: 'date-time' }, to: { type: 'string', format: 'date-time' },
      q: { type: 'string', maxLength: 80 }, upcoming: { type: 'boolean' },
      limit: { type: 'integer', minimum: 1, maximum: 200, default: 50 }, offset: { type: 'integer', minimum: 0, default: 0 },
    } } },
  }, async (request, reply) => {
    const q = request.query as any;
    const where: any[] = [sql`TRUE`];
    if (q.status) {
      const list = String(q.status).split(',').filter((s) => (STATUSES as readonly string[]).includes(s));
      if (list.length) where.push(sql`b.status IN (${sql.join(list.map((s) => sql`${s}`), sql`, `)})`);
    }
    if (q.from) where.push(sql`b.starts_at >= ${q.from}::timestamptz`);
    if (q.to) where.push(sql`b.starts_at < ${q.to}::timestamptz`);
    if (q.upcoming) where.push(sql`b.starts_at >= now() AND b.status IN ('pending','confirmed')`);
    if (q.q) {
      const like = `%${String(q.q).replace(/[%_\\]/g, '\\$&')}%`;
      where.push(sql`(b.customer_name ILIKE ${like} OR b.customer_phone ILIKE ${like} OR b.ref ILIKE ${like})`);
    }
    const res = await withTenantDb(request.tenant.id, async (tx) => {
      const list = await rows(tx, sql`${BOOKING_SELECT} WHERE ${sql.join(where, sql` AND `)}
        ORDER BY ${q.upcoming ? sql`b.starts_at ASC` : sql`b.starts_at DESC`} LIMIT ${q.limit ?? 50} OFFSET ${q.offset ?? 0}`);
      const [c] = await rows<any>(tx, sql`SELECT
        COUNT(*)::int AS all,
        COUNT(*) FILTER (WHERE starts_at >= now() AND status IN ('pending','confirmed'))::int AS upcoming,
        COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
        COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
        COUNT(*) FILTER (WHERE status = 'cancelled')::int AS cancelled FROM bk_bookings`);
      return { list, counts: c };
    });
    return reply.send({ bookings: res.list.map(mapBooking), counts: res.counts });
  });

  server.post('/api/bookings', {
    ...manage,
    schema: { body: { type: 'object', additionalProperties: false, required: ['serviceId', 'customerName', 'customerPhone', 'startsAt'], properties: {
      serviceId: { type: 'string', format: 'uuid' }, staffId: { type: ['string', 'null'], format: 'uuid' },
      customerName: { type: 'string', minLength: 1, maxLength: 160 }, customerPhone: { type: 'string', minLength: 5, maxLength: 32 },
      customerEmail: { type: ['string', 'null'], format: 'email', maxLength: 255 },
      startsAt: { type: 'string', format: 'date-time' }, notes: { type: ['string', 'null'], maxLength: 1000 },
    } } },
  }, async (request, reply) => {
    try {
      const out = await withTenantDb(request.tenant.id, (tx) => createBooking(tx, request.tenant, { ...(request.body as any), source: 'dashboard' }));
      await audit(request, 'bookings.created', out.booking.id, { ref: out.booking.ref, source: 'dashboard' });
      return reply.status(201).send({ booking: mapBooking({ ...out.booking, service_name: out.service.name, duration_min: out.service.duration_min }) });
    } catch (e) { return fail(reply, e); }
  });

  server.patch<{ Params: { id: string } }>('/api/bookings/:id', {
    ...manage,
    schema: { body: { type: 'object', additionalProperties: false, properties: {
      status: { type: 'string', enum: [...STATUSES] }, startsAt: { type: 'string', format: 'date-time' },
      staffId: { type: ['string', 'null'], format: 'uuid' }, notes: { type: ['string', 'null'], maxLength: 1000 },
      markDepositPaid: { type: 'boolean' },
    } } },
  }, async (request, reply) => {
    const { id } = request.params;
    if (!uuidRe.test(id)) return reply.status(404).send({ error: 'Booking not found' });
    const b = request.body as any;
    const t = request.tenant.id;
    try {
      const updated = await withTenantDb(t, async (tx) => {
        await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${'bk:' + t}, 0))`);
        const [cur] = await rows<any>(tx, sql`${BOOKING_SELECT} WHERE b.id = ${id}::uuid FOR UPDATE OF b`);
        if (!cur) throw new BookingError('not_found', 'Booking not found', 404);

        let startIso = new Date(cur.starts_at).toISOString(), endIso = new Date(cur.ends_at).toISOString();
        let staffId: string | null = b.staffId !== undefined ? b.staffId : cur.staff_id;
        if (b.startsAt || b.staffId !== undefined) {
          if (b.startsAt) {
            const ms = Date.parse(b.startsAt);
            startIso = new Date(ms).toISOString();
            endIso = new Date(ms + Number(cur.duration_min) * 60_000).toISOString();
          }
          if (staffId) {
            const ok = await rows(tx, sql`SELECT 1 FROM bk_staff WHERE id = ${staffId}::uuid AND active`);
            if (!ok.length) throw new BookingError('unknown_staff', 'That staff member is not available', 404);
          }
          const clash = await rows(tx, sql`SELECT 1 FROM bk_bookings b WHERE b.id <> ${id}::uuid AND ${BLOCKING_SQL}
            AND b.staff_id IS NOT DISTINCT FROM ${staffId}::uuid
            AND b.starts_at < ${endIso}::timestamptz AND b.ends_at > ${startIso}::timestamptz LIMIT 1`);
          if (clash.length) throw new BookingError('slot_unavailable', 'That time is already booked', 409);
        }
        let status: string = b.status ?? cur.status;
        let depositStatus = cur.deposit_status, paidAt = cur.paid_at;
        if (b.markDepositPaid) {
          if (cur.deposit_status === 'paid') throw new BookingError('already_paid', 'Deposit is already paid');
          if (Number(cur.deposit_minor) <= 0) throw new BookingError('no_deposit', 'This booking has no deposit');
          depositStatus = 'paid'; paidAt = new Date().toISOString();
          if (status === 'pending') status = 'confirmed';
          await tx.execute(sql`INSERT INTO bk_messages (tenant_id, booking_id, customer_name, customer_phone, direction, kind, body)
            VALUES (${t}::uuid, ${id}::uuid, ${cur.customer_name}, ${cur.customer_phone}, 'out', 'payment',
                    ${`Deposit recorded as received manually for ${cur.ref}`})`);
        }
        await tx.execute(sql`UPDATE bk_bookings SET status = ${status}, starts_at = ${startIso}::timestamptz, ends_at = ${endIso}::timestamptz,
          staff_id = ${staffId}::uuid, notes = ${b.notes !== undefined ? b.notes : cur.notes},
          deposit_status = ${depositStatus}, paid_at = ${paidAt}, updated_at = now() WHERE id = ${id}::uuid`);
        const [row] = await rows<any>(tx, sql`${BOOKING_SELECT} WHERE b.id = ${id}::uuid`);
        return row;
      });
      await audit(request, 'bookings.updated', id, { fields: Object.keys(b), status: updated.status });
      return reply.send({ booking: mapBooking(updated) });
    } catch (e) { return fail(reply, e); }
  });

  // Payment link: points the customer at the public page, which opens checkout for this reference.
  server.post<{ Params: { id: string } }>('/api/bookings/:id/payment-link', manage, async (request, reply) => {
    const { id } = request.params;
    if (!uuidRe.test(id)) return reply.status(404).send({ error: 'Booking not found' });
    const t = request.tenant.id;
    try {
      const out = await withTenantDb(t, async (tx) => {
        const [cur] = await rows<any>(tx, sql`SELECT * FROM bk_bookings WHERE id = ${id}::uuid FOR UPDATE`);
        if (!cur) throw new BookingError('not_found', 'Booking not found', 404);
        if (cur.deposit_status === 'paid') throw new BookingError('already_paid', 'Deposit is already paid', 409);
        const s = await loadSettings(tx, t);
        let ref = cur.payment_reference as string | null, amount = Number(cur.deposit_minor);
        if (!ref) {
          if (!s.deposit_enabled || Number(s.deposit_minor) <= 0) throw new BookingError('no_deposit', 'Turn on deposits in Settings first');
          amount = Number(s.deposit_minor);
          if (Number(cur.price_minor) > 0) amount = Math.min(amount, Number(cur.price_minor));
          ref = `bk_${request.tenant.slug}_${crypto.randomBytes(9).toString('hex')}`.slice(0, 128);
          await tx.execute(sql`UPDATE bk_bookings SET payment_reference = ${ref}, deposit_minor = ${amount}, deposit_status = 'unpaid', updated_at = now() WHERE id = ${id}::uuid`);
        }
        await tx.execute(sql`INSERT INTO bk_messages (tenant_id, booking_id, customer_name, customer_phone, direction, kind, body)
          VALUES (${t}::uuid, ${id}::uuid, ${cur.customer_name}, ${cur.customer_phone}, 'out', 'system', ${`Payment link issued for ${cur.ref}`})`);
        return { ref, amount, currency: s.currency, phone: cur.customer_phone, name: cur.customer_name, bookingRef: cur.ref, startsAt: cur.starts_at, offset: s.utc_offset_minutes };
      });
      const base = (process.env.PUBLIC_APP_URL || '').replace(/\/$/, '');
      const path = `/${request.tenant.slug}?pay=${encodeURIComponent(out.ref)}`;
      await audit(request, 'bookings.payment_link_issued', id, { reference: out.ref });
      return reply.send({
        url: `${base}${path}`, path, reference: out.ref, amountMinor: out.amount, currency: out.currency,
        message: `Hello ${out.name}, please secure your booking ${out.bookingRef} (${formatLocal(Date.parse(out.startsAt), out.offset)}) with your deposit: ${base}${path}`,
        phone: out.phone,
      });
    } catch (e) { return fail(reply, e); }
  });

  // ── Home summary ───────────────────────────────────────────────────────────
  server.get('/api/bookings/summary', read, async (request, reply) => {
    const t = request.tenant.id;
    const data = await withTenantDb(t, async (tx) => {
      const s = await loadSettings(tx, t);
      const off = s.utc_offset_minutes;
      const nowMs = Date.now();
      const today = localDateOf(nowMs, off);
      const dayStart = localMidnightUtc(today, off)!;
      const dow = new Date(dayStart + off * 60_000).getUTCDay(); // 0..6 local
      const mondayMs = dayStart - ((dow + 6) % 7) * 86_400_000;
      const iso = (ms: number) => new Date(ms).toISOString();

      const schedule = await rows(tx, sql`${BOOKING_SELECT}
        WHERE b.starts_at >= ${iso(dayStart)}::timestamptz AND b.starts_at < ${iso(dayStart + 86_400_000)}::timestamptz
          AND b.status <> 'cancelled' ORDER BY b.starts_at`);
      const [week] = await rows<any>(tx, sql`SELECT
          COALESCE(SUM(deposit_minor) FILTER (WHERE deposit_status = 'paid' AND paid_at >= ${iso(mondayMs)}::timestamptz), 0)::bigint AS deposits_minor,
          COUNT(*) FILTER (WHERE status = 'no_show' AND starts_at >= ${iso(mondayMs)}::timestamptz AND starts_at < ${iso(mondayMs + 7 * 86_400_000)}::timestamptz)::int AS no_shows,
          COUNT(*) FILTER (WHERE status <> 'cancelled' AND starts_at >= ${iso(mondayMs)}::timestamptz AND starts_at < ${iso(mondayMs + 7 * 86_400_000)}::timestamptz)::int AS total
        FROM bk_bookings`);
      const days = await rows<any>(tx, sql`SELECT floor(extract(epoch FROM (starts_at - ${iso(mondayMs)}::timestamptz)) / 86400)::int AS d, COUNT(*)::int AS n
        FROM bk_bookings WHERE status <> 'cancelled' AND starts_at >= ${iso(mondayMs)}::timestamptz AND starts_at < ${iso(mondayMs + 7 * 86_400_000)}::timestamptz GROUP BY 1`);
      const [att] = await rows<any>(tx, sql`SELECT
          COUNT(*) FILTER (WHERE status = 'pending' AND starts_at >= now())::int AS pending,
          COUNT(*) FILTER (WHERE deposit_status = 'unpaid' AND status IN ('pending','confirmed') AND starts_at >= now())::int AS unpaid_count,
          COALESCE(SUM(deposit_minor) FILTER (WHERE deposit_status = 'unpaid' AND status IN ('pending','confirmed') AND starts_at >= now()), 0)::bigint AS unpaid_minor
        FROM bk_bookings`);
      const [waiting] = await rows<any>(tx, sql`SELECT COUNT(DISTINCT customer_phone)::int AS n FROM bk_messages WHERE direction = 'in' AND kind = 'text' AND read_at IS NULL`);
      const popular = await rows<any>(tx, sql`SELECT s.name, COUNT(*)::int AS n FROM bk_bookings b JOIN bk_services s ON s.id = b.service_id AND s.tenant_id = b.tenant_id
        WHERE b.status <> 'cancelled' AND b.starts_at >= now() - interval '30 days' GROUP BY s.name ORDER BY n DESC LIMIT 3`);
      const [cnt] = await rows<any>(tx, sql`SELECT (SELECT COUNT(*) FROM bk_services WHERE active)::int AS services, (SELECT COUNT(*) FROM bk_staff WHERE active)::int AS staff`);
      return { s, today, schedule, week, days, att, waiting, popular, cnt };
    });
    const perDay = Array(7).fill(0);
    for (const d of data.days) if (d.d >= 0 && d.d < 7) perDay[d.d] = d.n;
    const popularTotal = data.popular.reduce((a: number, p: any) => a + p.n, 0) || 1;
    return reply.send({
      businessName: data.s.public_name, currency: data.s.currency, today: data.today, utcOffsetMinutes: data.s.utc_offset_minutes,
      setup: { onboarded: data.s.onboarded, services: data.cnt.services, staff: data.cnt.staff, depositEnabled: data.s.deposit_enabled },
      todayBookings: data.schedule.map(mapBooking),
      week: { total: data.week.total, depositsMinor: Number(data.week.deposits_minor), noShows: data.week.no_shows, perDay },
      attention: { pending: data.att.pending, unpaidCount: data.att.unpaid_count, unpaidMinor: Number(data.att.unpaid_minor), waitingReplies: data.waiting.n },
      popularServices: data.popular.map((p: any) => ({ name: p.name, count: p.n, pct: Math.round((p.n / popularTotal) * 100) })),
    });
  });

  // ── Customers (derived from bookings) ──────────────────────────────────────
  server.get('/api/bookings/customers', { ...read, schema: { querystring: { type: 'object', properties: { q: { type: 'string', maxLength: 80 } } } } }, async (request, reply) => {
    const qs = (request.query as any).q as string | undefined;
    const like = qs ? `%${qs.replace(/[%_\\]/g, '\\$&')}%` : null;
    const r = await withTenantDb(request.tenant.id, (tx) => rows(tx, sql`
      SELECT customer_phone AS phone, (array_agg(customer_name ORDER BY created_at DESC))[1] AS name,
             (array_agg(customer_email ORDER BY created_at DESC) FILTER (WHERE customer_email IS NOT NULL))[1] AS email,
             COUNT(*)::int AS bookings, COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
             COUNT(*) FILTER (WHERE status = 'no_show')::int AS no_shows,
             COALESCE(SUM(deposit_minor) FILTER (WHERE deposit_status = 'paid'), 0)::bigint AS deposits_minor,
             MAX(starts_at) AS last_visit
        FROM bk_bookings WHERE ${like ? sql`(customer_name ILIKE ${like} OR customer_phone ILIKE ${like})` : sql`TRUE`}
        GROUP BY customer_phone ORDER BY MAX(starts_at) DESC LIMIT 200`));
    return reply.send({ customers: r.map((c: any) => ({ phone: c.phone, name: c.name, email: c.email, bookings: c.bookings, completed: c.completed, noShows: c.no_shows, depositsMinor: Number(c.deposits_minor), lastVisit: c.last_visit })) });
  });

  // ── Messages ───────────────────────────────────────────────────────────────
  server.get('/api/bookings/conversations', { ...read, schema: { querystring: { type: 'object', properties: { filter: { type: 'string', enum: ['all', 'waiting', 'booked'] } } } } }, async (request, reply) => {
    const filter = (request.query as any).filter ?? 'all';
    const r = await withTenantDb(request.tenant.id, (tx) => rows(tx, sql`
      WITH last_msg AS (
        SELECT DISTINCT ON (customer_phone) customer_phone, customer_name, body, kind, direction, created_at
          FROM bk_messages ORDER BY customer_phone, created_at DESC),
      unread AS (SELECT customer_phone, COUNT(*)::int AS n FROM bk_messages WHERE direction = 'in' AND kind = 'text' AND read_at IS NULL GROUP BY 1),
      nextb AS (SELECT DISTINCT ON (customer_phone) customer_phone, starts_at, status, ref FROM bk_bookings
                 WHERE status IN ('pending','confirmed') AND starts_at >= now() ORDER BY customer_phone, starts_at)
      SELECT l.customer_phone AS phone, l.customer_name AS name, l.body, l.kind, l.direction, l.created_at,
             COALESCE(u.n, 0) AS unread, n.starts_at AS next_slot, n.status AS next_status, n.ref AS next_ref
        FROM last_msg l LEFT JOIN unread u USING (customer_phone) LEFT JOIN nextb n USING (customer_phone)
       ORDER BY (COALESCE(u.n, 0) > 0) DESC, l.created_at DESC LIMIT 200`));
    let list = r.map((c: any) => ({ phone: c.phone, name: c.name, lastBody: c.body, lastKind: c.kind, lastDirection: c.direction, lastAt: c.created_at, unread: c.unread, nextSlot: c.next_slot, nextStatus: c.next_status, nextRef: c.next_ref }));
    const counts = { all: list.length, waiting: list.filter((c: any) => c.unread > 0).length, booked: list.filter((c: any) => c.nextSlot).length };
    if (filter === 'waiting') list = list.filter((c: any) => c.unread > 0);
    if (filter === 'booked') list = list.filter((c: any) => c.nextSlot);
    return reply.send({ conversations: list, counts });
  });

  server.get('/api/bookings/conversation', { ...read, schema: { querystring: { type: 'object', required: ['phone'], properties: { phone: { type: 'string', maxLength: 32 } } } } }, async (request, reply) => {
    const phone = normalizePhone((request.query as any).phone) ?? (request.query as any).phone;
    const out = await withTenantDb(request.tenant.id, async (tx) => {
      const messages = await rows(tx, sql`SELECT id, booking_id, direction, kind, body, created_at, read_at FROM bk_messages WHERE customer_phone = ${phone} ORDER BY created_at LIMIT 500`);
      const bookings = await rows(tx, sql`${BOOKING_SELECT} WHERE b.customer_phone = ${phone} ORDER BY b.starts_at DESC LIMIT 20`);
      return { messages, bookings };
    });
    return reply.send({
      phone,
      messages: out.messages.map((m: any) => ({ id: m.id, bookingId: m.booking_id, direction: m.direction, kind: m.kind, body: m.body, createdAt: m.created_at, readAt: m.read_at })),
      bookings: out.bookings.map(mapBooking),
    });
  });

  server.post('/api/bookings/conversation/read', { ...manage, schema: { body: { type: 'object', required: ['phone'], properties: { phone: { type: 'string', maxLength: 32 } } } } }, async (request, reply) => {
    const phone = normalizePhone((request.body as any).phone) ?? (request.body as any).phone;
    await withTenantDb(request.tenant.id, (tx) => tx.execute(sql`UPDATE bk_messages SET read_at = now() WHERE customer_phone = ${phone} AND direction = 'in' AND read_at IS NULL`));
    return reply.send({ ok: true });
  });

  // Staff reply. Stored in the in-app inbox; the UI offers a WhatsApp deep link to deliver it.
  server.post('/api/bookings/messages', {
    ...manage,
    schema: { body: { type: 'object', additionalProperties: false, required: ['phone', 'body'], properties: {
      phone: { type: 'string', maxLength: 32 }, name: { type: 'string', maxLength: 160 }, body: { type: 'string', minLength: 1, maxLength: 2000 }, bookingId: { type: ['string', 'null'], format: 'uuid' },
    } } },
  }, async (request, reply) => {
    const b = request.body as any;
    const phone = normalizePhone(b.phone);
    if (!phone) return reply.status(400).send({ error: 'Enter a valid phone number' });
    try {
      const [m] = await withTenantDb(request.tenant.id, async (tx) => {
        const [known] = await rows<any>(tx, sql`SELECT customer_name FROM bk_messages WHERE customer_phone = ${phone} ORDER BY created_at DESC LIMIT 1`);
        const name = known?.customer_name ?? b.name?.trim();
        if (!name) throw new BookingError('unknown_customer', 'Add a name for this new conversation');
        await tx.execute(sql`UPDATE bk_messages SET read_at = now() WHERE customer_phone = ${phone} AND direction = 'in' AND read_at IS NULL`);
        return rows(tx, sql`INSERT INTO bk_messages (tenant_id, booking_id, customer_name, customer_phone, direction, kind, body)
          VALUES (${request.tenant.id}::uuid, ${b.bookingId ?? null}::uuid, ${name}, ${phone}, 'out', 'text', ${b.body.trim()}) RETURNING id, created_at`);
      });
      return reply.status(201).send({ id: m!.id, createdAt: m!.created_at, whatsappUrl: `https://wa.me/${phone.slice(1)}?text=${encodeURIComponent(b.body.trim())}` });
    } catch (e) { return fail(reply, e); }
  });
}
