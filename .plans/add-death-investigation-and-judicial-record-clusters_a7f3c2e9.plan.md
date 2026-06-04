---
title: "Add the death-investigation & judicial record clusters, and NIBRS-grade police records"
type: "feature"
created: "2026-06-04"
status: not-started
related: ["build-the-registry-backend-prisma-schema-and-forgeable-data-tables_b705b56b.plan.md", "add-the-registry-access-tiers-tamper-evident-audit-and-publication-layer_298f7bb1.plan.md", "build-the-procgen-v2-framework-lazy-realization-tiered-solvability_b3e8d4a1.plan.md"]
---

# Add the death-investigation & judicial record clusters, and NIBRS-grade police records

## Context

Enrich the Registry's record layer (GCD v2.0) beyond the base `MorticianRecord` + `PoliceRecord` from the data-layer plan. Adds the **death-investigation cluster** (the documents a real cold-case homicide generates), the **judicial cluster** (court rulings), and upgrades the police records to **NIBRS-grade** fields plus the **new record types** a real department produces. Every new table is a **forgeable record** in the same truth-model — `enteredBy` + `motive` + hidden `fidelity` (Pillar 1) — so each becomes a surface the faction society-sim can distort (a machine-owned coroner ruling a homicide "natural"; a bought cop shading an incident report). Depends on the data-layer plan's `PoliceRecord`/`PersonRegistration`/`Location` + the `server/` API, and reuses its class-table-inheritance pattern for the new per-type tables.

## Todos

- [ ] Model `DeathCertificate` (+ `mannerOfDeath`: natural/accident/suicide/homicide/undetermined) in `prisma/schema.prisma`
- [ ] Model `AutopsyReport` + `ToxicologyReport` (1-to-1 to a death) with forgeable fields
- [ ] Model `MEInvestigationReport` (scene) + `BodyChart` (intake/diagram)
- [ ] Model `ChainOfCustody` (append-only custody events for body & evidence) + `BodyReleaseForm`
- [ ] Add NIBRS-grade fields to `IncidentReport`/`ArrestReport` (offense codes, victim-offender relationship, weapon, disposition)
- [ ] Model new police record types: `CADDispatchLog`, `FieldInterviewCard`, `BookingReport`
- [ ] Model new police record types: `SupplementalReport` (append to a parent), `BOLO`, `Warrant` (court-issued), `EvidenceLog`
- [ ] Model `CourtRecord`/`Ruling` (judicial cluster) with `enteredBy`/`motive`/`fidelity`
- [ ] Add the `InternalAffairsReport` disposition enum (sustained/not-sustained/exonerated/unfounded)
- [ ] Wire the new tables into `PoliceRecord.reportDetails` links + `PersonRegistration`/`Location` FKs
- [ ] Add `server/api` routes to query/request the new record types
- [ ] Extend `src/engine/seedRegistry.ts` to emit the new clusters deterministically
- [ ] Test: determinism + forged-record round-trip across the new clusters

## Notes

**Why a separate plan.** Folding these into the data-layer plan blows create-plan's 15-todo cap; the split point is base records (data-layer plan) vs. the death/judicial/extended-police clusters (here). Depends on the data-layer plan's schema + API.

**Death-investigation cluster (research-grounded).** A real homicide generates a *paper fan*: the **DeathCertificate** (with the legally-loaded `mannerOfDeath` — the single field a corrupt coroner flips), the **AutopsyReport** (cause + findings) and its **ToxicologyReport**, the **MEInvestigationReport** (scene), a **BodyChart**, the **ChainOfCustody** (whose *gaps* are themselves clues when evidence is tampered), and the **BodyReleaseForm**. These are the multi-view records the procgen fans one ground-truth death into — they agree where no one lied and diverge where someone did (e.g., an autopsy wound-pattern vs. a "natural" death certificate).

**NIBRS-grade police records.** The real schema for incident/arrest data is NIBRS' segment model — offense codes, the **victim-offender relationship** (pure deduction fuel), weapon/force, and arrestee **disposition**. Enrich the existing 8 per-type tables rather than inventing fields.

**New record types.** Beyond the 8 report types: **CAD/dispatch logs** (often the *earliest* record — CAD-vs-report discrepancies are a classic lead), **field-interview cards**, **booking**, **supplemental reports** (an *append* to a parent — a child row, not an edit; ties to versioning), **BOLOs**, **warrants** (court-issued — links the judicial and police clusters; frequently sealed), and **evidence/property logs** (chain-of-custody). IA reports carry the standard disposition enum and are **sealable** (see the governance plan's sealed-access).

**Truth-model (Pillar 1).** Every new table is forgeable: `enteredBy` (a `PersonRegistration` GUID — later a faction member), a faction-linked `motive`, hidden `fidelity`. Build sim-agnostic; the faction society-sim becomes the author later.

**SQLite shims.** Per the data-layer plan: `mannerOfDeath`/disposition/new `reportType`s are string-unions now → native Prisma enums in the Postgres migration; arrays as `Json` now → `String[]` later.
