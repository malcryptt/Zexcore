/**
 * System check for platform admins.
 *
 *   GET  /api/admin/selfcheck        tests every integration live and says, in plain words, what works and what is missing.
 *   POST /api/admin/selfcheck/email  sends a real test e-mail to the signed-in admin (proves delivery end to end).
 *
 * Read-only apart from the test e-mail. It never returns a secret, only whether one is set and whether the other side accepted it.
 */
import type { Ctx, Env } from '../env';
import { paymentsEnabled } from '../env';
import { fsGet, fsQuery } from '../fs';
import { getLiveRates } from '../rates';
import { sendFormal } from '../mail';
import { json } from '../util';
import { adminEmails, requirePlatformAdmin } from './admin';
import { ps } from './deposits';

export type CheckStatus = 'ok' | 'warn' | 'fail' | 'off' | 'info';
export interface Check { id: string; label: string; status: CheckStatus; detail: string; fix?: string }

const HEARTBEAT = 'system/cron';
/** Called by the hourly schedule so the check can prove the schedule is really running. */
export async function recordHeartbeat(env: Env, d: { now: () => Date; fetch: typeof fetch }): Promise<void> {
  const { fsCommit } = await import('../fs');
  await fsCommit(env, d, [{ path: HEARTBEAT, fields: { at: d.now() } }]);
}

const set = (v: string | undefined): boolean => Boolean((v ?? '').trim());
async function attempt(label: string, fn: () => Promise<Omit<Check, 'id' | 'label'>>, id: string): Promise<Check> {
  try { return { id, label, ...(await fn()) }; }
  catch (e) { return { id, label, status: 'fail', detail: `The check itself could not run: ${e instanceof Error ? e.message : 'unknown error'}` }; }
}

