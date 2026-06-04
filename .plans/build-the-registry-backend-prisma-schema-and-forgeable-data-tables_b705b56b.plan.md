---
title: "Build the Registry backend, Prisma schema, and forgeable data tables for Mound City"
type: "feature"
created: "2026-06-04"
status: not-started
related: ["add-the-registry-access-tiers-tamper-evident-audit-and-publication-layer_298f7bb1.plan.md", "migrate-the-registry-database-from-sqlite-to-postgres_38b4da91.plan.md", "weave-authored-case-data-into-procgen_79b54597.plan.md", "faction-requests-contacts-provenance_c691cba1.plan.md", "add-death-investigation-and-judicial-record-clusters_a7f3c2e9.plan.md", "build-the-procgen-v2-framework-lazy-realization-tiered-solvability_b3e8d4a1.plan.md"]
---

# Build the Registry backend, Prisma schema, and forgeable data tables for Mound City

## Context

Stand up "The Registry" as a real persisted database behind a Node backend (the game is browser-only today; `src/main.ts` runs `CaseSession` client-side). Adds a `server/` Node API + Prisma (SQLite now, Postgres later) modeling world-level Person Registration, Mortician/Police/report records, and the forgeable-record layer (`enteredBy` + motive + hidden `fidelity`). Must preserve deterministic procgen (same seed → identical rows) and Pillar 1 (ground truth never lies; only records carry hidden fidelity). This is the **data layer** of the foundation slice (GCD **v2.0** — a *fictional* ~1950 St. Louis analogue per §4.2, records ultimately authored by the faction society-sim per §2.5); Plan 2 adds the governance layer, Plan 3 migrates SQLite→Postgres.

## Todos

- [ ] Scaffold `server/` Fastify API; `npm run dev` runs client + server
- [ ] Add Prisma; init `prisma/schema.prisma` (sqlite datasource, env-driven provider)
- [ ] Add `src/engine/ids.ts` — deterministic seed-derived GUID generator
- [ ] Model `PersonRegistration` in `schema.prisma` (id, name, aliases, features `Json`)
- [ ] Model `IdentityBinding` in `schema.prisma` — unforgeable real-person↔GUID spine
- [ ] Model `MorticianRecord` in `schema.prisma` (forgeable fields nullable)
- [ ] Model `PoliceRecord` (reportType discriminator + `reportDetails` links)
- [ ] Model 8 per-type report tables (1-to-1 → `PoliceRecord`)
- [ ] Add `enteredByPersonId`, `motive`, `fidelity` to record models
- [ ] Run `prisma migrate dev`; generate the Prisma client
- [ ] Add `server/api` routes: query person, query/request records
- [ ] Add `src/engine/seedRegistry.ts` — generator writes deterministic rows
- [ ] Rewire `CaseSession` (`src/engine/index.ts`) to read records via the API
- [ ] Update UI (`src/main.ts`, `src/ui/*`) to fetch the API
- [ ] Model `Location`/zones + `Organization` (world-level place & org entities the records reference)
- [ ] Test determinism + forged-record round-trip (`src/engine/registry.test.ts`)

## Notes

**Truth-model reconciliation (the core design).** The md says fields "can be forged or lied about," which seems to contradict Pillar 1 ("the world never lies"). They reconcile: the *unforgeable spine* = ground truth — the real-person↔GUID binding the Registry "never loses track of" (`IdentityBinding`, always true). *Everything a human enters* (Features-of-Person, names, cause of death, report type, even `enteredBy`) = the record layer, which already carries hidden `Fidelity` (`true|partial|biased|false`) in `src/engine/types.ts`. So forgery lives only in the record layer; the binding never lies.

**Forged records carry attribution (user decision: enterer + motive).** Every forgeable record gets `enteredByPersonId` (a `PersonRegistration` GUID) + a faction-linked `motive`/`distortionReason` + a hidden `fidelity`. This implements the md's "the reason they are incorrect has to make narrative sense… no hallucinations." Today `generator.ts: resolveCast` already sources the single crux-lie from a culprit-shielding faction "mouthpiece" — extend that so each distortion is attributable and motivated, not random.

