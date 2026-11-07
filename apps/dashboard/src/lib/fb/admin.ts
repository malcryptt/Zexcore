/** Platform-admin tools. The Worker decides who is an admin (an allow-list of verified e-mails); the app only asks. */
import { worker } from './worker';
import { fb } from './firebase';

export async function adminMe(): Promise<{ admin: boolean; reason?: string }> {
  try {
    // A fresh token, so an e-mail confirmed a minute ago counts straight away instead of after the old token expires.
    const u = fb().auth.currentUser;
    if (u) { await u.reload().catch(() => undefined); await u.getIdToken(true).catch(() => undefined); }
    return await worker<{ admin: boolean; reason?: string }>('/api/admin/me');
  } catch (e) { console.warn('platform admin check failed', e); return { admin: false }; }
}
export async function grantPlan(b: { workspaceId: string; plan: string; days: number | null }): Promise<{ ok: true; plan: string; expiresAt: string | null }> {
  return worker('/api/admin/grant-plan', { body: { workspaceId: b.workspaceId, plan: b.plan, ...(b.days === null ? {} : { days: b.days }) } });
}
