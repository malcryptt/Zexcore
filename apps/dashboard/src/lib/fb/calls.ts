import { getDocs, orderBy, query, limit as qLimit } from 'firebase/firestore';
import { loadCtx, wsCol } from './core';
import { worker } from './worker';

export type CallStatus = 'requested' | 'scheduled' | 'declined' | 'cancelled' | 'completed';
export interface CallDto {
  id: string; kind: 'booking' | 'order'; what: string; customerName: string; customerEmail: string | null; customerPhone: string;
  preferredAt: string | null; scheduledAt: string | null; note: string | null; status: CallStatus; createdAt: string;
}

const iso = (v: unknown): string | null => (v && typeof (v as { toDate?: unknown }).toDate === 'function' ? (v as { toDate(): Date }).toDate().toISOString() : null);

export async function listCalls(): Promise<CallDto[]> {
  const c = await loadCtx();
  const snap = await getDocs(query(wsCol(c, 'calls'), orderBy('createdAt', 'desc'), qLimit(200)));
  return snap.docs.map((d) => {
    const x = d.data();
    return { id: d.id, kind: x.kind === 'order' ? 'order' : 'booking', what: String(x.what ?? ''), customerName: String(x.customerName ?? ''), customerEmail: x.customerEmail ?? null,
      customerPhone: String(x.customerPhone ?? ''), preferredAt: iso(x.preferredAt), scheduledAt: iso(x.scheduledAt), note: x.note ?? null, status: x.status as CallStatus, createdAt: iso(x.createdAt) ?? '' };
  });
}

export async function respondToCall(callId: string, action: 'confirm' | 'decline' | 'cancel' | 'complete', scheduledAt?: string): Promise<void> {
  const c = await loadCtx();
  await worker('/api/calls/respond', { body: { workspaceId: c.wid, callId, action, ...(scheduledAt ? { scheduledAt } : {}) } });
}
