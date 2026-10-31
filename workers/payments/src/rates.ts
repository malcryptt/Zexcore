import type { Deps, Env } from './env';

const RATE_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
let cachedRate: { rate: number; timestamp: number } | null = null;
export const DEFAULT_FALLBACK_RATE = 1350;

/**
 * Fetches real-time USD to NGN exchange rate from open market exchange APIs.
 * Cached in memory for 1 hour with instant fallback so network hiccups never break checkout.
 */
export async function getLiveNgnRate(env?: Env, d?: Deps): Promise<number> {
  const envVal = env?.NGN_PER_USD?.trim();
  if (envVal && envVal !== 'auto') {
    const custom = Number(envVal);
    if (Number.isFinite(custom) && custom > 0) return custom;
  }

  const now = d ? d.now().getTime() : Date.now();
  if (cachedRate && now - cachedRate.timestamp < RATE_CACHE_TTL_MS) {
    return cachedRate.rate;
  }

  const fetcher = d?.fetch ?? fetch;

  // 1. Primary: api.exchangerate-api.com/v4/latest/USD (ultra-fast, free, no key)
  try {
    const res = await fetcher('https://api.exchangerate-api.com/v4/latest/USD', {
      headers: { accept: 'application/json' },
    });
    if (res.ok) {
      const data = (await res.json()) as { rates?: { NGN?: number } };
      const rate = Number(data?.rates?.NGN);
      if (Number.isFinite(rate) && rate > 100 && rate < 100000) {
        cachedRate = { rate: Math.round(rate * 100) / 100, timestamp: now };
        return cachedRate.rate;
      }
    }
  } catch {
    // try secondary fallback
  }

  // 2. Secondary: floatrates.com
  try {
    const res = await fetcher('https://www.floatrates.com/daily/usd.json', {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) {
      const data = (await res.json()) as { ngn?: { rate?: string | number } };
      const rate = Number(data?.ngn?.rate);
      if (Number.isFinite(rate) && rate > 100 && rate < 100000) {
        cachedRate = { rate: Math.round(rate * 100) / 100, timestamp: now };
        return cachedRate.rate;
      }
    }
  } catch {
    // fallback
  }

  // If cached value exists even if expired, use it
  if (cachedRate) return cachedRate.rate;

  return DEFAULT_FALLBACK_RATE;
}
