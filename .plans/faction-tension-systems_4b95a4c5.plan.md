---
title: "Faction state, stakes & reactions (§2.5 core): two-axis Standing+Heat, emergent stakes, the web, confirmation-by-doing"
type: "feature"
created: "2026-06-03"
status: in-progress
related: ["faction-requests-contacts-provenance_c691cba1.plan.md", "author-the-case-core_6a3b8c1f.plan.md", "analyze-install-and-build-the-mound-city-mvp_8e0af0d4.plan.md"]
---

# Faction State, Stakes & Reactions (§2.5 core)

## Context

Build the **runtime core** of the faction system now locked in GCD **§2.5** (v1.1) — the engine that
turns Plan 1's authored factions into live tension. Per-faction **two axes** (Standing = slow durable
trust; Heat = acute, **bidirectional**), **emergent stakes** (a faction's authored *interests* × the
case's hard facts + the player's public acts), **three-layer reactions** (roles → direction,
temperament → how, interests-overlap → magnitude), and the **inter-faction web** (authored ally/rival
ties ripple shifts outward). Replaces the binary `correct/incorrect` verdict with **confirmation-by-
doing** (§2.4). The **requests/contacts/provenance** interaction layer is the linked
**Plan 3** (`faction-requests-contacts-provenance_c691cba1`). Depends on Plan 1's authored data model
(`author-the-case-core_6a3b8c1f`). assist-project: `fct_c5af1dbb681f`, `fct_819d93bfe926`.

## Todos

- [x] Map Plan 1's authored `Faction`/`FactionMember`/`Person` + `CaseSession` verdict/consequence seams
- [ ] Add runtime types — per-faction `Standing` + `Heat` (two independent axes), `FactionRuntimeState`
- [ ] Implement emergent stakes — overlap of faction `interests` × (case hard-facts + player public acts)
- [ ] Implement three-layer reactions — roles (direction) × temperament (how) × stake (magnitude) → Standing/Heat deltas
- [ ] Implement the inter-faction web — ripple deltas to authored ally (+) / rival (−/heat) factions
- [ ] Replace binary `correct/incorrect` with confirmation-by-doing — pre-commit theory whisper + reaction-based confirmation
- [ ] Wire into `CaseSession` — verdict/disposition + official acts apply reactions; record shifts in a Ledger
- [ ] Surface faction state in the UI — per-faction Standing/Heat indicators + outcome/Ledger shifts
- [ ] Add tests — stakes math, reaction layers, web ripples, Heat bidirectionality, confirmation-by-doing
- [ ] Verify — `npm run typecheck`, `npm test` (green), `npm run build`, `npm run preview`

## Notes

**§2.5 anchors:** two-axis state (Standing vs Heat are independent — high Standing can coexist with
spiked Heat); Heat bidirectional (rises on acts against, falls on acts for); stakes emergent and
**live** (player publishing a claim against a faction's member mid-case, even in an unrelated case,
gives that faction a stake and shifts Heat); reactions combine roles+temperament+interests-overlap;
web ripples through authored ally/rival ties.

**Confirmation-by-doing (locked):** the engine's current immediate `correct: boolean` is replaced —
factual truth confirms/contradicts only when the player **acts** (verdict, disposition, official act)
and a faction **reacts**. Keep an internal correctness signal for tests, hidden from the player.

**Out of scope → Plan 3:** faction-initiated **requests**, **provenance** (grapevine/press/direct) +
verify-against-Registry, **Contacts & Favors**. Also deferred: the calendar / variable-latency
delayed consequences (this plan applies *immediate* reactions only), the secret backbone, interlinking.

**Split rationale:** state+reactions (this plan) is the foundation the interaction layer (Plan 3)
consumes; each stays a coherent ≤10-todo unit (`lsn_08e808e71bef`).

## Mapping (todo 1 findings)

**Authored data (from Plan 1, all in `AuthoredWorld`):** `Faction { id, name, interests[], temperament,
members[], allies?, rivals? }`, `FactionMember { personId, title? }`, `Person extends Entity {
factionId? }`. Reached via `world.factions` / `world.people`.

**Seam 1 — `CaseSession` must retain the world.** `index.ts` ctor currently calls
`generateCase(opts.world ?? defaultWorld, seed)` then **discards the world**. Store it:
`private readonly world: AuthoredWorld`. The runtime reads `world.factions`/`world.people`.

**Seam 2 — resolve the `CaseCore` at runtime (need `coreId` on `GameCase`).** `GameCase` exposes the
culprit (`solution.culpritId`) but **not** the victim id or the 5W+H. Add an **additive** `coreId?:
string` to `GameCase`, set by the generator, so the runtime can `world.cases.find(c => c.id ===
gameCase.coreId)` to get `what/how/victimId/whereId/when`. (Changes the golden snapshot → update with
`vitest -u`, expected.)

**Seam 3 — case roles → people → factions.** Roles: culprit = `solution.culpritId`; victim =
`core.victimId`; procgen cast = `"witness"` / `"suspect_b"`. A faction is *involved* when one of its
members (`world.people` with `factionId === f.id`) holds a role; **direction** = exposing/charging a
culprit-member harms that faction, clearing them helps.

**Seam 4 — interests overlap (stake magnitude).** Match `faction.interests` (strings) against the
case hard facts — `core.what`, `core.how`, and the involved entity **names** (culprit/victim/scene) —
plus the player's public act (the accused + disposition). More/stronger overlap → bigger swing.

**Seam 5 — `commitVerdict`.** `index.ts commitVerdict(culpritId, disposition)` returns `{ correct,
consequence }`. Faction reactions (Standing/Heat deltas + web ripple) apply here; confirmation-by-doing
(todo 6) reworks the player-facing `correct` into reaction-based confirmation (keep an internal signal
for tests). `VerdictResult` extends with the faction shifts.

**Seam 6 — UI.** `verdict.ts` (commit button) and `main.ts` (renders `res.correct`/`res.consequence`)
are the only outcome surfaces; `desk.ts`/`board.ts` untouched. The factions panel (todo 8) reads new
`CaseSession` faction state. Insulated otherwise.
