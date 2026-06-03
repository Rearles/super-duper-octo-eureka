---
title: "Faction requests, contacts & provenance (§2.5 interaction layer): grapevine/press/direct requests, verify-against-Registry, Contacts & Favors"
type: "feature"
created: "2026-06-03"
status: not-started
related: ["faction-tension-systems_4b95a4c5.plan.md", "author-the-case-core_6a3b8c1f.plan.md"]
---

# Faction Requests, Contacts & Provenance (§2.5 interaction layer)

## Context

Build the **interaction layer** of GCD **§2.5** on top of Plan 2's faction state engine: factions
**initiate** — making **requests/demands** of the player — and the player calls **Contacts** for
access. Every faction request carries a **claim** with a **provenance** (grapevine = Nth-hand,
unreliable / press = slanted, partial / direct = first-hand) and a **fidelity** drawn from the record
truth-model (Pillar 1) — so it **may be false**. The player's decision: **fulfill** (Standing↑/Heat↓ +
a Favor, often at a rival's or the truth's cost), **refuse/ignore** (Heat↑, a door may close), or
**verify** (spend clearance to test the claim against the Registry first). Depends on **Plan 2**
(`faction-tension-systems_4b95a4c5`) for the state + reaction engine, and Plan 1 for the record
truth-model. assist-project: `fct_c5af1dbb681f`, `fct_77976f74828b`.

## Todos

- [ ] Map Plan 2's `FactionRuntimeState` + the record fidelity/truth-model seams
- [ ] Add types — `Contact`, `FavorPool`, `FactionRequest` (provenance + fidelity + claim + ask)
- [ ] Implement Contacts & Favors — call a contact → spend that faction's favors for access, never answers (Pillar 2)
- [ ] Implement faction-initiated requests — factions push requests sourced from grapevine/press/their wants
- [ ] Implement provenance + verify — test a request's claim against the Registry (spend clearance); fidelity from the truth-model
- [ ] Implement fulfill / refuse / verify resolution — Standing/Heat/Favor shifts + rival ripples per choice (via Plan 2)
- [ ] Surface requests in the UI — a requests inbox + the verify action; Ledger records what was acted on
- [ ] Add tests — favor spend, each resolution path, verify exposes a false claim, fidelity handling
- [ ] Verify — `npm run typecheck`, `npm test` (green), `npm run build`, `npm run preview`

## Notes

**The interesting decision (Pillar 1 + Pillar 3):** a request's claim may be grapevine/press-distorted
bait. Acting on it blind is how the player gets *played*; verifying costs clearance but turns the
faction's own information into deduction material. This reuses the existing record-fidelity model
(true/partial/biased/false) rather than inventing a parallel reliability system.

**Provenance → reliability mapping (tune during build):** grapevine skews toward partial/false, press
toward biased/partial, direct toward true-but-self-interested. The player verifies by cross-checking
the claim against obtainable Registry records — the same contradiction machinery as case deduction.

**Out of scope:** the calendar / delayed-latency request timing (requests arrive on immediate/next-case
triggers for now), the press-cascade breadth of going-public (§6.1), the secret backbone.

**Depends on Plan 2** for `FactionRuntimeState`, Standing/Heat deltas, and the web-ripple helper —
do not duplicate that logic here; call into it.
