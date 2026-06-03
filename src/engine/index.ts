import { FactGraph, type Contradiction } from "./factGraph";
import { generateCase } from "./generator";
import { verifySolvable } from "./solver";
import { TemplateRenderer, type Renderer } from "./templateRenderer";
import { defaultWorld } from "./world";
import {
  applyInterFactionWeb,
  caseFacts,
  factionStake,
  generateRequests,
  listContacts,
  reactToOfficialAct,
  reactToVerdict,
  resolveCore,
  verifyClaim,
} from "./factions";
import type {
  AuthoredWorld,
  CaseCore,
  CaseRecord,
  Contact,
  Disposition,
  FactionReaction,
  FactionRequest,
  FactionRuntimeState,
  Fidelity,
  GameCase,
} from "./types";

/** Clearance a faction contact grants when called (§9.2 — access, not answers). */
const CONTACT_CLEARANCE_BONUS = 2;
/** Clearance cost to verify a faction request's claim against the Registry. */
const VERIFY_COST = 1;

export * from "./types";
export { generateCase, verifySolvable, FactGraph, TemplateRenderer };
export { defaultWorld } from "./world";
export * from "./authoring";
export * from "./factions";
export type { Renderer, Contradiction };

export interface VerdictResult {
  /**
   * Internal factual correctness of the accusation — **not a player-facing grade**.
   * §2.4 confirmation-by-doing: the player learns the truth only through the
   * world's reaction (`consequence` + the faction `reactions`), never a
   * "correct/incorrect" stamp. Kept for the engine + tests.
   */
  correct: boolean;
  /** The world's reaction — how the truth actually surfaces (confirmation-by-doing). */
  consequence: string;
  /** Per-faction Standing/Heat shifts this verdict produced (§2.5). */
  reactions: FactionReaction[];
}

