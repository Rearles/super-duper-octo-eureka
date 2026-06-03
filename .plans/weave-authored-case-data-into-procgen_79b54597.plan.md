---
title: "Weave authored case data (keyFact, cast, factions) deeply into the procgen generator"
type: "feature"
created: "2026-06-03"
status: in-progress
related: ["author-the-case-core_6a3b8c1f.plan.md", "faction-tension-systems_4b95a4c5.plan.md", "faction-requests-contacts-provenance_c691cba1.plan.md"]
---

# Weave authored case data into the procgen generator

## Context

`src/engine/generator.ts` currently reads only culprit/victim/scene/when (how/what become display text) and **ignores `core.keyFact`, the authored cast beyond the principals, and all faction data** — the planted lie is always a `location@when` alibi. Goal: drive lie-placement from the authored `keyFact` (all 5 cruxes), cast the framed-innocent/witnesses from authored people, weave the culprit's faction + red-herring decoys into the record layer, and generalize the Pillar-1 solver so every crux stays solvable. Determinism (seeded mulberry32) and all 36 tests must hold; the golden snapshot gets one intentional `-u` update; both paper-trail cases (`crase-natural` keyFact=how, `marsh-accident` keyFact=who) must generate SOLVABLE.

## Todos

- [x] Add `keyFact` to `Solution` in `src/engine/types.ts`; extend `RecordType` with `"ruling"`
- [ ] Create `src/engine/crux.ts` — `cruxPredicate(core)` + per-keyFact descriptor table
- [ ] Add five lie-strategy builders in `src/engine/crux.ts` (where/who/when/how/what)
- [ ] Add `resolveCast(world, core, rng)` to `src/engine/generator.ts` — authored people first, procgen fallback
- [ ] Refactor `generateCase` to dispatch on `core.keyFact` via the strategy table
- [ ] Weave culprit's faction into the cover-up record's source/provenance in `generateCase`
- [ ] Generate 1-2 (capped) red-herring decoy records pointing at other faction members
- [ ] Generalize `verifySolvable` check #2 in `src/engine/solver.ts` (two-pronged culprit implication)
- [ ] Update `generateRequests` in `src/engine/factions.ts` to use `cruxPredicate(core)`
- [ ] Update `caseFacts` topics in `src/engine/factions.ts` for richer interest-matching
- [ ] Fix `factions.test.ts` / `requests.test.ts` expectations for the where-crux fixture
- [ ] Add tests: how-crux + who-crux cases generate solvable with expected lie shape
- [ ] Regenerate the golden snapshot (`vitest -u`) and review the diff intentionally
- [ ] Verify: `npm run typecheck` + `npm test` + regenerate both paper-trail cases

## Notes

**Architecture — the crux strategy table (lsn_d9e3fcb0e3d9):** replace the single hardcoded alibi template with a registry keyed by `CaseFact`. Each strategy, given the resolved cast, returns `{ records, keyContradiction: [recA, recB], predicate }` and guarantees the solver invariants below. `cruxPredicate(core)` is shared by the generator, the solver, and `generateRequests` so all three agree on the contested predicate.

**Per-crux lie shapes:**
- **where** (current): false alibi — proxy contradiction (witness@bar F ⟂ phone witness@scene T) + a false `(culprit, location@when, bar)` co-claim.
- **who**: a record frames the authored innocent — false `(culprit, responsible, decoy)` ⟂ true `(culprit, responsible, victim)`; the framed innocent (e.g. Okafor) is the decoy object AND an accusable suspect.
- **how**: the **ruling** record falsely states cause — false `(victim, cause, natural)` ⟂ true autopsy `(victim, cause, <core.how>)`.
- **when**: shifted-timeline lie — false `(culprit, time-at-scene, <falseTime>)` ⟂ true `(culprit, time-at-scene, core.when)`.
- **what**: no-crime lie — false `(victim, event, inconclusive)` ⟂ true `(victim, event, crime)`.

**Solver generalization (the delicate part):** today `verifySolvable` check #2 requires a *false claim with `subject===culprit` on the key predicate* — that only fits where/who. Generalize to: the culprit is implicated if EITHER (a) a false claim `subject===culprit` on the key predicate exists (where/who/when), OR (b) a **truthful** record claim with `subject===culprit` and `object ∈ {victimId, sceneId}` exists (how/what — exposing the lie reopens the case and a true association/presence record points to the culprit). Each strategy MUST emit at least one. Add `solution.keyFact` so the checker can branch. Keep checks #1 (catchable contradiction on key predicate), #3 (culprit in suspects), #4 (key records exist).

**Cast resolution:** prefer authored non-principal people for framed-innocent (an authored person with no faction reads as a bystander, e.g. Okafor) and witnesses; faction members can fill decoy/associate roles. Fall back to procgen strangers (existing `uniqueName()`) only when no authored candidate exists. Keep it seeded/deterministic.

**Faction record weave:** the culprit's faction, when protective/vindictive, is the *source* of the cover-up record (provenance grapevine). Red-herring decoys realize the user's "boss+enforcer / two-hands" false theories as biased/false records implicating OTHER faction members — additional **undisproved** false claims (leads, not catchable contradictions) so they add misdirection without breaking solvability (the solver's `keyContradiction` is set explicitly). **Decision (user, 2026-06-03): cap decoys at 1-2 per case, and only emit them when the world supplies eligible other-faction members** — no decoys on a thin world.

**Commit grouping (assist-skill obs on implement-plan):** todos 1+5+8 (types `Solution.keyFact` → generator dispatch → solver branch) and the factions/test updates do **not** compile/pass individually — the TS project is red between a signature/shape change and its consumers. Group each interdependent set into ONE atomic working commit (flip all their checkboxes together, body lists each todo), restored to green before committing. Independent todos (e.g. new `crux.ts`, decoy records) commit on their own. Leaf-first order (lsn_81418856dfb0): types → crux.ts → generator → solver → factions → tests → snapshot.

**Test/verify (lsn_23b593244031):** run BOTH `npm run typecheck` and `npm test`; the snapshot at seed 7 (buriedWitness, where-crux) WILL change (new culprit-link record + provenance) — update with `vitest -u` intentionally and eyeball the diff. Confirm `crase-natural` (how) and `marsh-accident` (who) still pass `verifySolvable` by regenerating and printing both. The renderer is claim-text driven (no renderer changes needed for new record types beyond the `RecordType` union).
