---
title: "Add the graph analysis (Apache AGE) and full-text search upgrade"
type: "feature"
created: "2026-06-04"
status: not-started
related: ["migrate-the-registry-database-from-sqlite-to-postgres_38b4da91.plan.md", "build-the-relationships-and-pacts-diplomacy-engine_d2e8b3c9.plan.md", "build-the-event-to-record-pipeline-ground-truth-and-case-lifecycle_f4b1d5e2.plan.md"]
---

# Add the graph analysis (Apache AGE) + full-text search upgrade

## Context

The analysis surface over the Postgres Registry (GCD §2.3 raw-data analysis tools, v2.0). With the migration plan having enabled **Apache AGE**, project the `EntityLink` + faction **allegiance/pact/relationship** edges as a property graph and expose **openCypher** multi-hop queries; and upgrade case/record search from SQLite **FTS5** to Postgres **tsvector**. These power the §2.3 analysis tools that *reveal/compare/list but never interpret* (Pillar 2) — "list every document mentioning X", trace a defection chain, overlay timelines, map historical territory control. Depends on the migration (AGE/tsvector enabled), the relationships/pacts edges, and the records the event-pipeline writes.

## Todos

- [ ] Define the AGE graph projection: nodes (Person/Org/Faction/Record) + edges (EntityLink, allegiance, pact, relationship)
- [ ] Add a projection job keeping the AGE graph in step with the relational tables
- [ ] Expose read-only `cypher(query)` server endpoints for the analysis tools
- [ ] Build "every document mentioning entity X" (traversal over record-entity edges)
- [ ] Build "defection chain / who served whom in year Y" over the historized allegiance edges
- [ ] Build "factions at war with / grieved by entity X that winter" over relationship+grievance edges
- [ ] Build the historical **territory map** (zone control over time) + a timeline overlay
- [ ] Upgrade case/record search FTS5 -> Postgres `tsvector` (GIN index); keep the query API stable
- [ ] Enforce Pillar 2: tools reveal/compare/list raw data, never flag a conclusion
- [ ] Add tests: each Cypher tool returns correct nodes, projection stays in sync, tsvector parity with FTS5
- [ ] Verify: `npm run typecheck` + `npm test`

## Notes

**Why AGE (not CTEs).** The faction layer is fundamentally a graph (allegiance/pacts/relationships + record-entity links). Recursive multi-hop questions — defection chains, war webs, "who controlled this turf and its cops when the crime happened" — are natural in openCypher and painful in SQL. The migration enables AGE precisely so this layer is native.

**Pillar 2 (deduction, not direction).** These are **raw-data** tools: they reveal, compare, list, and overlay, but never interpret or flag a conclusion. "List every doc mentioning X" is fair; "X is the culprit" is not. The contradiction/corroboration flag still shows only *that* a relationship exists.

**Search upgrade.** SQLite FTS5 (foundation era) -> Postgres `tsvector` + GIN post-migration; keep the search API stable so the UI/engine don't change.

**assist-project:** fct_c9ebf6bea613 (Postgres/AGE server tier), fct_2fbede949a8d (the faction graph this queries).
