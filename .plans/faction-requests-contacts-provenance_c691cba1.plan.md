---
title: "Faction requests, contacts & provenance (§2.5 interaction layer): grapevine/press/direct requests, verify-against-Registry, Contacts & Favors"
type: "feature"
created: "2026-06-03"
status: in-progress
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

- [x] Map Plan 2's `FactionRuntimeState` + the record fidelity/truth-model seams
- [x] Add types — `Contact`, `FavorPool`, `FactionRequest` (provenance + fidelity + claim + ask)
- [x] Implement Contacts & Favors — call a contact → spend that faction's favors for access, never answers (Pillar 2)
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

## Mapping (todo 1 findings)

**Plan 2 seams to reuse (do not reimplement):**
- `FactionRuntimeState { factionId, standing, heat }` — **extend additively with `favors: number`**
  (the FavorPool lives on the same record). `CaseSession` inits it to 0.
- `applyInterFactionWeb(world, direct)` + `FactionReaction` — fulfill/refuse produce a direct
  reaction per the acted-on faction, then ripple through the web exactly like a verdict.
- `caseFacts` / `factionStake` — to decide which factions have stake (→ who makes a request) and
  the magnitude of fulfill/refuse shifts.
- `CaseSession.applyReactions(reactions, note)` (private) + `ledger` — **extend `applyReactions` to
  also apply a `favorDelta`** so fulfill grants a Favor; reuse the Ledger for request acts.

**Truth-model seams (for verify):** `gameCase.groundTruth: Claim[]` is the canonical truth. A request
carries a `Claim` (subject/predicate/object); **verify** = compare against `groundTruth` on
subject+predicate → matching object ⇒ true; conflicting ⇒ false; absent ⇒ unverifiable. Reuses
`Claim`/`Fidelity` (true/partial/biased/false) — no parallel reliability system (Pillar 1).

**New surface (this plan):**
- `FactionRequest { id, factionId, ask, provenance, claim, fidelity, revealed, status }` — a faction's
  demand backed by a (maybe-false) provenance-tagged claim. `ask` = the disposition the faction wants.
- `Contact` = an authored `FactionMember` (a faction's members ARE its contacts). Calling one spends
  1 favor of that faction for **access** (a clearance boost — never the answer; Pillar 2).
- Request generation (todo 4): each stake-holding faction makes one request; provenance/fidelity is
  seeded from temperament + member-guilt (a protective faction of a guilty member ⇒ a grapevine FALSE
  "he's innocent" claim).

**The sub-loop:** fulfill requests → earn that faction's **Favors** → spend Favors on **Contacts** for
clearance/access → pull more records → solve. **verify** spends clearance to expose a request's claim
fidelity before deciding. Self-contained; moves faction state only through Plan 2's machinery.

**CaseSession additions:** `requests()`, `verifyRequest(id)`, `fulfillRequest(id)`,
`refuseRequest(id)`, `contacts()`, `callContact(personId)`. The UI gets a requests inbox (todo 7).
