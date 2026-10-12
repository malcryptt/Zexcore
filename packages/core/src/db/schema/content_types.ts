import { pgTable, uuid, varchar, text, jsonb, integer, boolean, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { tenants } from './tenants.js';

export interface FieldDefinition {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'json' | 'relation' | 'select' | 'media' | 'encrypted';
  required?: boolean;
  defaultValue?: unknown;
  options?: string[]; // for 'select'
  relationTo?: string; // slug of referenced content_type for 'relation'
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface ContentTypeSchema {
  fields: FieldDefinition[];
  indexes?: string[];
}

export const contentTypes = pgTable(
  'content_types',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    slug: varchar('slug', { length: 64 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    schemaJson: jsonb('schema_json').$type<ContentTypeSchema>().notNull(),
    version: integer('version').default(1).notNull(),
    isSystem: boolean('is_system').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('content_types_tenant_slug_idx').on(table.tenantId, table.slug),
  ],
);

export type ContentType = typeof contentTypes.$inferSelect;
export type NewContentType = typeof contentTypes.$inferInsert;
