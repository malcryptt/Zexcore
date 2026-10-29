export type LimitKey = 'bookingsPerMonth' | 'staff' | 'services' | 'devices' | 'rules' | 'cmsPages' | 'crmContacts';
export type Limits = Record<LimitKey, number | null>;
export type Labels = Record<LimitKey, { one: string; many: string }>;

export const LIMIT_ORDER: LimitKey[] = ['bookingsPerMonth', 'services', 'staff', 'crmContacts', 'cmsPages'];

/** "200 bookings a month", "Unlimited services" … for a plan card. */
export function limitLines(limits: Limits | null, labels: Labels): string[] {
  if (!limits) return [];
  return LIMIT_ORDER.map((k) => {
    const n = limits[k];
    const l = labels[k];
    return n === null ? `Unlimited ${l.many}` : `${n.toLocaleString('en-NG')} ${n === 1 ? l.one : l.many}`;
  });
}
