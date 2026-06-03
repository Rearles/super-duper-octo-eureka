// keyFact-driven lie placement (§5.4): the authored `CaseCore.keyFact` names the
// crux the cover-up attacks, and procgen plants the central lie against THAT
// dimension instead of always faking an alibi. This module owns the per-crux
// contract shared by the generator (builds the records), the solver (checks the
// lie implicates the culprit), and the faction layer (its requests assert the
// same contested predicate). Strategy builders live alongside in CRUX_STRATEGIES.

import type { CaseCore, CaseFact, CaseRecord, Claim, Clue, Entity, Fidelity, GameCase, RecordType } from "./types";

/** The four player-facing theory slots (a `what` crux folds into `how`). */
export const THEORY_SLOTS: CaseFact[] = ["who", "where", "when", "how"];

/** The theory slot a crux contests — `what` is presented through the `how` slot. */
export function contestedSlot(core: CaseCore): CaseFact {
  return core.keyFact === "what" ? "how" : core.keyFact;
}

/** Build an atomic player-facing clue (hypothesis-board evidence) for a record + slot. */
export function mkClue(recordId: string, slot: CaseFact, value: string, fidelity: Fidelity, text: string): Clue {
  return { id: `${recordId}__${slot}`, recordId, slot, value, fidelity, text };
}

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
 * The canonical TRUTHFUL claim(s) on the crux predicate — the ground truth the
 * lie contradicts. Used to seed `GameCase.groundTruth` so faction requests that
 * assert the contested fact verify correctly against reality.
 */
export function cruxTruth(ctx: CruxContext): Claim[] {
  const { culprit, victim, scene, witness, when, predicate, claim, core } = ctx;
  switch (core.keyFact) {
    case "who":
      return [claim(victim.id, predicate, culprit.id, true, `${culprit.name} is responsible for ${victim.name}'s death.`)];
    case "how":
    case "what":
      return [claim(victim.id, predicate, "homicide", true, `${victim.name}'s death was a homicide, not natural or accidental.`)];
    case "when":
      return [claim(culprit.id, predicate, when, true, `${culprit.name} was at ${scene.name} at ${when}.`)];
    case "where":
    default:
      return [
        claim(culprit.id, predicate, scene.id, true, `${culprit.name} was at ${scene.name} at ${when}.`),
        claim(witness.id, predicate, scene.id, true, `${witness.name} was near ${scene.name} at ${when}.`),
      ];
  }
}

/**
 * The crux-appropriate claim a FACTION asserts in its request (§2.5) — the same
 * contested fact the lie turns on, phrased as the faction's `exculpatory` cover
 * story (shielding the culprit) or the true accusation. Verifies against
 * `GameCase.groundTruth` (seeded by `cruxTruth`) so its fidelity resolves
 * correctly for every crux, not just the where/alibi one.
 */