export async function buildChecks(c: Ctx): Promise<Check[]> {
  const { env, d } = c;
  const now = d.now();
  const checks: Promise<Check>[] = [];

  checks.push(attempt('Database and service account', async () => {
    await fsGet(env, d, 'system/ping');   // an authenticated read: fails when the service account is wrong or Firestore is unreachable
    return { status: 'ok', detail: 'The Worker can read and write the database.' };
  }, 'firestore'));

  checks.push(attempt('Hourly schedule (reminders, backups, expiry, email retries)', async () => {
    const hb = await fsGet(env, d, HEARTBEAT);
    const at = hb?.data.at instanceof Date ? hb.data.at : null;
    if (!at) return { status: 'warn', detail: 'No run recorded yet. The schedule runs at minute 7 of every hour, so check again after the next one.', fix: 'If it stays empty after an hour, open Cloudflare, Workers, zexcore-payments, Settings, Triggers and confirm the cron schedule exists.' };
    const mins = Math.round((now.getTime() - at.getTime()) / 60_000);
    if (mins > 135) return { status: 'fail', detail: `Last ran ${mins} minutes ago. It should run every hour.`, fix: 'Redeploy the Worker (npx wrangler deploy) and check Triggers in Cloudflare.' };
    return { status: 'ok', detail: `Last ran ${mins} minute${mins === 1 ? '' : 's'} ago.` };
  }, 'cron'));

  checks.push(attempt('Card payments (Paystack)', async () => {
    const key = (env.PAYSTACK_SECRET_KEY ?? '').trim();
    if (!key) return { status: 'off', detail: 'No Paystack key is set, so online payments are off.', fix: 'npx wrangler secret put PAYSTACK_SECRET_KEY' };
    const live = key.startsWith('sk_live_');
    if (!paymentsEnabled(env)) return { status: 'warn', detail: live ? 'Payments are off.' : 'This is a test key, so money routes are switched off on purpose.', fix: 'Use your live secret key (sk_live_…) for real customers.' };
    const r = await ps(env, d, '/bank?country=nigeria&perPage=1&use_cursor=false');
    if (r.status === 401) return { status: 'fail', detail: 'Paystack rejected the key.', fix: 'Copy the live secret key again from Paystack, Settings, API keys, then run npx wrangler secret put PAYSTACK_SECRET_KEY.' };
    if (!r.ok) return { status: 'warn', detail: `Paystack answered with an error (${r.status}). It may be having problems.` };
    return { status: 'ok', detail: 'Paystack accepted the live key.' };
  }, 'paystack'));

  checks.push(attempt('Paystack webhook', async () => ({
    status: 'info', detail: `Paystack must call ${env.APP_URL ? 'your Worker' : 'the Worker'} at /api/paystack-webhook so payments settle even if the customer closes the page. This cannot be tested from here.`,
    fix: 'Paystack, Settings, API keys and webhooks: the live webhook URL should be https://zexcore-payments.<your-account>.workers.dev/api/paystack-webhook. Use Paystack\'s "Resend" on a past event to confirm it arrives.',
  }), 'webhook'));

  checks.push(attempt('Email sending (Resend)', async () => {
    if (!set(env.RESEND_API_KEY)) return { status: 'off', detail: 'No email key is set, so no emails are sent (receipts, reminders, alerts).', fix: 'npx wrangler secret put RESEND_API_KEY' };
    const r = await d.fetch('https://api.resend.com/domains', { headers: { authorization: `Bearer ${env.RESEND_API_KEY}` } });
    const j = (await r.json().catch(() => ({}))) as { data?: { name: string; status: string }[]; name?: string };
    if (r.status === 401 && j.name === 'restricted_api_key') return { status: 'ok', detail: 'The key is accepted (it can only send, which is fine). Use "Send me a test email" to prove delivery.' };
    if (r.status === 401 || r.status === 403) return { status: 'fail', detail: 'Resend rejected the key.', fix: 'Create a new API key in Resend and run npx wrangler secret put RESEND_API_KEY.' };
    const from = /<([^>]+)>/.exec(env.MAIL_FROM ?? '')?.[1] ?? env.MAIL_FROM ?? '';
    const domain = from.split('@')[1]?.toLowerCase();
    const verified = (j.data ?? []).filter((x) => x.status === 'verified').map((x) => x.name.toLowerCase());
    if (domain && !verified.includes(domain)) return { status: 'warn', detail: `The key works, but the sending domain ${domain} is not verified in Resend, so mail may be refused or land in spam.`, fix: 'In Resend, Domains: add the SPF and DKIM records it shows to your DNS and wait until it says Verified.' };
    return { status: 'ok', detail: domain ? `The key works and ${domain} is verified.` : 'The key works.' };
  }, 'email'));

  checks.push(attempt('Email backlog', async () => {
    const [pending, dead] = await Promise.all(['pending', 'dead'].map((status) => fsQuery(env, d, { collection: 'emailOutbox', where: [{ field: 'status', op: 'EQUAL', value: status }], limit: 100 })));
    if (dead!.length) return { status: 'warn', detail: `${dead!.length} email${dead!.length === 1 ? '' : 's'} failed for good after several tries.${pending!.length ? ` ${pending!.length} more waiting to retry.` : ''}`, fix: 'Check the email sending result above, and that customers\' addresses are valid.' };
    return { status: 'ok', detail: pending!.length ? `${pending!.length} email${pending!.length === 1 ? ' is' : 's are'} waiting to be sent or retried.` : 'Nothing is stuck.' };
  }, 'outbox'));

  checks.push(attempt('Photo uploads (Cloudinary)', async () => {
    const cloud = (env.CLOUDINARY_CLOUD_NAME ?? '').trim(), key = (env.CLOUDINARY_API_KEY ?? '').trim(), secret = (env.CLOUDINARY_API_SECRET ?? '').trim();
    const missing = [!cloud && 'CLOUDINARY_CLOUD_NAME', !key && 'CLOUDINARY_API_KEY', !secret && 'CLOUDINARY_API_SECRET'].filter(Boolean);
    if (missing.length === 3) return { status: 'off', detail: 'Cloudinary is not set up, so product photos cannot be uploaded.', fix: 'Set the three CLOUDINARY_ secrets with npx wrangler secret put.' };
    if (missing.length) return { status: 'fail', detail: `Missing: ${missing.join(', ')}.`, fix: 'Set each missing one with npx wrangler secret put <NAME>.' };
    const r = await d.fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/resources/image?max_results=1`, { headers: { authorization: `Basic ${btoa(`${key}:${secret}`)}` } });
    if (r.status === 401 || r.status === 403) return { status: 'fail', detail: 'Cloudinary rejected the API key or secret.', fix: 'Copy the API key and API secret again from Cloudinary, Settings, API keys, and set both secrets.' };
    if (r.status === 404) return { status: 'fail', detail: 'Cloudinary does not know that cloud name.', fix: 'The cloud name is shown at the top of your Cloudinary dashboard. Set CLOUDINARY_CLOUD_NAME to exactly that.' };
    if (!r.ok) return { status: 'warn', detail: `Cloudinary answered with an error (${r.status}).` };
    return { status: 'ok', detail: 'Cloudinary accepted the keys.' };
  }, 'cloudinary'));

  checks.push(attempt('WhatsApp alerts (Meta)', async () => {
    if (!set(env.WHATSAPP_TOKEN) && !set(env.WHATSAPP_PHONE_ID)) return { status: 'off', detail: 'WhatsApp alerts are not switched on. Owners still get email.' };
    if (!set(env.WHATSAPP_TOKEN) || !set(env.WHATSAPP_PHONE_ID)) return { status: 'fail', detail: 'Only one of the token and the phone number ID is set.', fix: 'Set both WHATSAPP_TOKEN and WHATSAPP_PHONE_ID.' };
    const r = await d.fetch(`https://graph.facebook.com/v20.0/${encodeURIComponent(env.WHATSAPP_PHONE_ID!)}?fields=display_phone_number`, { headers: { authorization: `Bearer ${env.WHATSAPP_TOKEN}` } });
    if (r.status === 401 || r.status === 403 || r.status === 400) return { status: 'fail', detail: 'Meta rejected the token or phone number ID.', fix: 'Create a fresh permanent token in Meta Business settings and update WHATSAPP_TOKEN.' };
    if (!r.ok) return { status: 'warn', detail: `Meta answered with an error (${r.status}).` };
    return { status: 'ok', detail: 'Meta accepted the token. Messages also need an approved template to be delivered.' };
  }, 'whatsapp'));

  checks.push(attempt('Encrypted backups', async () => {
    if (!env.BACKUPS && !set(env.BACKUP_KEY)) return { status: 'off', detail: 'Backups are off. Enterprise and Dedicated workspaces cannot get daily backups until this is set.', fix: 'See the backups notes in workers/payments/wrangler.toml: an R2 bucket and the BACKUP_KEY secret.' };
    if (!env.BACKUPS || !set(env.BACKUP_KEY)) return { status: 'fail', detail: !env.BACKUPS ? 'The BACKUP_KEY is set but there is no BACKUPS storage bucket bound.' : 'The bucket is bound but BACKUP_KEY is missing.', fix: 'Both are needed. See workers/payments/wrangler.toml.' };
    return { status: 'ok', detail: 'Backup storage and key are present.' };
  }, 'backups'));

  checks.push(attempt('Exchange rate', async () => {
    const r = await getLiveRates(env, d);
    return r.live ? { status: 'ok', detail: `Live rate in use: $1 is about ₦${Math.round(r.rates.NGN).toLocaleString('en-NG')}.` } : { status: 'warn', detail: 'The live rate could not be fetched, so a built-in fallback rate is in use.', fix: 'This usually fixes itself. If it persists, set NGN_PER_USD to a number as a manual rate.' };
  }, 'rates'));

  checks.push(attempt('Licence signing key', async () => {
    if (!set(env.LICENSE_PRIVATE_JWK)) return { status: 'off', detail: 'Licence files are off.', fix: 'node scripts/gen-license-key.mjs | npx wrangler secret put LICENSE_PRIVATE_JWK  (once)' };
    const { publicKeyOf } = await import('./license');
    publicKeyOf(env);
    return { status: 'ok', detail: 'A valid signing key is set.' };
  }, 'license'));

  checks.push(attempt('Platform admins and sales inbox', async () => {
    const n = adminEmails(env).size;
    const sales = set(env.SALES_EMAIL);
    if (!n) return { status: 'warn', detail: 'No platform admin emails are set.', fix: 'npx wrangler secret put PLATFORM_ADMIN_EMAILS' };
    if (!sales) return { status: 'warn', detail: `${n} platform admin${n === 1 ? '' : 's'} set. No SALES_EMAIL, so dedicated cluster requests are saved but nobody is emailed.`, fix: 'npx wrangler secret put SALES_EMAIL' };
    return { status: 'ok', detail: `${n} platform admin${n === 1 ? '' : 's'} and a sales inbox are set.` };
  }, 'admins'));

  checks.push(attempt('Site address and allowed origins', async () => {
    const app = (env.APP_URL ?? '').trim().replace(/\/$/, '');
    const origins = (env.ALLOWED_ORIGINS ?? '').split(',').map((o) => o.trim().replace(/\/$/, ''));
    if (!app.startsWith('https://')) return { status: 'fail', detail: 'APP_URL is not an https address.', fix: 'Set APP_URL in wrangler.toml to https://zexcore.com.ng and redeploy.' };
    if (!origins.includes(app)) return { status: 'fail', detail: 'ALLOWED_ORIGINS does not include APP_URL, so the website could not talk to the Worker.', fix: 'Add your site address to ALLOWED_ORIGINS in wrangler.toml and redeploy.' };
    return { status: 'ok', detail: `The site is ${app} and it is allowed to call the Worker.` };
  }, 'origins'));

  return Promise.all(checks);
}

export async function selfCheck(c: Ctx): Promise<Response> {
  await requirePlatformAdmin(c);
  const checks = await buildChecks(c);
  const count = (s: CheckStatus): number => checks.filter((x) => x.status === s).length;
  return json({ at: c.d.now().toISOString(), summary: { ok: count('ok'), warn: count('warn'), fail: count('fail'), off: count('off') }, checks }, 200, c.headers);
}

export async function selfCheckEmail(c: Ctx): Promise<Response> {
  const caller = await requirePlatformAdmin(c);
  if (!caller.email) return json({ ok: false, sent: false }, 200, c.headers);
  const sent = await sendFormal(c.env, c.d, caller.email, 'ZexCore test email', {
    heading: 'Your emails are working', greeting: 'Hello,',
    paragraphs: ['This is a test from the ZexCore system check. If you can read it, sending works from your Worker to your inbox.', 'If it landed in spam, mark it as not spam so customers\' receipts do too.'],
  }).catch(() => false);
  return json({ ok: true, sent, to: caller.email }, 200, c.headers);
}
