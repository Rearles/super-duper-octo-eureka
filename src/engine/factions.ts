// The §2.5 faction tension engine (Plan 2): emergent stakes + reactions.
// Pure functions over the AUTHORED faction data (Plan 1) + the generated case —
// no UI, no LLM. Standing/Heat live on the CaseSession; this computes the deltas.

import type {
  AuthoredWorld,
  CaseCore,
  CaseRole,
  Disposition,
  Faction,
  FactionReaction,
  GameCase,
} from "./types";

/** The procgen-cast ids the generator always uses (see generator.ts). */
const WITNESS_ID = "witness";
const BYSTANDER_ID = "suspect_b";

/** What a case "is about" — for matching faction interests and member roles. */
export interface CaseFacts {
  /** lowercased strings the case surfaces; interests are matched against these */
  topics: string[];
  /** personId → role in this case */
  roles: Record<string, CaseRole>;
}

/** Weight each case role contributes to a faction's stake when one of its members holds it. */
const ROLE_WEIGHT: Record<CaseRole, number> = {
  culprit: 2,
  victim: 2,
  "person-of-interest": 2,
  witness: 1,
  bystander: 1,
};

/** Resolve the authored CaseCore a generated case came from. */
export function resolveCore(world: AuthoredWorld, gameCase: GameCase): CaseCore {
  const core = world.cases.find((c) => c.id === gameCase.coreId);
  if (!core) {
    throw new Error(`GameCase.coreId '${String(gameCase.coreId)}' not found in the authored world.`);
  }
  return core;
}

/** Derive the matchable facts + role map for a generated case. */
export function caseFacts(gameCase: GameCase, core: CaseCore): CaseFacts {
  const name = (id: string): string => gameCase.entities[id]?.name ?? id;
  const topics = [
    core.what,
    core.how,
    name(core.culpritId),
    name(core.victimId),
    name(core.whereId),
  ].map((s) => s.toLowerCase());
  const roles: Record<string, CaseRole> = {
    [core.culpritId]: "culprit",
    [core.victimId]: "victim",
    [WITNESS_ID]: "witness",
    [BYSTANDER_ID]: "bystander",
  };
  return { topics, roles };
}

/**
 * How much a faction CARES about a case (§2.5 emergent stakes): the overlap of
 * its authored `interests` with the case's hard facts (plus any `extraTopics`
 * from the player's public acts), plus the involvement of its members by role.
 * 0 = doesn't care; higher = more invested. Emergent from authored data, not
 * scripted per case.
 */
export function factionStake(faction: Faction, facts: CaseFacts, extraTopics: string[] = []): number {
  const haystack = [...facts.topics, ...extraTopics.map((t) => t.toLowerCase())];
  let stake = 0;
  for (const interest of faction.interests) {
    const needle = interest.toLowerCase();
    if (haystack.some((h) => h.includes(needle))) stake += 1;
  }
  for (const m of faction.members) {
    const role = facts.roles[m.personId];
    if (role) stake += ROLE_WEIGHT[role];
  }
  return stake;
}

/** The player's committed verdict — the act factions react to. */
export interface VerdictAct {
  /** the person the player named as culprit */
  accusedId: string;
  disposition: Disposition;
  /** internal factual correctness of the accusation (hidden from the player) */
  correct: boolean;
}

/**
 * One faction's reaction to a committed verdict (§2.5), composed of three layers:
 *   1. ROLES set the DIRECTION  — naming/exposing a faction's member harms it;
 *      burying their member's case (or their victim's) flips the sign.
 *   2. STAKE sets the MAGNITUDE — how much they care (interests × facts + members).
 *   3. TEMPERAMENT shapes HOW    — protective spikes heat, vindictive holds grudges,
 *      opportunistic mutes loyalty, principled rewards the truth being served.
 * Heat is bidirectional: harm raises it, help lowers it.
 */
export function reactToVerdict(faction: Faction, facts: CaseFacts, stake: number, act: VerdictAct): FactionReaction {
  const accusedIsMember = faction.members.some((m) => m.personId === act.accusedId);
  const victimIsMember = faction.members.some((m) => facts.roles[m.personId] === "victim");
  const isPublic = act.disposition === "charge" || act.disposition === "expose";

  // Layer 1 — DIRECTION (+1 helps the faction, −1 harms it, 0 = onlooker).
  let direction = 0;
  let why: string;
  if (accusedIsMember) {
    direction = act.disposition === "bury" ? 1 : -1;
    why = act.disposition === "bury" ? "you shielded one of their own" : "you named one of their own";
  } else if (victimIsMember) {
    direction = act.disposition === "bury" ? -1 : 1;
    why = act.disposition === "bury" ? "you buried their own's case" : "you sought justice for their own";
  } else {
    why = stake > 0 ? "they were watching a case they care about" : "no stake in this case";
  }

  // Layers 2/3 — MAGNITUDE from stake; harm raises heat, help lowers it.
  let standingDelta = direction * stake;
  let heatDelta = -direction * stake;
  if (direction === 0 && stake > 0 && isPublic) heatDelta += 1; // onlookers grow warier in public

  switch (faction.temperament) {
    case "protective":
      if (direction < 0) {
        heatDelta *= 2;
        why += " — and they protect their own fiercely";
      }
      break;
    case "vindictive":
      if (direction < 0) {
        heatDelta += stake;
        standingDelta -= 1;
        why += " — and they hold grudges";
      }
      break;
    case "opportunistic":
      heatDelta = Math.round(heatDelta / 2); // they'd trade their own; muted loyalty
      why += " — but they bend with the wind";
      break;
    case "principled": {
      if (stake > 0) {
        const justice = isPublic && act.correct ? 1 : act.disposition === "bury" ? -1 : 0;
        standingDelta += justice;
        if (justice > 0) why += " — and the truth was served";
        else if (justice < 0) why += " — and the truth was buried";
      }
      break;
    }
  }

  return { factionId: faction.id, name: faction.name, standingDelta, heatDelta, reason: why };
}
