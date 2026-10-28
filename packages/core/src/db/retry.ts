import type postgres from 'postgres';

/** Postgres picks one victim when two transactions wait on each other; the victim is rolled back and is safe to retry. */
export function isRetryableConflict(e: unknown): boolean {
  const code = (e as { code?: string; cause?: { code?: string } } | null)?.code ?? (e as any)?.cause?.code;
  return code === '40P01' /* deadlock_detected */ || code === '40001' /* serialization_failure */;
}

export async function retryDeadlock<T>(fn: () => Promise<T>, attempts = 4): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i >= attempts || !isRetryableConflict(e)) throw e;
      await new Promise((r) => setTimeout(r, 15 * i + Math.random() * 45));
    }
  }
}

/**
 * Wraps a client so single-statement `unsafe` calls (each its own transaction, e.g. the SECURITY DEFINER functions)
 * are retried when Postgres aborts them as a deadlock victim. This happens when another instance is booting and
 * re-applying DDL while this one serves traffic (rolling deploys).
 */
export function retrying(sql: postgres.Sql): { unsafe: postgres.Sql['unsafe'] } {
  return { unsafe: ((q: string, p?: any[], o?: any) => retryDeadlock(() => sql.unsafe(q, p, o) as unknown as Promise<any>)) as any };
}
