import crypto from 'node:crypto';
import { sql, assertRoom, PlanLimitError } from '@zexcore/core';
import { formatLocal, isValidSlotStart, normalizePhone, type SlotSettings } from './slots.js';

export type Tx = { execute(q: any): Promise<any> };
export async function rows<T = any>(tx: Tx, q: any): Promise<T[]> {
  return (await tx.execute(q)) as unknown as T[];
}

export interface Settings extends SlotSettings {
  tenant_id: string;
  business_type: string;
  public_name: string | null;
  phone: string | null;
  address: string | null;
  currency: string;
  deposit_enabled: boolean;
  deposit_minor: string | number;
  onboarded: boolean;
}

/** Settings row for the current tenant; created with defaults on first access. */
export async function loadSettings(tx: Tx, tenantId: string): Promise<Settings> {
  await tx.execute(sql`INSERT INTO bk_settings (tenant_id) VALUES (${tenantId}::uuid) ON CONFLICT (tenant_id) DO NOTHING`);
  const [s] = await rows<Settings>(tx, sql`SELECT * FROM bk_settings WHERE tenant_id = ${tenantId}::uuid`);
  return s!;
}

/** A booking blocks its slot unless it is cancelled/no-show, or an unpaid public deposit hold that has expired. */
export const BLOCKING_SQL = sql`(b.status IN ('pending','confirmed','completed')
  AND NOT (b.deposit_status = 'unpaid' AND b.source = 'public' AND b.created_at < now() - interval '30 minutes'))`;

export class BookingError extends Error {
  constructor(public code: string, message: string, public status = 400) {
    super(message);
  }
}

export interface NewBooking {
  serviceId: string;
  staffId?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  startsAt: string;
  notes?: string | null;
  source: 'public' | 'dashboard';
}

function newRef(): string {
  return `BK-${crypto.randomInt(100000, 999999)}`;
}

/**
 * Creates a booking inside an open tenant transaction. Serialised per tenant with an advisory lock so two
 * customers can never take the same slot. Public bookings must land exactly on a generated slot.
 */
export async function createBooking(tx: Tx, tenant: { id: string; slug: string }, input: NewBooking) {
  const phone = normalizePhone(input.customerPhone);
  if (!phone) throw new BookingError('invalid_phone', 'Enter a valid phone number, e.g. 0803 123 4567');
  const startMs = Date.parse(input.startsAt);
  if (!Number.isFinite(startMs)) throw new BookingError('invalid_time', 'Invalid start time');

  await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${'bk:' + tenant.id}, 0))`);
  try {
    await assertRoom(tx, tenant.id, 'bookingsPerMonth');
  } catch (e) {
    if (!(e instanceof PlanLimitError)) throw e;
    // Customers are never told about the business's plan; the owner sees the real reason.
    throw input.source === 'public'
      ? new BookingError('unavailable', 'This business is not taking new online bookings right now. Please contact them directly.', 409)
      : new BookingError('plan_limit', e.message, 402);
  }
  const settings = await loadSettings(tx, tenant.id);

  const [service] = await rows<any>(tx, sql`SELECT id, name, duration_min, price_minor FROM bk_services WHERE id = ${input.serviceId}::uuid AND active`);
  if (!service) throw new BookingError('unknown_service', 'That service is not available', 404);

  const durationMs = Number(service.duration_min) * 60_000;
  if (input.source === 'public' && !isValidSlotStart(startMs, Number(service.duration_min), settings)) {
    throw new BookingError('slot_unavailable', 'That time is no longer available. Please pick another slot.', 409);
  }
  if (input.source === 'dashboard' && startMs < Date.now() - 86_400_000) {
    throw new BookingError('invalid_time', 'Start time is in the past');
  }
  const endMs = startMs + durationMs;
  const startIso = new Date(startMs).toISOString();
  const endIso = new Date(endMs).toISOString();

  // Pick / validate the staff member (or the single unassigned resource when no staff exist).
  const staffRows = await rows<{ id: string }>(tx, sql`SELECT id FROM bk_staff WHERE active ORDER BY created_at`);
  let staffId: string | null = null;
  const candidates: (string | null)[] = input.staffId ? [input.staffId] : staffRows.length ? staffRows.map((s) => s.id) : [null];
  if (input.staffId && !staffRows.some((s) => s.id === input.staffId)) {
    throw new BookingError('unknown_staff', 'That staff member is not available', 404);
  }
  for (const c of candidates) {
    const clash = await rows(tx, sql`
      SELECT 1 FROM bk_bookings b
       WHERE ${BLOCKING_SQL}
         AND b.staff_id IS NOT DISTINCT FROM ${c}::uuid
         AND b.starts_at < ${endIso}::timestamptz AND b.ends_at > ${startIso}::timestamptz
       LIMIT 1`);
    if (clash.length === 0) { staffId = c; break; }
    if (c === candidates[candidates.length - 1]) {
      throw new BookingError('slot_unavailable', 'That time is already booked. Please pick another slot.', 409);
    }
  }

  const price = Number(service.price_minor);
  let deposit = 0;
  if (input.source === 'public' && settings.deposit_enabled) {
    deposit = Number(settings.deposit_minor);
    if (price > 0) deposit = Math.min(deposit, price);
  }
  const needsDeposit = deposit > 0;
  const paymentRef = needsDeposit ? `bk_${tenant.slug}_${crypto.randomBytes(9).toString('hex')}`.slice(0, 128) : null;
  const status = input.source === 'dashboard' ? 'confirmed' : 'pending';

  let booking: any;
  for (let attempt = 0; attempt < 5 && !booking; attempt++) {
    {
      const [b] = await rows<any>(tx, sql`
        INSERT INTO bk_bookings (tenant_id, ref, service_id, staff_id, customer_name, customer_phone, customer_email,
                                 starts_at, ends_at, status, currency, price_minor, deposit_minor, deposit_status,
                                 payment_reference, notes, source)
        VALUES (${tenant.id}::uuid, ${newRef()}, ${input.serviceId}::uuid, ${staffId}::uuid,
                ${input.customerName.trim()}, ${phone}, ${input.customerEmail?.trim() || null},
                ${startIso}::timestamptz, ${endIso}::timestamptz, ${status}, ${settings.currency}, ${price}, ${deposit},
                ${needsDeposit ? 'unpaid' : 'none'}, ${paymentRef}, ${input.notes?.trim() || null}, ${input.source})
        ON CONFLICT (tenant_id, ref) DO NOTHING
        RETURNING *`);
      booking = b;
    }
  }
  if (!booking) throw new BookingError('ref_collision', 'Could not allocate a booking reference, please retry', 503);

  await tx.execute(sql`
    INSERT INTO bk_messages (tenant_id, booking_id, customer_name, customer_phone, direction, kind, body)
    VALUES (${tenant.id}::uuid, ${booking.id}::uuid, ${booking.customer_name}, ${phone}, 'out', 'system',
            ${`Booking ${booking.ref} for ${service.name}, ${formatLocal(startMs, settings.utc_offset_minutes)}${needsDeposit ? '. Awaiting deposit.' : ''}`})`);

  return { booking, service };
}
