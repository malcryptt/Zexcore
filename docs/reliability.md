> **Legacy design notes.** This document describes the earlier self-hosted PostgreSQL/Fastify design (`apps/api`, `packages/*`), which is not what production runs. The live product is the Firebase + Cloudflare Worker build described in the [README](../README.md) and [launch runbook](launch-runbook.md). Nothing here (including encryption, RLS or queue claims) should be read as a description of the live service.

# ZexCore Reliability & Operations Architecture

## 1. The Transactional Outbox Pattern

To prevent silent event loss caused by system crashes between database commits and event emissions:
- Every state mutation writes an event record to `outbox_events` **inside the exact same database transaction** as the data change.
- A background worker reads unprocessed outbox events and publishes them to the event bus / subscribers.
- Event subscribers must be **idempotent**, because outbox guarantees at-least-once delivery.

```sql
BEGIN;
  UPDATE records SET data = '...', version = version + 1 WHERE id = ...;
  INSERT INTO outbox_events (tenant_id, event_name, payload) VALUES (...);
COMMIT;
```

---

## 2. Postgres-Backed Job Queue (Zero Extra Services)

To keep RAM usage minimal (optimal for 8GB dev machines) and maintain operational simplicity:
- Background jobs run directly against PostgreSQL (`pg-boss` or native transactional jobs).
- No Redis or secondary message broker required.
- Single database backups capture data, outbox, and job queues in one consistent snapshot.

---

## 3. Concurrency & Mutation Idempotency

- **Optimistic Locking**: Every mutation on `records` and `content_types` checks `WHERE version = :expected_version` and increments `version = version + 1`. If another actor modified the record concurrently, the mutation fails with `409 Conflict`.
- **Idempotency Keys**: Mutation endpoints accept an `Idempotency-Key` header. Requests with the same key within a 24-hour window return the cached response without re-executing.

---

## 4. Operational Standards: Time, Currency & Logging

- **Time Standard**: All timestamps in database, APIs, and events are strictly **UTC** ISO 8601 strings (`TIMESTAMPTZ` in Postgres). Tenants configure their own display timezone in `tenants.config.timezone`.
- **Currency Standard**: All monetary values are stored as **integer minor units** (e.g. cents/kobo: $50.00 is stored as `5000`). Floating point currency representation is forbidden.
- **Structured Logging**: Every log entry includes `tenantId`, `requestId`, and `principalType`. PII (passwords, tokens, national IDs, clinical notes) is strictly scrubbed.
- **Tenant Export-on-Exit**: Every tenant has a single-click JSON/archive export that dumps all schemas, records, audit trails, and memberships for portability and legal compliance.
