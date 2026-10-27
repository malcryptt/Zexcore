/**
 * Transactional email through Resend (https://resend.com). Configure RESEND_API_KEY and EMAIL_FROM.
 * Without a key: tests capture messages in an in-memory outbox; development logs them; production
 * logs an error and reports failure so callers can tell the user honestly.
 */
export interface Mail { to: string; subject: string; text: string; html: string }

export const mailTestHooks: { outbox: Mail[] } = { outbox: [] };

export const appUrl = (): string => {
  const explicit = (process.env.PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  if (explicit) return explicit;
  const firstOrigin = (process.env.CORS_ORIGIN || '').split(',')[0]?.trim().replace(/\/$/, '');
  return firstOrigin || 'http://localhost:5173';
};

export const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export async function sendMail(mail: Mail, log?: { error: (o: unknown, m?: string) => void; info: (o: unknown, m?: string) => void }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV === 'test') { mailTestHooks.outbox.push(mail); return true; }
    if (process.env.NODE_ENV === 'production') { log?.error({ to: mail.to }, '[mail] RESEND_API_KEY is not set; email was not sent'); return false; }
    log?.info({ to: mail.to, subject: mail.subject, text: mail.text }, '[mail] (dev, not sent)');
    return true;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: process.env.EMAIL_FROM || 'ZexCore <onboarding@resend.dev>', to: [mail.to], subject: mail.subject, html: mail.html, text: mail.text }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) { log?.error({ status: res.status, body: (await res.text()).slice(0, 300) }, '[mail] provider rejected the message'); return false; }
    return true;
  } catch (err) {
    log?.error({ err }, '[mail] provider unreachable');
    return false;
  }
}

const shell = (title: string, bodyHtml: string, cta: { label: string; url: string }): string => `<!doctype html><html><body style="margin:0;background:#f5f6f8;font-family:Inter,Arial,sans-serif;color:#18191b">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="480" cellspacing="0" cellpadding="0" style="max-width:480px;background:#fff;border:1px solid #e1e5ea;border-radius:16px">
<tr><td style="padding:28px 28px 8px;font-size:20px;font-weight:800;color:#e50920">ZexCore</td></tr>
<tr><td style="padding:8px 28px 0;font-size:20px;font-weight:700">${escapeHtml(title)}</td></tr>
<tr><td style="padding:12px 28px;font-size:15px;line-height:1.55;color:#464c57">${bodyHtml}</td></tr>
<tr><td style="padding:8px 28px 8px"><a href="${escapeHtml(cta.url)}" style="display:inline-block;background:#e50920;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px">${escapeHtml(cta.label)}</a></td></tr>
<tr><td style="padding:12px 28px 28px;font-size:12px;color:#647084;word-break:break-all">Button not working? Paste this link into your browser:<br>${escapeHtml(cta.url)}</td></tr>
</table></td></tr></table></body></html>`;

export function resetEmail(to: string, name: string, url: string): Mail {
  const first = escapeHtml(name.split(' ')[0] || 'there');
  return {
    to, subject: 'Reset your ZexCore password',
    text: `Hi ${name.split(' ')[0] || 'there'},\n\nUse this link to choose a new password. It works once and expires in 60 minutes:\n${url}\n\nIf you did not ask for this, ignore this email. Your password has not changed.`,
    html: shell('Reset your password', `Hi ${first}, use the button below to choose a new password. The link works once and expires in 60 minutes. If you did not ask for this, you can ignore this email; your password has not changed.`, { label: 'Choose a new password', url }),
  };
}

export function verifyEmail(to: string, name: string, url: string): Mail {
  const first = escapeHtml(name.split(' ')[0] || 'there');
  return {
    to, subject: 'Confirm your email for ZexCore',
    text: `Hi ${name.split(' ')[0] || 'there'},\n\nConfirm this is your email address (link valid for 24 hours):\n${url}`,
    html: shell('Confirm your email', `Hi ${first}, confirm that this is your email address so we can keep your account and payments secure. The link is valid for 24 hours.`, { label: 'Confirm my email', url }),
  };
}
