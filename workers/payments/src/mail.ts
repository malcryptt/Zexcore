import type { Deps, Env } from './env';

/** Sends a plain-text e-mail through Resend when it is configured; otherwise reports that nothing was sent. */
export async function sendMail(env: Env, d: Deps, to: string, subject: string, text: string): Promise<boolean> {
  if (!env.RESEND_API_KEY || !to) return false;
  try {
    const r = await d.fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: env.MAIL_FROM || 'ZexCore <notifications@zexcore.com.ng>', to: [to], subject: subject.slice(0, 200), text: text.slice(0, 5000) }),
    });
    return r.ok;
  } catch { return false; }
}
