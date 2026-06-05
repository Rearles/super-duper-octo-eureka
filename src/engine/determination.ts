// Tiered solvability (refined Pillar 1, GCD §1.2/§5.4). Generalizes the binary
// verifySolvable gate into a DETERMINATION classifier:
//   provable        — surviving records pin a unique culprit (>= 2 paths)
//   crackable       — exactly one surviving path; hard, but it converges
//   underdetermined — evidence-rich, >= 2 live suspects, no conclusive link
//                     (the White Whale: closeable BY THEORY, never by proof)
//   blank           — FORBIDDEN: no reachable theory; the engagement floor rejects it
// The floor guarantees the world never ships a blank wall.
import { verifySolvable } from "./solver";
import type { Determination, GameCase } from "./types";

export interface DeterminationResult {
  determination: Determination;
  /** distinct surviving records that implicate the culprit */
  corroborationPaths: number;
  /** accusable suspects (the theory always has someone to name) */
  liveSuspects: number;
  /** the engagement floor: a reachable theory always exists (never a blank wall) */
  fair: boolean;
  reason: string;
}

/** Classify a case's determination tier and check the engagement floor. */
export function classifyDetermination(gameCase: GameCase): DeterminationResult {
  const solvable = verifySolvable(gameCase);
  const culpritId = gameCase.solution.culpritId;
  const pred = gameCase.solution.predicate;

  // A "path" = a record that implicates the culprit: a claim on the key predicate
  // (true or false — exposing a false alibi is itself a path), or a truthful
  // at-scene tie. Count DISTINCT records.
  const corroborationPaths = gameCase.records.filter((r) =>
    r.claims.some(
      (cl) =>
        cl.subject === culpritId &&
        (cl.predicate === pred || (cl.predicate === "at-scene" && cl.truthful)),
    ),
  ).length;
  const liveSuspects = gameCase.suspects.length;

  let determination: Determination;
  let reason: string;
  if (solvable.solvable) {
    // a solvable case is never blank — at worst it's crackable
    determination = corroborationPaths >= 2 ? "provable" : "crackable";
    reason =
      determination === "provable"
        ? "Multiple surviving records pin the culprit."
        : "One surviving path converges on the culprit.";
  } else if (liveSuspects >= 2 && corroborationPaths >= 1) {
    determination = "underdetermined";
    reason = "Evidence-rich but no conclusive link — closeable by theory, not proof.";
  } else {
    determination = "blank";
    reason = "No reachable theory — engagement floor violated.";
  }

  return {
    determination,
    corroborationPaths,
    liveSuspects,
    fair: determination !== "blank",
    reason,
  };
}

/** Target case-population mix for n cases: mostly provable, a controlled
 *  underdetermined minority, never blank (the distribution the generator aims for). */
export function distributionTarget(n: number): Record<Determination, number> {
  const underdetermined = Math.max(0, Math.round(n * 0.15));
  const crackable = Math.round(n * 0.25);
  return {
    provable: Math.max(0, n - underdetermined - crackable),
    crackable,
    underdetermined,
    blank: 0,
  };
}

/**
 * The load-bearing record whose erosion would push a case from provable toward
 * underdetermined — the target of *targeted* decay for White-Whale cases (vs.
 * uniform decay). Returns the record id carrying the truthful half of the key
 * contradiction, or null.
 */
export function loadBearingRecord(gameCase: GameCase): string | null {
  const [a, b] = gameCase.solution.keyContradiction;
  for (const id of [a, b]) {
    const rec = gameCase.records.find((r) => r.id === id);
    if (rec?.claims.some((cl) => cl.truthful)) return id;
  }
  return a ?? null;
}
