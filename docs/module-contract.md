# ZexCore Module Contract

Every domain extension in ZexCore (such as `module-cms`, `module-crm`, `module-iot`) is a first-class module conforming to the `ZexModule` contract defined in `@zexcore/core`.

---

## 1. Directory Structure

Each module must follow this standard shape:
```text
packages/module-<name>/
├── package.json
├── tsconfig.json
└── src/
    ├── schema/           # Drizzle table extensions (must include tenantId)
    ├── routes/           # Fastify route plugins
    ├── permissions.ts    # Capabilities declared by this module
    ├── events.ts         # Event definitions emitted or consumed
    └── index.ts          # Default export implementing ZexModule
```

---

## 2. The `ZexModule` Interface

A module exports an object conforming to the interface:

```typescript
export interface ZexModule {
  name: string;                   // Unique slug, e.g. "cms", "crm"
  version: string;                // SemVer string, e.g. "1.0.0"
  description?: string;
  dependsOn?: string[];           // Dependent module slugs
  
  permissions: CapabilityDefinition[];
  
  registerRoutes?(app: FastifyInstance, core: ZexCoreInstance): Promise<void> | void;
  
  onInit?(core: ZexCoreInstance): Promise<void> | void;
  
  onShutdown?(core: ZexCoreInstance): Promise<void> | void;
}
```

---

## 3. Strict Rules for Module Authors

### Rule 1: No Cross-Module Imports
Modules must **NEVER** import directly from another module.
- **Disallowed:** `import { Contact } from '@zexcore/module-crm';` inside `module-cms`
- **Allowed:** Communicate via Core Event Bus:
  ```typescript
  core.events.emit('lead.created', { tenantId, leadId, ... });
  ```

### Rule 2: Tenant Scoping on All Tables
Any database table declared by a module **MUST** include `tenantId`:
```typescript
export const cmsPages = pgTable('cms_pages', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  slug: varchar('slug', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: jsonb('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Rule 3: Protected Routes
All routes registered by a module must utilize the Core tenancy and authentication plugins:
```typescript
app.get('/api/cms/pages', {
  preHandler: [app.authenticate, app.requireCapability('cms:pages:read')],
  handler: async (request, reply) => {
    // request.tenant is guaranteed
    // request.user is guaranteed
  }
});
```

### Rule 4: Clean Event Subscriptions
Event listeners must handle errors gracefully without crashing the core server. Listeners must not block synchronous HTTP request flows.
