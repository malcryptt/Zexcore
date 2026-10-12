import { pgTable, uuid, varchar, jsonb, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { tenants } from './tenants.js';
import { users } from './users.js';
import { contentTypes } from './content_types.js';

export const records = pgTable(
  'records',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    contentTypeId: uuid('content_type_id')
      .notNull()
      .references(() => contentTypes.id, { onDelete: 'cascade' }),
    slug: varchar('slug', { length: 255 }),
    status: varchar('status', { length: 32 }).default('draft').notNull(), // 'draft', 'published', 'archived'
    data: jsonb('data').$type<Record<string, unknown>>().default({}).notNull(),
    version: integer('version').default(1).notNull(),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('records_tenant_content_type_idx').on(table.tenantId, table.contentTypeId),
    index('records_tenant_slug_idx').on(table.tenantId, table.slug),
  ],
);

export type RecordEntity = typeof records.$inferSelect;
export type NewRecordEntity = typeof records.$inferInsert;
