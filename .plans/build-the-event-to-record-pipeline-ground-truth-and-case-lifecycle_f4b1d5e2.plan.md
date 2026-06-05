---
title: "Build the event-to-record pipeline, the hidden ground-truth, and the Case lifecycle"
type: "feature"
created: "2026-06-04"
status: complete
related: ["build-the-simulation-tick-agendas-and-incentive-engine_e3a9c4d1.plan.md", "build-the-registry-backend-prisma-schema-and-forgeable-data-tables_b705b56b.plan.md", "add-death-investigation-and-judicial-record-clusters_a7f3c2e9.plan.md", "build-the-procgen-v2-framework-lazy-realization-tiered-solvability_b3e8d4a1.plan.md", "hypothesis-board-engine_78222339.plan.md"]
---

# Build the event-to-record pipeline, ground-truth & Case lifecycle

## Context

The bridge that makes the society-sim *author the Registry* (GCD §5.1 v2.0, Pillar 1). When the tick's faction actions produce consequential events (a hit, an arrest, a bribe, a death), this pipeline emits the matching **Registry records** across the clusters — each record's `fidelity`/`motive`/`provenance` set by the **acting faction's integrity** (the procgen-v2 truth->distortion contract). It maintains a hidden, append-only **ground-truth log** (the answer key the detective never sees) distinct from the distorted public/official record, and tracks each unsolved event as it **cools into a Case**. Depends on the tick (event source), the record clusters (write targets), and the procgen-v2 contract (the distortion function).

## Todos

- [ ] Add an append-only `GroundTruthLog` (the canonical what-really-happened; never rendered to the player)
- [ ] Add `emitRecords(event, actor)` that fans one event into records across the clusters
- [ ] Set each emitted record's `fidelity`/`motive`/`provenance` from the acting faction's integrity (procgen-v2 contract)
- [ ] Implement the **multi-view fan-out**: independent records agree where no one lied, diverge where someone did
- [ ] Add the `Case` entity + lifecycle: open -> cold -> solved | cleared-by-theory | closed-false
- [ ] Cool unsolved sim events into cold cases (the self-refreshing backlog) deterministically
- [ ] Run `classifyDetermination` (procgen-v2) on each realized Case; enforce the engagement floor (never blank)
- [ ] Wire the player's verdict/disposition to write back into the Registry + ground-truth (confirmation-by-doing)
- [ ] Connect the `Clue`/`Theory` consumer (`hypothesis-board-engine`) so a White Whale closes **by theory**
- [ ] Integrate `runHistory`: historical events -> the starting cold-case backlog + current faction map
- [ ] Add tests: fan-out consistency, ground-truth never leaks, determination tiers, case lifecycle transitions
- [ ] Verify: `npm run typecheck` + `npm test`; both paper-trail cases survive the pipeline as provable

## Notes

**The sim authors the record (the keystone).** Every consequential sim action emits records; the acting faction's integrity sets the distortion. A machine-owned coroner's `DeathCertificate` says "natural"; the `AutopsyReport` (a different author) may contradict it; the CAD log (neutral) pins the timing. These are the motivated divergences the detective triangulates — generated, not hand-authored.

**Ground truth vs. record (Pillar 1).** The `GroundTruthLog` holds the real answer; the Registry holds the distorted view; the deduction game is closing that gap. The log is the reference for `verifySolvable`/`classifyDetermination` and for confirming the player's theory on commit — but it is NEVER rendered to the player.

**Case lifecycle = a living queue.** Crimes spawn continuously (the tick); unsolved ones cool into cold cases; dispositions write back as official truth and schedule consequences (the calendar). `cleared-by-theory` and `closed-false` are real outcomes (the White Whale; a wrong verdict the city remembers).

**assist-project:** fct_2fbede949a8d (the society-sim authors records), fct_a5b0a0cfbc34 (tiered solvability per Case), fct_368b273e0ae0 (v2.0 pivot).
