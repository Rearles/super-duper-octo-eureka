import { FactGraph } from "./factGraph";
import type { GameCase } from "./types";

export interface SolvabilityResult {
  solvable: boolean;
  reason: string;
}

/**
 * Pillar 1 guarantee: confirm a chain of *obtainable* records exposes the lie
 * and implicates the culprit. The generator and this checker are co-built; any
 * malformed case is rejected (CaseSession throws on failure).
 */
export function verifySolvable(gameCase: GameCase): SolvabilityResult {
  const graph = new FactGraph(gameCase);
  const allIds = gameCase.records.map((r) => r.id);

  // 1. A catchable contradiction: a false claim a true record disproves.
  const catchable = graph.contradictions(allIds).some((c) => {
    const recA = gameCase.records.find((r) => r.id === c.recordA);
    const recB = gameCase.records.find((r) => r.id === c.recordB);
    if (!recA || !recB) return false;
    const ca = recA.claims.find(
      (cl) => cl.subject === c.subject && cl.predicate === c.predicate && cl.object === c.objectA,
    );
    const cb = recB.claims.find(
      (cl) => cl.subject === c.subject && cl.predicate === c.predicate && cl.object === c.objectB,
    );
    return !!ca && !!cb && ca.truthful !== cb.truthful;
  });
  if (!catchable) {
    return { solvable: false, reason: "No catchable contradiction (a lie a true record disproves)." };
  }

  // 2. Exposing the lie must implicate the culprit (a false alibi on the key predicate).
  const implicated = gameCase.records.some((r) =>
    r.claims.some(
      (cl) =>
        cl.subject === gameCase.solution.culpritId &&
        cl.predicate === gameCase.solution.predicate &&
        !cl.truthful,
    ),
  );
  if (!implicated) {
    return { solvable: false, reason: "Culprit is not implicated by exposing the lie." };
  }

  // 3. The culprit must be an accusable suspect.
  if (!gameCase.suspects.includes(gameCase.solution.culpritId)) {
    return { solvable: false, reason: "Culprit is not among the accusable suspects." };
  }

  // 4. The key contradiction records must exist.
  const [a, b] = gameCase.solution.keyContradiction;
  if (!allIds.includes(a) || !allIds.includes(b)) {
    return { solvable: false, reason: "Key contradiction records are missing." };
  }

  return {
    solvable: true,
    reason: "A chain of obtainable records exposes the lie and implicates the culprit.",
  };
}
