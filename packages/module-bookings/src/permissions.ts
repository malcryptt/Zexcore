import type { CapabilityDefinition } from '@zexcore/core';

export const BOOKINGS_CAPABILITIES = {
  READ: 'bookings:read',
  MANAGE: 'bookings:manage',
  SETTINGS: 'bookings:settings',
} as const;

export const bookingsCapabilityDefinitions: CapabilityDefinition[] = [
  { name: BOOKINGS_CAPABILITIES.READ, description: 'View bookings, customers and conversations', module: 'bookings' },
  { name: BOOKINGS_CAPABILITIES.MANAGE, description: 'Create, reschedule and update bookings; reply to customers', module: 'bookings' },
  { name: BOOKINGS_CAPABILITIES.SETTINGS, description: 'Manage services, staff, hours and deposit rules', module: 'bookings' },
];
