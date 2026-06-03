import { FactGraph, type Contradiction } from "./factGraph";
import { generateCase } from "./generator";
import { verifySolvable } from "./solver";
import { TemplateRenderer, type Renderer } from "./templateRenderer";
import { defaultWorld } from "./world";
import type { AuthoredWorld, CaseRecord, Disposition, GameCase } from "./types";

export * from "./types";
export { generateCase, verifySolvable, FactGraph, TemplateRenderer };
export { defaultWorld } from "./world";
export * from "./authoring";
export type { Renderer, Contradiction };

export interface VerdictResult {
  /**
   * Internal factual correctness of the accusation — **not a player-facing grade**.
   * §2.4 confirmation-by-doing: the player learns the truth only through the
   * world's reaction (`consequence`, and the faction reactions in Plan 2), never
   * a "correct/incorrect" stamp. Kept for the engine + tests.
   */
  correct: boolean;
  /** The world's reaction — how the truth actually surfaces (confirmation-by-doing). */
  consequence: string;
}

/**
 * A playable session over one generated case: tracks clearance and obtained
 * records, exposes leads and contradictions, and resolves the two-layer verdict
 * with one immediate consequence (§2.1 / §2.4 / §3.3, MVP subset).
 */
export class CaseSession {
  readonly gameCase: GameCase;
  readonly graph: FactGraph;
  private readonly renderer: Renderer;
  private readonly obtained = new Set<string>();
  clearance: number;
  closed = false;

  constructor(
    seed: number,
    opts: {
      clearance?: number;
      renderer?: Renderer;
      /** override the authored world (defaults to the bundled `defaultWorld`) */
      world?: AuthoredWorld;
      /** which authored case to generate (defaults to the world's first) */
      caseId?: string;
    } = {},
  ) {
    this.gameCase = generateCase(opts.world ?? defaultWorld, seed, opts.caseId);
    const check = verifySolvable(this.gameCase);
    if (!check.solvable) {
      throw new Error(`Unsolvable case generated (seed ${seed}): ${check.reason}`);
    }
    this.graph = new FactGraph(this.gameCase);
    this.renderer = opts.renderer ?? new TemplateRenderer();
    this.clearance = opts.clearance ?? 5;
    this.obtained.add(this.gameCase.caseFileId); // the case file is free
  }

  obtainedRecords(): CaseRecord[] {
    return this.gameCase.records.filter((r) => this.obtained.has(r.id));
  }

  /** Records pointed to by a lead in something already obtained, but not yet pulled. */
  availableRequests(): CaseRecord[] {
    const known = new Set<string>();
    for (const r of this.obtainedRecords()) {
      known.add(r.source);
      r.leads.forEach((l) => known.add(l));
    }
    return this.gameCase.records.filter(
      (r) => !this.obtained.has(r.id) && known.has(r.source),
    );
  }

  request(recordId: string): { ok: boolean; message: string } {
    if (this.closed) return { ok: false, message: "The case is closed." };
    if (this.obtained.has(recordId)) return { ok: false, message: "Already obtained." };
    const rec = this.gameCase.records.find((r) => r.id === recordId);
    if (!rec) return { ok: false, message: "No such record." };
    if (!this.availableRequests().some((r) => r.id === recordId)) {
      return { ok: false, message: "No lead points to that record yet." };
    }
    if (this.clearance < rec.clearanceCost) {
      return { ok: false, message: "Not enough clearance." };
    }
    this.clearance -= rec.clearanceCost;
    this.obtained.add(recordId);
    return { ok: true, message: `Obtained: ${rec.title}` };
  }

  render(recordId: string): string {
    const rec = this.gameCase.records.find((r) => r.id === recordId);
    if (!rec || !this.obtained.has(recordId)) return "(not obtained)";
    return this.renderer.render(rec, this.gameCase);
  }

  /** Contradictions among the records the player currently holds. */
  contradictions(): Contradiction[] {
    return this.graph.contradictions([...this.obtained]);
  }

  /**
   * The vague, theory-level whisper — the §2.4 fairness valve. It reflects how
   * *ripe* the overall investigation is, never which piece is true and never who
   * the culprit is. Confirmation of the specific account comes only by acting
   * (committing a verdict) — see `commitVerdict`.
   */
  whisper(): string {
    if (this.contradictions().length === 0) {
      return "Nothing yet rings false — keep pulling threads.";
    }
    const [a, b] = this.gameCase.solution.keyContradiction;
    if (this.obtained.has(a) && this.obtained.has(b)) {
      return "The thread you're pulling holds — you have enough to make the call.";
    }
    return "Something in what you have doesn't add up.";
  }

  // §2.4 confirmation-by-doing: `correct` stays internal; the player learns the
  // truth from the world's reaction (`consequence`), not a grade.
  commitVerdict(culpritId: string, disposition: Disposition): VerdictResult {
    const correct = culpritId === this.gameCase.solution.culpritId;
    this.closed = true;
    const culprit = this.graph.entityName(this.gameCase.solution.culpritId);
    const accused = this.graph.entityName(culpritId);

    let consequence: string;
    switch (disposition) {
      case "charge":
        consequence = correct
          ? `${accused} is charged. The case holds — but the Registry now bears your name on it.`
          : `${accused} is charged on your word. Months later, ${culprit} is seen leaving the city. An innocent pays.`;
        break;
      case "expose":
        consequence = correct
          ? `You make the lie public. The press runs with it; ${culprit} is ruined before any trial — clean or not.`
          : `You expose the wrong thread. The real ${culprit} watches the noise settle, and goes quiet.`;
        break;
      case "bury":
        consequence = correct
          ? `You bury what you found. ${culprit} walks free, and you carry the truth alone.`
          : `You bury the case. No one is the wiser — least of all you.`;
        break;
    }
    return { correct, consequence };
  }
}
