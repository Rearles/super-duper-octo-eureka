# Authoring Interview — spec

The script Claude Code follows to walk an author through building the **hand-authored base layer**
of a Mound City world, emitting typed **builder-API** calls (`src/engine/authoring.ts`). This is the
specification the `case-author` skill implements; it can also be run ad hoc by reading this file.

See `docs/GameConceptDocument.md` §2.5 (The Faction System) and §5.4 (Case anatomy), and the plan
`.plans/author-the-case-core_6a3b8c1f.plan.md`.

---

## What the author writes vs. what procgen adds

| Author writes (this interview) | Procgen builds on top (the generator) |
|---|---|
| Case **Core 5W+H** — what · who (culprit+victim) · where · when · how — and the **`keyFact`** crux | Places the lie/contradiction against `keyFact`; **may add secondary contradictions** |
| A few **key people** — the principals + a couple of faction members who matter | Casts the remaining witnesses & bystanders |
| **Places** — the scene and any locations that matter | All **records**, **leads**, and **distortions** |
| **Factions** — interests · temperament · members · ally/rival ties | (consumed by the Plan 2 faction runtime, not here) |

**The author never writes:** the lie/cover-up (procgen places it), motive/"why", per-case faction
stakes (those are emergent — §2.5), or any record text.

## Output

The interview produces a TypeScript module under `src/engine/world/` (e.g. `src/engine/world/<slug>.ts`)
that calls the builders and exports a single `AuthoredWorld`:

```ts
import { defineWorld, definePerson, definePlace, defineFaction, defineCase } from "../authoring";

export const world = defineWorld({
  people:   [ /* definePerson(...) */ ],
  places:   [ /* definePlace(...) */ ],
  factions: [ /* defineFaction(...) */ ],
  cases:    [ /* defineCase(...) */ ],
});
```

`defineWorld(...)` validates every cross-reference and throws `AuthoringError` on any gap, so a
half-authored world fails loudly at author time rather than producing a broken case.

---

## Question style (non-negotiable)

Every prompt is a **structured multiple-choice question** in the AskUserQuestion style — **2–4 concrete
options, each with a one-line preview and a recommended default** — never an open "type it in" box,
*except* for inherently free-text values (a name, a one-line "what happened"). When free text is
required, still offer 2–3 **example options** to anchor tone, plus the author's own text. Always state
a recommendation and why. Confirm each piece back before writing it.

---

## The interview flow

Author **bottom-up** so every reference resolves: places & people first, then factions (which
reference people), then the case core (which references people & places).

### Phase 0 — Frame the world
- Ask for the **world slug** (file name) and a one-line premise.
- Recap what the author will write vs. what procgen adds (the table above), so expectations are set.

### Phase 1 — Places
For each place: **id** (kebab), **name**. Always include the **scene** of the case. Prompt for
optional extra locations the case or factions might care about (offer "just the scene" as the default
for a first pass). → `definePlace(id, name)`.

### Phase 2 — Key people
Author only the **principals + a few faction members**. For each person: **id**, **name**, and
**faction membership** (a choice among defined factions, or "none"). The **culprit** and **victim**
are people — author them here. → `definePerson(id, name).faction(factionId?)`.
> Procgen will invent the witness(es) and bystanders; do **not** author a full cast.

### Phase 3 — Factions
For each faction (offer 1–2 to start; more is optional):
- **id**, **name**, **description** (free text + 2–3 example tones).
- **Temperament** — choose one: `protective` · `opportunistic` · `vindictive` · `principled`
  (recommend `protective` for a first faction; it gives the clearest reactions). Shapes *how* it reacts.
- **Interests** — multi-select + free text: topics / places / people / objects / money / drugs it
  cares about. These drive **emergent stakes** (§2.5): a case whose hard facts overlap an interest
  makes that faction care. Recommend 2–4 concrete interests.
- **Members** — pick from defined people; optional **title** (e.g. "reporter", "boss").
- **Ally / rival ties** — pick other factions as allies (+) or rivals (−); acts ripple along these
  (§2.5). Offer "no ties yet" as a valid default with one faction.
→ `defineFaction(id, name).describe(...).temperament(...).interests(...).member(...).allies(...).rivals(...)`.

### Phase 4 — The case core (5W+H + keyFact)
- **what** — one-line crime/event (free text + examples: "a death staged as an accident", "a
  disappearance", "a witness who was never interviewed").
- **who** — pick the **culprit** and the **victim** from defined people (must differ).
- **where** — pick the scene from defined places.
- **when** — the time anchor (e.g. `2300`); offer common values + free text.
- **how** — one-line method (free text + examples).
- **keyFact** — the crux the cover-up attacks: choose one of `what · who · where · when · how`.
  **Recommend `where`** (the alibi — the classic Buried Witness crux and the pattern the generator
  supports first); explain that procgen plants the central lie against this fact.
→ `defineCase(id).what(...).culprit(...).victim(...).where(...).when(...).how(...).keyFact(...)`.

### Phase 5 — Validate & write
- Assemble `defineWorld({...})` and let it validate. If it throws `AuthoringError`, surface the
  message and walk the author back to the offending field.
- Write the module to `src/engine/world/<slug>.ts`, then run `npm run typecheck` + `npm test`.
- Offer to generate a case from it (`new CaseSession(seed)` once the generator consumes the world).

---

## Mirroring to assist-project (skill behavior)

Like `game-concept-builder`, the `case-author` skill mirrors authored data so it persists and other
sessions can read it:
- Each authored **case core** → `project_add_fact` (`scope: "case"`, value = the 5W+H + keyFact).
- Each authored **faction** → `project_add_fact` (`scope: "faction"`, value = interests/temperament/
  members/ties).
- Consult `assist-memory` at the start for authoring lessons; capture a lesson only if something
  durable and reusable about the *authoring process* surfaced.
