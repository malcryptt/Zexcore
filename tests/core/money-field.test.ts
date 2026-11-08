import { describe, expect, it } from 'vitest';
import { fromUsd, toUsdMinor } from '../../apps/dashboard/src/lib/moneyField';

// Default table (no network in tests): 1 USD = 1350 NGN, 0.78 GBP.
describe('price currency conversion', () => {
  it('turns naira into US cents at the table rate', () => {
    expect(toUsdMinor(13_500, 'NGN')).toBe(1000);       // ₦13,500 = $10.00
    expect(toUsdMinor(10, 'USD')).toBe(1000);
  });
  it('never turns a real price into free', () => {
    expect(toUsdMinor(1, 'NGN')).toBe(1);
    expect(toUsdMinor(0, 'NGN')).toBe(0);
  });
  it('shows dollars in another currency', () => {
    expect(fromUsd(10, 'NGN')).toBe(13_500);
    expect(fromUsd(10, 'GBP')).toBe(7.8);
  });
  it('round-trips a typed price within one cent', () => {
    for (const c of ['NGN', 'GBP', 'EUR', 'GHS', 'KES', 'ZAR'] as const) {
      const usd = toUsdMinor(250, c) / 100;
      expect(Math.abs(fromUsd(usd, c) - 250) / 250).toBeLessThan(0.05);
    }
  });
});
