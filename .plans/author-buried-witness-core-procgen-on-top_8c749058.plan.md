---
title: "Refactor the generator so the Buried Witness crime core is hand-authored and procgen builds the records on top"
type: "refactor"
created: "2026-06-03"
status: not-started
related: ["analyze-install-and-build-the-mound-city-mvp_8e0af0d4.plan.md", "build-mound-city-mvp-prototype_ad9accc1.plan.md"]
---

# Author the Buried Witness Core, Procgen On Top

## Context

Today `generateCase(seed)` invents the entire case from a seed — the user found authoring-by-seed
annoying (assist-project `fct_57242bb32131`). New model (decided 2026-06-03): the author writes the
**crime core / "hard truths"** (who/how/when + key ground-truth facts) via a **fluent builder API**;
the **procedural generator places the lie/contradiction, invents the other suspects, and builds the
full record layer on top** of the authored core. `verifySolvable` still gates Pillar 1, and the
`GameCase` output shape is unchanged — only `generateCase`'s input + internals change, so factGraph,
solver, renderer, and UI are untouched. Leaf-first order (`lsn_81418856dfb0`).

## Todos

- [ ] Map `generateCase` consumers (`CaseSession`, `engine.test.ts`, exports); confirm `GameCase` shape unchanged
- [ ] Add `CaseSkeleton` + `CaseCrime` types to `src/engine/types.ts` (authored core)
- [ ] Create `src/engine/authoring.ts` — `defineCase(id)` fluent builder → validated `CaseSkeleton`
- [ ] Author `src/engine/cases/buriedWitness.ts` — the hard truths via the builder
- [ ] Refactor `generateCase(skeleton, seed)` in `generator.ts` — procgen places lie + suspects + records
- [ ] Update `CaseSession` to default to the Buried Witness skeleton (seed drives only the dressing)
- [ ] Update `engine.test.ts` — author-core determinism, procgen-placed lie, solvable across seeds
- [ ] Add `authoring.test.ts` — `defineCase` validates and rejects an incomplete skeleton
- [ ] Verify — `npm run typecheck`, `npm test` (green), `npm run build`, `npm run preview`

## Notes

**Design decisions (user, 2026-06-03):**
- *Division of labor* = **Skeleton + placed lie.** Author writes the crime core (culprit, victim,
  the key time/place, the canonical ground-truth claims). Procgen places the lie/contradiction,
  generates the bystander suspects + witness, and builds the record layer (statement carrying the
  false alibi, phone logs that disprove it, autopsy, property) wiring leads + the key contradiction.
- *Authoring format* = **Builder API.** A fluent `defineCase(id).entity(...).truth(...).crime(...)`
  helper that validates as you write and `.build()`s a `CaseSkeleton`. Catches incomplete cores
  (missing culprit/victim/key facts) before they reach the generator.

**Proposed shapes (refine during build):**
- `CaseSkeleton` = `{ id, entities: Record<string,Entity>, groundTruth: Claim[], crime: CaseCrime }`.
- `CaseCrime` = `{ culpritId, victimId, keyPredicate (e.g. "location@2300"), sceneId }`.
- Builder authors the SKELETON only — **not** the lie. Procgen owns lie placement, suspects, records.
- `generateCase(skeleton, seed)`: copy authored entities + groundTruth → seeded-invent witness +
  bystanders (names from FIRST/LAST, avoid authored-name collisions) → place a false alibi for the
  culprit on `keyPredicate` at an invented location → generate corroborating true records (phone
  disproves the alibi; autopsy fixes time/place; property links culprit+witness) → build caseFile +
  leads → `solution = { culpritId, keyContradiction: [stmtId, phoneId], predicate: keyPredicate }`
  → `suspects = [culprit, ...bystanders, witness]`. Then `verifySolvable` (unchanged) gates it.

**Determinism:** same `(skeleton, seed)` → identical `GameCase`. Update the test that asserted
seed-only determinism to author-core + seed. `CaseSession(seed)` keeps its signature but internally
loads the Buried Witness skeleton and passes `(skeleton, seed)`; seed now varies only the dressing,
not the authored truths.

**Out of scope:** multiple archetypes, the LLM renderer, factions/calendar/interlinking, a JSON/UI
authoring tool. One authored case, builder + generator split, Pillar 1 preserved.
