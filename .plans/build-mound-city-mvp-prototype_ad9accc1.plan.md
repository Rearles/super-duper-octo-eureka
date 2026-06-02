---
title: "Build the Mound City MVP prototype — the request → contradiction → verdict core loop"
type: "feature"
created: "2026-06-02"
status: not-started
related: []
---

# Build the Mound City MVP prototype — the request → contradiction → verdict core loop

## Context

Greenfield TypeScript/web app (no game engine) per `docs/GameConceptDocument.md` §14. Goal: the ruthless MVP (§15.1) — prove the core loop is fun. Build a **pure deterministic core engine** for ONE solvable case plus a **barebones top-down desk UI**; the LLM is deferred (template renderer only). The engine must be UI- and LLM-independent and seed-replayable.

Key design refs in the doc: §5.1 (generation engine), truth-model (ground truth vs. records that can lie), §2.1 (core loop / two-layer verdict), §2.2/§12 (desk UI), §3.3 (one consequence). Deferred: LLM, factions/Heat, calendar, interlinking, going-public, hunches, progression, multiple archetypes, A/V polish.

## Todos

- [ ] Scaffold `package.json`, `tsconfig.json` (strict), and Vite — TS web skeleton
- [ ] Create `src/engine/types.ts` — Entity, Event, Relationship, Record, Fidelity, Case
- [ ] Create `src/engine/factGraph.ts` — `FactGraph` model with query helpers
- [ ] Create `src/engine/generator.ts` — seeded one-case generator with one planted lie
- [ ] Create `src/engine/solver.ts` — `verifySolvable()` confirms a solution path exists
- [ ] Create `src/engine/templateRenderer.ts` — render facts to plain document text (no LLM)
- [ ] Create `src/engine/index.ts` — `generateCase(seed)` → verify → expose engine API
- [ ] Add `src/engine/engine.test.ts` — generation is deterministic, solvable, and renders
- [ ] Create `src/ui/desk.ts` — desk view: list documents, read, submit a request (spend clearance)
- [ ] Create `src/ui/board.ts` — minimal Board; flag contradictions between conflicting records
- [ ] Create `src/ui/verdict.ts` — two-layer verdict (factual + one disposition) firing one consequence
- [ ] Create `index.html` and `src/main.ts` — mount the desk UI and play one case end-to-end
- [ ] Verify: `npm install && npm run build && npm test` green; play one case; commit

## Notes

### Architecture (from §14.3)

- **Pure deterministic core engine** (`src/engine/`): `factGraph` · `generator` · `solver` · `templateRenderer`. No DOM, no network, no LLM. Everything seed-replayable and unit-testable.
- **Renderer interface:** define `Renderer` in `templateRenderer.ts` so an `LLMRenderer` can drop in later behind the same interface. The template renderer is the always-available fallback; the LLM is presentation-only.
- **UI adapter** (`src/ui/`): consumes engine state only; never reaches into generation logic.

### Truth model (critical — keep the engine honest)

- Generate **ground truth first** (the crime + world state), then **project records** with tracked fidelity (`true | partial | biased | false`). At least one record must be a deterministic **lie** the player can catch by cross-referencing.
- The renderer may express **only** facts a given record would legitimately contain — never the solution. The contradiction flag shows *that* two records conflict, never what it means.
- `verifySolvable()` must guarantee ≥1 chain of obtainable records yields the factual solution; regenerate/patch on failure (the generator + solver are co-built — build #4 and #5 together).

### Scope guardrails

- ONE hand-tuned case shape (a "Buried Witness": a false statement vs. a hard record). No interlinking, no factions, no calendar.
- "Clearance" is a single integer counter for the MVP. One disposition with one immediate, visible consequence — enough to prove the act has weight.
- Success test: can a fresh player request records, notice the planted contradiction, and reach the correct factual verdict — and does it feel good?

### Next milestones (post-MVP, see §15.2)

Vertical slice (LLM renderer + Heat + one faction + a delayed consequence + noir pass) → Content build (interlinking, archetypes, full faction web, calendar, going-public) → Polish & ship.
