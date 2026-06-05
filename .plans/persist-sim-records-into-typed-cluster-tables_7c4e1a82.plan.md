---
title: "Persist sim records into the typed cluster tables (not the generic SimRecord)"
type: "feature"
created: "2026-06-05"
status: not-started
related: ["add-death-investigation-and-judicial-record-clusters_a7f3c2e9.plan.md", "build-the-event-to-record-pipeline-ground-truth-and-case-lifecycle_f4b1d5e2.plan.md"]
---

# Persist sim records into the typed cluster tables

## Context

The integration currently writes the sim's fanned records into a GENERIC
`SimRecord` table. This routes them into the REAL typed cluster tables from the
foundation (`DeathCertificate`, `AutopsyReport`, `PoliceRecord` + `IncidentReport`,
...) so the sim writes through the actual Registry schema — making the persisted
record layer faithful to the design.

## Todos

- [ ] Map emitRecords output by recordType: ruling -> DeathCertificate (mannerOfDeath from the truth; fidelity), autopsy -> AutopsyReport, witness-statement -> PoliceRecord + IncidentReport
- [ ] Carry enteredBy/motive/fidelity from each CaseRecord into the typed row
- [ ] Link the typed records to their ColdCase (a caseId column or a join table)
- [ ] Update server/simRegistry.ts persistBacklog to write typed rows (keep GroundTruthLog hidden)
- [ ] Update the read helpers + the /cases/:id/records route to read the typed tables
- [ ] Decide SimRecord's fate (keep as an index/audit, or drop)
- [ ] Re-run `npm run seed:sim`; verify counts per typed table
- [ ] Add a test for the mapping (a forged ruling -> DeathCertificate fidelity false)
- [ ] Verify: server typecheck + tests; commit

## Notes

**The fan-out already tags record types** (`src/engine/backlog.ts` `emitRecords`
uses RecordType "ruling"/"autopsy"/"witness-statement"). Map those to tables.
Extend the fan-out with more record types (CAD, evidence log, court ruling) once
the mapping exists.

**assist-project:** fct_4262177601db (remaining work), fct_a5b0a0cfbc34 (these records feed solvability).
