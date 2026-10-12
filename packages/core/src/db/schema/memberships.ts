import { pgTable, uuid, varchar, jsonb, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { tenants } from './tenants.js';
import { users } from './users.js';

export type PrincipalType =
  | 'platform_admin'
  | 'tenant_admin'
  | 'tenant_user'
  | 'public'
  | 'end_user'
  | 'device'
  | 'ai_agent'
  | 'system';

export type TenantRole = 'owner' | 'admin' | 'member' | 'viewer';

export const memberships = pgTable(
  'memberships',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    principalType: varchar('principal_type', { length: 32 })
      .$type<PrincipalType>()
      .default('tenant_user')
      .notNull(),
    role: varchar('role', { length: 64 }).$type<TenantRole>().default('member').notNull(),
    capabilities: jsonb('capabilities').$type<string[]>().default([]).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('memberships_tenant_user_idx').on(table.tenantId, table.userId),
  ],
);

export type Membership = typeof memberships.$inferSelect;
export type NewMembership = typeof memberships.$inferInsert;
