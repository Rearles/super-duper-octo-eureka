// The §2.5 faction tension engine (Plan 2): emergent stakes + reactions.
// Pure functions over the AUTHORED faction data (Plan 1) + the generated case —
// no UI, no LLM. Standing/Heat live on the CaseSession; this computes the deltas.

import type { AuthoredWorld, CaseCore, CaseRole, Faction, GameCase } from "./types";

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
