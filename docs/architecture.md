# ZexCore Architecture

## 1. System Overview

**ZexCore** is an extensible, multi-tenant enterprise core application framework designed for high-performance modular workloads (CMS, CRM, IoT, and custom domain applications).

The system enforces strict architectural layers:
- **Tenancy-First Foundation**: Every single domain entity, permission check, and event is strictly bounded by a tenant context.
- **Micro-kernel with Plugins**: The core runtime (`@zexcore/core`) handles authentication, dynamic content/custom fields, RBAC/capabilities, event broadcasting, and audit trails. Domain engines (like CMS and CRM) are built as standalone workspace modules that register schemas, routes, and listeners through a formal module lifecycle contract.
- **Config-Driven Domain Packs**: Industry vertical packs (`packs/realty`, `packs/clinic`, `packs/store`) declare content type schemas, pipelines, and workflows without requiring code alterations.

```
+-------------------------------------------------------------------------+
|                               Applications                              |
|          apps/api (Fastify)        |       apps/admin (React + Vite)    |
+------------------------------------+------------------------------------+
                                      |
+-------------------------------------------------------------------------+
|                             Industry Packs                              |
|         packs/realty       |      packs/clinic     |     packs/store    |
+----------------------------+-----------------------+--------------------+
                                      |
+-------------------------------------------------------------------------+
|                                Modules                                  |
|     @zexcore/module-cms    |   @zexcore/module-crm |  @zexcore/module-iot|
+----------------------------+-----------------------+--------------------+
                                      |
+-------------------------------------------------------------------------+
|                              ZexCore Core                               |
|                  Tenancy  |  Auth & RBAC  |  Content Engine             |
|                  Events   |  Audit Log    |  Module Registry            |
|                  Database (Drizzle ORM + PostgreSQL RLS)                |
+-------------------------------------------------------------------------+
```

---

## 2. Layering & Module Boundaries

Module boundaries in ZexCore are enforced at three distinct levels:
1. **Repository Topology**: Code resides in isolated pnpm workspace packages. Sibling packages cannot access internal source files directly.
2. **Explicit Package Exports**: Packages only expose approved symbols through their top-level `exports` (`"."`).
3. **Lint Rules (`no-restricted-imports`)**: ESLint prohibits any relative traversal out of package boundaries or importing deep `/src/...` paths.

### Dependency Direction Rules
- **Core (`packages/core`)** depends ONLY on shared utility libraries and database drivers. It **NEVER** imports from `apps/*`, `packs/*`, or any domain module (`packages/module-*`).
- **Domain Modules (`packages/module-*`)** depend on `@zexcore/core`. Modules **MUST NOT** import sibling modules directly. Any inter-module communication is asynchronous and mediated via the Core Event Bus.
- **API Application (`apps/api`)** imports `@zexcore/core` and the enabled modules, orchestrating their registration into the Fastify server.
- **Industry Packs (`packs/*`)** are pure configuration manifests (JSON/TypeScript schemas) that configure custom types, fields, and pipelines for tenants.

---

## 3. Request Lifecycle & Tenancy Resolution

Every incoming request to the API undergoes a strict pipeline:
1. **Tenant Identification**: Extracted from subdomain (e.g., `acme.zexcore.local`) or `X-Tenant-ID` header.
2. **Context Binding**: Stored in Node.js `AsyncLocalStorage` (`TenantContext`).
3. **Database Session Binding**: PostgreSQL connection executes `SET LOCAL app.current_tenant_id = '<tenant_id>'` inside transactional queries, enforcing PostgreSQL Row Level Security (RLS).
4. **Authentication**: Resolves Bearer JWT to an active `User` and their `Membership` record for the resolved tenant.
5. **Authorization / Capability Check**: Verifies that the user's role has the required capability (e.g., `records:create`).
6. **Execution & Audit**: The controller processes the action and emits audit entries and internal events.
