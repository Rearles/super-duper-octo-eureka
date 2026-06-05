---
title: "Build record decay, active cover-up, and the observer effect"
type: "feature"
created: "2026-06-04"
status: complete
related: ["build-the-event-to-record-pipeline-ground-truth-and-case-lifecycle_f4b1d5e2.plan.md", "add-the-registry-access-tiers-tamper-evident-audit-and-publication-layer_298f7bb1.plan.md", "build-the-procgen-v2-framework-lazy-realization-tiered-solvability_b3e8d4a1.plan.md"]
---

# Build record decay, cover-up & the observer effect

## Context

The entropy layer that makes the trail go cold (GCD §3.2/§3.3, v2.0). Two pressures degrade the record over in-world time: **passive decay** (witnesses age then die; physical evidence degrades; records fade), tracked as `freshness`/`recoverability` on each Clue/Claim/Evidence; and **active cover-up** — when investigating a case raises its **Heat**, the guilty faction *reads that Heat through the audit log* (the sensor net) and responds by destroying/sealing records, fabricating a competing story, or intimidating a witness. The act of looking degrades the trail (the observer effect). Depends on the event-to-record pipeline (what decays), the governance audit log (the sensor), and the procgen-v2 recoverability model.

## Todos

- [ ] Add `freshness`/`recoverability` to Clue/Claim/Evidence, decaying on the in-world clock
- [ ] Implement passive decay: witnesses age -> memory fidelity drops -> death (record becomes unobtainable)
- [ ] Implement evidence/record degradation (chain-of-custody gaps widen into "lost"; records fade)
- [ ] Read **Heat** from the audit-log sensor net: a case's accumulated views/edits/official acts
- [ ] Implement **active cover-up** a guilty faction takes when Heat crosses a threshold (destroy/seal/fabricate/intimidate)
- [ ] Implement **targeted** cover-up/decay for White-Whale cases (erode the load-bearing link, keep the rest rich)
- [ ] Keep the engagement floor under decay: re-run `classifyDetermination`; never decay a case to blank
- [ ] Add player counter-play hooks: corroborate quietly, or Go Public before a fact is buried
- [ ] Add tests: passive decay over time, Heat-triggered cover-up, observer effect, floor preserved
- [ ] Verify: `npm run typecheck` + `npm test`

## Notes

**The observer effect (the elegant loop).** Investigating raises Heat; the guilty faction senses it via the **audit log** (every record pulled / witness seen is a logged event a watching faction can read) and actively covers tracks. So looking degrades the trail — counter-play is to corroborate quietly before going overt, and to use the press to force a fact into the open before it can be buried. The audit log thus serves governance AND gameplay (the sensor net).

**Two ways to play, one engine.** Old cold cases are archaeology (reconstruct from degraded remains); live cases are a race (solve before they cool). Same decay model, two tempos.

**Never a blank wall (Pillar 1).** Decay + cover-up are bounded by the engagement floor: re-classify after each degradation; if a case would drop below "reachable best theory", preserve a load-bearing clue or re-seed. Underdetermined is allowed; blank is not.

**assist-project:** fct_2fbede949a8d (factions drive cover-up via the sensor net), fct_368b273e0ae0 (v2.0 pivot).
