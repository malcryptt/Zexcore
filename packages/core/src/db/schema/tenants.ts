import { pgTable, uuid, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core';

export interface TenantConfig {
  features?: Record<string, boolean>;
  enabledModules?: string[];
  activePack?: string;
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
  };
}

export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 64 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  status: varchar('status', { length: 32 }).default('active').notNull(),
  tier: varchar('tier', { length: 32 }).default('standard').notNull(), // 'standard', 'pro', 'hardened_clinic'
  config: jsonb('config').$type<TenantConfig>().default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
