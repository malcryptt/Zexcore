<img src="Interlocking-Red-Hexagon-Emblem.png" alt="ZexCore logo" width="160">

# ZexCore

Appointments, customers, inbox, deposits, device monitoring and automations for service businesses, built by Zexlabs. Live at https://zexcore.com.ng.

## What runs in production

| Part | Technology | Where |
|---|---|---|
| Dashboard and public booking pages | TypeScript + Vite, no framework | `apps/dashboard`, Firebase Hosting |
| Accounts | Firebase Authentication (email/password, Google) | Firebase |
| Data and tenant isolation | Cloud Firestore; **`firestore.rules` is the security boundary** (membership, roles, data shape, plan limits, double-booking locks) | `firestore.rules` |
| Payments, deposits, audit chain, device ingest, automations | One Cloudflare Worker using the Firestore REST API | `workers/payments` |
| Shared automation rule engine | Pure TypeScript used by dashboard and Worker | `shared/rules-engine.ts` |

Plan changes, deposits, the audit chain and automation runs are written only by the Worker; browsers cannot write them.

## Legacy code

`apps/api`, `apps/payments-worker` and `packages/*` are an earlier self-hosted PostgreSQL/Fastify design. They are not deployed. `docs/` other than `launch-runbook.md` describes that design and is marked as legacy.

## Develop

```bash
pnpm install
cd apps/dashboard && npx tsc --noEmit -p .      # typecheck
npx vitest run -c vitest.rules.config.ts         # rules + end-to-end tests (needs the Firestore emulator)
```

CI runs both jobs on every PR; merging to `main` deploys rules and the Worker (`deploy-backend`) and the dashboard (`deploy-hosting`). See `docs/launch-runbook.md` for secrets and first-time setup.
