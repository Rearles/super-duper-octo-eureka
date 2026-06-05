// The detective: integrity, leverage & flipping (society-sim plan 6, GCD §2.4 v2.0).
// The player is INSIDE the allegiance system — an actor with a portfolio and an
// Integrity axis. He flips witnesses/officials by stacking incentive AND offering
// protection (cutting their fear); factions flip HIM (advancement, bribes, threats
// to kin); leverage (debts/favors/blackmail) is a symmetric currency; and once
// compromised, his OWN filings carry hidden fidelity (he can bury findings) while
// the audit-log sensor net catches his compromising acts. Integrity is a
// liability/leverage axis, NOT a moral grade (§2.4). Pure + deterministic.
import { evaluateAllegiance, type Costs, type Incentives, type AllegianceDecision } from "./allegiance";
import { fidelityFromAuthor } from "./procgen/contract";
import type { Allegiance, Fidelity } from "./types";

export type IntegrityState = "clean" | "compromised" | "owned";

/** Map the 0..1 integrity value to a branching state. Not a score — a liability tier. */
export function integrityState(integrity: number): IntegrityState {
  if (integrity >= 0.7) return "clean";
  if (integrity >= 0.3) return "compromised";
  return "owned";
}

export type LeverageKind = "debt" | "favor" | "blackmail";

/** Leverage one party holds over another — symmetric currency for flipping. */
export interface Leverage {
  holderId: string;
  overId: string;
  kind: LeverageKind;
  weight: number;
  note?: string;
}

export interface Detective {
  id: string;
  /** 0 (owned) .. 1 (clean) */
  integrity: number;
  allegiances: Allegiance[];
  /** leverage the detective holds over others (to flip them) */
  leverageHeld: Leverage[];
  /** leverage others hold over the detective (to flip him) */
  leverageOwed: Leverage[];
}

export function newDetective(id: string): Detective {
  return { id, integrity: 1, allegiances: [], leverageHeld: [], leverageOwed: [] };
}

/**
 * The detective flips a witness/official: the SAME incentive engine, but to turn
 * someone you must both raise incentive AND lower their cost — offering protection
 * cuts their fear of retaliation. Returns the allegiance decision.
 */
export function flipActor(opts: {
  targetId: string;
  toFactionId: string;
  incentives: Incentives;
  targetFear: number;
  offerProtection: boolean;
  at: string;
}): AllegianceDecision {
  const fear = opts.offerProtection ? Math.max(0, opts.targetFear - 2) : opts.targetFear;
  return evaluateAllegiance({
    actorId: opts.targetId,
    targetFactionId: opts.toFactionId,
    incentives: opts.incentives,
    costs: { bonds: 1, fear, reputation: 0 },
    secret: true,
    at: opts.at,
  });
}

export interface CoOptOffer {
  factionId: string;
  incentives: Incentives;
  /** a threat to kin adds coercion */
  threatToKin?: boolean;
  at: string;
}

/**
 * A faction tries to co-opt the detective (advancement / bribe / threat). His cost
 * to turn is his own integrity (bonds + reputation); a threat to kin adds coercion.
 * Accepting lowers his integrity, forms a SECRET tie, and hands the faction leverage
 * over him.
 */
export function coOptDetective(
  detective: Detective,
  offer: CoOptOffer,
): { detective: Detective; accepted: boolean; note: string } {
  const costs: Costs = { bonds: detective.integrity * 2, fear: 0, reputation: detective.integrity };
  const incentives: Incentives = offer.threatToKin
    ? { ...offer.incentives, coercion: offer.incentives.coercion + 2 }
    : offer.incentives;
  const decision = evaluateAllegiance({
    actorId: detective.id,
    targetFactionId: offer.factionId,
    incentives,
    costs,
    secret: true,
    at: offer.at,
  });
  if (!decision.switched || !decision.tie) {
    return { detective, accepted: false, note: "The detective turns the offer down." };
  }
  const integrity = Math.max(0, Number((detective.integrity - 0.4).toFixed(3)));
  const owed: Leverage = {
    holderId: offer.factionId,
    overId: detective.id,
    kind: offer.threatToKin ? "blackmail" : "debt",
    weight: 2,
    note: "the detective took the deal",
  };
  return {
    detective: {
      ...detective,
      integrity,
      allegiances: [...detective.allegiances, decision.tie],
      leverageOwed: [...detective.leverageOwed, owed],
    },
    accepted: true,
    note: "The detective takes the deal — and is now owed.",
  };
}

/** A compromised detective's own filings carry hidden fidelity (he can bury findings). */
export function filingFidelity(detective: Detective): Fidelity {
  return fidelityFromAuthor(detective.integrity);
}

/** A compromising act the detective takes — itself a logged, readable audit event. */
export interface AuditableAct {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  note: string;
}

export function compromisingActToAudit(
  detective: Detective,
  act: { kind: string; targetId: string },
): AuditableAct {
  return {
    actorId: detective.id,
    action: `compromise:${act.kind}`,
    targetType: "detective",
    targetId: act.targetId,
    note: `${detective.id} ${act.kind} (integrity ${detective.integrity})`,
  };
}

/** A faction that catches a compromising act in the audit log gains leverage. */
export function leverageFromCaughtAct(factionId: string, detectiveId: string): Leverage {
  return {
    holderId: factionId,
    overId: detectiveId,
    kind: "blackmail",
    weight: 2,
    note: "caught a compromising act in the audit log",
  };
}

export type Ending = "crusader" | "owned" | "burned-out";

/**
 * Branching ending gated on the detective's Integrity state + accumulated reform/
 * civic standing — NOT a moral grade (§2.4): "owned" isn't "losing", it's a
 * different ending, and the corrupt path stays genuinely powerful.
 */
export function ending(detective: Detective, reformStanding: number): Ending {
  const state = integrityState(detective.integrity);
  if (state === "owned") return "owned";
  if (state === "clean" && reformStanding > 0) return "crusader";
  return "burned-out";
}
