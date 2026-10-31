const FX_STORAGE_KEY = 'zx.fx_ngn_v1';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache
export const DEFAULT_FALLBACK_RATE = 1350;

interface CachedFx {
  rate: number;
  updatedAt: number;
}

let inMemoryRate: CachedFx | null = null;

function readStorage(): CachedFx | null {
  try {
    const raw = localStorage.getItem(FX_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedFx;
    if (parsed && typeof parsed.rate === 'number' && Number.isFinite(parsed.rate) && parsed.rate > 100) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

function writeStorage(rate: number): void {
  try {
    const data: CachedFx = { rate, updatedAt: Date.now() };
    inMemoryRate = data;
    localStorage.setItem(FX_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

/** Synchronous getter returning the best available rate immediately (no await needed). */
export function getCachedNgnRate(): number {
  if (inMemoryRate && Number.isFinite(inMemoryRate.rate) && inMemoryRate.rate > 100) {
    return inMemoryRate.rate;
  }
  const stored = readStorage();
  if (stored) {
    inMemoryRate = stored;
    return stored.rate;
  }
  return DEFAULT_FALLBACK_RATE;
}

/**
 * Returns current live USD to NGN exchange rate from real-time market API.
 * Uses localStorage cache so it never delays UI rendering, updating in background when stale.
 */
export async function getLiveNgnRate(): Promise<number> {
  const current = inMemoryRate ?? readStorage();
  const now = Date.now();
  if (current && now - current.updatedAt < CACHE_TTL_MS) {
    return current.rate;
  }

  // 1. Try ExchangeRate-API v4 (free, instant, no key)
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      headers: { accept: 'application/json' },
    });
    if (res.ok) {
      const data = (await res.json()) as { rates?: { NGN?: number } };
      const rate = Number(data?.rates?.NGN);
      if (Number.isFinite(rate) && rate > 100 && rate < 100000) {
        const rounded = Math.round(rate * 100) / 100;
        writeStorage(rounded);
        return rounded;
      }
    }
  } catch {
    // try fallback
  }

  // 2. Secondary fallback: Floatrates
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('https://www.floatrates.com/daily/usd.json', {
      signal: controller.signal,
      headers: { accept: 'application/json' },
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = (await res.json()) as { ngn?: { rate?: string | number } };
      const rate = Number(data?.ngn?.rate);
      if (Number.isFinite(rate) && rate > 100 && rate < 100000) {
        const rounded = Math.round(rate * 100) / 100;
        writeStorage(rounded);
        return rounded;
      }
    }
  } catch {
    // ignore
  }

  return current?.rate ?? DEFAULT_FALLBACK_RATE;
}

// Background prefetch on idle
if (typeof window !== 'undefined') {
  const prefetch = () => { void getLiveNgnRate(); };
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(prefetch, { timeout: 3000 });
  } else {
    setTimeout(prefetch, 500);
  }
}
