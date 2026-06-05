---
title: "Build the faction & actor model + Allegiance portfolios (the society-sim data layer)"
type: "feature"
created: "2026-06-04"
status: complete
related: ["faction-tension-systems_4b95a4c5.plan.md", "faction-requests-contacts-provenance_c691cba1.plan.md", "build-the-registry-backend-prisma-schema-and-forgeable-data-tables_b705b56b.plan.md", "build-the-relationships-and-pacts-diplomacy-engine_d2e8b3c9.plan.md"]
---

# Build the faction & actor model + Allegiance portfolios

## Context

The data layer of the v2.0 autonomous society-sim (GCD §2.5). **Extends — does not replace — the built `faction-tension-systems` / `faction-requests-contacts-provenance`** (keep Standing/Heat/Favors/Contacts, the three-layer reactions, and the ally/rival web). Adds the structure the sim runs on: the seven **blocs** → **sub-factions** → **members**, and **Allegiance** as a per-actor portfolio that replaces flat `factionId` membership. Allegiance applies to every actor — faction OR person, **including the detective** — and is the unifying mechanic for witness-flipping, corruption, moles, and defection cascades. This plan is data + the switch rule; the diplomacy graph is the sibling `build-the-relationships-and-pacts` plan, and the tick that drives switching is `build-the-simulation-tick-agendas`.

## Todos

- [ ] Add `Bloc` (7 authored: Press/Political-Machine/Organized-Crime/Unorganized-Crime/Law-Enforcement/Reform-Civic/Business-Industry) + `subFactionOf` on `Faction` in `types.ts`
- [ ] Add `Allegiance` `{ actorId, factionId, strength, public, secret, role, since }` + append-only `AllegianceHistory`
- [ ] Migrate authored `Person.factionId` / `FactionMember` into seed `Allegiance` ties (back-compat shim)
- [ ] Add the incentive model: `switchScore = incentive(material/power/survival/coercion/loyalty) - cost(bonds/fear/reputation)`
- [ ] Implement `evaluateAllegiance(actor)` -> flips/forms a tie when `switchScore` crosses the threshold (public or secret)
- [ ] Add bloc-membership fluidity: a sub-faction's bloc can change as its character crosses (organize / fall out)
- [ ] Expose `world.blocs` / `world.factions` / `actorAllegiances(id)` query helpers
- [ ] Assign the existing authored newspapers/gangs/parties to blocs in `src/engine/world/`
- [ ] Keep `faction-tension-systems` Standing/Heat reading the new model via an adapter (not a rewrite)
- [ ] Add tests: portfolio queries, secret vs public ties, the switch threshold, bloc fluidity, determinism
- [ ] Verify: `npm run typecheck` + `npm test`; the existing faction tests stay green

## Notes

**Allegiance, not membership (GCD §2.5).** Replace single `factionId` with a **portfolio**: an actor holds several ties, each `strength` + `public|secret` + `role` + an append-only history (so the sim can answer "who did this person serve in 1931?" — essential for cold cases). A bought cop = `public: Law Enforcement (strong)` + `secret: a gang (growing)`; uncovering the secret tie breaks a record open later.

**The switch rule is the whole engine.** An actor defects when `incentive - cost` crosses a threshold. Incentives: material (money/cut/job), power (rank/territory/appointment), survival (flip to whoever's winning), coercion (blackmail), loyalty (kin/neighborhood/omerta/grudge). Costs: bonds, fear of retaliation, reputation. This one rule yields witness-flipping (the player raises incentive + offers protection to cut fear), corruption (a faction buys a secret tie), moles (secret != public), and defection cascades (a losing faction bleeds members). Killing a snitch *raises everyone's switching cost* — emergent omerta.

**Extends the built system.** Do NOT discard `faction-tension-systems` (Standing/Heat/web) or `faction-requests-contacts-provenance` (requests/provenance/contacts); they become consumers via an adapter. Determinism: seed-derived (mulberry32); allegiance evaluation is pure + reproducible.

**assist-project:** fct_2fbede949a8d (autonomous society-sim), fct_368b273e0ae0 (v2.0 pivot).
