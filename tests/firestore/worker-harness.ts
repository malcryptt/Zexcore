// Runs the real Worker in-process so the dashboard's data layer can call it during the emulator end-to-end tests.
// The Worker talks to the Firestore emulator (FIRESTORE_EMULATOR_HOST) and accepts the Auth emulator's unsigned tokens.
import { vi } from 'vitest';
import { handle } from '../../workers/payments/src/index';
import type { Env } from '../../workers/payments/src/env';

export const WORKER_URL = 'http://worker.test';
export const workerEnv: Env = {
  PAYSTACK_SECRET_KEY: 'sk_test_e2e', FIREBASE_SERVICE_ACCOUNT: '{}', FIREBASE_PROJECT_ID: 'demo-zexcore', APP_URL: 'http://localhost',
  ALLOWED_ORIGINS: '*', FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',
};
export const emulatorBase = 'http://127.0.0.1:8080/v1/projects/demo-zexcore/databases/(default)/documents';

/** Call before importing the dashboard modules. */
export function installWorker(opts: { fetchOut?: (url: string, init?: RequestInit) => Promise<Response | null> } = {}): void {
  vi.stubEnv('VITE_PAYMENTS_URL', WORKER_URL);
  const store = new Map<string, string>();
  (globalThis as any).localStorage ??= { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, String(v)), removeItem: (k: string) => void store.delete(k) };
  const real = globalThis.fetch.bind(globalThis);
  const worker = (input: any, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    return url.startsWith(WORKER_URL) ? handle(new Request(url, init), workerEnv, { fetch: wrapped, now: () => new Date() }) : null;
  };
  // Outbound calls made by the Worker itself (emulator, and anything the test wants to fake such as Paystack).
  const wrapped: typeof fetch = (async (input: any, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    return (await opts.fetchOut?.(url, init)) ?? real(input, init);
  }) as typeof fetch;
  globalThis.fetch = (async (input: any, init?: RequestInit) => worker(input, init) ?? real(input, init)) as typeof fetch;
}
