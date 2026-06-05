// Analysis tools — the §2.3 raw-data aids that REVEAL / COMPARE / LIST but never
// interpret or flag a conclusion (Pillar 2). These run over the in-memory graph
// (records, the historized allegiance ledger, the relationship graph). At scale on
// Postgres they map to Apache AGE openCypher traversals + a tsvector full-text
// index (deferred — AGE needs the apache/age image; see prisma/postgres/README).
// Pure + deterministic.
import type { AllegianceChange, CaseRecord, Relationship } from "./types";

/**
 * Every document that mentions an entity — in a claim (subject/object), as the
 * record's source, or as a lead. The "list every document mentioning X" tool. It
 * lists; it never says what the mentions MEAN.
 */
export function documentsMentioning(records: CaseRecord[], entityId: string): CaseRecord[] {
  return records.filter(
    (r) =>
      r.source === entityId ||
      r.leads.includes(entityId) ||
      r.claims.some((c) => c.subject === entityId || c.object === entityId),
  );
}

/**
 * Token search over record titles + claim/clue text (every term must appear). The
 * always-available analog of the Postgres tsvector full-text index. Returns the
 * matching records; the player reads them.
 */
export function searchRecords(records: CaseRecord[], query: string): CaseRecord[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  const haystack = (r: CaseRecord): string =>
    [r.title, ...r.claims.map((c) => c.text), ...(r.clues ?? []).map((c) => c.text)]
      .join(" ")
      .toLowerCase();
  return records.filter((r) => {
    const h = haystack(r);
    return terms.every((t) => h.includes(t));
  });
}

/**
 * An actor's defection chain — their allegiance changes over time, in order
 * ("who served whom in 1931"). Over the append-only AllegianceChange ledger; the
 * graph traversal AGE would do over historized allegiance edges.
 */
export function defectionChain(history: AllegianceChange[], actorId: string): AllegianceChange[] {
  return history.filter((h) => h.actorId === actorId).sort((a, b) => (a.at < b.at ? -1 : 1));
}

/**
 * Shortest chain of factions connecting two factions through relationship edges
 * (any stance) — the multi-hop graph traversal (BFS) AGE/Cypher would run. Empty
 * if unconnected.
 */
export function relationshipPath(rels: Relationship[], a: string, b: string): string[] {
  if (a === b) return [a];
  const adj = new Map<string, Set<string>>();
  const link = (x: string, y: string): void => {
    if (!adj.has(x)) adj.set(x, new Set());
    adj.get(x)!.add(y);
  };
  for (const r of rels) {
    link(r.aId, r.bId);
    link(r.bId, r.aId);
  }
  const queue: string[][] = [[a]];
  const seen = new Set<string>([a]);
  while (queue.length > 0) {
    const path = queue.shift()!;
    const last = path[path.length - 1]!;
    for (const next of adj.get(last) ?? []) {
      if (seen.has(next)) continue;
      const extended = [...path, next];
      if (next === b) return extended;
      seen.add(next);
      queue.push(extended);
    }
  }
  return [];
}
