import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, sendEmailVerification, sendPasswordResetEmail,
  confirmPasswordReset, applyActionCode, EmailAuthProvider, reauthenticateWithCredential, updatePassword, deleteUser,
} from 'firebase/auth';
import { collection, doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { fb } from './firebase';
import { ApiError, DEFAULT_SETTINGS, clearCtx, loadCtx, toApiError, claimSlot, type Ctx } from './core';
import { syncBookingCap } from './catalog';

const RESERVED = new Set(['admin', 'api', 'app', 'www', 'signin', 'signup', 'login', 'pricing', 'security', 'contact', 'privacy', 'terms', 'docs', 'about', 'console', 'dashboard',
  'platform', 'solutions', 'modules', 'architecture', 'resources', 'book', 'b', 'static', 'assets', 'zexcore', 'mail', 'support', 'help', 'status', 'product', 'home', 'forgot-password', 'reset-password', 'verify-email', 'multi-tenancy', 'automation']);
const SLUG_RE = /^[a-z0-9]([a-z0-9-]{1,38})[a-z0-9]$/;

export const slugify = (s: string): string => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 34).replace(/-+$/g, '');
const rand = (n: number): string => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => 'abcdefghjkmnpqrstuvwxyz23456789'[b % 31]).join('');

async function freeSlug(wanted: string): Promise<string> {
  const { db } = fb();
  const base = slugify(wanted);
  for (let i = 0; i < 6; i++) {
    const s = i === 0 && base.length >= 3 && !RESERVED.has(base) ? base : `${base.length >= 2 ? base : 'biz'}-${rand(4)}`;
    if (!SLUG_RE.test(s) || RESERVED.has(s)) continue;
    if (!(await getDoc(doc(db, 'slugs', s))).exists()) return s;
    if (i === 0 && wanted && wanted === base) throw new ApiError(409, 'That web address is already taken. Choose another.', 'slug_taken');
  }
  throw new ApiError(409, 'Could not find a free web address. Try a different business name.', 'slug_taken');
}

const authMessage = (e: unknown): ApiError => {
  const code = (e as { code?: string })?.code ?? '';
  const map: Record<string, [number, string]> = {
    'auth/invalid-credential': [401, 'Incorrect email or password.'], 'auth/wrong-password': [401, 'Incorrect email or password.'], 'auth/user-not-found': [401, 'Incorrect email or password.'],
    'auth/invalid-email': [400, 'Enter a valid email address.'], 'auth/email-already-in-use': [409, 'An account with this email already exists. Try signing in.'],
    'auth/weak-password': [400, 'Use a stronger password (at least 10 characters).'], 'auth/too-many-requests': [429, 'Too many attempts. Please wait a few minutes and try again.'],
    'auth/user-disabled': [403, 'This account has been disabled.'], 'auth/expired-action-code': [400, 'This link has expired. Request a new one.'],
    'auth/invalid-action-code': [400, 'This link is no longer valid. Request a new one.'], 'auth/requires-recent-login': [401, 'Sign in again, then retry.'],
    'auth/operation-not-allowed': [503, 'Email sign-in is not switched on yet. Please contact support.'],
  };
  const hit = map[code];
  return hit ? new ApiError(hit[0], hit[1], code) : toApiError(e);
};

