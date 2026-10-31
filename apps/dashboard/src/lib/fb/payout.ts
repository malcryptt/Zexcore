import { doc, getDoc } from 'firebase/firestore';
import { fb } from './firebase';
import { loadCtx, ApiError } from './core';
import { worker } from './worker';

export interface Payout { setUp: boolean; bankName: string | null; accountName: string | null; last4: string | null }

/** The business's payout account (read-only here: only the Worker can write it, after Paystack verifies the account). */
export async function getPayout(): Promise<Payout> {
  const c = await loadCtx();
  if (c.role === 'staff') return { setUp: false, bankName: null, accountName: null, last4: null };
  const s = await getDoc(doc(fb().db, 'workspaces', c.wid, 'payout', 'main'));
  const d = s.data();
  if (!s.exists() || !d?.subaccountCode) return { setUp: false, bankName: null, accountName: null, last4: null };
  return { setUp: true, bankName: d.bankName ?? null, accountName: d.accountName ?? null, last4: d.last4 ?? null };
}

export async function listBanks(): Promise<{ banks: { name: string; code: string }[] }> {
  const c = await loadCtx();
  return worker('/api/banks', { query: { workspaceId: c.wid } });
}

export async function savePayout(b: Record<string, unknown>): Promise<{ ok: true; accountName: string; last4: string }> {
  const c = await loadCtx();
  if (c.role !== 'owner') throw new ApiError(403, 'Only the workspace owner can change payout details.', 'forbidden');
  const r = await worker<{ ok: true; accountName: string; last4: string }>('/api/payout/setup', { method: 'POST', body: { workspaceId: c.wid, bankCode: b.bankCode, bankName: b.bankName, accountNumber: b.accountNumber } });
  await loadCtx(true);
  return r;
}
