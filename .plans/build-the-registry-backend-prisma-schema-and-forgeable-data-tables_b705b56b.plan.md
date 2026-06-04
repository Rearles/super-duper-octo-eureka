---
title: "Build the Registry backend, Prisma schema, and forgeable data tables for Mound City"
type: "feature"
created: "2026-06-04"
status: not-started
related: ["add-the-registry-access-tiers-tamper-evident-audit-and-publication-layer_298f7bb1.plan.md", "weave-authored-case-data-into-procgen_79b54597.plan.md", "faction-requests-contacts-provenance_c691cba1.plan.md"]
---

# Build the Registry backend, Prisma schema, and forgeable data tables for Mound City

## Context

Stand up "The Registry" as a real persisted database behind a Node backend (the game is browser-only today; `src/main.ts` runs `CaseSession` client-side). Adds a `server/` Node API + Prisma (SQLite now, Postgres later) modeling world-level Person Registration, Mortician/Police/report records, and the forgeable-record layer (`enteredBy` + motive + hidden `fidelity`). Must preserve deterministic procgen (same seed → identical rows) and Pillar 1 (ground truth never lies; only records carry hidden fidelity). This is Plan 1 of 2; the access/audit/publication layer is the linked governance plan.

## Todos

- [ ] Scaffold `server/` Fastify API; `npm run dev` runs client + server
- [ ] Add Prisma; init `prisma/schema.prisma` (sqlite datasource, env-driven provider)
- [ ] Add `src/engine/ids.ts` — deterministic seed-derived GUID generator
- [ ] Model `PersonRegistration` in `schema.prisma` (id, name, aliases, features `Json`)
- [ ] Model `IdentityBinding` in `schema.prisma` — unforgeable real-person↔GUID spine
- [ ] Model `MorticianRecord` in `schema.prisma` (forgeable fields nullable)
- [ ] Model `PoliceRecord` + polymorphic `ReportRecord` (reportType, payload `Json`)
- [ ] Add `enteredByPersonId`, `motive`, `fidelity` to record models
- [ ] Run `prisma migrate dev`; generate the Prisma client
- [ ] Add `server/api` routes: query person, query/request records
- [ ] Add `src/engine/seedRegistry.ts` — generator writes deterministic rows
- [ ] Rewire `CaseSession` (`src/engine/index.ts`) to read records via the API
- [ ] Update UI (`src/main.ts`, `src/ui/*`) to fetch the API
- [ ] Test determinism + forged-record round-trip (`src/engine/registry.test.ts`)

## Notes

**Truth-model reconciliation (the core design).** The md says fields "can be forged or lied about," which seems to contradict Pillar 1 ("the world never lies"). They reconcile: the *unforgeable spine* = ground truth — the real-person↔GUID binding the Registry "never loses track of" (`IdentityBinding`, always true). *Everything a human enters* (Features-of-Person, names, cause of death, report type, even `enteredBy`) = the record layer, which already carries hidden `Fidelity` (`true|partial|biased|false`) in `src/engine/types.ts`. So forgery lives only in the record layer; the binding never lies.

**Forged records carry attribution (user decision: enterer + motive).** Every forgeable record gets `enteredByPersonId` (a `PersonRegistration` GUID) + a faction-linked `motive`/`distortionReason` + a hidden `fidelity`. This implements the md's "the reason they are incorrect has to make narrative sense… no hallucinations." Today `generator.ts: resolveCast` already sources the single crux-lie from a culprit-shielding faction "mouthpiece" — extend that so each distortion is attributable and motivated, not random.

**Schema calls (confirmed with user):**
- *One polymorphic `ReportRecord`*, not 8 per-type tables (incident/arrest/accident/investigation/analytical/use-of-force/internal-affairs/criminal-case). They're structurally identical (GUID + procgen details); use a `reportType` discriminator + typed `Json` payload. Adding a type needs no migration.
- *Prisma + SQLite gotcha:* SQLite has no native `enum` or `String[]`. Model `aliases` as a `Json` column (or child table) and `fidelity`/`reportType` as string-union types now; flip to real Prisma enums when the provider moves to Postgres. Keeps "SQLite now, Postgres later" honest.

**Determinism.** The md's "generated GUID" must be **seed-derived** (`src/engine/ids.ts`), never `crypto.randomUUID()`, or reproducible worlds break. The generator owns ID assignment; Prisma stores them. `mulberry32` (in `generator.ts`) is the existing seeded PRNG to draw from.

**md terminology resolved:** the md says "row" where it means a *field/column* of a table; read accordingly. The md's "Report Details" (line 43) defines "Type of Police Report" twice (circularly) — resolved as one `reportType` field on `PoliceRecord` plus a `reportDetails` list of `{reportType, recordId}` links into `ReportRecord`.

**Person Registration is world-level (user decision):** a persistent population spanning cases, not per-case entities — this is the reason a real DB is needed (vs. today's in-memory per-case objects). Maps onto the GCD "interlinked cases → one truth" vision.

**Stack:** Node backend + Prisma chosen by the user (runtime = "add a backend server"; schema = Prisma). Fastify is a lightweight default for `server/` — swappable for Express. Backend gets its own `tsconfig`/build; keep strict TS, no `any`.

**Affected existing files:** `src/engine/index.ts` (CaseSession), `src/engine/generator.ts`, `src/engine/types.ts`, `src/main.ts`, `src/ui/*`. New: `server/`, `prisma/schema.prisma`, `src/engine/ids.ts`, `src/engine/seedRegistry.ts`.
