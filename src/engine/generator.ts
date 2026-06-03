import type {
  AuthoredWorld,
  CaseCore,
  CaseRecord,
  CaseRole,
  Claim,
  Entity,
  GameCase,
  Person,
  Solution,
} from "./types";
import {
  CRUX_STRATEGIES,
  THEORY_SLOTS,
  contestedSlot,
  cruxPredicate,
  cruxTruth,
  mkClue,
  type CruxContext,
} from "./crux";

/** Deterministic seeded PRNG (mulberry32). Same seed → identical procgen. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = ["Mara", "Cole", "Iris", "Dale", "Vera", "Otis", "Nell", "Roy", "Ada", "Sol"];
const LAST = ["Hale", "Voss", "Pike", "Frey", "Mott", "Lund", "Crane", "Webb", "Dunn", "Ash"];

function claim(
  subject: string,
  predicate: string,
  object: string,
  truthful: boolean,
  text: string,
): Claim {
  return { subject, predicate, object, truthful, text };
}

function resolveCore(world: AuthoredWorld, caseId?: string): CaseCore {
  const core = caseId ? world.cases.find((c) => c.id === caseId) : world.cases[0];
  if (!core) {
    throw new Error(`No authored case core${caseId ? ` '${caseId}'` : ""} in the world.`);
  }
  return core;
}

function requirePerson(world: AuthoredWorld, id: string, role: string): Person {
  const p = world.people.find((person) => person.id === id);
  if (!p) throw new Error(`Case core ${role} '${id}' is not a person in the authored world.`);
  return p;
}

function requirePlace(world: AuthoredWorld, id: string): Entity {
  const place = world.places.find((p) => p.id === id);
  if (!place) throw new Error(`Case core where '${id}' is not a place in the authored world.`);
  return place;
}

/** The cast the lie strategies need: the liar (`witness`) and the framed innocent. */
interface ResolvedCast {
  witness: Person;
  framed: Person;
}

/**
 * Resolve the witness (whose statement carries the alibi-style lie) and the
 * framed innocent (the who-crux decoy) — preferring AUTHORED people so the cast
 * the author wrote actually appears, with procgen strangers as the fallback.
 *
 * - **framed**: a factionless authored person reads as an innocent bystander
 *   (e.g. the wrongly-accused driver). If none, a procgen stranger — never an
 *   authored faction member (framing one of those isn't "innocent").
 * - **witness** (the cover-up's mouthpiece): preferentially a member of the
 *   culprit's OWN protective/vindictive faction, so the false statement is
 *   sourced from the camp shielding the culprit; then any authored non-principal;
 *   then a procgen stranger. Naming them later carries faction consequences.
 */
function resolveCast(
  world: AuthoredWorld,
  core: CaseCore,
  rng: () => number,
  uniqueName: () => string,
): ResolvedCast {
  const principals = new Set([core.culpritId, core.victimId]);
  const pool = world.people.filter((p) => !principals.has(p.id));
  const pick = (cands: Person[]): Person | undefined =>
    cands.length ? cands[Math.floor(rng() * cands.length)] : undefined;

  const factionless = pool.filter((p) => !p.factionId);
  const framed: Person = pick(factionless) ?? { id: "suspect_b", type: "person", name: uniqueName() };

  // The culprit's faction, if it's one that would cover for its own.
  const culprit = world.people.find((p) => p.id === core.culpritId);
  const culpritFaction = world.factions.find((f) => f.id === culprit?.factionId);
  const shields = culpritFaction?.temperament === "protective" || culpritFaction?.temperament === "vindictive";
  const others = pool.filter((p) => p.id !== framed.id);
  const mouthpieces = shields ? others.filter((p) => p.factionId === culpritFaction?.id) : [];

  const witness: Person =
    pick(mouthpieces) ?? pick(others) ?? { id: "witness", type: "person", name: uniqueName() };

  return { witness, framed };
}

/**
 * Generate one playable case from a HAND-AUTHORED world + a seed (§2.5 / §5.4).
 *
 * The author owns the hard truths (the `CaseCore` 5W+H + the `keyFact` crux);
 * this generator builds the record layer ON TOP. It **places the lie against the
 * authored `keyFact`** by dispatching to the matching strategy in `crux.ts`
 * (where=false alibi, who=framed innocent, when=shifted timeline, how/what=false
 * ruling vs. true autopsy), casts the witness/framed from authored people when
 * available, and wraps the strategy's records in a shared case-file + property
 * record. The authored culprit/victim/scene/time/method are never invented.
 */
