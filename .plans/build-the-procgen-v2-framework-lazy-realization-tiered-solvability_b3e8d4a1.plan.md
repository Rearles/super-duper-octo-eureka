---
title: "Build the procgen v2.0 framework: lazy realization, the truth-to-distortion record contract, and tiered solvability"
type: "feature"
created: "2026-06-04"
status: complete
related: ["build-the-registry-backend-prisma-schema-and-forgeable-data-tables_b705b56b.plan.md", "add-death-investigation-and-judicial-record-clusters_a7f3c2e9.plan.md", "weave-authored-case-data-into-procgen_79b54597.plan.md", "hypothesis-board-engine_78222339.plan.md"]
---

# Build the procgen v2.0 framework

## Context

Generalize the built generator (`src/engine/generator.ts`, `crux.ts`, `solver.ts`) into the **v2.0 procgen framework** the society-sim will drive (GCD §5.1, v2.0). Three pieces: (1) **deterministic lazy realization** — the sim runs *coarse* and fully realizes a person/case only when touched, but seed-derived so realization is order-independent and reproducible; (2) the **truth-to-distortion-to-record contract** — one generator shape, `generateTruth() -> applyDistortion(actor, motive, decay) -> emit record(s)`, that every cluster generator implements, producing the hidden ground truth AND the distorted record(s); (3) **tiered solvability** — extend `verifySolvable` from a binary gate to a *determination classifier* (provable / crackable / underdetermined), targeting a distribution and **guaranteeing an engagement floor** (never a blank wall — refined Pillar 1, §1.2/§5.4). This is the **seed + guardrail** layer; the autonomous sim (agendas, allegiance, pacts, tick) is a later slice that *calls* this framework.

## Todos

- [ ] Add a hierarchical seeded-RNG splitter to `src/engine/` (root seed -> per-entity sub-seeds; order-independent)
- [ ] Define the `Generator` contract `generateTruth() -> applyDistortion(actor, motive, decay) -> records` in `src/engine/procgen/contract.ts`
- [ ] Refactor the existing `crux.ts` lie-strategies to implement the contract (truth + motivated distortion, not ad-hoc)
- [ ] Add **lazy realization**: a `realize(entityId)` that deterministically materializes a person/place on touch + a realized-set cache
- [ ] Add `Determination` = provable | crackable | underdetermined to `types.ts`; add `solution.determination`
- [ ] Generalize `verifySolvable` -> `classifyDetermination` (count independent surviving corroboration paths)
- [ ] Implement the **engagement floor**: an underdetermined case must retain >=2 suspects + partial chains; never zero
- [ ] Implement a **targeted decay** hook: erode the load-bearing link for designated White-Whale cases (vs. uniform)
- [ ] Add a case-population **distribution target** (mostly provable, a controlled underdetermined minority)
- [ ] Wire the multi-view fan-out: one ground-truth event -> records across clusters, each distorted by its author
- [ ] Update the golden snapshot + add tests: determinism under lazy realization, determination tiers, engagement floor
- [ ] Verify: `npm run typecheck` + `npm test`; both paper-trail cases stay provable; a White-Whale fixture classifies underdetermined-but-engaging

## Notes

**Builds on, doesn't replace.** The existing authored-core + procgen + `verifySolvable` (plans `author-the-case-core`, `weave-authored-case-data-into-procgen`) stay; this generalizes them. The `Clue`/`Theory` work in `hypothesis-board-engine` is the player-facing consumer of tiered solvability (closing a White Whale **by theory**).

**Determinism is sacrosanct.** Same seed -> same world, same cold cases. Lazy realization MUST be seed-derived (a hierarchical/splittable RNG), so realizing person #N later is identical to realizing them early — never `crypto.randomUUID()`. Reuse the existing `mulberry32`.

**Tiered solvability (refined Pillar 1).** `provable` = surviving chains pin a unique ground truth; `crackable` = hard but converges; `underdetermined` = evidence-rich, >=2 live suspects, no conclusive link (the White Whale — closeable **by theory**, never by proof). **Blank is forbidden** — the classifier repairs or re-seeds any case that decays below the engagement floor. Difficulty tunes by how many independent corroboration paths survive.

**The sim is the future caller.** Build the framework sim-agnostic and deterministic now; the autonomous society-sim (the next slice) supplies the `actor`/`motive` from faction allegiance + agendas and drives `realize()` as the detective and the world touch entities. Keep the contract pure so the sim is the only thing that changes later.

**assist-project:** fct_a5b0a0cfbc34 (Pillar 1 tiered solvability), fct_368b273e0ae0 (v2.0 pivot).