export function factionClaim(gameCase: GameCase, core: CaseCore, exculpatory: boolean): Claim {
  const predicate = (CRUX[core.keyFact] ?? CRUX.where).predicate(core);
  const name = (id: string): string => gameCase.entities[id]?.name ?? id;
  const culpritId = gameCase.solution.culpritId;
  const victimId = core.victimId;
  const sceneId = core.whereId;
  const mk = (s: string, o: string, truthful: boolean, text: string): Claim => ({
    subject: s,
    predicate,
    object: o,
    truthful,
    text,
  });

  switch (core.keyFact) {
    case "who": {
      const framedId =
        Object.entries(gameCase.roles ?? {}).find(([, r]) => r === "person-of-interest")?.[0] ?? culpritId;
      return exculpatory
        ? mk(victimId, framedId, false, `word is ${name(framedId)} did it, not ${name(culpritId)}`)
        : mk(victimId, culpritId, true, `${name(culpritId)} is the one responsible for ${name(victimId)}'s death`);
    }
    case "how":
    case "what":
      return exculpatory
        ? mk(victimId, "natural", false, `it was natural causes — there's no case here`)
        : mk(victimId, "homicide", true, `the ruling is wrong — ${name(victimId)}'s death was a homicide`);
    case "when":
      return exculpatory
        ? mk(culpritId, shiftTime(core.when), false, `${name(culpritId)} was at ${name(sceneId)} at ${shiftTime(core.when)}, not the key hour`)
        : mk(culpritId, core.when, true, `${name(culpritId)} was at ${name(sceneId)} at ${core.when}`);
    case "where":
    default: {
      const elsewhereId = gameCase.entities["across_town"] ? "across_town" : sceneId;
      return exculpatory
        ? mk(culpritId, elsewhereId, false, `${name(culpritId)} was at ${name(elsewhereId)}, not the scene`)
        : mk(culpritId, sceneId, true, `${name(culpritId)} was at ${name(sceneId)} that night`);
    }
  }
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

// --- The five strategies ---------------------------------------------------
//
// Each returns a catchable false/true pair (the `keyContradiction`) on the crux
// `predicate`. WHERE/WHEN name the culprit directly in the false claim (solver
// check #2a). WHO/HOW/WHAT contest a victim-subject fact, so each also emits a
// TRUTHFUL `(culprit, "at-scene", scene)` claim (solver check #2b) so exposing
// the lie still reaches the culprit.

/** Shift a 4-digit clock anchor by +2h (deterministic; for the WHEN false time). */
function shiftTime(when: string): string {
  const n = Number.parseInt(when, 10);
  if (Number.isNaN(n)) return "an earlier hour";
  return (((n + 200) % 2400) + "").padStart(4, "0");
}

/** WHERE — a false alibi places the witness (and culprit) elsewhere; phone logs disprove it. */
function whereLie(ctx: CruxContext): CruxLie {
  const { culprit, witness, scene, elsewhere, phone, when, predicate, claim } = ctx;
  const lie: CaseRecord = {
    id: "rec_witness_stmt",
    type: "witness-statement",
    title: `Statement of ${witness.name}`,
    source: witness.id,
    fidelity: "false",
    claims: [
      claim(witness.id, predicate, elsewhere.id, false, `${witness.name} states they were at ${elsewhere.name} at ${when}.`),
      claim(culprit.id, predicate, elsewhere.id, false, `${witness.name} states ${culprit.name} was with them at ${elsewhere.name} at ${when}.`),
    ],
    clues: [
      mkClue("rec_witness_stmt", "where", elsewhere.id, "false", `${witness.name} swears they and ${culprit.name} were across town at ${elsewhere.name} at ${when}.`),
    ],
    leads: [phone.id, elsewhere.id, culprit.id],
    clearanceCost: 1,
  };
  const disproof: CaseRecord = {
    id: "rec_phone",
    type: "phone-records",
    title: `Telephone records — ${witness.name}`,
    source: witness.id,
    fidelity: "true",
    claims: [
      claim(witness.id, predicate, scene.id, true, `${witness.name}'s line placed a call from beside ${scene.name} at ${when}.`),
    ],
    clues: [
      mkClue("rec_phone", "where", scene.id, "true", `A call from ${witness.name}'s line hit the tower beside ${scene.name} at ${when} — not across town.`),
    ],
    leads: [scene.id],
    clearanceCost: 1,
  };
  return { records: [lie, disproof], keyContradiction: [lie.id, disproof.id], predicate };
}

/** WHO — a statement frames an innocent; forensics tie the culprit, not them. */
function whoLie(ctx: CruxContext): CruxLie {
  const { culprit, victim, framed, witness, scene, predicate, claim } = ctx;
  const lie: CaseRecord = {
    id: "rec_witness_stmt",
    type: "witness-statement",
    title: `Statement of ${witness.name}`,
    source: witness.id,
    fidelity: "false",
    claims: [
      claim(victim.id, predicate, framed.id, false, `${witness.name} names ${framed.name} as the one responsible for ${victim.name}'s death.`),
    ],
    clues: [
      mkClue("rec_witness_stmt", "who", framed.id, "false", `${witness.name}'s statement puts ${framed.name} behind the wheel.`),
    ],
    leads: [framed.id, scene.id],
    clearanceCost: 1,
  };
  const disproof: CaseRecord = {
    id: "rec_forensic",
    type: "property-record",
    title: `Forensic reconstruction — ${scene.name}`,
    source: scene.id,
    fidelity: "true",
    claims: [
      claim(victim.id, predicate, culprit.id, true, `Physical evidence ties ${culprit.name}, not ${framed.name}, to ${victim.name}'s death.`),
      claim(culprit.id, "at-scene", scene.id, true, `${culprit.name} was placed at ${scene.name}.`),
    ],
    clues: [
      mkClue("rec_forensic", "who", culprit.id, "true", `Tread marks show the car was stopped at impact — no accident; a partial print on the gearshift matches ${culprit.name}.`),
    ],
    leads: [culprit.id, scene.id],
    clearanceCost: 1,
  };
  return { records: [lie, disproof], keyContradiction: [lie.id, disproof.id], predicate };
}

/** WHEN — a statement shifts the culprit's time at the scene; phone pings fix the real time. */
function whenLie(ctx: CruxContext): CruxLie {
  const { culprit, witness, scene, phone, when, predicate, claim } = ctx;
  const falseTime = shiftTime(when);
  const lie: CaseRecord = {
    id: "rec_witness_stmt",
    type: "witness-statement",
    title: `Statement of ${witness.name}`,
    source: witness.id,
    fidelity: "false",
    claims: [
      claim(culprit.id, predicate, falseTime, false, `${witness.name} places ${culprit.name} at ${scene.name} at ${falseTime}, not ${when}.`),
    ],
    clues: [
      mkClue("rec_witness_stmt", "when", falseTime, "false", `${witness.name} places ${culprit.name} at ${scene.name} at ${falseTime}.`),
    ],
    leads: [phone.id, culprit.id],
    clearanceCost: 1,
  };
  const disproof: CaseRecord = {
    id: "rec_phone",
    type: "phone-records",
    title: `Telephone records — ${culprit.name}`,
    source: culprit.id,
    fidelity: "true",
    claims: [
      claim(culprit.id, predicate, when, true, `${culprit.name}'s line pinged the tower beside ${scene.name} at ${when}.`),
    ],
    clues: [
      mkClue("rec_phone", "when", when, "true", `${culprit.name}'s line pinged the tower beside ${scene.name} at ${when}.`),
    ],
    leads: [scene.id],
    clearanceCost: 1,
  };
  return { records: [lie, disproof], keyContradiction: [lie.id, disproof.id], predicate };
}

/** HOW — a coroner's ruling calls it natural; a re-examination autopsy reveals the method. */
function howLie(ctx: CruxContext): CruxLie {
  const { culprit, victim, scene, core, predicate, claim } = ctx;
  const lie: CaseRecord = {
    id: "rec_ruling",
    type: "ruling",
    title: `Coroner's ruling — ${victim.name}`,
    source: victim.id,
    fidelity: "false",
    claims: [
      claim(victim.id, predicate, "natural", false, `${victim.name}'s death was ruled natural causes.`),
    ],
    clues: [
      mkClue("rec_ruling", "how", "natural", "false", `The coroner's ruling reads: natural causes.`),
    ],
    leads: [scene.id],
    clearanceCost: 1,
  };
  const disproof: CaseRecord = {
    id: "rec_autopsy",
    type: "autopsy",
    title: `Autopsy — ${victim.name}`,
    source: victim.id,
    fidelity: "true",
    claims: [
      claim(victim.id, predicate, "homicide", true, `Re-examination: ${victim.name} did not die naturally — ${core.how}.`),
      claim(culprit.id, "at-scene", scene.id, true, `Trace evidence places ${culprit.name} at ${scene.name}.`),
    ],
    clues: [
      mkClue("rec_autopsy", "how", "homicide", "true", `Re-examination of the body: ${core.how}`),
    ],
    leads: [scene.id, culprit.id],
    clearanceCost: 1,
  };
  return { records: [lie, disproof], keyContradiction: [lie.id, disproof.id], predicate };
}

/** WHAT — the file is closed as no-crime; the autopsy establishes a homicide. */
function whatLie(ctx: CruxContext): CruxLie {
  const { culprit, victim, scene, core, predicate, claim } = ctx;
  const lie: CaseRecord = {
    id: "rec_ruling",
    type: "ruling",
    title: `Case disposition — ${victim.name}`,
    source: victim.id,
    fidelity: "false",
    claims: [
      claim(victim.id, predicate, "no-crime", false, `${victim.name}'s death was ruled inconclusive — no crime recorded.`),
    ],
    clues: [
      mkClue("rec_ruling", "how", "no-crime", "false", `The file was closed: inconclusive — no crime recorded.`),
    ],
    leads: [scene.id],
    clearanceCost: 1,
  };
  const disproof: CaseRecord = {
    id: "rec_autopsy",
    type: "autopsy",
    title: `Autopsy — ${victim.name}`,
    source: victim.id,
    fidelity: "true",
    claims: [
      claim(victim.id, predicate, "homicide", true, `Findings establish a homicide, not misadventure — ${core.how}.`),
      claim(culprit.id, "at-scene", scene.id, true, `${culprit.name} was placed at ${scene.name}.`),
    ],
    clues: [
      mkClue("rec_autopsy", "how", "homicide", "true", `Autopsy findings establish a homicide, not misadventure — ${core.how}`),
    ],
    leads: [scene.id, culprit.id],
    clearanceCost: 1,
  };
  return { records: [lie, disproof], keyContradiction: [lie.id, disproof.id], predicate };
}

/** The strategy registry — one row per authored crux. */
export const CRUX_STRATEGIES: Record<CaseFact, CruxStrategy> = {
  where: whereLie,
  who: whoLie,
  when: whenLie,
  how: howLie,
  what: whatLie,
};
