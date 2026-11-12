import { worker } from './worker';
import { loadCtx } from './core';

export interface JoinTarget { mode: 'own' | 'daily'; url: string; used?: number; limit?: number; expiresAt?: number }
export interface MeetingUsage { used: number; limit: number; ready: boolean; own: boolean }

/** A team member joins (or starts) the meeting for a booking. */
export async function joinMeeting(bookingId: string): Promise<JoinTarget> {
  const c = await loadCtx();
  return worker<JoinTarget>('/api/meetings/join', { body: { workspaceId: c.wid, bookingId } });
}

/** A customer joins from the link in their email. No account: the link's key is the proof. */
export const joinAsGuest = (workspaceId: string, bookingId: string, key: string): Promise<JoinTarget> =>
  worker<JoinTarget>('/api/public/meeting', { body: { workspaceId, bookingId, key }, auth: false });

export async function meetingUsage(): Promise<MeetingUsage> {
  const c = await loadCtx();
  return worker<MeetingUsage>('/api/meetings/usage', { body: { workspaceId: c.wid } });
}
