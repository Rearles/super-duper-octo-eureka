import type { CaseFact, CaseRecord, Clue, Entity, GameCase } from "./types";

/** A surfaced disagreement between two records on the same subject+predicate. */
export interface Contradiction {
  recordA: string;
  recordB: string;
  subject: string;
  predicate: string;
  objectA: string;
  objectB: string;
}

/** The verdict on a player-ASSERTED clue contradiction (§2.4 — the player spots it, not the engine). */
export interface ClueConflict {
  /** do the two clues genuinely disagree — same slot, different value? */
  conflict: boolean;
  /** the slot they disagree about, when they conflict */
  slot?: CaseFact;
}

/**
 * Read-only query layer over a generated case. Surfaces *that* records conflict
 * — never what it means (the player interprets). See §2.2 / §12.3.
 */
export class FactGraph {
  constructor(private readonly gameCase: GameCase) {}

  entity(id: string): Entity | undefined {
    return this.gameCase.entities[id];
  }

  entityName(id: string): string {
    return this.gameCase.entities[id]?.name ?? id;
  }

  get records(): CaseRecord[] {
    return this.gameCase.records;
  }

  recordsAbout(entityId: string): CaseRecord[] {
    return this.gameCase.records.filter(
      (r) => r.source === entityId || r.leads.includes(entityId),
    );
  }

  /** Every clue across the case (hypothesis-board layer). */
  get clues(): Clue[] {
    return this.gameCase.clues ?? this.gameCase.records.flatMap((r) => r.clues ?? []);
  }

  /**
   * Validate a contradiction the PLAYER asserts between two clues (§2.4): they
   * genuinely conflict only if they speak to the same slot but point at different
   * values. This NEVER reveals which clue is true — the player must decide and
   * commit under uncertainty; truth surfaces only through consequence.
   */
  assertContradiction(clueIdA: string, clueIdB: string): ClueConflict {
    const a = this.clues.find((c) => c.id === clueIdA);
    const b = this.clues.find((c) => c.id === clueIdB);
    if (!a || !b || a.id === b.id) return { conflict: false };
    if (a.slot === b.slot && a.value !== b.value) return { conflict: true, slot: a.slot };
    return { conflict: false };
  }

  /**
   * Pairs of claims across different records that share subject+predicate but
   * disagree on object. The atom of deduction.
   */
  contradictions(amongRecordIds: string[]): Contradiction[] {
    const records = this.gameCase.records.filter((r) =>
      amongRecordIds.includes(r.id),
    );
    const out: Contradiction[] = [];
    for (let i = 0; i < records.length; i++) {
      for (let j = i + 1; j < records.length; j++) {
        for (const a of records[i].claims) {
          for (const b of records[j].claims) {
            if (
              a.subject === b.subject &&
              a.predicate === b.predicate &&
              a.object !== b.object
            ) {
              out.push({
                recordA: records[i].id,
                recordB: records[j].id,
                subject: a.subject,
                predicate: a.predicate,
                objectA: a.object,
                objectB: b.object,
              });
            }
          }
        }
      }
    }
    return out;
  }
}