/** A Decision-Ledger entry: a player act and the faction reactions it caused (§2.2/§3.3). */
export interface LedgerEntry {
  note: string;
  reactions: FactionReaction[];
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
  private readonly world: AuthoredWorld;
  private readonly core: CaseCore;
  private readonly factionState = new Map<string, FactionRuntimeState>();
  private readonly requestList: FactionRequest[];
  /** The Decision Ledger: every act and the faction reactions it caused (§2.2). */
  readonly ledger: LedgerEntry[] = [];
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
    const world = opts.world ?? defaultWorld;
    this.world = world;
    this.gameCase = generateCase(world, seed, opts.caseId);
    const check = verifySolvable(this.gameCase);
    if (!check.solvable) {
      throw new Error(`Unsolvable case generated (seed ${seed}): ${check.reason}`);
    }
    this.graph = new FactGraph(this.gameCase);
    this.core = resolveCore(world, this.gameCase);
    for (const f of world.factions) {
      this.factionState.set(f.id, { factionId: f.id, standing: 0, heat: 0, favors: 0 });
    }
    this.requestList = generateRequests(world, this.gameCase, this.core);
    this.renderer = opts.renderer ?? new TemplateRenderer();
    this.clearance = opts.clearance ?? 5;
    this.obtained.add(this.gameCase.caseFileId); // the case file is free
  }

  /** Live per-faction Standing/Heat (§2.5). */
  factions(): FactionRuntimeState[] {
    return [...this.factionState.values()];
  }

  /** Display name for a faction id. */
  factionName(id: string): string {
    return this.world.factions.find((f) => f.id === id)?.name ?? id;
  }

  /**
   * Open and resolved faction requests pushed to the player (§2.5). A request's
   * `fidelity` is the hidden truth — display it only once `revealed` (verified).
   */
  requests(): FactionRequest[] {
    return [...this.requestList];
  }

  /**
   * Verify a request's provenance-tagged claim against the Registry's ground
   * truth (§2.5): spend clearance to reveal its true `fidelity` before deciding.
   * Turns the faction's own information into deduction material (Pillar 1).
   */
  verifyRequest(requestId: string): { ok: boolean; message: string; fidelity?: Fidelity } {
    if (this.closed) return { ok: false, message: "The case is closed." };
    const req = this.requestList.find((r) => r.id === requestId);
    if (!req) return { ok: false, message: "No such request." };
    if (req.revealed) return { ok: false, message: "Already verified.", fidelity: req.fidelity };
    if (this.clearance < VERIFY_COST) {
      return { ok: false, message: "Not enough clearance to verify." };
    }
    this.clearance -= VERIFY_COST;
    req.fidelity = verifyClaim(req.claim, this.gameCase.groundTruth);
    req.revealed = true;
    this.ledger.push({
      note: `Verified ${this.factionName(req.factionId)}'s claim → ${req.fidelity}`,
      reactions: [],
    });
    return { ok: true, message: `Their claim checks out as: ${req.fidelity}.`, fidelity: req.fidelity };
  }

  /**
   * Fulfill a faction's request — side with them: that faction's Standing rises,
   * Heat cools, and you earn a Favor; rivals shift the other way (§2.5 web). Often
   * at the truth's expense if their claim was false.
   */
  fulfillRequest(requestId: string): { ok: boolean; message: string; reactions: FactionReaction[] } {
    const req = this.openRequest(requestId);
    if ("error" in req) return { ok: false, message: req.error, reactions: [] };
    const faction = this.world.factions.find((f) => f.id === req.req.factionId)!;
    const stake = factionStake(faction, caseFacts(this.gameCase, this.core));
    const direct: FactionReaction = {
      factionId: faction.id,
      name: faction.name,
      standingDelta: stake,
      heatDelta: -stake,
      favorDelta: 1,
      reason: `you granted their request to ${req.req.ask}`,
    };
    const reactions = applyInterFactionWeb(this.world, [direct]);
    this.applyReactions(reactions, `Fulfilled ${faction.name}'s request (${req.req.ask})`);
    req.req.status = "fulfilled";
    return { ok: true, message: `You side with ${faction.name}.`, reactions };
  }

  /** Refuse/ignore a faction's request — their Heat rises and standing dips; rivals ease. */
  refuseRequest(requestId: string): { ok: boolean; message: string; reactions: FactionReaction[] } {
    const req = this.openRequest(requestId);
    if ("error" in req) return { ok: false, message: req.error, reactions: [] };
    const faction = this.world.factions.find((f) => f.id === req.req.factionId)!;
    const stake = factionStake(faction, caseFacts(this.gameCase, this.core));
    const direct: FactionReaction = {
      factionId: faction.id,
      name: faction.name,
      standingDelta: -1,
      heatDelta: stake,
      reason: `you refused their request to ${req.req.ask}`,
    };
    const reactions = applyInterFactionWeb(this.world, [direct]);
    this.applyReactions(reactions, `Refused ${faction.name}'s request`);
    req.req.status = "refused";
    return { ok: true, message: `You turn ${faction.name} down.`, reactions };
  }

  private openRequest(requestId: string): { req: FactionRequest } | { error: string } {
    if (this.closed) return { error: "The case is closed." };
    const req = this.requestList.find((r) => r.id === requestId);
    if (!req) return { error: "No such request." };
    if (req.status !== "open") return { error: "That request is already resolved." };
    return { req };
  }

  /** The faction members the player can call for access (§9.2). */
  contacts(): Contact[] {
    return listContacts(this.world);
  }

  /**
   * Call a faction contact: spend 1 of that faction's favors for ACCESS — a
   * clearance boost (they pull a string). Never an answer (Pillar 2).
   */
  callContact(personId: string): { ok: boolean; message: string } {
    if (this.closed) return { ok: false, message: "The case is closed." };
    const contact = this.contacts().find((c) => c.personId === personId);
    if (!contact) return { ok: false, message: "No such contact." };
    const state = this.factionState.get(contact.factionId);
    if (!state || state.favors < 1) {
      return { ok: false, message: `No favors to spend with ${this.factionName(contact.factionId)}.` };
    }
    state.favors -= 1;
    this.clearance += CONTACT_CLEARANCE_BONUS;
    this.ledger.push({
      note: `Called ${contact.name} (${this.factionName(contact.factionId)}) — clearance +${CONTACT_CLEARANCE_BONUS}`,
      reactions: [],
    });
    return { ok: true, message: `${contact.name} pulls a string — clearance +${CONTACT_CLEARANCE_BONUS}.` };
  }

  /** Apply faction reactions to the live state (heat floored at 0) and log to the Ledger. */
  private applyReactions(reactions: FactionReaction[], note: string): void {
    for (const r of reactions) {
      const state = this.factionState.get(r.factionId);
      if (!state) continue;
      state.standing += r.standingDelta;
      state.heat = Math.max(0, state.heat + r.heatDelta);
      state.favors = Math.max(0, state.favors + (r.favorDelta ?? 0));
    }
    this.ledger.push({ note, reactions });
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

    // The factions react to who you named and what you did (§2.5): direct reactions
    // (the accused's name is now public) rippled through the ally/rival web.
    const facts = caseFacts(this.gameCase, this.core);
    const direct = this.world.factions.map((f) =>
      reactToVerdict(f, facts, factionStake(f, facts, [accused]), {
        accusedId: culpritId,
        disposition,
        correct,
      }),
    );
    const reactions = applyInterFactionWeb(this.world, direct);
    this.applyReactions(reactions, `Verdict: ${disposition} — ${accused}`);

    return { correct, consequence, reactions };
  }

  /**
   * An intermediate **official act** (§2.4 confirmation-by-doing): publicly name a
   * person of interest. The factions react — naming one of their own raises that
   * faction's heat — and beliefs resolve as the world responds. Returns the
   * reactions and logs them to the Ledger.
   */
  nameOfInterest(personId: string): FactionReaction[] {
    const facts = caseFacts(this.gameCase, this.core);
    const targetName = this.graph.entityName(personId);
    const direct = this.world.factions.map((f) =>
      reactToOfficialAct(f, factionStake(f, facts, [targetName]), personId),
    );
    const reactions = applyInterFactionWeb(this.world, direct);
    this.applyReactions(reactions, `Named a person of interest: ${targetName}`);
    return reactions;
  }
}
