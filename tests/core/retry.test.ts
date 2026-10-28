import { describe, it, expect } from 'vitest';
import { isRetryableConflict, retryDeadlock } from '../../packages/core/src/db/retry.js';

const pgError = (code: string) => Object.assign(new Error('pg'), { code });

describe('retryDeadlock', () => {
  it('retries a deadlock victim and returns the eventual result', async () => {
    let calls = 0;
    const out = await retryDeadlock(async () => {
      if (++calls < 3) throw pgError('40P01');
      return 'done';
    });
    expect(out).toBe('done');
    expect(calls).toBe(3);
  });
  it('gives up after the attempt limit and rethrows the conflict', async () => {
    let calls = 0;
    await expect(retryDeadlock(async () => { calls++; throw pgError('40P01'); }, 3)).rejects.toMatchObject({ code: '40P01' });
    expect(calls).toBe(3);
  });
  it('never retries real errors (constraint violations, bad SQL, app errors)', async () => {
    for (const e of [pgError('23505'), pgError('42601'), new Error('boom')]) {
      let calls = 0;
      await expect(retryDeadlock(async () => { calls++; throw e; })).rejects.toBe(e);
      expect(calls).toBe(1);
    }
  });
  it('recognises deadlock and serialization failures only', () => {
    expect(isRetryableConflict(pgError('40P01'))).toBe(true);
    expect(isRetryableConflict(pgError('40001'))).toBe(true);
    expect(isRetryableConflict(pgError('23505'))).toBe(false);
    expect(isRetryableConflict(null)).toBe(false);
  });
});
