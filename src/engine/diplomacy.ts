// The relationships & pacts diplomacy engine (society-sim plan 2, GCD §2.5).
// Generalizes the built ally/rival web into a live graph over ANY faction pair
// (across OR within a bloc): relationships + trust + a grievance ledger, and
// PACTS as first-class temporal objects that form, strain, break, and get
// betrayed over ticks. Territory is append-only control history. Pure +
// deterministic; factions.ts's applyInterFactionWeb stays — this is the richer
// graph the sim drives.
import type {
  AuthoredWorld,
  Grievance,
  Pact,
  PactStatus,
  PactType,
  Relationship,
  TerritoryControl,
} from "./types";

// --- Relationships ---------------------------------------------------------

/** Seed the relationship graph from authored allies/rivals (deduped, order-insensitive). */
export function seedRelationships(world: AuthoredWorld): Relationship[] {
  const rels: Relationship[] = [];
  const seen = new Set<string>();
  const key = (a: string, b: string): string => [a, b].sort().join("|");
  for (const f of world.factions) {
    for (const ally of f.allies ?? []) {
      if (seen.has(key(f.id, ally))) continue;
      seen.add(key(f.id, ally));
      rels.push({ aId: f.id, bId: ally, stance: "allied", trust: 0.6 });
    }
    for (const rival of f.rivals ?? []) {
      if (seen.has(key(f.id, rival))) continue;
      seen.add(key(f.id, rival));
      rels.push({ aId: f.id, bId: rival, stance: "rival", trust: -0.4 });
    }
  }
  return rels;
}

/** The relationship between two factions (order-insensitive), if any. */
export function relationship(rels: Relationship[], a: string, b: string): Relationship | undefined {
  return rels.find((r) => (r.aId === a && r.bId === b) || (r.aId === b && r.bId === a));
}

/** Factions currently at war with `id`. */
export function factionsAtWarWith(rels: Relationship[], id: string): string[] {
  return rels
    .filter((r) => r.stance === "at-war" && (r.aId === id || r.bId === id))
    .map((r) => (r.aId === id ? r.bId : r.aId));
}

// --- Grievances ------------------------------------------------------------

export function addGrievance(ledger: Grievance[], g: Grievance): Grievance[] {
  return [...ledger, g];
}

/** Total grievance weight between two factions (either direction). */
export function grievanceWeight(ledger: Grievance[], a: string, b: string): number {
  return ledger
    .filter((g) => (g.wrongedId === a && g.byId === b) || (g.wrongedId === b && g.byId === a))
    .reduce((sum, g) => sum + g.weight, 0);
}

// --- Pacts -----------------------------------------------------------------

export function formPact(opts: {
  id: string;
  type: PactType;
  parties: string[];
  at: string;
  terms?: string;
  stability?: number;
}): Pact {
  return {
    id: opts.id,
    type: opts.type,
    parties: [...opts.parties],
    formedAt: opts.at,
    status: "active",
    stability: opts.stability ?? 0.8,
    ...(opts.terms ? { terms: opts.terms } : {}),
  };
}

export function pactsInvolving(pacts: Pact[], id: string): Pact[] {
  return pacts.filter((p) => p.parties.includes(id));
}

/**
 * Re-evaluate a pact for one tick: stability erodes with grievances between the
 * parties and the power imbalance that tempts the stronger to defect. Crosses
 * into strained, then broken. Deterministic.
 */
export function evaluatePact(
  pact: Pact,
  opts: { grievance?: number; powerImbalance?: number } = {},
): Pact {
  const erosion = (opts.grievance ?? 0) * 0.2 + (opts.powerImbalance ?? 0) * 0.15;
  const stability = Math.max(0, Math.min(1, Number((pact.stability - erosion).toFixed(3))));
  const status: PactStatus = stability <= 0.2 ? "broken" : stability <= 0.5 ? "strained" : "active";
  return { ...pact, stability, status };
}

/**
 * A betrayal: one party breaks the pact. Cascade — the pact is marked betrayed, a
 * heavy grievance is logged for the wronged parties, and their relationship turns
 * to war with zero trust. (The sim ripples this outward via the web.)
 */
export function betray(
  pact: Pact,
  betrayerId: string,
  at: string,
): { pact: Pact; grievances: Grievance[]; warStances: Relationship[] } {
  const victims = pact.parties.filter((p) => p !== betrayerId);
  const grievances: Grievance[] = victims.map((v) => ({
    wrongedId: v,
    byId: betrayerId,
    kind: `betrayed a ${pact.type} pact`,
    when: at,
    weight: 3,
  }));
  const warStances: Relationship[] = victims.map((v) => ({
    aId: betrayerId,
    bId: v,
    stance: "at-war",
    trust: 0,
  }));
  return { pact: { ...pact, status: "betrayed", stability: 0 }, grievances, warStances };
}

// --- Territory (append-only control over time) -----------------------------

/** Who controlled a zone at a given in-world time (the latest control on or before it). */
export function controllerOf(
  history: TerritoryControl[],
  zoneId: string,
  at: string,
): string | undefined {
  return history
    .filter((t) => t.zoneId === zoneId && t.since <= at)
    .sort((a, b) => (a.since < b.since ? 1 : -1))[0]?.factionId;
}

/** Record a turf change (append-only — the historical control map a cold case needs). */
export function transferTerritory(
  history: TerritoryControl[],
  zoneId: string,
  toFactionId: string,
  at: string,
): TerritoryControl[] {
  return [...history, { zoneId, factionId: toFactionId, since: at }];
}

// --- Relationship-graph ripple (generalizes applyInterFactionWeb) ----------

/**
 * Ripple a standing shift through the relationship graph: allies move the same way,
 * rivals/enemies the opposite (and heat up when the source is helped). The richer,
 * graph-driven version of factions.ts's authored-web ripple.
 */
export function rippleThroughRelationships(
  rels: Relationship[],
  sourceId: string,
  sign: number,
): Array<{ factionId: string; standingDelta: number; heatDelta: number }> {
  const out: Array<{ factionId: string; standingDelta: number; heatDelta: number }> = [];
  for (const r of rels) {
    const other = r.aId === sourceId ? r.bId : r.bId === sourceId ? r.aId : null;
    if (!other) continue;
    if (r.stance === "allied" || r.stance === "aligned") {
      out.push({ factionId: other, standingDelta: sign, heatDelta: 0 });
    } else if (r.stance === "rival" || r.stance === "at-war") {
      out.push({ factionId: other, standingDelta: -sign, heatDelta: sign > 0 ? 1 : 0 });
    }
  }
  return out;
}
