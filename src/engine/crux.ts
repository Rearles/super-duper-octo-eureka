// keyFact-driven lie placement (§5.4): the authored `CaseCore.keyFact` names the
// crux the cover-up attacks, and procgen plants the central lie against THAT
// dimension instead of always faking an alibi. This module owns the per-crux
// contract shared by the generator (builds the records), the solver (checks the
// lie implicates the culprit), and the faction layer (its requests assert the
// same contested predicate). Strategy builders live alongside in CRUX_STRATEGIES.

import type { CaseCore, CaseFact, CaseRecord, Claim, Entity, RecordType } from "./types";

/**
 * Per-crux metadata: the contested predicate, the record type that carries the
 * planted lie, and a human label. `predicate` is the canonical axis the lie and
 * its disproof both turn on; for `where`/`when` it encodes the authored time.
 */
export interface CruxDescriptor {
  predicate: (core: CaseCore) => string;
  lieRecord: RecordType;
  label: string;
}

/** The descriptor table — one row per authored crux (lsn: registry over branching). */
export const CRUX: Record<CaseFact, CruxDescriptor> = {
  where: { predicate: (c) => `location@${c.when}`, lieRecord: "witness-statement", label: "a false alibi" },
  who: { predicate: () => "responsible", lieRecord: "witness-statement", label: "a framed innocent" },
  when: { predicate: () => "time-at-scene", lieRecord: "witness-statement", label: "a shifted timeline" },
  how: { predicate: () => "cause", lieRecord: "ruling", label: "a false cause of death" },
  what: { predicate: () => "event", lieRecord: "ruling", label: "no crime at all" },
};

/** The contested predicate for a case's crux. Shared by generator, solver, requests. */
export function cruxPredicate(core: CaseCore): string {
  return (CRUX[core.keyFact] ?? CRUX.where).predicate(core);
}

/**
 * Everything a lie-strategy needs from the generator: the resolved cast + scene,
 * the contested predicate, and a `claim` factory. The generator assembles this
 * (casting witness/framed deterministically) and hands it to the strategy.
 */
export interface CruxContext {
  core: CaseCore;
  culprit: Entity;
  victim: Entity;
  scene: Entity;
  /** procgen-or-authored witness whose statement carries the alibi-style lie */
  witness: Entity;
  /** the innocent party a who-crux frames (authored preferred); decoy object */
  framed: Entity;
  /** a different place used for a false "elsewhere" alibi */
  elsewhere: Entity;
  /** the witness's phone line (disproof source for the where crux) */
  phone: Entity;
  when: string;
  predicate: string;
  claim: (subject: string, predicate: string, object: string, truthful: boolean, text: string) => Claim;
}

/**
 * What a strategy contributes: the crux-specific records (the lie, its disproof,
 * and a truthful culprit-link the solver keys on), plus the catchable pair.
 */
export interface CruxLie {
  records: CaseRecord[];
  keyContradiction: [string, string];
  predicate: string;
}

/** A lie-placement strategy: builds the crux's records from a context. */
export type CruxStrategy = (ctx: CruxContext) => CruxLie;
