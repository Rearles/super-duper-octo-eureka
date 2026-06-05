// The public read-model (CQRS) + Go Public (surface plan, GCD §2.3/§6.1). The
// write side is the full Registry (hidden fidelity and all); the public READ side
// projects only PUBLISHED records — what the city sees, distinct from the
// detective's deeper, clearance-gated access. Going public is a consequential
// lever: a low-rigor press can re-distort even a true record on the way out, and
// every faction reacts to what's made public (rippled through the relationship
// graph). At the DB this read-model is a published-only projection enforced by
// Postgres RLS (prisma/postgres/rls.sql). Pure + deterministic.
import { distortClaims, type Author } from "./procgen/contract";
import { rippleThroughRelationships } from "./diplomacy";
import type { CaseRecord, Relationship } from "./types";

/** The CQRS public read-model: only PUBLISHED records (the detective sees more). */
export function publicProjection(
  records: CaseRecord[],
  publishedIds: ReadonlySet<string>,
): CaseRecord[] {
  return records.filter((r) => publishedIds.has(r.id));
}

/** Go Public: add a record to the published set. Irreversible in the world's memory (Pillar 4). */
export function goPublic(published: ReadonlySet<string>, recordId: string): Set<string> {
  return new Set([...published, recordId]);
}

/**
 * Publishing routes a record through a paper; a low-rigor (yellow) press can
 * RE-DISTORT even a true record on the way out — the exposé carries the paper's
 * fidelity. Returns the public-facing version.
 */
export function publishThroughPress(record: CaseRecord, press: Author): CaseRecord {
  const { claims, distortion } = distortClaims({ claims: record.claims }, press);
  return { ...record, claims, fidelity: distortion.fidelity, title: `${record.title} (as published)` };
}

/**
 * Going public is a lever, not a switch (§6.1): every faction reacts to what's made
 * public per its relationship to the exposed party — allies of the exposed cool,
 * rivals warm and heat up. The player triggers the cascade but can't fully control it.
 */
export function reactionsToPublication(
  rels: Relationship[],
  exposedFactionId: string,
): Array<{ factionId: string; standingDelta: number; heatDelta: number }> {
  return rippleThroughRelationships(rels, exposedFactionId, -1);
}
