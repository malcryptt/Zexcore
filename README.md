# ZexCore

> **Multi-tenant Backend Engine & Modular Platform ("One Core, Different Possibilities")**  
> Built by Zexlabs for extensible, enterprise-grade business workloads.

---

##  Stack & Architecture

- **Runtime**: Node.js 22 LTS
- **Language**: TypeScript (`strict: true`)
- **Monorepo**: pnpm workspaces
- **API Framework**: Fastify
- **Database & RLS**: PostgreSQL (Native or Docker) + Drizzle ORM
- **Validation**: Zod (shared across API, config, and AI proposal validators)
- **Dev Runner**: `tsx` (zero build step in dev)
- **Test Runner**: Vitest (tenant isolation and integration tests)
- **Lint / Format**: ESLint + Prettier (enforcing strict module boundary imports)

---

##  Repository Layout

```text
ZexCore/
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── eslint.config.mjs             # Enforces no cross-module or deep core imports
├── .env.example
├── README.md
│
├── docs/
│   ├── architecture.md           # System topology & request lifecycle
│   ├── module-contract.md        # Rules modules must follow
│   └── security.md               # Tenancy, RLS, threat model & compliance
│
├── packages/
│   ├── core/                     # Foundational microkernel (auth, tenancy, content, events, audit)
│   │   └── src/
│   │       ├── db/               # PostgreSQL client, 6 starter tables, RLS policies
│   │       ├── auth/             # scrypt passwords, JWT tokens, session context
│   │       ├── tenancy/          # AsyncLocalStorage request scoping
│   │       ├── permissions/      # Role & capability matrices (all principals)
│   │       ├── content/          # Dynamic Zod compiler for ContentTypes & AI proposals
│   │       ├── events/           # Typed async event bus with error isolation
│   │       ├── audit/            # Tamper-evident audit logging
│   │       ├── modules/          # ZexModule lifecycle & registry
│   │       └── config/           # Validated env and per-workspace feature flags
│   │
│   └── module-cms/               # Content Management System module (pages, publishing)
│
├── packs/                        # Industry vertical manifests (config only, no code)
│   ├── realty/                   # Real estate listings, viewing inquiries
│   ├── clinic/                   # Healthcare intake & consultation notes (hardened tier)
│   └── store/                    # Products, inventory, orders
│
├── apps/
│   └── api/                      # Fastify server: wiring core + enabled modules
│
├── scripts/
│   ├── dev-db.sh                 # Local Postgres startup with NOBYPASSRLS app role
│   └── seed.ts                   # Seeds demo tenant (Realty Pros), platform admin & records
│
└── tests/
    ├── isolation/                # PostgreSQL RLS attack tests
    └── api/                      # Fastify booting Core + Modules integration tests
```

---

##  Quickstart

### 1. Start the Database
Spins up PostgreSQL in Docker, creates the database, and provisions the `zexcore_app` non-superuser role to enforce strict Row-Level Security:
```bash
./scripts/dev-db.sh
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Run Security & Isolation Tests
Attacks the PostgreSQL database across tenants to verify that queries and updates cannot breach tenant boundaries:
```bash
pnpm test
# or specifically isolation tests:
pnpm test:isolation
```

### 4. Seed Initial Data
Provisions the platform superadmin and demo tenant (`realty-pros`):
```bash
pnpm seed
```

### 5. Start API Server in Development Mode
```bash
pnpm dev
```
Health endpoint:
```bash
curl http://localhost:3000/api/health
```

---

##  Security & Defense-in-Depth

1. **Database Row-Level Security (RLS)**: Enforced via PostgreSQL policies and session context `app.current_tenant_id`. Bypasses are blocked by running as `zexcore_app` (`NOBYPASSRLS`).
2. **Application Scoping**: Node.js `AsyncLocalStorage` isolates request context per asynchronous execution tree.
3. **Capability-Based Permissions**: Every actor (`platform_admin`, `tenant_admin`, `tenant_user`, `public`, `end_user`, `device`, `ai_agent`, `system`) passes through `hasCapability()`.
4. **AI Safety Invariant**: AI agents are restricted to creating proposals (`ai:proposals:create`) that must pass dynamic Zod schema compilation and human approval before mutation.
