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
