---
title: "Add Postgres tsvector full-text search over the Registry"
type: "feature"
created: "2026-06-05"
status: not-started
related: ["migrate-the-registry-database-from-sqlite-to-postgres_38b4da91.plan.md", "add-the-graph-analysis-and-full-text-search-upgrade_c7e4a8b5.plan.md"]
---

# Add Postgres tsvector full-text search over the Registry

## Context

Replace/augment the in-engine token search (`src/engine/analysis.ts` `searchRecords`)
with a real Postgres FULL-TEXT index. `tsvector` is CORE Postgres — NO extension,
NO Docker needed (runs on the local cluster: `pg_ctlcluster 16 main start`). The
engine `searchRecords` is the behavioral oracle to verify parity against.

## Todos

- [ ] Start local PG (`pg_ctlcluster 16 main start`); apply prisma/schema.postgres.prisma (db push)
- [ ] Add a `search` tsvector (generated column or trigger) over SimRecord(title, claims) + a GIN index
- [ ] Add the migration SQL under prisma/postgres/ (reflect in schema.postgres.prisma where expressible)
- [ ] Add `searchRegistry(query)` in server/ using websearch_to_tsquery over the GIN index
- [ ] Add a server route GET /search?q= (used by the vertical-slice UI)
- [ ] Add a test asserting parity with `src/engine/analysis.ts` `searchRecords` on the same seeded data
- [ ] Verify: server typecheck + the parity test; commit

## Notes

**No Docker required** — `tsvector`/`to_tsquery`/`websearch_to_tsquery`/GIN are core
Postgres 16. This is DISTINCT from Apache AGE (which DOES need the apache/age image).

**Parity oracle:** `src/engine/analysis.ts` `searchRecords` defines the expected
matches; the tsvector query should return the same records for the same query
(modulo stemming — document any stemming differences).

**assist-project:** fct_c9ebf6bea613 (server tier / Postgres), fct_4262177601db (remaining work).
