// The procgen-v2 generator contract (GCD §5.1 v2.0). One generator shape that
// every cluster generator implements:
//     generateTruth() -> applyDistortion(author, decay) -> emit record(s)
// It produces the hidden ground truth AND the distorted record(s) in one pass,
// with the AGENT (author) and MOTIVE behind every distortion attached — Pillar 1:
// every falsehood is itself a deterministic, attributed, discoverable fact, never
// a hallucination. The autonomous society-sim supplies the Author/motive later.
import type { CaseRecord, Claim, Fidelity } from "../types";

/** Who authored a record + why — the agent behind a distortion (GCD §2.5). */
export interface Author {
  /** the filer's entity id (a person; a faction member once the sim runs) */
  enteredById: string;
  /** how reliable this author is: 1 = honest, 0 = fabricator */
  integrity: number;
  /** the faction-linked reason a distortion is applied, if any */
  motive?: string;
}

/** The hidden ground truth of an event — what really happened. Never rendered. */
export interface Truth {
  /** all claims here are truthful by construction */
  claims: Claim[];
}

/** The kind + fidelity of a distortion applied to a truth. */
export interface Distortion {
  type: "omission" | "fabrication" | "alteration" | "bias";
  fidelity: Fidelity;
  motive?: string;
}

/** The contract a cluster generator implements. */
export interface Generator {
  /** the hidden ground truth (always truthful) */
  generateTruth(): Truth;
  /** decide how this author distorts the truth (incl. time decay) */
  applyDistortion(truth: Truth, author: Author, decay?: number): Distortion;
  /** emit the player-facing record(s) carrying the (possibly distorted) claims */
  emit(truth: Truth, distortion: Distortion, author: Author): CaseRecord[];
}

/** Map an author's integrity (minus time decay) to a record fidelity. Deterministic. */
export function fidelityFromAuthor(integrity: number, decay = 0): Fidelity {
  const score = integrity - decay;
  if (score >= 0.85) return "true";
  if (score >= 0.6) return "partial";
  if (score >= 0.3) return "biased";
  return "false";
}

/**
 * Reference distortion: derive record claims from a truth, bending fidelity per the
 * author. An honest author yields truthful claims; a low-integrity one flips them
 * (a motivated, attributed lie). Cluster generators reuse or specialize this.
 */
export function distortClaims(
  truth: Truth,
  author: Author,
  decay = 0,
): { claims: Claim[]; distortion: Distortion } {
  const fidelity = fidelityFromAuthor(author.integrity, decay);
  const truthful = fidelity === "true";
  const claims = truth.claims.map((c) => (truthful ? c : { ...c, truthful: false }));
  const distortion: Distortion = {
    type: truthful ? "omission" : fidelity === "biased" ? "bias" : "alteration",
    fidelity,
    ...(author.motive ? { motive: author.motive } : {}),
  };
  return { claims, distortion };
}
