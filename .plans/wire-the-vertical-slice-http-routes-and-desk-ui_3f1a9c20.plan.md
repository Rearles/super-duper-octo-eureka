---
title: "Wire the vertical slice: HTTP routes + the desk UI (cases end to end)"
type: "feature"
created: "2026-06-05"
status: not-started
related: ["build-the-public-read-model-cqrs-and-go-public_d8f5b9c6.plan.md", "add-the-registry-access-tiers-tamper-evident-audit-and-publication-layer_298f7bb1.plan.md"]
---

# Wire the vertical slice: HTTP routes + the desk UI

## Context

The governance logic (`server/audit.ts`, `access.ts`, `seal.ts`), the sim
(`src/engine/sim.ts`, `backlog.ts`, `eventRecord.ts`), and the public read-model
(`src/engine/publicView.ts`) are all BUILT and unit-tested as pure modules; this
wires them to the world over HTTP and surfaces one persisted cold case end to end
in the desk UI. No new infra. The pure modules are the behavioral ORACLE — routes
just expose them. Highest user-facing value: it makes the v2.0 build playable.

## Todos

- [ ] Add `server/index.ts` routes: GET /cases (listColdCases), GET /cases/:id/records (caseRecords)
- [ ] Add a Fastify onResponse audit middleware logging every read into AuditLogEntry (hash-chained — server/audit.ts)
- [ ] Add GET /audit (entries + verifyChain status), gated to auditor/admin (server/access.ts)
- [ ] Add POST /seal + POST /unseal/petition + POST /unseal/rule (server/seal.ts) with sealed-record gating on reads
- [ ] Add POST /publish (Go Public): write a Publication + return reactionsToPublication (src/engine/publicView.ts)
- [ ] Add GET /public/cases (the CQRS public projection — published only)
- [ ] Extend src/registryClient.ts with the new endpoints (browser-safe fetch)
- [ ] Seed first (`npm run seed:sim`); surface one ColdCase + its records in src/ui/desk.ts
- [ ] Add a "request record" + "go public" affordance in the desk UI calling the API
- [ ] Add a server integration test (Fastify inject): /cases, /audit tamper-detect, /publish reactions
- [ ] Verify: npm test + npm run typecheck + `tsc -p server/tsconfig.json --noEmit`; commit

## Notes

**The pure logic is the oracle.** Don't reimplement audit/seal/publish in the routes —
call `server/audit.ts`, `server/seal.ts`, `server/access.ts`, and
`src/engine/publicView.ts`. Keep the browser engine Prisma-free (it talks to the
server via `src/registryClient.ts`).

**Async boundary.** The existing `CaseSession` is synchronous (the in-memory MVP).
Add an ADDITIVE async path (the desk reads persisted cases via registryClient)
rather than rewriting CaseSession — keep the test suite green.

**assist-project:** fct_4262177601db (remaining work), fct_6752594d3d62 (foundation: server/Prisma), fct_0d2822797cd5 (sim modules).
