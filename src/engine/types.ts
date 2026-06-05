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
  | "property-record"
  | "ruling";

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
  /** atomic player-facing evidence (hypothesis-board layer); the player deduces from these */
  clues?: Clue[];
  leads: string[]; // entity ids referenced (become requestable)
  clearanceCost: number;
}

/**
 * One atomic piece of player-facing evidence that points a single case slot
 * toward a value — the deduction currency of the hypothesis board. The player
 * weighs clues to fill the WHO/WHERE/WHEN/HOW theory; `fidelity` is hidden, so a
 * `false`/`biased` clue (the planted lie) must be outweighed by true ones. Unlike
 * a `Claim`, a clue states EVIDENCE, never a conclusion.
 */
export interface Clue {
  id: string;
  /** the record this clue surfaced from */
  recordId: string;
  /** atomic evidence prose — never "X did it" */
  text: string;
  /** which 5W+H slot this clue speaks to */
  slot: CaseFact;
  /** the value it points the slot toward (entity id or literal token) */
  value: string;
  /** hidden truthfulness against ground truth */
  fidelity: Fidelity;
}

/** The player's working hypothesis: a chosen value per slot (unset slots absent). */
export type Theory = Partial<Record<CaseFact, string>>;

/** Tiered solvability (refined Pillar 1 §1.2/§5.4): provable | crackable | underdetermined | blank. */
export type Determination = "provable" | "crackable" | "underdetermined" | "blank";

export interface Solution {
  culpritId: string;
  /** the two record ids whose claims expose the key lie */
  keyContradiction: [string, string];
  /** the predicate the contradiction turns on */
  predicate: string;
  /** which authored crux the lie attacks (drives solver branching); defaults to "where" when absent */
  keyFact?: CaseFact;
  /** the true per-slot answers (who/where/when/how) — internal; never shown as a grade */
  trueAnswers?: Theory;
  /** tiered-solvability classification (refined Pillar 1); computed on demand, optional */
  determination?: Determination;
}

export interface GameCase {
  seed: number;
  /** the authored CaseCore id this was generated from (resolve via `world.cases`) */
  coreId?: string;
  entities: Record<string, Entity>;
  /** ground-truth facts as canonical (always-truthful) claims */
  groundTruth: Claim[];
  records: CaseRecord[];
  /** flat aggregate of every record's clues (hypothesis-board layer) */
  clues?: Clue[];
  /** the record handed to the player for free at the start */
  caseFileId: string;
  solution: Solution;
  /** entity ids the player may accuse */
  suspects: string[];
  /** personId → role in this case (culprit/victim/witness/framed…); drives faction stake */
  roles?: Record<string, CaseRole>;
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
  /** the broad bloc this faction belongs to (fluid over the sim — GCD §2.5 v2.0) */
  bloc?: BlocId;
}

/** The complete hand-authored base the generator builds on top of. */
export interface AuthoredWorld {
  cases: CaseCore[];
  factions: Faction[];
  people: Person[];
  /** authored place entities (scenes/locations) referenced by `CaseCore.whereId` and faction interests */
  places: Entity[];
}

// ---------------------------------------------------------------------------
// Society-sim: blocs + allegiance portfolios (GCD §2.5 v2.0). Additive — the
// authored Faction/FactionMember layer above stays the seed.
// ---------------------------------------------------------------------------

/** The seven broad blocs the society-sim is organized into. */
export type BlocId =
  | "press"
  | "political-machine"
  | "organized-crime"
  | "unorganized-crime"
  | "law-enforcement"
  | "reform-civic"
  | "business-industry";

/** A broad faction bloc; sub-factions belong to one (fluidly). */
export interface Bloc {
  id: BlocId;
  name: string;
  description: string;
}

/**
 * An allegiance tie from an actor (a person OR a faction, incl. the detective) to a
 * faction. Affiliation is a PORTFOLIO, not a single membership: an actor may hold
 * several ties, some secret. `strength` is 0..1; `since` is an in-world clock token.
 * (The unifying mechanic for flipping, corruption, moles, and defection cascades.)
 */
export interface Allegiance {
  actorId: string;
  factionId: string;
  strength: number;
  /** public (what the world sees) vs secret (a mole / bought official) */
  secret: boolean;
  /** role/rank within the faction, if any */
  role?: string;
  /** in-world time the tie formed */
  since: string;
}

