---
title: "Faction tension systems (§2.4/§9/§10): Standing, Heat, Contacts, confirmation-by-doing"
type: "feature"
created: "2026-06-03"
status: not-started
related: ["author-the-case-core_6a3b8c1f.plan.md", "analyze-install-and-build-the-mound-city-mvp_8e0af0d4.plan.md"]
---

# Faction Tension Systems (§2.4 / §9 / §10)

## Context

Turn the **authored factions** from Plan 1 (`author-the-case-core_6a3b8c1f`) into the live tension
engine the GCD describes: every faction is a sub-system with its own **Standing**, **Heat/Exposure**
gauge, and **Contacts & favors** network (§2.4, §9.1, §9.2, §10); factual beliefs resolve only by
**confirmation-by-doing** — committing a verdict/disposition or an **intermediate official act**
(subpoena, naming a person of interest) makes the world react and confirm or contradict (§2.4). No
score, no karma meter — competing faction pressures are the stakes. Depends on Plan 1's authored
faction data model + the `CaseSession` verdict/consequence seams. **Large — split further if a
single domain (e.g. Contacts, or confirmation-by-doing) grows past its todos.**

## Todos

- [ ] Map Plan 1's `Faction`/`FactionMember` data + `CaseSession` verdict + consequence seams
- [ ] Add runtime state types: per-faction `Standing`, `HeatExposure`, `FavorPool`, `Contact`
- [ ] Implement `FactionState` — apply Standing + Heat shifts from dispositions and published info
- [ ] Implement Heat thresholds → retaliation events (surveillance, clearance revocation, framing)
- [ ] Implement Contacts & favors — calling a contact spends that faction's favors for access, never answers
- [ ] Implement confirmation-by-doing — official acts (subpoena, name POI) + theory-whisper resolve beliefs
- [ ] Wire into `CaseSession` — verdict/disposition + an official-acts path schedule immediate faction reactions
- [ ] Surface factions in the UI — per-faction Standing/Heat indicators; outcome/Ledger shows the shifts
- [ ] Add tests — Standing math, Heat→retaliation thresholds, favor spend, confirmation-by-doing resolution
- [ ] Verify — `npm run typecheck`, `npm test` (green), `npm run build`, `npm run preview`

## Notes

**Why this is its own plan:** the user chose to build the **full §2.4 systems**, which is a distinct
runtime/simulation domain layered on Plan 1's authored data. Plan 1 has no dependency on this plan;
this plan consumes Plan 1's `Faction` model. Clean domain boundary (`lsn_08e808e71bef`).

**GCD anchors:** §2.4 (no score; standing = multi-factional reputation; confirmation-by-doing),
§9.1 (Heat/Exposure per faction; no game-over — maxed Heat forces hard consequences), §9.2 (Contacts
& favors give access not answers), §10 (Clearance global; Heat/Favors/Standing per faction).
Factions and a couple of members are **authored** (Plan 1); their **gauges and reactions** are built
here. Keep Pillar 2 — the systems pressure and react, but never interpret or hand the player a
conclusion.

**Likely sub-splits if it grows:** (a) Standing + Heat + retaliation; (b) Contacts & favors;
(c) confirmation-by-doing + official acts + UI. Reassess after the first three todos.

**Deferred even here:** the calendar / variable-latency delayed consequences (only *immediate*
reactions in this plan), going-public/press cascade breadth, interlinking/the secret backbone.
