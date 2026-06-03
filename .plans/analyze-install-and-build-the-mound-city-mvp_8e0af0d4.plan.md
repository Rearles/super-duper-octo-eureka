---
title: "Analyze and understand the Mound City MVP, install dependencies, and build it"
type: "feature"
created: "2026-06-03"
status: not-started
related: ["build-mound-city-mvp-prototype_ad9accc1.plan.md"]
---

# Analyze, Install, and Build the Mound City MVP

## Context

Onboarding + verification pass over the `mound-city` MVP (TypeScript / Vite / Vitest web app) that
realizes the §15.1 MVP slice of `docs/GameConceptDocument.md`: a deterministic core engine for one
"Buried Witness" case + template renderer + barebones top-down desk UI + the
request → contradiction → two-layer-verdict loop. No source changes — digest the GCD as a whole,
map the code to it, then install, typecheck, test, build, and run. `node_modules/` is present;
do a clean install to be certain. Toolchain: Node v24, npm 11.

## Todos

- [ ] Read `docs/GameConceptDocument.md` end-to-end — all 15 §§ + Decision Log
- [ ] Map `src/engine/*` + `src/ui/*` to the GCD MVP scope (Pillar 1, two-layer verdict)
- [ ] Verify toolchain — `node -v`, `npm -v`
- [ ] Install deps — `rm -rf node_modules && npm install`
- [ ] Typecheck — `npm run typecheck` (tsc --noEmit, strict)
- [ ] Test — `npm test` (vitest; expect 7 passing)
- [ ] Build — `npm run build` (tsc && vite build) → confirm `dist/`
- [ ] Run — `npm run preview`, confirm request→contradiction→verdict loop serves
- [ ] Capture engine architecture facts to assist-project

## Notes

**What the codebase is.** A faithful build of the GCD's smallest validating prototype (§14.3 / §15.1).
- `src/engine/types.ts` — domain model: `Entity`, `Claim` (with `truthful`), `CaseRecord` (with
  `Fidelity` true/partial/biased/false), `Solution`, `GameCase`. Encodes the ground-truth-vs-record
  split that Pillar 1 rests on.
- `src/engine/generator.ts` — deterministic seeded (mulberry32) "Buried Witness" generator: builds
  ground truth first, then projects records, planting one lie (a false alibi in the witness
  statement) that a true record (phone logs) disproves.
- `src/engine/solver.ts` — `verifySolvable` gate (Pillar 1): a catchable contradiction exists, it
  implicates the culprit, the culprit is accusable, key records exist. `CaseSession` throws if false.
- `src/engine/factGraph.ts` — read-only query layer; `contradictions()` surfaces *that* records
  conflict, never what it means (§2.2).
- `src/engine/templateRenderer.ts` — no-LLM `Renderer` (the LLM renderer is deferred; same interface).
- `src/engine/index.ts` — `CaseSession`: clearance, leads (`availableRequests`), `request`,
  `contradictions`, the theory-level `whisper` (§2.4 fairness valve), and `commitVerdict`
  (factual + disposition charge/bury/expose, one immediate consequence).
- `src/main.ts` + `src/ui/{desk,board,verdict}.ts` — barebones top-down desk UI (SEED=7); plain
  DOM, styles inline in `index.html`.
- `src/engine/engine.test.ts` — 7 tests: determinism, seed variance, solvability across 100 seeds,
  the planted lie, contradiction-only-after-obtaining, clearance spend, verdict correctness.

**Deliberately deferred (per §15.1):** LLM renderer, per-faction Heat/contacts/standing, calendar +
delayed/variable-latency consequences, interlinking + the secret backbone, going public/press,
hunch requests, rank/tools progression, multiple archetypes, A/V polish, PixiJS Board, Tauri.

**Lessons applied:** batch-read related files up front (`lsn_49cf78afc1ee`); if install fails, read
the real error before swapping deps (`lsn_e9ffd7a42ab1`); a killed/partial `npm install` corrupts
`node_modules` — `rm -rf` and reinstall rather than retry in place (`lsn_0a820e091c9f`), which is why
the install step wipes first. To drive the running app headlessly if needed, system Chrome +
puppeteer-core (`lsn_b560763b7994`).

**Stack:** `package.json` scripts — dev (vite), build (tsc && vite build), preview, test (vitest run),
typecheck (tsc --noEmit). tsconfig is strict, `noEmit`, ES2022/ESNext, bundler resolution,
verbatimModuleSyntax. Vite is configed by convention (no vite.config — `index.html` at root entry).
