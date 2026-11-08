/** URL of the payments Worker (Cloudflare). Kept apart from the Firebase SDK so public pages can read it without loading Firebase. */
const env = import.meta.env as Record<string, string | undefined>;
export const paymentsUrl = (): string => (env.VITE_PAYMENTS_URL || 'https://zexcore-payments.mal4crypt404.workers.dev').replace(/\/$/, '');
