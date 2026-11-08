/**
 * A price box with a currency picker beside it, so owners type what they charge in their own money.
 * Everything is still stored in US dollars (cents); the box converts on save at the rate the booking page uses.
 * An untouched box returns the stored amount exactly, so opening a form never moves a price when the market rate has.
 */
import { html, $, type Raw } from './html';
import { CURRENCY_SYMBOLS, DEFAULT_RATES_FROM_USD, fetchLiveRates, getCachedRates, usdToMajor, type SupportedCurrency } from './fx';
import { loadSettings } from './store';

const CURRENCIES = Object.keys(DEFAULT_RATES_FROM_USD) as SupportedCurrency[];
const NAMES: Record<SupportedCurrency, string> = { USD: 'US dollar', NGN: 'Naira', GBP: 'Pound', EUR: 'Euro', GHS: 'Cedi', KES: 'Shilling', ZAR: 'Rand' };
const KEY = 'zx.price_currency_v1';
const ZERO_DECIMAL = new Set<SupportedCurrency>(['NGN', 'KES']);

let rates = getCachedRates();
let ngnManual: number | null = null;
let fallback: SupportedCurrency = 'USD';

/** Loads the workspace's rate setting and the market table. Call once when a screen opens; forms use what it found. */
export async function primeMoney(): Promise<void> {
  try {
    const [s, r] = await Promise.all([loadSettings(), fetchLiveRates()]);
    rates = r;
    ngnManual = s.exchangeRateMode === 'manual' && (s.exchangeRate ?? 0) > 100 ? (s.exchangeRate as number) : null;
    if (CURRENCIES.includes(s.currency as SupportedCurrency)) fallback = s.currency as SupportedCurrency;
  } catch { rates = getCachedRates(); }
}

function chosen(): SupportedCurrency {
  try { const v = localStorage.getItem(KEY) as SupportedCurrency | null; if (v && CURRENCIES.includes(v)) return v; } catch { /* storage unavailable */ }
  return fallback;
}
const remember = (c: SupportedCurrency): void => { try { localStorage.setItem(KEY, c); } catch { /* storage unavailable */ } };
const perUsd = (c: SupportedCurrency): number => (c === 'NGN' && ngnManual ? ngnManual : rates[c] ?? 1);
const dp = (c: SupportedCurrency): number => (ZERO_DECIMAL.has(c) ? 0 : 2);

interface Opts { id: string; label: string; usdMinor?: number | null; required?: boolean; disabled?: boolean; max?: number; note?: string }

export function moneyField(o: Opts): Raw {
  const cur = chosen();
  const has = typeof o.usdMinor === 'number';
  const shown = has ? Number(usdToMajor(o.usdMinor as number, cur, rates, ngnManual).toFixed(dp(cur))) : '';
  return html`<div class="field" data-money="${o.id}" data-orig="${has ? String(o.usdMinor) : ''}" data-max="${o.max ?? ''}">
    <label for="${o.id}">${o.label}</label>
    <div class="row" style="gap:8px">
      <select class="select" id="${o.id}-cur" aria-label="Currency" style="max-width:130px" ${o.disabled ? 'disabled' : ''}>${CURRENCIES.map((c) => html`<option value="${c}" ${c === cur ? 'selected' : ''}>${CURRENCY_SYMBOLS[c]} ${c}</option>`)}</select>
      <input class="input" id="${o.id}" type="number" min="0" step="any" inputmode="decimal" value="${shown}" ${o.required ? 'required' : ''} ${o.disabled ? 'disabled' : ''} style="flex:1">
    </div>
    <p class="muted small" id="${o.id}-hint" aria-live="polite"></p>${o.note ? html`<p class="muted small">${o.note}</p>` : ''}
  </div>`;
}

const field = (root: ParentNode, id: string): HTMLElement | null => $(`[data-money="${id}"]`, root);
const num = (root: ParentNode, id: string): HTMLInputElement => $(`#${id}`, root) as HTMLInputElement;
const sel = (root: ParentNode, id: string): HTMLSelectElement => $(`#${id}-cur`, root) as HTMLSelectElement;

/** Reads the box as US cents. Returns NaN when it is empty or invalid. */
export function moneyMinor(root: ParentNode, id: string): number {
  const f = field(root, id); if (!f) return NaN;
  const n = num(root, id);
  if (f.dataset.orig && f.dataset.dirty !== '1') return Number(f.dataset.orig);
  if (n.value.trim() === '') return NaN;
  const major = Number(n.value);
  if (!Number.isFinite(major) || major < 0) return NaN;
  if (major === 0) return 0;
  const c = sel(root, id).value as SupportedCurrency;
  return Math.max(1, Math.round((major / perUsd(c)) * 100));
}

/** Wires the currency picker and the "saved as" line. Call after the form is on the page. */
export function bindMoney(root: ParentNode, id: string): void {
  const f = field(root, id); if (!f) return;
  const n = num(root, id), s = sel(root, id), hint = $(`#${id}-hint`, root) as HTMLElement;
  const draw = (): void => {
    const c = s.value as SupportedCurrency;
    if (n.value.trim() === '') { hint.textContent = ''; return; }
    const usd = moneyMinor(root, id);
    if (!Number.isFinite(usd)) { hint.textContent = 'Enter a valid amount.'; return; }
    const max = Number(f.dataset.max);
    const over = max > 0 && usd > max * 100;
    if (c === 'USD') hint.textContent = over ? `Too high. The most allowed is $${max.toLocaleString('en-US')}.` : '';
    else hint.textContent = (over ? `Too high. The most allowed is $${max.toLocaleString('en-US')}. ` : '') + `Saved as $${(usd / 100).toFixed(2)} USD (₦ and other prices follow the rate: 1 USD = ${CURRENCY_SYMBOLS[c]}${perUsd(c).toLocaleString('en-US', { maximumFractionDigits: 2 })}).`;
  };
  n.addEventListener('input', () => { f.dataset.dirty = '1'; draw(); });
  s.addEventListener('change', () => {
    const next = s.value as SupportedCurrency;
    // Switching currency converts what is typed, so the same price stays the same price.
    const usd = moneyMinor(root, id);
    if (Number.isFinite(usd) && n.value.trim() !== '') n.value = String(Number(usdToMajor(usd, next, rates, ngnManual).toFixed(dp(next))));
    remember(next);
    draw();
  });
  draw();
}

// Helpers for screens that show one currency picker for several price boxes (the first-run setup).
export const currencyChoices = (): { code: SupportedCurrency; label: string }[] => CURRENCIES.map((c) => ({ code: c, label: `${CURRENCY_SYMBOLS[c]} ${c} · ${NAMES[c]}` }));
export const preferredCurrency = (): SupportedCurrency => chosen();
export const rememberCurrency = remember;
/** A US-dollar amount (dollars) as a tidy number in another currency. */
export const fromUsd = (usd: number, c: SupportedCurrency): number => Number((usd * perUsd(c)).toFixed(dp(c)));
/** An amount typed in a currency, as US cents. */
export const toUsdMinor = (amount: number, c: SupportedCurrency): number => (amount > 0 ? Math.max(1, Math.round((amount / perUsd(c)) * 100)) : 0);
export const currencySymbol = (c: SupportedCurrency): string => CURRENCY_SYMBOLS[c];