/** An append-only allegiance-history event (so historical ties can be reconstructed). */
export interface AllegianceChange {
  actorId: string;
  factionId: string;
  kind: "formed" | "strengthened" | "weakened" | "broken" | "flipped";
  at: string;
  note?: string;
}

// ---------------------------------------------------------------------------
// Society-sim: relationships, pacts & territory (diplomacy plan, GCD §2.5).
// ---------------------------------------------------------------------------

/** Disposition between two factions (across OR within a bloc). */
export type Stance = "allied" | "aligned" | "neutral" | "rival" | "at-war";

/** A relationship edge between two factions, with trust. Order-insensitive. */
export interface Relationship {
  aId: string;
  bId: string;
  stance: Stance;
  /** -1 (hostile) .. 1 (trusting) */
  trust: number;
}

/** A grievance one faction holds against another — feeds trust + pact stability. */
export interface Grievance {
  wrongedId: string;
  byId: string;
  kind: string;
  when: string;
  weight: number;
}

export type PactType =
  | "non-aggression"
  | "territory"
  | "tribute"
  | "alliance"
  | "ceasefire"
  | "protection";
export type PactStatus = "active" | "strained" | "broken" | "betrayed";

/** A first-class, temporal agreement between 2+ factions; forms/strains/breaks over ticks. */
export interface Pact {
  id: string;
  type: PactType;
  parties: string[];
  terms?: string;
  formedAt: string;
  status: PactStatus;
  /** 0 (collapsing) .. 1 (rock-solid) */
  stability: number;
}

/** Which faction controls a zone, since when (append-only; territory changes over time). */
export interface TerritoryControl {
  zoneId: string;
  factionId: string;
  since: string;
}

// ---------------------------------------------------------------------------
// Faction runtime (Plan 2 — the §2.5 tension engine, computed not authored).
// ---------------------------------------------------------------------------

/** What the player does with a closed case (the morally-grey second layer). */
export type Disposition = "charge" | "bury" | "expose";

/**
 * Live per-faction relationship state — two INDEPENDENT axes (§2.5):
 * you can hold high `standing` and a spiked `heat` at once.
 */
export interface FactionRuntimeState {
  factionId: string;
  /** slow, durable trust/reputation; gates access. Signed (− hostile … + allied). */
  standing: number;
  /** acute hostile attention; bidirectional (rises on acts against, falls on acts for). `>= 0`. */
  heat: number;
  /** spendable favors with this faction; earned by fulfilling its requests, spent on its contacts. `>= 0`. */
  favors: number;
}

/** One faction's reaction to a player act: the applied deltas + why. */
export interface FactionReaction {
  factionId: string;
  name: string;
  standingDelta: number;
  heatDelta: number;
  /** favors granted/spent by this act (Plan 3); defaults to 0. */
  favorDelta?: number;
  reason: string;
}

// ---------------------------------------------------------------------------
// Faction interaction layer (Plan 3 — requests, contacts, provenance).
// ---------------------------------------------------------------------------

/** Where a faction's information came from — and how trustworthy it tends to be (§2.5). */
export type Provenance = "grapevine" | "press" | "direct";

export type RequestStatus = "open" | "fulfilled" | "refused";

/**
 * A faction-initiated demand backed by a provenance-tagged claim that **may be
 * false**. The player may fulfill, refuse, or verify it (§2.5). The claim's true
 * `fidelity` is hidden until `revealed` (by verifying against the Registry).
 */
export interface FactionRequest {
  id: string;
  factionId: string;
  /** what the faction wants the player to do with the case */
  ask: Disposition;
  /** one-line human summary of the demand */
  text: string;
  provenance: Provenance;
  /** the (maybe-false) claim backing the demand */
  claim: Claim;
  /** the claim's true fidelity — hidden from the player until `revealed` */
  fidelity: Fidelity;
  /** whether the player has verified (revealed) the claim's fidelity */
  revealed: boolean;
  status: RequestStatus;
}

/** A faction member the player can call for access (never answers — Pillar 2). */
export interface Contact {
  factionId: string;
  personId: string;
  name: string;
  title?: string;
}
