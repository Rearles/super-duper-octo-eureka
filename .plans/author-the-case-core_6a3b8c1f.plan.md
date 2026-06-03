---
title: "Author the Case Core: builder + guided interview + procgen base layer"
type: "feature"
created: "2026-06-03"
status: in-progress
related: ["faction-tension-systems_4b95a4c5.plan.md", "analyze-install-and-build-the-mound-city-mvp_8e0af0d4.plan.md", "build-mound-city-mvp-prototype_ad9accc1.plan.md"]
---

# Author the Case Core

## Context

Replace seed-only case generation with an **authored base layer + procgen on top**
(assist-project `fct_57242bb32131`). The author hand-writes, via a **Claude-Code-conducted guided
interview using structured multiple-choice questions** (the AskUserQuestion style — options,
previews, recommendations), the world's base: a case's **Core 5W+H hard truths**, the **factions**,
and a **few key people** (principals + a couple of faction members). The interview emits typed
**builder-API** data. **Procgen fleshes out the rest**: places the lie/contradiction, casts the
remaining witnesses/bystanders, and generates all records, leads, and distortions. `verifySolvable`
still guarantees Pillar 1. The `GameCase` output is *extended, not broken* — solver, factGraph,
renderer, and UI keep working. This plan is the base layer; the §2.4 faction **runtime** is Plan 2
(`faction-tension-systems_4b95a4c5`). Leaf-first order (`lsn_81418856dfb0`).

## Todos

- [x] Map `generateCase` consumers + `GameCase`/`types.ts`; list what extends vs. breaks
- [ ] Add authored types to `types.ts`: `CaseCore` (5W+H + `keyFact`), `Faction` (`interests` + `temperament`), `FactionMember`, `Person` (case `role`, `factionId`), `AuthoredWorld`
- [ ] Create `src/engine/authoring.ts` — `defineCase` / `defineFaction` / `definePerson` builders → validated data
- [ ] Write `docs/authoring-interview.md` — the structured-choice interview spec (5W+H · factions · key people); feeds the skill
- [ ] Author `src/engine/world/` starter data — one case core + 1–2 factions + a few members, via the builders
- [ ] Create the `case-author` skill via skill-creator — guided interview driving the builders; mirrors authored data to assist-project + consults assist-memory
- [ ] Refactor `generateCase(world, seed)` — copy authored core/people → place lie → cast extras → build records/leads
- [ ] Extend `verifySolvable` so authored-core + generated-layer cases still guarantee a solution path
- [ ] Update `CaseSession` to consume the `AuthoredWorld` (seed drives only the procgen dressing)
- [ ] Update `engine.test.ts` + add `authoring.test.ts` — builder validation, determinism, placed lie, solvable across seeds
- [ ] Add a golden snapshot test — one fully generated + rendered case at a fixed `(world, seed)`
- [ ] Verify — `npm run typecheck`, `npm test` (green), `npm run build`, `npm run preview`

## Notes

**Decisions (user, 2026-06-03):**
- *Hard-truth schema* = **Core 5W+H** + a **`keyFact`**: what, who (culprit+victim), where, when, how
  — and the author **designates one `keyFact` as the crux** the cover-up attacks. The lie is
  **procgen-placed against the keyFact**, and procgen **may add secondary contradictions** around it
  (author owns the central deduction; procgen enriches). Motive/"why" and explicit per-case stakes
  are **not** authored.
- *Authored vs cast* = **author key people + procgen casts the rest**: author the principals (culprit,
  victim) and a few faction members who matter; procgen invents remaining witnesses/bystanders and
  all their records, leads, distortions.
- *Factions (authored fields only here)* = identity + members + a one-word **`temperament`**
  (protective/opportunistic/vindictive/principled…) + **`interests`** (topics/places/people/objects/
  money/drugs a faction cares about). Member **case roles** link factions to a case. The *reaction
  and stake math* is runtime (Plan 2): stakes are **emergent** — overlap of a faction's interests
  with the case's hard facts AND the player's public acts — so this plan only needs the authored
  fields. (assist-project `fct_819d93bfe926`.)
