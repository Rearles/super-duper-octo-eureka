# Mound City

A cold-case detective game where you read the file, pull records, catch the
lie, and commit a verdict — and the city's factions react to what you do.

AI-assisted game design and development exploration. The full design lives in
[docs/GameConceptDocument.md](docs/GameConceptDocument.md).

## The model: authored truth + procgen on top

You hand-author the **hard truths** of a case — the Core 5W+H
(what/who/where/when/how) plus a `keyFact` crux — along with the **factions**
and a few key people. Procgen fleshes out the rest: it plants the lie, casts
the remaining witnesses, and generates all records, leads, and distortions.

- **Builder API** ([src/engine/authoring.ts](src/engine/authoring.ts)) —
  `defineWorld / definePerson / definePlace / defineFaction / defineCase`.
- **case-author skill** — a guided, structured-choice interview that walks you
  through authoring a world and emits the builder calls.
- **Generator** ([src/engine/generator.ts](src/engine/generator.ts)) —
  `generateCase(world, seed)` builds the record layer on top of authored truth.

## The faction system (GCD §2.5)

Factions hold two-axis **Standing** (slow) + **Heat** (acute, bidirectional),
take **emergent stakes** in cases that touch what they care about, and react in
three layers (role → direction, temperament → how, interest-overlap →
magnitude) — rippling through an ally/rival web. They reach out with
**provenance-tagged requests** (grapevine / press / direct) that may be lying;
you can **verify** a claim against the Registry, **fulfill** or **refuse** it,
and spend **favors** to call contacts for access. Verdicts confirm by doing —
no binary grade.

## Run it

```bash
npm install
npm run dev        # play the prototype
npm test           # 36 tests
npm run typecheck
npm run build
```
