---
title: "Author the Case Core: builder + guided interview + procgen base layer"
type: "feature"
created: "2026-06-03"
status: not-started
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

- [ ] Map `generateCase` consumers + `GameCase`/`types.ts`; list what extends vs. breaks
- [ ] Add authored types to `types.ts`: `CaseCore` (5W+H), `Faction`, `FactionMember`, `Person`, `AuthoredWorld`
- [ ] Create `src/engine/authoring.ts` — `defineCase` / `defineFaction` / `definePerson` builders → validated data
- [ ] Write `docs/authoring-interview.md` — the structured-choice interview script (5W+H · factions · key people)
- [ ] Author `src/engine/world/` starter data — one case core + 1–2 factions + a few members, via the builders
- [ ] Refactor `generateCase(world, seed)` — copy authored core/people → place lie → cast extras → build records/leads
- [ ] Extend `verifySolvable` so authored-core + generated-layer cases still guarantee a solution path
- [ ] Update `CaseSession` to consume the `AuthoredWorld` (seed drives only the procgen dressing)
- [ ] Update `engine.test.ts` + add `authoring.test.ts` — builder validation, determinism, placed lie, solvable across seeds
- [ ] Verify — `npm run typecheck`, `npm test` (green), `npm run build`, `npm run preview`

## Notes

**Decisions (user, 2026-06-03):**
- *Hard-truth schema* = **Core 5W+H only**: what (crime/event), who (culprit + victim), where (scene),
  when (time), how (method). Motive/"why", explicit stakes, and the lie are **not** authored on the
  case core — the **lie/contradiction is procgen-placed** (preserves the earlier skeleton+placed-lie
  call). Tension comes from the factions, not a case stakes field.
- *Authored vs cast* = **author key people + procgen casts the rest**: author the principals (culprit,
  victim) and a few faction members who matter; procgen invents remaining witnesses/bystanders and
  all their records, leads, distortions.
- *Builder UX* = **guided interview that emits builder data, asked in structured multiple-choice
  form** (like these planning questions — options + previews + a recommended default). Conducted by
  Claude Code per `docs/authoring-interview.md`; could later be formalized as a toolbelt
  `case-author` skill (via skill-creator) — out of scope here, in-repo playbook is enough.

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
