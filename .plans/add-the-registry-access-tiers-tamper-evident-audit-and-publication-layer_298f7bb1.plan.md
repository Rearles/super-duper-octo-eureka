---
title: "Add the Registry access tiers, tamper-evident audit, and publication layer"
type: "feature"
created: "2026-06-04"
status: not-started
related: ["build-the-registry-backend-prisma-schema-and-forgeable-data-tables_b705b56b.plan.md", "migrate-the-registry-database-from-sqlite-to-postgres_38b4da91.plan.md", "faction-requests-contacts-provenance_c691cba1.plan.md", "add-death-investigation-and-judicial-record-clusters_a7f3c2e9.plan.md"]
---

# Add the Registry access tiers, tamper-evident audit, and publication layer

## Context

The governance layer over the Registry's records: who may read/edit/publish, a tamper-evident audit of every access, and the public vs. non-public projection. Implements the md's "stored in triplicate… audited every day… no one can manipulate without the powers that be knowing" and the privileged roles (cold-case detectives, prosecutors, judges, auditors). Depends on Plan 1's tables + `server/` API. This is the **governance layer** of the foundation slice (GCD **v2.0**) — now also home to the **sealed-access / unseal-petition** subsystem (sealing applies to *any* record: court rulings, internal-affairs files, personnel, warrants) and to exposing the audit log as the factions' **sensor net** (§2.5). Plan 2 of 3; Plan 3 then migrates the whole schema (these audit/access tables included) SQLite→Postgres.

## Todos

- [ ] Model `Role`/`Permission` + `RegistryUser` in `prisma/schema.prisma`
- [ ] Model append-only `AuditLogEntry` (prevHash, hash) in `prisma/schema.prisma`
- [ ] Add audit middleware: log every view/edit/create in `server/api`
- [ ] Add `server/audit/verifyChain.ts` + daily-auditor query endpoint
- [ ] Add audit-log replication ("triplicate") in `server/audit`
- [ ] Add `published` flag + `PublicRecordView` projection in `schema.prisma`
- [ ] Implement role-gated "Go Public" route in `server/api`
- [ ] Enforce read/write access by role + clearance in `server/api`
- [ ] Surface published/private + the publish action in `src/ui`
- [ ] Model `SealedRecord` (wraps ANY record — court, IA, personnel, warrant, grand-jury) + seal tiers in `prisma/schema.prisma`
- [ ] Model `UnsealPetition` (evidence bundle) → `UnsealRuling` (judge-granted; corrupt-judge hook) in `prisma/schema.prisma`
- [ ] Enforce sealed-record gating in `server/api` (content withheld until an `UnsealRuling` grants it)
- [ ] Expose the audit log as a "who-touched-this" feed (the faction **sensor net** the sim reads — observer effect)
- [ ] Test audit tamper-detection + access gating (`server/audit/audit.test.ts`)

## Notes

**Tamper-evidence = hash-chained append-only log.** `AuditLogEntry` is insert-only; each row stores `hash(prevHash + payload)`. Recomputing the chain (`verifyChain.ts`) makes any edit/deletion detectable — the md's "no one can manipulate without the powers that be knowing." "In triplicate" = N replicas/backups of the chain (file copies now; Postgres replication or a sync target later).

**Access tiers map to existing clearance/rank (GCD §2.3).** The md's privileged readers — cold-case detectives, select prosecutors, select high-ranking officers, judges who compel publication — plus the document-submitters (police employees, morticians) and auditors. Reuse the game's clearance/rank gating rather than inventing a parallel system; `RegistryUser.role` + clearance gates each API route. Note the md's asymmetry: submitted documents are accepted as valid if Required Fields are non-empty (no validation on submission) — enforce that, since it's the source of forged records.

**Public vs. non-public (the "Go Public" act already exists — GCD §2.4 / index.ts).** Publication copies/flags a record into `PublicRecordView`; only privileged roles may publish. Verdicts are "written back into the Registry," and publishing triggers faction reactions — wire the publish route to the existing faction runtime so going public moves Standing/Heat.

**Why this is a separate plan:** decomposing both subsystems together exceeded create-plan's 15-step cap. Split point = the records themselves (Plan 1) vs. governance of access/audit/publication over them (Plan 2). Plan 2 assumes Plan 1's `server/`, Prisma schema, and record models exist. The Postgres migration is deferred to Plan 3 so it can convert the **complete** schema (data + governance) at once — including switching the `Role`/`fidelity`/`reportType` string-unions to native enums and `aliases` to `String[]`.

**Sealed-access (v2.0).** A `SealedRecord` wraps any record behind a seal **tier**; access requires an `UnsealRuling` granted on an `UnsealPetition` (an evidence bundle the cold-case detective files) — and a *machine-owned* judge can deny a valid petition or grant a crony's (the corrupt-judge hook, §2.5). The audit log doubles as the factions' **sensor net**: every view/edit is a logged event a watching faction can read, so investigating a sealed case raises Heat and can trigger active cover-up (the observer effect).

**assist-project:** fct_368b273e0ae0 (v2.0 pivot), fct_2fbede949a8d (the factions read the audit log as their sensor net).

**Affected files:** new `server/audit/*`, extends `prisma/schema.prisma` and `server/api` (from Plan 1), `src/ui/*` for the publish/published surfacing.
