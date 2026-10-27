import { describe, it, expect, afterAll } from 'vitest';
import { withBootstrapLock, closeDatabaseConnection } from '../../packages/core/src/index.js';

describe('withBootstrapLock', () => {
  afterAll(async () => { await closeDatabaseConnection(); });

  it('runs concurrent boot sections one at a time and releases after a failure', async () => {
    let active = 0;
    let maxActive = 0;
    const section = (fail = false) => withBootstrapLock(async () => {
      active++; maxActive = Math.max(maxActive, active);
      await new Promise((r) => setTimeout(r, 40));
      active--;
      if (fail) throw new Error('boom');
      return 'ok';
    });

    const results = await Promise.allSettled([section(), section(true), section(), section()]);
    expect(maxActive).toBe(1);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(3);
    expect(results.filter((r) => r.status === 'rejected')).toHaveLength(1);
    // the lock was released despite the failure
    await expect(section()).resolves.toBe('ok');
  });
});
