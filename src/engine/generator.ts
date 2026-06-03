import type {
  AuthoredWorld,
  CaseCore,
  CaseRecord,
  Claim,
  Entity,
  GameCase,
  Person,
  Solution,
} from "./types";

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

/**
 * Generate one playable case from a HAND-AUTHORED world + a seed (§2.5 / §5.4).
 *
 * The author owns the hard truths (the `CaseCore` 5W+H + the `keyFact` crux);
 * this generator builds the record layer ON TOP — it casts the witness and a
 * bystander procedurally (deterministically from the seed), and **places the
 * lie against the `keyFact`**: a false alibi a true record (phone logs)
 * disproves. The authored culprit/victim/scene/time/method are never invented.
 *
 * `keyFact` currently realizes the where/when "alibi" crux (the Buried Witness
 * pattern); other crux dimensions fall back to it until more archetypes exist.
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

  // Procgen-cast people + places (deterministic from the seed).
  const witness: Person = { id: "witness", type: "person", name: uniqueName() };
  const bystander: Person = { id: "suspect_b", type: "person", name: uniqueName() };
  const bar: Entity = { id: "across_town", type: "place", name: "the Westside bar" };
  const phone: Entity = { id: "witness_phone", type: "phone", name: "the witness's telephone line" };

  const when = core.when;
  const at = `location@${when}`; // the contested predicate the keyFact crux turns on

  const entities: Record<string, Entity> = Object.fromEntries(
    [culprit, victim, scene, witness, bystander, bar, phone].map((e) => [e.id, e]),
  );

  // Ground truth, projected from the authored core: culprit killed victim at the
  // scene at `when`; the witness was there too.
  const groundTruth: Claim[] = [
    claim(culprit.id, "killed", victim.id, true, `${culprit.name} killed ${victim.name}.`),
    claim(culprit.id, at, scene.id, true, `${culprit.name} was at ${scene.name} at ${when}.`),
    claim(witness.id, at, scene.id, true, `${witness.name} was near ${scene.name} at ${when}.`),
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
    leads: [witness.id, culprit.id, bystander.id, scene.id],
    clearanceCost: 0,
  };

  // THE LIE (placed against the keyFact): the witness falsely alibis the culprit
  // (and themselves) across town at `when`.
  const witnessStatement: CaseRecord = {
    id: "rec_witness_stmt",
    type: "witness-statement",
    title: `Statement of ${witness.name}`,
    source: witness.id,
    fidelity: "false",
    claims: [
      claim(witness.id, at, bar.id, false, `${witness.name} states they were at ${bar.name} at ${when}.`),
      claim(culprit.id, at, bar.id, false, `${witness.name} states ${culprit.name} was with them at ${bar.name} at ${when}.`),
    ],
    leads: [phone.id, bar.id, culprit.id],
    clearanceCost: 1,
  };

  // THE PROOF: phone logs place the witness at the scene at `when` — disproving the statement.
  const phoneRecords: CaseRecord = {
    id: "rec_phone",
    type: "phone-records",
    title: `Telephone records — ${witness.name}`,
    source: witness.id,
    fidelity: "true",
    claims: [
      claim(witness.id, at, scene.id, true, `${witness.name}'s line placed a call from beside ${scene.name} at ${when}.`),
    ],
    leads: [scene.id],
    clearanceCost: 1,
  };

  const autopsy: CaseRecord = {
    id: "rec_autopsy",
    type: "autopsy",
    title: `Autopsy — ${victim.name}`,
    source: victim.id,
    fidelity: "true",
    claims: [
      claim(victim.id, "death-time", when, true, `Time of death fixed at ${when}; ${core.how}.`),
      claim(victim.id, at, scene.id, true, `${victim.name} died at ${scene.name}.`),
    ],
    leads: [scene.id],
    clearanceCost: 1,
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

  const solution: Solution = {
    culpritId: culprit.id,
    keyContradiction: [witnessStatement.id, phoneRecords.id],
    predicate: at,
  };

  return {
    seed,
    entities,
    groundTruth,
    records: [caseFile, witnessStatement, phoneRecords, autopsy, property],
    caseFileId: caseFile.id,
    solution,
    suspects: [culprit.id, bystander.id, witness.id],
  };
}
