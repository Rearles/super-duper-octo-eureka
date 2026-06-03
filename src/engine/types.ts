// Core domain types for the Mound City engine.
// Ground truth is consistent and solvable; *records* may lie (tracked fidelity).
// See docs/GameConceptDocument.md §5.1 and the truth-model.

export type EntityType = "person" | "place" | "phone" | "org";

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
}

export type RecordType =
  | "case-file"
  | "witness-statement"
  | "phone-records"
  | "autopsy"
  | "property-record";

/** How faithfully a record reflects ground truth. */
export type Fidelity = "true" | "partial" | "biased" | "false";

/**
 * An atomic assertion made by a record. `truthful` = whether it matches ground
 * truth. A `false` claim is a deterministic, discoverable lie.
 */
export interface Claim {
  subject: string; // entity id
  predicate: string; // e.g. "location@2300", "killed", "knows"
  object: string; // entity id or literal value
  truthful: boolean;
  text: string; // human-readable rendering
}

export interface CaseRecord {
  id: string;
  type: RecordType;
  title: string;
  source: string; // the entity this record concerns / comes from
  fidelity: Fidelity;
  claims: Claim[];
  leads: string[]; // entity ids referenced (become requestable)
  clearanceCost: number;
}

export interface Solution {
  culpritId: string;
  /** the two record ids whose claims expose the key lie */
  keyContradiction: [string, string];
  /** the predicate the contradiction turns on */
  predicate: string;
}

export interface GameCase {
  seed: number;
  entities: Record<string, Entity>;
  /** ground-truth facts as canonical (always-truthful) claims */
  groundTruth: Claim[];
  records: CaseRecord[];
  /** the record handed to the player for free at the start */
  caseFileId: string;
  solution: Solution;
  /** entity ids the player may accuse */
  suspects: string[];
}

// ---------------------------------------------------------------------------
// Authored base layer (the "hard truths" the author writes by hand).
// The generator builds the record layer + extra cast ON TOP of these.
// See docs/GameConceptDocument.md §2.5 and .plans/author-the-case-core.
// ---------------------------------------------------------------------------

/** The 5W+H dimensions of a case core. `keyFact` names which one is the crux. */
export type CaseFact = "what" | "who" | "where" | "when" | "how";

/**
 * A hand-authored case "core" — the hard truths. Procgen places the lie
 * against `keyFact`, casts the remaining witnesses/bystanders, and generates
 * the record layer around this; it never invents these facts.
 */
export interface CaseCore {
  id: string;
  /** what happened — the crime/event, one line */
  what: string;
  /** who did it — a Person id (also the accusable culprit) */
  culpritId: string;
  /** who it happened to — a Person id */
  victimId: string;
  /** where — a place entity id (the scene) */
  whereId: string;
  /** when — the time anchor, e.g. "2300" */
  when: string;
  /** how — the method, one line */
  how: string;
  /** the crux the cover-up attacks; procgen places the planted lie against it */
  keyFact: CaseFact;
}

/** How a person figures in a given case. Authored for principals; procgen assigns the rest. */
export type CaseRole =
  | "culprit"
  | "victim"
  | "witness"
  | "person-of-interest"
  | "bystander";

/** A world person; may belong to a faction. Slots into `GameCase.entities` (extends Entity). */
export interface Person extends Entity {
  type: "person";
  /** the faction this person belongs to, if any */
  factionId?: string;
}

/** Shapes HOW a faction reacts (Plan 2 runtime). Extensible. */
export type Temperament =
  | "protective"
  | "opportunistic"
  | "vindictive"
  | "principled";

/** A person's membership in a faction, with their role inside it (e.g. "reporter"). */
export interface FactionMember {
  personId: string;
  title?: string;
}

/**
 * A hand-authored faction. Identity + interests + temperament + members + the
 * authored ally/rival web (GCD §2.5). Runtime gauges (Standing/Heat/Favors) and
 * the stake/reaction math live in Plan 2 — this is authored data only.
 */
export interface Faction {
  id: string;
  name: string;
  description: string;
  /** topics/places/people/objects/money/drugs it cares about — drives emergent stakes (Plan 2) */
  interests: string[];
  temperament: Temperament;
  members: FactionMember[];
  /** authored inter-faction web (GCD §2.5) — faction ids */
  allies?: string[];
  rivals?: string[];
}

/** The complete hand-authored base the generator builds on top of. */
export interface AuthoredWorld {
  cases: CaseCore[];
  factions: Faction[];
  people: Person[];
}
