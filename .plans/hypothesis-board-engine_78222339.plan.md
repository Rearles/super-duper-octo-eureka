---
title: "Hypothesis-board deduction redesign — Phase 1 (engine: clues, theory, per-slot solver, pure-consequence verdict)"
type: "feature"
created: "2026-06-03"
status: in-progress
related: ["weave-authored-case-data-into-procgen_79b54597.plan.md"]
---

# Hypothesis-board redesign — Phase 1 (engine only)

## Context

Playtest found the player has no deductive agency: records state conclusions and the engine auto-detects the contradiction + signals readiness (assist-project `playtest_deduction_no_agency`). Decision (`hypothesis_board_redesign`): records emit atomic **clues**, the player fills a **WHO/WHERE/WHEN/HOW theory**, asserts contradictions themselves, and commits — the world reacts with **pure consequence** (no grade). This plan is the **engine layer only** (no UI — Plan 2). It is **additive**: keep `commitVerdict`/`contradictions()`/`whisper()` working so `src/ui/*` + `src/main.ts` still compile; the new clue/theory/commitTheory API lands alongside. Keep determinism and both paper-trail cases solvable under the new per-slot solver.

## Todos

- [x] Add `Clue` + `Theory` types to `src/engine/types.ts`; optional `clues?` on `CaseRecord`/`GameCase`
- [x] Emit per-slot clue sets from `src/engine/crux.ts` strategies (contested slot: ≥1 false + ≥1 true)
- [x] Add true clues for non-contested who/where/when/how slots in `src/engine/generator.ts`; aggregate `GameCase.clues`
- [x] Render record `clues` as atomic evidence in `src/engine/templateRenderer.ts` (no conclusions)
- [x] Add `Theory` state + `setSlot`/`clearSlot`/`theory()` to `CaseSession` in `src/engine/index.ts`
- [x] Add player-asserted `assertContradiction(clueA, clueB)` validation in `src/engine/factGraph.ts`
- [ ] Add `trueAnswers` (per-slot ground truth) to `Solution` via optional field in `src/engine/generator.ts`
- [ ] Generalize `verifySolvable` in `src/engine/solver.ts` to per-slot supported + contested catchable
- [ ] Add `commitTheory(theory, disposition)` to `CaseSession` — pure consequence, reuse §2.5 reactions, no grade
- [ ] Update `buriedWitness` fixture + `engine/factions/requests` tests for the clue/theory API
- [ ] Regenerate the golden snapshot (`vitest -u`) and review the diff
- [ ] Add tests: clue emission per crux, per-slot solvability, `commitTheory` consequences (no grade)
- [ ] Verify: `npm run typecheck` + `npm test` + regenerate both paper-trail cases under the new loop

## Notes

**Clues vs claims (keep both):** `claims` stay as the faction/request truth-model (groundTruth, `verifyClaim`, `factionClaim`) — untouched. **Clues** are the new player-facing deduction currency: `Clue { id, recordId, text, slot: CaseFact, value: string, fidelity }`. Each record carries `clues?`; `GameCase.clues` is the flat aggregate. The contested (`keyFact`) slot gets ≥1 **false/biased** clue (the lie's value) + ≥1 **true** clue (the real value) so the player must outweigh; non-contested slots get consistent **true** clues so all four slots are fillable. The `who` slot's true value = culprit, `where` = scene, `when` = `core.when`, `how` = a canonical token (e.g. "homicide"/method) — reuse the crux predicate/value scheme already in `crux.ts`.

**Atomic-evidence text (the heart of the fix):** clue `text` must read as evidence, NOT conclusions — e.g. who-crux false clue "a witness puts Okafor behind the wheel"; true clues "tread marks: the car was stopped at impact", "a heavyset man (Skell's build) left by the south stair". The renderer shows a record's clues; the player infers the slot value. Do NOT write "X, not Y" conclusions.

**Player-asserted contradiction (no auto-surface):** `assertContradiction(clueA, clueB)` returns whether the two clues genuinely conflict (same `slot`, different `value`) and which (if either) matches ground truth — but the engine never *lists* contradictions for the player. Keep the old `FactGraph.contradictions()` for the existing UI/tests (Plan 2 removes it). The new method is additive.

**Per-slot solvability:** generalize `verifySolvable` to: for EACH slot in {who,where,when,how}, ∃ an obtainable **true** clue establishing the real value; AND the contested slot has a **false** clue whose value differs from a **true** clue (catchable); AND the culprit (who-value) ∈ `suspects`. Key on `solution.keyFact` (already added) and the new `solution.trueAnswers`. Keep the existing checks meaningful.

**Pure-consequence commit:** `commitTheory(theory, disposition)` compares `theory` to `solution.trueAnswers` INTERNALLY to build consequence fiction (right who+expose → culprit ruined; wrong who → real culprit walks & reacts; framed innocent stays imprisoned if who wrong) and reuses `reactToVerdict`/`applyInterFactionWeb` keyed on the NAMED who. **No grade, no per-slot right/wrong returned** — only `{ consequence: string, reactions }`. Keep `commitVerdict` for the current UI.

**Commit hygiene (assist-skill obs on implement-plan; `lsn_9dbe945725a8`):** add new type fields **optional** (`clues?`, `trueAnswers?`) so each todo compiles green independently — the types→generator→solver→session chain stays per-todo committable. Group only the genuinely-coupled behavior+test+snapshot todos (10–11) into atomic commits. Leaf-first: types → crux → generator → renderer → session/solver → tests → snapshot.

**Test/verify (`lsn_23b593244031`):** existing `engine/factions/requests` tests use the buriedWitness where-crux fixture and the auto-`contradictions()` API — those KEEP working (additive). The golden snapshot WILL change (records gain `clues` + rendered evidence) — regenerate with `-u` and eyeball. Run BOTH `npm run typecheck` (covers `src/ui` too — don't break it) and `npm test`. Confirm crase-natural (how) + marsh-accident (who) pass the new per-slot `verifySolvable` and that `commitTheory` yields distinct consequences for right vs wrong theories.

**Explicitly OUT of scope (Plan 2 — UI):** the theory-board UI, clue-assignment interactions, removing the Board panel/`whisper`/`contradictions()`, epilogue rendering, `src/ui/*`, `src/main.ts`. This plan leaves those intact and compiling.

**Cross-session (`lsn_87d520682829`):** Plan 1 (this) then Plan 2 (UI) — run one per session.
