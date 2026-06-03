---
title: "Faction state, stakes & reactions (§2.5 core): two-axis Standing+Heat, emergent stakes, the web, confirmation-by-doing"
type: "feature"
created: "2026-06-03"
status: not-started
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

- [ ] Map Plan 1's authored `Faction`/`FactionMember`/`Person` + `CaseSession` verdict/consequence seams
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
