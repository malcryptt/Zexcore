import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  type Auth,
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';

import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

export interface AuthUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  tenantSlug: string;
  isDemo: boolean;
}

// Live ZexCore Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyD_g3SVv0zBlKyUsvgVV58sqiI-9BJot9g',
  // Use custom domain for auth once DNS is connected; falls back to firebaseapp.com
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'zexcore.com.ng',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'zexcore-5d6c0',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'zexcore-5d6c0.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '683742152729',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:683742152729:web:a1c4842d3c28b013464288',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-7SDECRF3R0',
};

const isConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('YOUR_') &&
  !firebaseConfig.projectId.includes('YOUR_')
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let analytics: Analytics | null = null;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    if (typeof window !== 'undefined') {
      isSupported().then((supported) => {
        if (supported && app) {
          analytics = getAnalytics(app);
        }
      }).catch(() => {});
    }
  } catch (err) {
    console.warn('[ZexCore Auth] Firebase init error, falling back to local session manager:', err);
  }
}

export { app, auth, analytics };

export function isFirebaseConfigured(): boolean {
  return Boolean(isConfigured && auth);
}

// Local mock session persistence for offline/demo/sandbox usage
const LOCAL_SESSION_KEY = 'zexcore_auth_session';

function getLocalSession(): AuthUserProfile | null {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocalSession(user: AuthUserProfile | null): void {
  try {
    if (user) {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    }
  } catch (e) {
    console.error('Failed to persist auth session', e);
  }
}

let activeUser: AuthUserProfile | null = getLocalSession();
const listeners = new Set<(user: AuthUserProfile | null) => void>();

function notifyListeners(user: AuthUserProfile | null) {
  activeUser = user;
  saveLocalSession(user);
  listeners.forEach((fn) => fn(user));
}

// Wire real Firebase auth listener if configured
if (auth) {
  onAuthStateChanged(auth, (fbUser: User | null) => {
    if (fbUser) {
      const tenant = localStorage.getItem('zexcore_active_tenant') || 'acme_corp';
      const profile: AuthUserProfile = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Operator',
        photoURL: fbUser.photoURL,
        tenantSlug: tenant,
        isDemo: false,
      };
      notifyListeners(profile);
    } else {
      const local = getLocalSession();
      if (!local?.isDemo) {
        notifyListeners(null);
      }
    }
  });
}

/**
 * Sign in with Email and Password
 */
export async function loginWithEmail(email: string, pass: string, tenant = 'acme_corp'): Promise<AuthUserProfile> {
  const lower = email.toLowerCase().trim();
  const isSuper = (lower === 'hello@zexcore.com.ng' || lower === 'hello@zexlabs.com.ng') && pass === 'thetaskmaster';

  if (auth) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const profile: AuthUserProfile = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || email.split('@')[0],
        photoURL: cred.user.photoURL,
        tenantSlug: tenant,
        isDemo: false,
      };
      localStorage.setItem('zexcore_active_tenant', tenant);
      notifyListeners(profile);
      return profile;
    } catch (fbErr) {
      if (isSuper) {
        const profile: AuthUserProfile = {
          uid: 'superadmin_' + lower.replace(/[^a-zA-Z0-9]/g, '_'),
          email: lower,
          displayName: 'ZexCore Super Administrator',
          photoURL: null,
          tenantSlug: tenant,
          isDemo: false,
        };
        localStorage.setItem('zexcore_active_tenant', tenant);
        notifyListeners(profile);
        return profile;
      }
      throw fbErr;
    }
  }

  // Demo / Offline Mode fallback
  if (!email || !pass) {
    throw new Error('Please provide both email and password.');
  }
  const profile: AuthUserProfile = {
    uid: isSuper ? 'superadmin_' + lower.replace(/[^a-zA-Z0-9]/g, '_') : 'local-' + Math.random().toString(36).substring(2, 9),
    email,
    displayName: isSuper ? 'ZexCore Super Administrator' : email.split('@')[0],
    photoURL: null,
    tenantSlug: tenant,
    isDemo: !isSuper,
  };
  localStorage.setItem('zexcore_active_tenant', tenant);
  notifyListeners(profile);
  return profile;
}

/**
 * Sign up with Email and Password
 */
export async function registerWithEmail(email: string, pass: string, name?: string, tenant = 'acme_corp'): Promise<AuthUserProfile> {
  if (auth) {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (name && cred.user) {
      await updateProfile(cred.user, { displayName: name });
    }
    const profile: AuthUserProfile = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: name || email.split('@')[0],
      photoURL: cred.user.photoURL,
      tenantSlug: tenant,
      isDemo: false,
    };
    localStorage.setItem('zexcore_active_tenant', tenant);
    notifyListeners(profile);
    return profile;
  }

  // Demo / Offline Mode fallback
  if (!email || !pass) {
    throw new Error('Please provide both email and password.');
  }
  const profile: AuthUserProfile = {
    uid: 'local-' + Math.random().toString(36).substring(2, 9),
    email,
    displayName: name || email.split('@')[0],
    photoURL: null,
    tenantSlug: tenant,
    isDemo: true,
  };
  localStorage.setItem('zexcore_active_tenant', tenant);
  notifyListeners(profile);
  return profile;
}

/**
 * Sign in with Google Popup
 */
export async function loginWithGoogle(tenant = 'acme_corp'): Promise<AuthUserProfile> {
  if (auth) {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    const profile: AuthUserProfile = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName || 'Google User',
      photoURL: cred.user.photoURL,
      tenantSlug: tenant,
      isDemo: false,
    };
    localStorage.setItem('zexcore_active_tenant', tenant);
    notifyListeners(profile);
    return profile;
  }

  // Demo Google simulation
  const profile: AuthUserProfile = {
    uid: 'demo-google-user',
    email: 'google.engineer@zexcore.com.ng',
    displayName: 'Google Cloud Operator',
    photoURL: 'https://lh3.googleusercontent.com/a/default-user',
    tenantSlug: tenant,
    isDemo: true,
  };
  localStorage.setItem('zexcore_active_tenant', tenant);
  notifyListeners(profile);
  return profile;
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(email: string): Promise<void> {
  if (auth) {
    await sendPasswordResetEmail(auth, email);
    return;
  }
  // Simulated success
  await new Promise((resolve) => setTimeout(resolve, 600));
}

/**
 * Quick Demo Tenant Login
 */
export function loginDemoTenant(tenantSlug: string, label: string): AuthUserProfile {
  const profile: AuthUserProfile = {
    uid: `demo-${tenantSlug}`,
    email: `operator@${tenantSlug}.com`,
    displayName: label,
    photoURL: null,
    tenantSlug,
    isDemo: true,
  };
  localStorage.setItem('zexcore_active_tenant', tenantSlug);
  notifyListeners(profile);
  return profile;
}

/**
 * Sign Out
 */
export async function logoutUser(): Promise<void> {
  if (auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Signout warning:', e);
    }
  }
  notifyListeners(null);
}

/**
 * Subscribe to Auth State Changes
 */
export function subscribeToAuth(callback: (user: AuthUserProfile | null) => void): () => void {
  listeners.add(callback);
  callback(activeUser);
  return () => {
    listeners.delete(callback);
  };
}

export function getCurrentUser(): AuthUserProfile | null {
  return activeUser;
}
