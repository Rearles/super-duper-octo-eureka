---
title: "Add the Registry access tiers, tamper-evident audit, and publication layer"
type: "feature"
created: "2026-06-04"
status: not-started
related: ["build-the-registry-backend-prisma-schema-and-forgeable-data-tables_b705b56b.plan.md", "faction-requests-contacts-provenance_c691cba1.plan.md"]
---

# Add the Registry access tiers, tamper-evident audit, and publication layer

## Context

The governance layer over the Registry's records: who may read/edit/publish, a tamper-evident audit of every access, and the public vs. non-public projection. Implements the md's "stored in triplicate… audited every day… no one can manipulate without the powers that be knowing" and the privileged roles (cold-case detectives, prosecutors, judges, auditors). Depends on Plan 1's tables + `server/` API. This is Plan 2 of 2.

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
- [ ] Test audit tamper-detection + access gating (`server/audit/audit.test.ts`)

## Notes

**Tamper-evidence = hash-chained append-only log.** `AuditLogEntry` is insert-only; each row stores `hash(prevHash + payload)`. Recomputing the chain (`verifyChain.ts`) makes any edit/deletion detectable — the md's "no one can manipulate without the powers that be knowing." "In triplicate" = N replicas/backups of the chain (file copies now; Postgres replication or a sync target later).

**Access tiers map to existing clearance/rank (GCD §2.3).** The md's privileged readers — cold-case detectives, select prosecutors, select high-ranking officers, judges who compel publication — plus the document-submitters (police employees, morticians) and auditors. Reuse the game's clearance/rank gating rather than inventing a parallel system; `RegistryUser.role` + clearance gates each API route. Note the md's asymmetry: submitted documents are accepted as valid if Required Fields are non-empty (no validation on submission) — enforce that, since it's the source of forged records.

**Public vs. non-public (the "Go Public" act already exists — GCD §2.4 / index.ts).** Publication copies/flags a record into `PublicRecordView`; only privileged roles may publish. Verdicts are "written back into the Registry," and publishing triggers faction reactions — wire the publish route to the existing faction runtime so going public moves Standing/Heat.

**Why this is a separate plan:** decomposing both subsystems together exceeded create-plan's 15-step cap. Split point = the records themselves (Plan 1) vs. governance of access/audit/publication over them (Plan 2). Plan 2 assumes Plan 1's `server/`, Prisma schema, and record models exist.

**Affected files:** new `server/audit/*`, extends `prisma/schema.prisma` and `server/api` (from Plan 1), `src/ui/*` for the publish/published surfacing.