export async function register(b: { tenantName: string; name: string; email: string; password: string; tenantSlug?: string }): Promise<void> {
  const { auth, db } = fb();
  const tenantName = String(b.tenantName ?? '').trim(), name = String(b.name ?? '').trim(), email = String(b.email ?? '').trim();
  if (tenantName.length < 2 || tenantName.length > 120) throw new ApiError(400, 'Enter your business name.');
  if (name.length < 2) throw new ApiError(400, 'Enter your name.');
  if (String(b.password ?? '').length < 10) throw new ApiError(400, 'Use at least 10 characters for your password.');
  let cred;
  try { cred = await createUserWithEmailAndPassword(auth, email, b.password); } catch (e) { throw authMessage(e); }
  const user = cred.user;
  try {
    const slug = await freeSlug(b.tenantSlug || tenantName);
    const wid = doc(collection(db, 'workspaces')).id;
    const batch = writeBatch(db);
    batch.set(doc(db, 'workspaces', wid), { name: tenantName, slug, ownerUid: user.uid, plan: 'free', createdAt: serverTimestamp(), settings: { ...DEFAULT_SETTINGS, publicName: tenantName } });
    batch.set(doc(db, 'workspaces', wid, 'members', user.uid), { role: 'owner', name, email, createdAt: serverTimestamp() });
    batch.set(doc(db, 'slugs', slug), {
      wid, ownerUid: user.uid, name: tenantName, timezone: 'Africa/Lagos', currency: 'NGN', bookingEnabled: true, slotMinutes: DEFAULT_SETTINGS.slotMinutes,
      openMinutes: DEFAULT_SETTINGS.openMinutes, closeMinutes: DEFAULT_SETTINGS.closeMinutes, closedWeekdays: [0], bookingCap: 30,
      leadMinutes: DEFAULT_SETTINGS.leadMinutes, maxDaysAhead: DEFAULT_SETTINGS.maxDaysAhead,
    });
    batch.set(doc(db, 'users', user.uid), { name, email, workspaceIds: [wid], createdAt: serverTimestamp() });
    await batch.commit();
  } catch (e) {
    clearCtx();
    await deleteUser(user).catch(() => undefined); // do not leave a half-created account behind
    throw e instanceof ApiError ? e : authMessage(e);
  }
  clearCtx();
  await updateProfile(user, { displayName: name }).catch(() => undefined);
  void sendEmailVerification(user).catch(() => undefined);
  // Every business needs one bookable calendar. It is replaced if the owner adds their own team member (see staff handler).
  const ctx = await loadCtx(true);
  await claimSlot(ctx, 'staff', 'p', 'staff', { name, title: 'Owner', active: true, auto: true }).catch(() => undefined);
}

export async function login(email: string, password: string): Promise<void> {
  const { auth } = fb();
  try { await signInWithEmailAndPassword(auth, String(email).trim(), password); } catch (e) { throw authMessage(e); }
  clearCtx();
}

export async function logout(): Promise<void> {
  clearCtx();
  try { await signOut(fb().auth); } catch { /* already signed out */ }
}

export const me = async (): Promise<unknown> => {
  const c: Ctx = await loadCtx(true);
  void syncBookingCap(c);
  return {
    user: { id: c.uid, email: c.email, name: c.name, emailVerified: c.emailVerified },
    tenant: { id: c.wid, slug: c.slug, name: c.wsName, tier: c.plan, plan_cycle: c.planCycle, plan_expires_at: c.planExpiresAt },
    role: c.role === 'staff' ? 'member' : c.role,
    isPlatformAdmin: false,
  };
};

export async function forgot(email: string): Promise<void> {
  try { await sendPasswordResetEmail(fb().auth, String(email).trim()); }
  catch (e) { const code = (e as { code?: string }).code; if (code !== 'auth/user-not-found') throw authMessage(e); } // never reveal whether an address has an account
}
export async function reset(token: string, password: string): Promise<void> {
  if (String(password).length < 10) throw new ApiError(400, 'Use at least 10 characters for your password.');
  try { await confirmPasswordReset(fb().auth, token, password); } catch (e) { throw authMessage(e); }
}
export async function verifyEmail(token: string): Promise<void> { try { await applyActionCode(fb().auth, token); clearCtx(); } catch (e) { throw authMessage(e); } }
export async function resendVerification(): Promise<void> {
  const u = fb().auth.currentUser;
  if (!u) throw new ApiError(401, 'Please sign in again.');
  try { await sendEmailVerification(u); } catch (e) { throw authMessage(e); }
}
export async function changePassword(current: string, next: string): Promise<void> {
  const u = fb().auth.currentUser;
  if (!u?.email) throw new ApiError(401, 'Please sign in again.');
  if (String(next).length < 10) throw new ApiError(400, 'Use at least 10 characters for your new password.');
  try { await reauthenticateWithCredential(u, EmailAuthProvider.credential(u.email, current)); await updatePassword(u, next); }
  catch (e) { throw authMessage(e); }
}