- *Builder UX* = **guided interview that emits builder data, asked in structured multiple-choice
  form** (like these planning questions — options + previews + a recommended default), delivered as
  the **`case-author` skill** (via skill-creator) with `docs/authoring-interview.md` as its spec.

**Pending the GCD faction-design pass (user chose GCD-first, 2026-06-03):** the faction *runtime* —
emergent-stake computation, bidirectional Heat, faction-initiated **requests** with **provenance**
(grapevine/press/direct) + testable reliability, confirmation-by-doing — is designed in the GCD
(§2.4/§6/§9/§10) and built in Plan 2. Plan 1 must only author the data those systems will read.

**Proposed shapes (refine during build):**
- `CaseCore` = `{ id, what, culpritId, victimId, whereId, when, how }` (the 5W+H; `when`/`how` as the
  key deducible anchors).
- `Person` = extends `Entity` with optional `factionId`.
- `Faction` = `{ id, name, description, members: FactionMember[] }` — runtime gauges (Standing/Heat/
  favors) are added in Plan 2, not here; Plan 1 authors only identity + membership.
- `AuthoredWorld` = `{ cases: CaseCore[], factions: Faction[], people: Person[] }`.
- `generateCase(world, seed)`: pick/seed a case core → copy authored people → seeded-invent witness +
  bystanders (avoid authored-name collisions) → place a false alibi for the culprit on the key
  predicate → generate corroborating true records (phone disproves alibi; autopsy fixes time/place;
  property links culprit+witness) → caseFile + leads → `solution`/`suspects` → `verifySolvable` gates.

**Determinism:** same `(world, seed)` → identical `GameCase`. `CaseSession(seed)` keeps its signature,
loads the `AuthoredWorld`, passes `(world, seed)`; seed varies only the dressing, never authored truth.

**Out of scope (→ Plan 2):** the §2.4/§9/§10 faction runtime — Standing, Heat/Exposure, Contacts &
favors, confirmation-by-doing, official acts, and the factions UI. Also out: multiple archetypes,
the LLM renderer, calendar/delayed consequences, interlinking.

## Mapping (todo 1 findings)

**`generateCase(seed)` direct callers — BREAK on signature change (`seed` → `world, seed`):**
- `src/engine/index.ts:32` — `CaseSession` ctor: `this.gameCase = generateCase(seed)`. Fix: load the
  `AuthoredWorld`, call `generateCase(world, seed)`. **Keep `CaseSession(seed)`'s public signature.**
- `src/engine/index.ts:8` — re-export of `generateCase` (keep; signature updates).
- `src/engine/engine.test.ts` — `generateCase(42/43/7/seed)` at lines 8,9,14,15,21,26. Fix: pass a
  test `world` (the starter `AuthoredWorld`) + seed.

**`GameCase` output shape — EXTEND, don't break (these stay untouched):**
- `factGraph.ts` (uses `gameCase.entities`, `.records`), `solver.ts` (`.records`/`.solution`/
  `.suspects`), `templateRenderer.ts` (param currently unused `_gameCase`), `CaseSession.gameCase`.
- Rule: keep all existing `GameCase` fields (`seed, entities, groundTruth, records, caseFileId,
  solution, suspects`); new authored types (`CaseCore/Faction/FactionMember/Person/AuthoredWorld`)
  are **additive**. `Person` extends `Entity`, so authored people slot into `entities` cleanly.

**UI — fully insulated by `CaseSession` (no direct `generateCase`/`GameCase` coupling except one):**
- `desk.ts` (clearance/whisper/obtainedRecords/render/availableRequests/closed), `board.ts`
  (contradictions/graph), `verdict.ts` (closed/graph + **`session.gameCase.suspects`** ← only direct
  `GameCase` field touched by UI), `main.ts` (request/commitVerdict). **As long as `CaseSession(seed)`
  keeps its signature and `GameCase.suspects` persists, the UI needs zero changes.**

**Net:** the only breaks are the `generateCase` call sites (CaseSession ctor + tests). Everything
downstream of `CaseSession` is insulated. Build leaf-first: types → builders → starter world →
`generateCase` refactor → CaseSession internals → tests.