**Schema calls (confirmed with user):**
- *Per-type report tables* (user decision, revised from an earlier polymorphic single-table idea): each police report type is its OWN table — `IncidentReport`, `ArrestReport`, `AccidentReport`, `InvestigationReport`, `AnalyticalReport`, `UseOfForceReport`, `InternalAffairsReport`, `CriminalCaseReport` — because each carries genuinely different fields. Use **class-table inheritance**: `PoliceRecord` is the shared parent (GUID, `reportType` discriminator, `enteredBy`/`motive`/`fidelity`, `lastEditedBy`, `reportDetails` links); each per-type table holds a GUID PK + a one-to-one FK `policeRecordId` + its type-specific columns. Distinguishing fields per type: **Incident** = location/time/involved/narrative/witnesses/conditions/preliminary-actions; **Arrest** = arrestee/charges/probable-cause/evidence/booking/Miranda; **Accident** = location/weather/vehicles/driver+passenger/injuries/citations; **Investigation** = lead-investigator/evidence-log/interviews/persons-of-interest/status/findings; **Analytical** = data-sources/method/patterns/scope/conclusions/analyst; **Use-of-Force** = officers/subject/force-level/justification/injuries/supervisor-review; **Internal Affairs** = subject-officer/complainant/allegation/findings/disposition/confidentiality; **Criminal Case** = case-id/defendants/charges/consolidated-evidence/witness-list/linked-reports/prosecutor. (Sources: blueforcelearning.com "What Are the Different Types of Reports in Law Enforcement?"; study.com "Police Report Definition, Types & Example".)
- *Prisma + SQLite gotcha:* SQLite has no native `enum` or `String[]`. Model `aliases` as a `Json` column (or child table) and `fidelity`/`reportType`/role as string-union types now; they become real Prisma `enum`s + `String[]` in the Postgres migration (Plan 3). Keeps "SQLite now, Postgres later" honest.

**Determinism.** The md's "generated GUID" must be **seed-derived** (`src/engine/ids.ts`), never `crypto.randomUUID()`, or reproducible worlds break. The generator owns ID assignment; Prisma stores them. `mulberry32` (in `generator.ts`) is the existing seeded PRNG to draw from.

**md terminology resolved:** the md says "row" where it means a *field/column* of a table; read accordingly. The md's "Report Details" (line 43) defines "Type of Police Report" twice (circularly) — resolved as one `reportType` field on `PoliceRecord` plus a `reportDetails` list of `{reportType, recordId}` links into the matching per-type report table.

**Person Registration is world-level (user decision):** a persistent population spanning cases, not per-case entities — this is the reason a real DB is needed (vs. today's in-memory per-case objects). Maps onto the GCD "interlinked cases → one truth" vision.

**Stack:** Node backend + Prisma chosen by the user (runtime = "add a backend server"; schema = Prisma). Fastify is a lightweight default for `server/` — swappable for Express. Backend gets its own `tsconfig`/build; keep strict TS, no `any`.

**Affected existing files:** `src/engine/index.ts` (CaseSession), `src/engine/generator.ts`, `src/engine/types.ts`, `src/main.ts`, `src/ui/*`. New: `server/`, `prisma/schema.prisma`, `src/engine/ids.ts`, `src/engine/seedRegistry.ts`.

**v2.0 alignment (GCD 2026-06-04 pivot).** Names/geography are *fictional* analogues (§4.2). The forgeable record layer (`enteredBy`/`motive`/`fidelity`) is the seam the **faction society-sim** (§2.5) writes distortions through — build it sim-agnostic here (a human `enteredBy` today), but keep `enteredBy` a `PersonRegistration` GUID so a faction member can be the author later. `Location`/`Organization` are world-level (like `PersonRegistration`), shared across cases. The death-investigation/judicial clusters, NIBRS-grade fields, and new record types live in the sibling `add-death-investigation-and-judicial-record-clusters` plan; lazy realization + tiered solvability in `build-the-procgen-v2-framework`.
