/**
 * Automation rule engine. Pure and deterministic: no clock, no network, no randomness. It is imported by the
 * dashboard (to dry-run a rule against sample data) and by the Worker (to run it for real), so a test run shows
 * exactly what production will do.
 */
export type Op = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'exists';
export const OPS: readonly Op[] = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'contains', 'exists'];

export interface Leaf { field: string; op: Op; value?: string | number | boolean }
export type Condition = Leaf | { all: Condition[] } | { any: Condition[] };
export type Action =
  | { type: 'notify'; message: string }
  | { type: 'webhook'; url: string };
export interface RuleDef { trigger: { source: string } | string; conditions?: Condition | null; actions: Action[] }

export const EVENTS = ['bookings.booking.created', 'crm.lead.created', 'iot.reading', 'iot.alert'] as const;
export const EVENT_RE = /^[a-z0-9_]+(\.[a-z0-9_]+){1,4}$/;

export function getPath(obj: unknown, path: string): unknown {
  let cur: any = obj;
  for (const part of path.split('.')) { if (cur === null || typeof cur !== 'object') return undefined; cur = cur[part]; }
  return cur;
}

function leaf(c: Leaf, payload: unknown): boolean {
  const actual = getPath(payload, c.field);
  if (c.op === 'exists') return actual !== undefined && actual !== null;
  if (actual === undefined || actual === null) return false;
  switch (c.op) {
    case 'eq': return actual === c.value || String(actual) === String(c.value);
    case 'neq': return !(actual === c.value || String(actual) === String(c.value));
    case 'contains': return String(actual).toLowerCase().includes(String(c.value ?? '').toLowerCase());
    default: {
      const a = Number(actual), b = Number(c.value);
      if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
      return c.op === 'gt' ? a > b : c.op === 'gte' ? a >= b : c.op === 'lt' ? a < b : a <= b;
    }
  }
}
export function matches(c: Condition | null | undefined, payload: unknown, depth = 0): boolean {
  if (!c) return true;
  if (depth > 4) return false;
  if ('all' in c) return c.all.every((x) => matches(x, payload, depth + 1));
  if ('any' in c) return c.any.some((x) => matches(x, payload, depth + 1));
  return leaf(c, payload);
}

export const sourceOf = (t: RuleDef['trigger']): string => (typeof t === 'string' ? t : t?.source ?? '').replace(/^event:/, '');

export function evaluate(rule: RuleDef, event: string, payload: unknown): { triggerPassed: boolean; conditionsPassed: boolean; wouldExecute: boolean } {
  const triggerPassed = sourceOf(rule.trigger) === event;
  const conditionsPassed = triggerPassed && matches(rule.conditions, payload);
  return { triggerPassed, conditionsPassed, wouldExecute: triggerPassed && conditionsPassed && rule.actions.length > 0 };
}

/** Only public https hosts, never IP literals or internal names, so a rule cannot be pointed at private services. */
export function safeWebhookUrl(raw: string): boolean {
  let u: URL; try { u = new URL(raw); } catch { return false; }
  if (u.protocol !== 'https:' || u.username || u.password || u.port && u.port !== '443') return false;
  const h = u.hostname.toLowerCase();
  if (!h.includes('.') || /^\d+\.\d+\.\d+\.\d+$/.test(h) || h.includes(':') || h.startsWith('[')) return false;
  return !/(^|\.)(localhost|local|internal|lan|home|corp|intranet)$/.test(h);
}

/** Validates what a person typed into a rule; returns a clean copy or an error message. */
export function cleanRule(input: { name?: unknown; trigger?: unknown; conditions?: unknown; actions?: unknown }): { ok: true; rule: RuleDef & { name: string } } | { ok: false; error: string } {
  const name = String(input.name ?? '').trim();
  if (name.length < 2 || name.length > 128) return { ok: false, error: 'Give the rule a name.' };
  const source = sourceOf(input.trigger as RuleDef['trigger']);
  if (!EVENT_RE.test(source)) return { ok: false, error: 'Choose an event such as bookings.booking.created.' };
  let conditions: Condition | null = null;
  if (input.conditions) {
    const c = input.conditions as Leaf;
    if (!c || typeof c.field !== 'string' || !/^[A-Za-z0-9_.]{1,64}$/.test(c.field) || !OPS.includes(c.op)) return { ok: false, error: 'That condition is not valid.' };
    conditions = c.op === 'exists' ? { field: c.field, op: c.op } : { field: c.field, op: c.op, value: typeof c.value === 'number' || typeof c.value === 'boolean' ? c.value : String(c.value ?? '').slice(0, 200) };
  }
  if (!Array.isArray(input.actions) || input.actions.length < 1 || input.actions.length > 3) return { ok: false, error: 'Add between one and three actions.' };
  const actions: Action[] = [];
  for (const a of input.actions as any[]) {
    if (a?.type === 'notify') {
      const message = String(a.message ?? '').trim();
      if (message.length < 1 || message.length > 512) return { ok: false, error: 'Write the message to send (up to 512 characters).' };
      actions.push({ type: 'notify', message });
    } else if (a?.type === 'webhook') {
      const url = String(a.url ?? '').trim();
      if (!safeWebhookUrl(url)) return { ok: false, error: 'A webhook must be a public https address (no IP addresses or internal hosts).' };
      actions.push({ type: 'webhook', url });
    } else return { ok: false, error: 'Unknown action.' };
  }
  return { ok: true, rule: { name, trigger: { source: `event:${source}` }, conditions, actions } };
}

/** {{path}} placeholders in a message are filled from the event data. */
export const render = (message: string, payload: unknown): string =>
  message.replace(/\{\{\s*([A-Za-z0-9_.]{1,64})\s*\}\}/g, (_m, p) => { const v = getPath(payload, p); return v === undefined || v === null ? '' : String(v); });

export type AlertOp = 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
export const ALERT_OPS: readonly AlertOp[] = ['gt', 'gte', 'lt', 'lte', 'eq'];
export function alertHit(op: AlertOp, value: unknown, threshold: number): boolean {
  const v = Number(value); if (!Number.isFinite(v)) return false;
  return op === 'gt' ? v > threshold : op === 'gte' ? v >= threshold : op === 'lt' ? v < threshold : op === 'lte' ? v <= threshold : v === threshold;
}
