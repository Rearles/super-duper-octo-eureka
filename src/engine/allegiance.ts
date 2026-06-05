// The faction & actor allegiance model (society-sim plan 1, GCD §2.5 v2.0).
// EXTENDS the built faction system (factions.ts Standing/Heat/web stay intact):
// adds the seven blocs, allegiance as a per-actor PORTFOLIO (public/secret ties),
// and the incentive engine that flips/forms ties when incentive - cost crosses a
// threshold — the one mechanic behind witness-flipping, corruption, moles, and
// defection cascades. Pure + deterministic.
import type { Allegiance, AllegianceChange, AuthoredWorld, Bloc, BlocId, Faction } from "./types";

/** The seven authored blocs the sim is organized into. */
export const BLOCS: Record<BlocId, Bloc> = {
  press: { id: "press", name: "The Press", description: "Newspapers; shapes public pressure." },
  "political-machine": {
    id: "political-machine",
    name: "The Political Machine",
    description: "Ward bosses, patronage, and the courts/coroner it appoints.",
  },
  "organized-crime": {
    id: "organized-crime",
    name: "Organized Crime",
    description: "The disciplined, protected rackets.",
  },
  "unorganized-crime": {
    id: "unorganized-crime",
    name: "Unorganized Crime",
    description: "Upstart crews muscling in on the rackets.",
  },
  "law-enforcement": {
    id: "law-enforcement",
    name: "Law Enforcement",
    description: "The detective's own house — honest cops and bought ones.",
  },
  "reform-civic": {
    id: "reform-civic",
    name: "Reform / Civic",
    description: "Reform prosecutors, leagues, churches, unions — the public-pressure allies.",
  },
  "business-industry": {
    id: "business-industry",
    name: "Business / Industry",
    description: "The franchise barons and trusts who pay the boodle.",
  },
};

export function allBlocs(): Bloc[] {
  return Object.values(BLOCS);
}

/** Factions in a given bloc. */
export function factionsInBloc(world: AuthoredWorld, bloc: BlocId): Faction[] {
  return world.factions.filter((f) => f.bloc === bloc);
}

/**
 * Seed allegiance ties from the authored faction membership (back-compat): every
 * authored member gets a PUBLIC tie to their faction (strength 1, role = title).
 * The bridge from the authored layer to the portfolio model.
 */
export function seedAllegiances(world: AuthoredWorld, at = "0000"): Allegiance[] {
  const ties: Allegiance[] = [];
  for (const f of world.factions) {
    for (const m of f.members) {
      ties.push({
        actorId: m.personId,
        factionId: f.id,
        strength: 1,
        secret: false,
        since: at,
        ...(m.title ? { role: m.title } : {}),
      });
    }
  }
  return ties;
}

/** An actor's allegiance portfolio. */
export function actorAllegiances(ties: Allegiance[], actorId: string): Allegiance[] {
  return ties.filter((t) => t.actorId === actorId);
}

/** An actor's dominant PUBLIC allegiance (highest strength), if any. */
export function publicAllegiance(ties: Allegiance[], actorId: string): Allegiance | undefined {
  return actorAllegiances(ties, actorId)
    .filter((t) => !t.secret)
    .sort((a, b) => b.strength - a.strength)[0];
}

/** An actor's SECRET ties (moles, bought officials) — what the record never shows. */
export function secretAllegiances(ties: Allegiance[], actorId: string): Allegiance[] {
  return actorAllegiances(ties, actorId).filter((t) => t.secret);
}

// --- The incentive engine: switch when incentive - cost crosses a threshold ---

export interface Incentives {
  /** money, a cut, a patronage job */
  material: number;
  /** rank, territory, an appointment */
  power: number;
  /** flip to whoever can keep you alive (esp. when your side is losing) */
  survival: number;
  /** blackmail, threats to kin */
  coercion: number;
  /** conviction, kin/neighborhood ties, omerta, a grudge — pull toward the target */
  loyalty: number;
}

export interface Costs {
  /** bonds to current ties */
  bonds: number;
  /** fear of retaliation for switching (killing snitches raises this for everyone) */
  fear: number;
  /** reputational cost of turning */
  reputation: number;
}

export const SWITCH_THRESHOLD = 1;

/** Net pull toward switching: incentives minus the cost of switching. */
export function switchScore(inc: Incentives, cost: Costs): number {
  const pull = inc.material + inc.power + inc.survival + inc.coercion + inc.loyalty;
  const drag = cost.bonds + cost.fear + cost.reputation;
  return pull - drag;
}

export interface AllegianceDecision {
  switched: boolean;
  score: number;
  tie?: Allegiance;
  change?: AllegianceChange;
}

/**
 * Decide whether an actor forms/flips an allegiance to a target faction. The SAME
 * rule powers the player flipping a witness (raise incentive + offer protection to
 * cut fear), a faction buying an official (a SECRET tie), and bottom-up defection
 * cascades. Pure + deterministic.
 */
export function evaluateAllegiance(opts: {
  actorId: string;
  targetFactionId: string;
  incentives: Incentives;
  costs: Costs;
  secret?: boolean;
  at: string;
  role?: string;
  threshold?: number;
}): AllegianceDecision {
  const score = switchScore(opts.incentives, opts.costs);
  const threshold = opts.threshold ?? SWITCH_THRESHOLD;
  if (score < threshold) return { switched: false, score };
  // strength scales with how decisively the threshold was crossed (capped at 1)
  const strength = Math.max(0.1, Math.min(1, Number((score / (threshold * 3)).toFixed(3))));
  const tie: Allegiance = {
    actorId: opts.actorId,
    factionId: opts.targetFactionId,
    strength,
    secret: opts.secret ?? false,
    since: opts.at,
    ...(opts.role ? { role: opts.role } : {}),
  };
  const change: AllegianceChange = {
    actorId: opts.actorId,
    factionId: opts.targetFactionId,
    kind: "formed",
    at: opts.at,
    note: opts.secret ? "secret tie formed (mole / bought)" : "tie formed",
  };
  return { switched: true, score, tie, change };
}

/**
 * Bloc-membership fluidity: a faction can cross blocs as its character changes (a
 * UC crew that organizes; an outfit that loses discipline). Returns a new faction
 * with the updated bloc.
 */
export function moveFactionToBloc<T extends { bloc?: BlocId }>(faction: T, bloc: BlocId): T {
  return { ...faction, bloc };
}
