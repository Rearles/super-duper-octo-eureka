---
title: "Add Apache AGE graph queries (faction/allegiance/pact + record-entity graph)"
type: "feature"
created: "2026-06-05"
status: not-started
related: ["migrate-the-registry-database-from-sqlite-to-postgres_38b4da91.plan.md", "add-the-graph-analysis-and-full-text-search-upgrade_c7e4a8b5.plan.md"]
---

# Add Apache AGE graph queries

## Context

Project the faction RELATIONSHIP / ALLEGIANCE / PACT edges and the RECORD<->ENTITY
edges into an Apache AGE property graph and query them with openCypher — the scale
version of `src/engine/analysis.ts` (relationshipPath, defectionChain,
documentsMentioning). The engine functions are the behavioral ORACLE; the Cypher
must reproduce their results.

## ⚠️ RUN THIS IN A DOCKER-CAPABLE ENVIRONMENT

AGE is NOT on stock Postgres and NOT in apt; it needs the **`apache/age` image**
(`docker-compose.yml` is already pinned to it) or a source build. The default
Claude Code remote sandbox has **no running Docker daemon** — run this plan on a
machine/devcontainer where `docker ps` works. (`tsvector`, by contrast, needs no
Docker — see the tsvector plan.)

## Todos

- [ ] In a Docker env: `docker compose up -d` (apache/age PG16); set DATABASE_URL to it
- [ ] Apply prisma/schema.postgres.prisma (db push) + prisma/postgres/extensions.sql (CREATE EXTENSION age) + rls.sql
- [ ] Create an AGE graph; `LOAD 'age'`; set search_path
- [ ] Project relationship/allegiance/pact edges (from the sim/diplomacy data) into the graph
- [ ] Project record<->entity edges (a record MENTIONS an entity) into the graph
- [ ] Implement openCypher server queries: documents-mentioning-X, relationship-path (multi-hop), defection-chain, factions-at-war
- [ ] Add a projection step keeping the graph in step with the relational tables
- [ ] Add tests asserting the Cypher results equal `src/engine/analysis.ts` on the same data
- [ ] Verify (in the Docker env): the parity tests; commit

## Notes

**Behavioral oracle:** `src/engine/analysis.ts` (relationshipPath BFS,
defectionChain, documentsMentioning) defines correct output; the Cypher versions
must match it.

**Fallback:** if no Docker is available anywhere, the engine-level `analysis.ts`
tools already deliver the behavior in-process — AGE is a scale/query-power
optimization, not a correctness requirement.

**assist-project:** fct_c9ebf6bea613 (Postgres/AGE server tier), fct_4262177601db (remaining work — AGE deferred for Docker).
