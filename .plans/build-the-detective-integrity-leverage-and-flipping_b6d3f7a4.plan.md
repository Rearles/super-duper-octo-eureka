---
title: "Build the detective's integrity, leverage, and the flip mechanic"
type: "feature"
created: "2026-06-04"
status: complete
related: ["build-the-faction-and-allegiance-model_c1f7a2b8.plan.md", "build-the-event-to-record-pipeline-ground-truth-and-case-lifecycle_f4b1d5e2.plan.md", "faction-tension-systems_4b95a4c5.plan.md"]
---

# Build the detective: integrity, leverage & flipping

## Context

Put the player INSIDE the allegiance system (GCD §2.4 v2.0). The detective is just another actor with an **Allegiance portfolio** and an explicit **Integrity** axis: he can flip witnesses/officials by stacking incentive + offering protection, factions can flip HIM (co-opt / threaten), and **leverage** (debts, favors, blackmail) is a symmetric currency both ways. A compromised detective becomes a distortion source in his own filings. Integrity is a liability/leverage dimension, NOT a virtue score. Depends on the faction & allegiance model (the shared switch rule), the event-to-record pipeline (his filings become records), and the built faction-tension Standing/Heat.

## Todos

- [ ] Add the detective as an actor with an `Allegiance` portfolio + an `Integrity` value (clean -> compromised -> owned)
- [ ] Implement the **flip** action: stack incentive + lower cost (offer protection) to turn a witness/official
- [ ] Implement factions flipping the detective: advancement offers, bribes, threats to kin (the co-opt path)
- [ ] Add **leverage** as a symmetric resource: debts/favors/blackmail he holds AND that factions hold over him
- [ ] Make his official acts/filings carry `fidelity` driven by his Integrity (a compromised detective can bury findings)
- [ ] Surface his compromising acts in the audit log (the sensor net cuts both ways — factions gain leverage)
- [ ] Gate **branching endings** on Integrity state + accumulated faction Standing (crusader / owned / burned-out)
- [ ] Keep §2.4's no-grade rule: Integrity is never shown as a moral score; the corrupt path stays genuinely powerful
- [ ] Add tests: flip succeeds/fails by incentive-cost, the co-opt path, leverage both ways, compromised filings gain fidelity
- [ ] Verify: `npm run typecheck` + `npm test`

## Notes

**The loop closes on the player.** Once the detective can be compromised, his own records inherit his Integrity — he can bury his findings, and the Registry he mines now contains his lies too. Clean is the principled-but-resource-poor path (manufacture public pressure to force indictments — the reformer arc); dirty is powerful-but-entangling (access/money/protection, but owned, and his truths become self-incriminating).

**Leverage is symmetric, and the sensor net watches him.** He gathers blackmail to flip others; factions gather his favors/cut-corners to flip him — and a compromising act is a *logged* event, so a faction that catches him dirty gains leverage. He must cover his own tracks, becoming the thing he hunts.

**Not a karma meter (§2.4).** Integrity tracks how *owned* he is, never how *good*. No optimal value; the corrupt path is a real, powerful option; never display it as a grade. Branching states gate endings without grading morality.

**assist-project:** fct_6aaf3f612bd9 (detective integrity axis), fct_2fbede949a8d (same incentive model as NPC allegiance).