export function generateCase(world: AuthoredWorld, seed: number, caseId?: string): GameCase {
  const core = resolveCore(world, caseId);
  const rng = mulberry32(seed);

  // Don't let procgen-cast names collide with any authored person.
  const used = new Set(world.people.map((p) => p.name));
  const uniqueName = (): string => {
    let n = "";
    let guard = 0;
    do {
      n = `${FIRST[Math.floor(rng() * FIRST.length)]} ${LAST[Math.floor(rng() * LAST.length)]}`;
    } while (used.has(n) && guard++ < 64);
    used.add(n);
    return n;
  };

  // Authored principals + scene (the hard truths — never invented here).
  const culprit = requirePerson(world, core.culpritId, "culprit");
  const victim = requirePerson(world, core.victimId, "victim");
  const scene = requirePlace(world, core.whereId);

  // Cast the liar + framed innocent (authored-first), plus fixed procgen props.
  const { witness, framed } = resolveCast(world, core, rng, uniqueName);
  const bar: Entity = { id: "across_town", type: "place", name: "the Westside bar" };
  const phone: Entity = { id: "witness_phone", type: "phone", name: "the witness's telephone line" };

  const when = core.when;
  const predicate = cruxPredicate(core);
  const ctx: CruxContext = {
    core,
    culprit,
    victim,
    scene,
    witness,
    framed,
    elsewhere: bar,
    phone,
    when,
    predicate,
    claim,
  };

  // Place the lie against the authored crux (fallback: where/alibi).
  const strategy = CRUX_STRATEGIES[core.keyFact] ?? CRUX_STRATEGIES.where;
  const lie = strategy(ctx);

  const entities: Record<string, Entity> = {};
  for (const e of [culprit, victim, scene, witness, framed, bar, phone]) entities[e.id] = e;

  // Ground truth, projected from the authored core + the crux's canonical facts.
  const groundTruth: Claim[] = [
    claim(culprit.id, "killed", victim.id, true, `${culprit.name} killed ${victim.name}.`),
    claim(culprit.id, "at-scene", scene.id, true, `${culprit.name} was at ${scene.name}.`),
    ...cruxTruth(ctx),
  ];

  const caseFile: CaseRecord = {
    id: "rec_casefile",
    type: "case-file",
    title: `Cold Case File — ${core.what}`,
    source: victim.id,
    fidelity: "true",
    claims: [
      claim(victim.id, "found-dead", scene.id, true, `${victim.name} was found dead at ${scene.name}; ruled inconclusive.`),
    ],
    leads: [witness.id, culprit.id, framed.id, scene.id],
    clearanceCost: 0,
  };

  const property: CaseRecord = {
    id: "rec_property",
    type: "property-record",
    title: "Property & associations",
    source: culprit.id,
    fidelity: "true",
    claims: [
      claim(culprit.id, "knows", witness.id, true, `${culprit.name} and ${witness.name} are long-time associates.`),
    ],
    leads: [witness.id],
    clearanceCost: 1,
  };

  // A generic autopsy unless the crux strategy already produced one (how/what own it).
  const strategyHasAutopsy = lie.records.some((r) => r.type === "autopsy");
  const genericAutopsy: CaseRecord[] = strategyHasAutopsy
    ? []
    : [
        {
          id: "rec_autopsy",
          type: "autopsy",
          title: `Autopsy — ${victim.name}`,
          source: victim.id,
          fidelity: "true",
          claims: [
            claim(victim.id, "death-time", when, true, `Time of death fixed at ${when}; ${core.how}.`),
            claim(victim.id, "died-at", scene.id, true, `${victim.name} died at ${scene.name}.`),
          ],
          leads: [scene.id],
          clearanceCost: 1,
        },
      ];

  // Red-herring decoys (capped at 2): the "someone else did it" theories the
  // cover-up seeds, each an unverifiable rumor implicating ANOTHER faction member
  // (the boss / second-hand theories). They add misdirection without touching the
  // solvable spine — `keyContradiction` is set explicitly, and these aren't disproved.
  const taken = new Set([culprit.id, victim.id, framed.id, witness.id]);
  const decoyPool = world.people.filter((p) => p.factionId && !taken.has(p.id));
  const theories = ["a contract job ordered from above", "a second hand at the scene"];
  const decoys: CaseRecord[] = [];
  for (const m of decoyPool) {
    if (decoys.length >= 2) break;
    entities[m.id] = m;
    decoys.push({
      id: `rec_decoy_${m.id}`,
      type: "witness-statement",
      title: `Anonymous tip — ${m.name}`,
      source: m.id,
      fidelity: "biased",
      claims: [
        claim(m.id, "rumored-involved", victim.id, false, `Grapevine ties ${m.name} to ${victim.name}'s death — ${theories[decoys.length]}.`),
      ],
      leads: [m.id],
      clearanceCost: 1,
    });
  }

  const records: CaseRecord[] = [caseFile, ...lie.records, property, ...genericAutopsy, ...decoys];

  // True clues for the NON-contested theory slots, so the player can fill all four
  // (the contested slot already carries its false+true pair from the strategy).
  // Carrier records: who → property, where/when/how → the autopsy.
  const contested = contestedSlot(core);
  const autopsyRec = records.find((r) => r.type === "autopsy") ?? property;
  const slotTrue: Record<string, { value: string; carrier: CaseRecord; text: string }> = {
    who: { value: culprit.id, carrier: property, text: `${culprit.name}'s effects place him near ${scene.name}.` },
    where: { value: scene.id, carrier: autopsyRec, text: `${victim.name}'s body was found at ${scene.name}.` },
    when: { value: when, carrier: autopsyRec, text: `Time of death is fixed at ${when}.` },
    how: { value: "homicide", carrier: autopsyRec, text: `The injuries are consistent with foul play — ${core.how}.` },
  };
  for (const slot of THEORY_SLOTS) {
    if (slot === contested) continue;
    const t = slotTrue[slot];
    t.carrier.clues = [...(t.carrier.clues ?? []), mkClue(t.carrier.id, slot, t.value, "true", t.text)];
  }

  const clues = records.flatMap((rec) => rec.clues ?? []);

  const solution: Solution = {
    culpritId: culprit.id,
    keyContradiction: lie.keyContradiction,
    predicate,
    keyFact: core.keyFact,
  };

  const roles: Record<string, CaseRole> = {
    [culprit.id]: "culprit",
    [victim.id]: "victim",
    [witness.id]: "witness",
    [framed.id]: core.keyFact === "who" ? "person-of-interest" : "bystander",
  };

  // Accusable suspects: the culprit + the framed innocent + the witness (deduped).
  const suspects = [...new Set([culprit.id, framed.id, witness.id])];

  return {
    seed,
    coreId: core.id,
    entities,
    groundTruth,
    records,
    clues,
    caseFileId: caseFile.id,
    solution,
    suspects,
    roles,
  };
}
