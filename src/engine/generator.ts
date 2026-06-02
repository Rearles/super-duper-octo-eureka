import type { Claim, CaseRecord, Entity, GameCase, Solution } from "./types";

/** Deterministic seeded PRNG (mulberry32). Same seed → identical case. */
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

/**
 * Generate one "Buried Witness" case from a seed (§5.4 archetype):
 * ground truth is built first, then records are projected — one of them a lie
 * (a false alibi) that a true record (phone logs) disproves. Always solvable.
 */
export function generateCase(seed: number): GameCase {
  const rng = mulberry32(seed);
  const used = new Set<string>();
  const uniqueName = (): string => {
    let n = "";
    let guard = 0;
    do {
      n = `${FIRST[Math.floor(rng() * FIRST.length)]} ${LAST[Math.floor(rng() * LAST.length)]}`;
    } while (used.has(n) && guard++ < 64);
    used.add(n);
    return n;
  };

  const victim: Entity = { id: "victim", type: "person", name: uniqueName() };
  const culprit: Entity = { id: "suspect_a", type: "person", name: uniqueName() };
  const bystander: Entity = { id: "suspect_b", type: "person", name: uniqueName() };
  const witness: Entity = { id: "witness", type: "person", name: uniqueName() };
  const home: Entity = { id: "victim_home", type: "place", name: "the victim's flat" };
  const bar: Entity = { id: "across_town", type: "place", name: "the Westside bar" };
  const phone: Entity = { id: "witness_phone", type: "phone", name: "the witness's telephone line" };

  const entities: Record<string, Entity> = Object.fromEntries(
    [victim, culprit, bystander, witness, home, bar, phone].map((e) => [e.id, e]),
  );

  // Ground truth: culprit killed victim at 23:00 at the flat; the witness was there too.
  const groundTruth: Claim[] = [
    claim(culprit.id, "killed", victim.id, true, `${culprit.name} killed ${victim.name}.`),
    claim(culprit.id, "location@2300", home.id, true, `${culprit.name} was at ${home.name} at 23:00.`),
    claim(witness.id, "location@2300", home.id, true, `${witness.name} was near ${home.name} at 23:00.`),
  ];

  const caseFile: CaseRecord = {
    id: "rec_casefile",
    type: "case-file",
    title: "Cold Case File",
    source: victim.id,
    fidelity: "true",
    claims: [
      claim(victim.id, "found-dead", home.id, true, `${victim.name} was found dead at ${home.name}; ruled inconclusive.`),
    ],
    leads: [witness.id, culprit.id, bystander.id, home.id],
    clearanceCost: 0,
  };

  // THE LIE: the witness falsely alibis the culprit (and themselves) across town.
  const witnessStatement: CaseRecord = {
    id: "rec_witness_stmt",
    type: "witness-statement",
    title: `Statement of ${witness.name}`,
    source: witness.id,
    fidelity: "false",
    claims: [
      claim(witness.id, "location@2300", bar.id, false, `${witness.name} states they were at ${bar.name} at 23:00.`),
      claim(culprit.id, "location@2300", bar.id, false, `${witness.name} states ${culprit.name} was with them at ${bar.name} at 23:00.`),
    ],
    leads: [phone.id, bar.id, culprit.id],
    clearanceCost: 1,
  };

  // THE PROOF: phone logs place the witness at the flat at 23:00 — contradicting the statement.
  const phoneRecords: CaseRecord = {
    id: "rec_phone",
    type: "phone-records",
    title: `Telephone records — ${witness.name}`,
    source: witness.id,
    fidelity: "true",
    claims: [
      claim(witness.id, "location@2300", home.id, true, `${witness.name}'s line placed a call from beside ${home.name} at 23:00.`),
    ],
    leads: [home.id],
    clearanceCost: 1,
  };

  const autopsy: CaseRecord = {
    id: "rec_autopsy",
    type: "autopsy",
    title: `Autopsy — ${victim.name}`,
    source: victim.id,
    fidelity: "true",
    claims: [
      claim(victim.id, "death-time", "2300", true, `Time of death fixed at 23:00.`),
      claim(victim.id, "location@2300", home.id, true, `${victim.name} died at ${home.name}.`),
    ],
    leads: [home.id],
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
    predicate: "location@2300",
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
