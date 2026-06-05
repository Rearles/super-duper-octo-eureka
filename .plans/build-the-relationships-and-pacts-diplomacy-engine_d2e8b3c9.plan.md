---
title: "Build the relationships & pacts diplomacy engine (the living faction web)"
type: "feature"
created: "2026-06-04"
status: complete
related: ["build-the-faction-and-allegiance-model_c1f7a2b8.plan.md", "faction-tension-systems_4b95a4c5.plan.md", "build-the-simulation-tick-agendas-and-incentive-engine_e3a9c4d1.plan.md"]
---

# Build the relationships & pacts diplomacy engine

## Context

The inter-faction diplomacy layer of the society-sim (GCD §2.5). Generalizes the built **ally/rival web** (`faction-tension-systems`) into a live graph: any two factions — **across OR within a bloc** — carry a relationship + trust + a grievance ledger, and **Pacts** are first-class temporal objects that **form, strain, renegotiate, and break** over sim ticks. The Organized vs Unorganized turf war and its shifting understandings *emerge* here rather than being scripted. Depends on the faction & allegiance model; the tick that re-evaluates pacts each step is `build-the-simulation-tick-agendas`.

## Todos

- [ ] Add `Relationship` `{ aId, bId, disposition: allied|aligned|neutral|rival|at-war, trust }` for any faction pair (incl. intra-bloc)
- [ ] Add a `Grievance` ledger `{ wrongedId, byId, kind, when, weight }` feeding trust + future reactions
- [ ] Add `Pact` `{ id, type: non-aggression|territory|tribute|alliance|ceasefire|protection, parties[], terms, formedAt, status, stability }`
- [ ] Implement `evaluatePact(pact, world)` -> hold / strain / renegotiate / break, from power balance + agendas + grievances
- [ ] Implement pact **formation**: factions with a shared threat or aligned interest propose/accept a pact
- [ ] Implement **betrayal** cascades: a break collapses trust, adds grievances, and ripples to allies/rivals
- [ ] Generalize the existing `applyInterFactionWeb` ripple to read the new relationship graph (adapter)
- [ ] Model territory as zones with a controlling faction over time (what the pacts/wars are about)
- [ ] Expose `relationship(a,b)`, `pactsInvolving(id)`, `factionsAtWarWith(id)` query helpers
- [ ] Add tests: pact lifecycle, betrayal ripple, intra-bloc rivalry, Org-vs-Unorg turf emergence, determinism
- [ ] Verify: `npm run typecheck` + `npm test`

## Notes

**A graph, not a table (GCD §2.5).** Relationships + pacts are edges over the full faction set, queryable later via Apache AGE (the migration plan enables it). "Across OR within a bloc" is load-bearing — two Organized-Crime crews can be at war while both are "Organized Crime"; the bloc is an affiliation, not solidarity.

**Pacts are temporal + emergent.** Each tick re-scores every active pact's `stability` against the current power balance, agendas, and grievances -> it holds, strains, renegotiates, or breaks; new pacts form between factions with aligned short-term interest or a mutual threat. Betrayal is a high-consequence event (trust collapse + realignment + retaliatory violence that emits records).

**Territory ties to Location/zones.** Stealing turf = a zone changing controlling-faction over time; because it's ~1950 looking back, a cold-case location may have changed hands repeatedly — *who held the turf (and the local cops) at the time of the crime* is itself a deduction.

**assist-project:** fct_2fbede949a8d (autonomous society-sim), fct_368b273e0ae0 (v2.0 pivot).
