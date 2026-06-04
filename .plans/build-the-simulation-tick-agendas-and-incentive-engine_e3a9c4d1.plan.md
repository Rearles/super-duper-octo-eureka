---
title: "Build the simulation tick, faction agendas, and the incentive engine"
type: "feature"
created: "2026-06-04"
status: not-started
related: ["build-the-faction-and-allegiance-model_c1f7a2b8.plan.md", "build-the-relationships-and-pacts-diplomacy-engine_d2e8b3c9.plan.md", "build-the-event-to-record-pipeline-ground-truth-and-case-lifecycle_f4b1d5e2.plan.md"]
---

# Build the simulation tick, agendas & incentive engine

## Context

The clock of the society-sim: a deterministic **tick** that advances in-world time and, each step, lets every faction pursue its **agenda** via a per-bloc **action repertoire**, drives **allegiance switching** (the incentive engine) and **pact re-evaluation**, and updates world state (territory, resources, Standing/Heat, membership — deaths, promotions). This turns the static faction+pact data into a living history. It does NOT itself emit records — that is the sibling `event-to-record-pipeline` plan, which the tick calls. Runs in two phases off one seed: historical generation (1920s -> ~1950) then live play.

## Todos

- [ ] Add a deterministic `tick(world, clock)` advancing the in-world calendar a step
- [ ] Add per-faction `Agenda` (expand rackets / hold wards / chase circulation / pursue indictments / ...)
- [ ] Define per-bloc **action repertoires** (crime: muscle/bribe/intimidate; machine: appoint/quash/rig; press: investigate/publish/smear; ...)
- [ ] Implement action selection: each tick a faction scores its repertoire against agenda + state, picks
- [ ] Drive `evaluateAllegiance` (incentive engine) + `evaluatePact` each tick (defections, pact churn)
- [ ] Apply state deltas: territory, resources, Standing/Heat, membership (deaths, promotions up the hierarchy)
- [ ] Add the **calendar / scheduled-consequence** queue (GCD §3.3 — actions schedule future world events deterministically)
- [ ] Bound live consequence-threads + guarantee each scheduled event eventually surfaces (GCD §3.3)
- [ ] Add a coarse/cheap mode for historical generation; fine detail realizes lazily on touch (procgen-v2 contract)
- [ ] Expose `runHistory(seed, fromYear, toYear)` and `step(world)` for live play
- [ ] Add tests: determinism (same seed -> same history), agenda->action, defection under incentive, calendar surfacing
- [ ] Verify: `npm run typecheck` + `npm test`

## Notes

**Two phases, one engine.** `runHistory` simulates the 1920s -> ~1950 to produce the cold-case backlog + the current faction map; `step` continues it live during play. Same deterministic tick; the only difference is granularity (history is coarse; live play realizes detail on touch — see the procgen-v2 lazy-realization contract).

**Agendas make it emergent, not scripted.** A gang wants territory + to eliminate rivals; the machine wants wards + graft + to neutralize reformers; a paper wants circulation (rigorously or yellow). Actions fall out of agenda x state, so gang wars, machine purges, and circulation battles emerge.

**Calendar / delayed consequences (GCD §3.3/§11.3).** Actions (and the player's verdicts/official acts) schedule future events on a variable-latency clock; the tick surfaces them. Keep latency *causal* (tied to in-world triggers), bound live threads, and guarantee legible surfacing via the Decision Ledger.

**assist-project:** fct_2fbede949a8d (autonomous society-sim), fct_368b273e0ae0 (v2.0 pivot).
