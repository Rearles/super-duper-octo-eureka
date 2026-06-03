// The §2.5 faction tension engine (Plan 2): emergent stakes + reactions.
// Pure functions over the AUTHORED faction data (Plan 1) + the generated case —
// no UI, no LLM. Standing/Heat live on the CaseSession; this computes the deltas.

import type {
  AuthoredWorld,
  CaseCore,
  CaseRole,
  Contact,
  Disposition,
  Faction,
  FactionReaction,
  GameCase,
} from "./types";

/** A faction's members are its callable contacts (§9.2). */
export function listContacts(world: AuthoredWorld): Contact[] {
  const out: Contact[] = [];
  for (const f of world.factions) {
    for (const m of f.members) {
      const person = world.people.find((p) => p.id === m.personId);
      out.push({
        factionId: f.id,
        personId: m.personId,
        name: person?.name ?? m.personId,
        ...(m.title ? { title: m.title } : {}),
      });
    }
  }
  return out;
}

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

function appendReason(base: string, note: string): string {
  return base ? `${base}; ${note}` : note;
}

/**
 * Ripple direct reactions through the authored ally/rival web (§2.5): a faction's
 * standing shift nudges its **allies** the same way and its **rivals** the
 * opposite way — and helping a faction heats up its rivals. Takes the direct
 * reactions for all factions and returns the NET reaction per faction (direct +
 * ripples folded in), dropping factions left with no net effect.
 */
export function applyInterFactionWeb(world: AuthoredWorld, direct: FactionReaction[]): FactionReaction[] {
  const byId = new Map(world.factions.map((f) => [f.id, f]));
  const net = new Map<string, FactionReaction>(
    world.factions.map((f) => [
      f.id,
      { factionId: f.id, name: f.name, standingDelta: 0, heatDelta: 0, reason: "" },
    ]),
  );

  // Seed from the direct reactions.
  for (const r of direct) {
    const n = net.get(r.factionId);
    if (!n) continue;
    n.standingDelta += r.standingDelta;
    n.heatDelta += r.heatDelta;
    if (r.standingDelta !== 0 || r.heatDelta !== 0) n.reason = r.reason;
  }

  // Ripple each nonzero direct standing shift to allies (+) and rivals (−, +heat if helped).
  for (const r of direct) {
    if (r.standingDelta === 0) continue;
    const f = byId.get(r.factionId);
    if (!f) continue;
    const s = Math.sign(r.standingDelta);
    for (const allyId of f.allies ?? []) {
      const a = net.get(allyId);
      if (!a) continue;
      a.standingDelta += s;
      a.reason = appendReason(a.reason, `allied with ${f.name}`);
    }
    for (const rivalId of f.rivals ?? []) {
      const rv = net.get(rivalId);
      if (!rv) continue;
      rv.standingDelta -= s;
      if (s > 0) rv.heatDelta += 1;
      rv.reason = appendReason(rv.reason, `rival of ${f.name}`);
    }
  }

  return [...net.values()].filter((n) => n.standingDelta !== 0 || n.heatDelta !== 0);
}

/**
 * One faction's reaction to an intermediate **official act** (§2.4 confirmation-by-
 * doing) — e.g. naming a person of interest. A public, hostile-leaning act toward
 * the target: naming a faction's own member raises that faction's heat; onlookers
 * with a stake grow warier. Temperament shapes the intensity.
 */
export function reactToOfficialAct(faction: Faction, stake: number, targetId: string): FactionReaction {
  const targetIsMember = faction.members.some((m) => m.personId === targetId);
  const direction = targetIsMember ? -1 : 0;
  let standingDelta = direction * stake;
  let heatDelta = -direction * stake;
  let why = targetIsMember
    ? "you officially named one of their own"
    : stake > 0
      ? "an official act in a case they care about"
      : "no stake in this act";
  if (direction === 0 && stake > 0) heatDelta += 1;

  if (direction < 0 && faction.temperament === "protective") {
    heatDelta *= 2;
    why += " — and they protect their own fiercely";
  } else if (direction < 0 && faction.temperament === "vindictive") {
    heatDelta += stake;
    standingDelta -= 1;
    why += " — and they hold grudges";
  } else if (faction.temperament === "opportunistic") {
    heatDelta = Math.round(heatDelta / 2);
  }

  return { factionId: faction.id, name: faction.name, standingDelta, heatDelta, reason: why };
}
