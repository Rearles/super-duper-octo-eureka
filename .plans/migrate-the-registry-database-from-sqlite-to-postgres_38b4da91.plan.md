---
title: "Migrate the Registry database from SQLite to Postgres"
type: "migration"
created: "2026-06-04"
status: not-started
related: ["build-the-registry-backend-prisma-schema-and-forgeable-data-tables_b705b56b.plan.md", "add-the-registry-access-tiers-tamper-evident-audit-and-publication-layer_298f7bb1.plan.md"]
---

# Migrate the Registry database from SQLite to Postgres

## Context

Move the Registry off SQLite onto Postgres once the full **foundation** schema exists (data layer + governance + the death/judicial record clusters). **Position (GCD v2.0): after the substrate, *before* the faction society-sim** — because the sim is graph-shaped (allegiance/pacts) and wants **Apache AGE**, RLS access tiers, and PostGIS zones natively, rather than being built on SQLite CTEs and ported later. Postgres unlocks the types Prisma+SQLite couldn't do natively — `enum`s for `fidelity`/`reportType`/role, `String[]` for `aliases`, and `Jsonb` for `featuresOfPerson` — and gives the production/scale path the "add a backend server" choice was aimed at. Must preserve seed-derived GUIDs (determinism) and the audit hash-chain integrity across the move.

## Todos

- [ ] Audit — inventory all Prisma models, SQLite-only shims (string-union enums, `Json` arrays), and rows to move
- [ ] Provision local Postgres (`docker-compose.yml`); set `DATABASE_URL`
- [ ] Switch `prisma/schema.prisma` datasource `provider` to `postgresql`
- [ ] Convert string-union fields to native `enum`s (`fidelity`, `reportType`, role)
- [ ] Convert `aliases` → `String[]`, `featuresOfPerson` → `Jsonb`
- [ ] Generate the Postgres migration (`prisma migrate dev`)
- [ ] Write SQLite→Postgres data-transfer script (preserve GUIDs)
- [ ] Verify determinism + audit hash-chain integrity post-migration
- [ ] Update `server/` DB config + CI/dev scripts for Postgres
- [ ] Enable **Apache AGE**; project the faction allegiance/pact + `EntityLink` edges as a graph for openCypher queries
- [ ] Add **Row-Level Security** policies enforcing the Registry access tiers in Postgres
- [ ] Enable **PostGIS** for `Location`/zone geometry (sim territory)
- [ ] Rollback — script/document revert to the SQLite provider + datasource

## Notes

**Sequencing (why Plan 3, last).** Running the migration after both schema-producing plans means one clean conversion of the *complete* schema rather than migrating twice. Plan 1 deliberately modeled enums/arrays as SQLite-friendly shims (string unions, `Json`); this plan is where those become real Postgres types. Depends on Plans 1 + 2 being `complete`.

**Determinism must survive the move (engine invariant).** GUIDs are seed-derived in `src/engine/ids.ts`, not DB-generated — so the transfer script copies PKs verbatim; do NOT let Postgres reassign IDs (no `SERIAL`/identity on the GUID columns). Re-run the generator against Postgres with a fixed seed and diff against the SQLite rows to prove identical output.

**Audit integrity (Plan 2 dependency).** The `AuditLogEntry` hash-chain (`hash(prevHash + payload)`) must verify identically after transfer — copy `prevHash`/`hash` columns as-is and run `verifyChain.ts` against Postgres as an acceptance gate. Any mismatch = a bad transfer, not a tamper.

**Type conversions (the real work).**
- `fidelity` (`true|partial|biased|false`), `reportType` (the 8 police types), and `Role` string-unions → Prisma `enum`s.
- `aliases` `Json`/child-table → Postgres `String[]`.
- `featuresOfPerson` `Json` → `Jsonb` (indexable).
- The 8 per-type report tables carry over unchanged structurally (already real tables from Plan 1).

**Rollback path.** Keep the SQLite migration + a tagged commit; revert = switch `provider` back, restore `DATABASE_URL`, replay the SQLite migration. The SQLite file stays the source of truth until the Postgres cutover is verified.

**v2.0 — Postgres-native power tier.** This migration also lights up what the society-sim needs: **Apache AGE** (project `EntityLink` + faction allegiance/pact edges as a property graph for openCypher multi-hop — "who was at war with the victim's crew that winter"), **Row-Level Security** (enforce access tiers in the DB, not just the API), and **PostGIS** (zone geometry for sim territory). These are why the migration is sequenced *before* the sim, not last.

**Provider portability.** Prisma makes the provider swap mostly declarative, but watch: `@db.*` native attributes, case-sensitivity, and autoincrement semantics differ. The Audit step must list every native-type attribute before the switch.
