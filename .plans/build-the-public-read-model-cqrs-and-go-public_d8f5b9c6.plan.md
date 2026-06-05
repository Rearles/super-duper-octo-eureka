---
title: "Build the public read-model (CQRS) and the Go Public mechanic"
type: "feature"
created: "2026-06-04"
status: complete
related: ["migrate-the-registry-database-from-sqlite-to-postgres_38b4da91.plan.md", "add-the-registry-access-tiers-tamper-evident-audit-and-publication-layer_298f7bb1.plan.md", "faction-tension-systems_4b95a4c5.plan.md"]
---

# Build the public read-model (CQRS) + Go Public

## Context

The public face of the Registry (GCD §2.3/§6.1, v2.0). A **CQRS** read-model projects the *public* (distorted, published) view of the Registry — distinct from the detective's deeper, clearance-gated access — and the **Go Public** action publishes a record into it, triggering the faction reactions the built `faction-tension-systems` already models. Going public is a consequential act: the press runs exposes (true or not), the powerful retaliate or reposition, the public shifts; it can crack OR harden an obstruction, and factions act ONLY on what the player makes public (agency preserved, Pillar 2). Depends on the Postgres migration (RLS + projections), the governance Go-Public route, and the faction reaction engine.

## Todos

- [ ] Define the public read-model projection (published records only) separate from the write side (CQRS)
- [ ] Build the projection updater: publishing a record materializes it into the public view
- [ ] Gate `Go Public` by role/clearance (reuse the governance route) + write back to the Registry
- [ ] Wire publishing to the faction reaction engine: every faction reacts to what is made public (§6.1)
- [ ] Apply press distortion on publish (an exposed fact can be re-distorted by a yellow paper — fidelity applies)
- [ ] Model public vs. private divergence: the detective sees more than the public read-model shows
- [ ] Use Postgres RLS so the public projection physically cannot expose gated content
- [ ] Surface the public view + the publish action + resulting faction shifts in the UI
- [ ] Add tests: publish -> projection update, role gating, faction reactions fire, RLS blocks gated content
- [ ] Verify: `npm run typecheck` + `npm test`

## Notes

**CQRS — two views of one truth.** The write side is the full Registry (with hidden fidelity); the read side is the **public** projection of what's been published; the detective's clearance-gated reads are a third, deeper view. Publishing moves a record from private to public and is irreversible in the world's memory (Pillar 4).

**Go Public is a lever, not a switch (§6.1).** Every faction reacts to published info per its interests; the press can distort the expose (apply the record fidelity model on publish); resolving one obstruction can inflame another. Factions act ONLY on what the player makes public — the player triggers the cascade but cannot fully control it.

**RLS is the hard boundary.** The public read-model is enforced by Postgres Row-Level Security (from the migration), so gated content cannot leak into the public projection even via a query bug — defense in depth over the API checks.

**assist-project:** fct_c9ebf6bea613 (Postgres RLS / CQRS server tier), fct_368b273e0ae0 (v2.0 pivot).
