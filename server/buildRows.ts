// Pure, deterministic Registry row-builder: maps an AuthoredWorld into Registry
// rows (people, identity bindings, places, orgs, and a starter record layer that
// now includes the death-investigation + judicial clusters). NO Prisma/DB here —
// kept pure so determinism is unit-testable (Pillar 1): the same seed always
// yields identical rows. The DB persist lives in registry.ts.
import { createIdFactory } from "../src/engine/ids";
import type { AuthoredWorld } from "../src/engine/types";

export interface PersonRow {
  id: string;
  name: string;
  aliases: string[];
  features: Record<string, unknown>;
}
export interface BindingRow {
  id: string;
  personId: string;
  trueName: string;
  trueFeatures: Record<string, unknown>;
}
export interface LocationRow {
  id: string;
  name: string;
  kind: string;
  zoneId: string | null;
}
export interface OrganizationRow {
  id: string;
  name: string;
  kind: string;
}
export interface MorticianRow {
  id: string;
  subjectId: string;
  causeOfDeath: string | null;
  mannerHint: string | null;
  notes: string | null;
  enteredById: string;
  motive: string | null;
  fidelity: string;
  enteredAt: string | null;
}
export interface IncidentSub {
  id: string;
  involved: string[];
  witnesses: string[];
  conditions: string | null;
  preliminaryActions: string | null;
}
export interface PoliceRow {
  id: string;
  reportType: string;
  subjectId: string | null;
  locationId: string | null;
  occurredAt: string | null;
  narrative: string | null;
  enteredById: string;
  motive: string | null;
  fidelity: string;
  incident?: IncidentSub;
}
export interface DeathCertRow {
  id: string;
  subjectId: string;
  mannerOfDeath: string;
  causeOfDeath: string | null;
  pronouncedAt: string | null;
  certifierId: string | null;
  enteredById: string;
  motive: string | null;
  fidelity: string;
}
export interface AutopsyRow {
  id: string;
  subjectId: string;
  deathCertId: string | null;
  causeFindings: string | null;
  woundPattern: string | null;
  timeOfDeath: string | null;
  examinerId: string | null;
  enteredById: string;
  motive: string | null;
  fidelity: string;
}
export interface ToxRow {
  id: string;
  subjectId: string;
  autopsyId: string | null;
  substances: string[];
  findings: string | null;
  analystId: string | null;
  enteredById: string;
  fidelity: string;
}
export interface CourtRow {
  id: string;
  caseRef: string | null;
  court: string | null;
  judgeId: string | null;
  rulingType: string | null;
  ruling: string | null;
  ruledAt: string | null;
  parties: string[];
  enteredById: string;
  motive: string | null;
  fidelity: string;
}
export interface RegistryRows {
  seed: number;
  persons: PersonRow[];
  bindings: BindingRow[];
  locations: LocationRow[];
  organizations: OrganizationRow[];
  morticianRecords: MorticianRow[];
  policeRecords: PoliceRow[];
  deathCertificates: DeathCertRow[];
  autopsies: AutopsyRow[];
  toxicologies: ToxRow[];
  courtRecords: CourtRow[];
  /** authored entity id -> registry GUID (so records can reference registry ids) */
  idMap: Record<string, string>;
}

/** Build the deterministic Registry rows for an authored world + seed. Pure. */
export function buildRegistryRows(world: AuthoredWorld, seed: number): RegistryRows {
  const idf = createIdFactory(seed);
  const idMap: Record<string, string> = {};

  const persons: PersonRow[] = [];
  const bindings: BindingRow[] = [];
  for (const p of world.people) {
    const id = idf.next("person");
    idMap[p.id] = id;
    persons.push({ id, name: p.name, aliases: [], features: {} });
    // The unforgeable spine: this GUID truly is this person (Pillar 1 ground truth).
    bindings.push({ id: idf.next("bind"), personId: id, trueName: p.name, trueFeatures: {} });
  }

  const locations: LocationRow[] = [];
  for (const place of world.places) {
    const id = idf.next("place");
    idMap[place.id] = id;
    locations.push({ id, name: place.name, kind: "address", zoneId: null });
  }

  const organizations: OrganizationRow[] = [];
  for (const f of world.factions) {
    const id = idf.next("org");
    idMap[f.id] = id;
    organizations.push({ id, name: f.name, kind: "faction" });
  }

  const morticianRecords: MorticianRow[] = [];
  const policeRecords: PoliceRow[] = [];
  const deathCertificates: DeathCertRow[] = [];
  const autopsies: AutopsyRow[] = [];
  const toxicologies: ToxRow[] = [];
  const courtRecords: CourtRow[] = [];

  for (const c of world.cases) {
    const victimRegId = idMap[c.victimId];
    const culpritRegId = idMap[c.culpritId];
    if (!victimRegId || !culpritRegId) continue; // authored core references a non-person; skip

    const culpritPerson = world.people.find((p) => p.id === c.culpritId);
    const faction = world.factions.find((f) => f.id === culpritPerson?.factionId);
    const mouthAuthoredId = faction?.members[0]?.personId;
    const enteredById = (mouthAuthoredId && idMap[mouthAuthoredId]) || culpritRegId;

    // The cover-up seam: a how-crux case has its manner-of-death forged "natural"
    // (a faction-motivated, hidden-fidelity lie a true autopsy later disproves).
    const forged = c.keyFact === "how";
    const motive = forged ? `shield ${faction?.name ?? "the accused"}` : null;

    morticianRecords.push({
      id: idf.next("mort"),
      subjectId: victimRegId,
      causeOfDeath: forged ? "natural causes" : c.how,
      mannerHint: forged ? "natural" : "homicide",
      notes: null,
      enteredById,
      motive,
      fidelity: forged ? "false" : "true",
      enteredAt: c.when,
    });

    policeRecords.push({
      id: idf.next("police"),
      reportType: "incident",
      subjectId: victimRegId,
      locationId: idMap[c.whereId] ?? null,
      occurredAt: c.when,
      narrative: `Reported at ${c.when}: ${c.what}.`,
      enteredById,
      motive: null,
      fidelity: "true",
      incident: {
        id: idf.next("incident"),
        involved: [victimRegId, culpritRegId],
        witnesses: [],
        conditions: null,
        preliminaryActions: "Scene secured; body removed to the morgue.",
      },
    });

    // Death-investigation cluster — the multi-view fan-out. The death certificate
    // may forge the manner; the autopsy stays HONEST, so the two records contradict
    // (the deduction seam: corroborate through the record the cover-up didn't own).
    const certId = idf.next("death");
    deathCertificates.push({
      id: certId,
      subjectId: victimRegId,
      mannerOfDeath: forged ? "natural" : "homicide",
      causeOfDeath: forged ? "natural causes" : c.how,
      pronouncedAt: c.when,
      certifierId: enteredById,
      enteredById,
      motive,
      fidelity: forged ? "false" : "true",
    });

    const autopsyId = idf.next("autopsy");
    autopsies.push({
      id: autopsyId,
      subjectId: victimRegId,
      deathCertId: certId,
      causeFindings: c.how, // the TRUE cause — contradicts a forged certificate
      woundPattern: forged
        ? "injuries inconsistent with a natural death"
        : "consistent with the reported method",
      timeOfDeath: c.when,
      examinerId: null,
      enteredById,
      motive: null,
      fidelity: "true", // the honest autopsy is the contradiction
    });

    toxicologies.push({
      id: idf.next("tox"),
      subjectId: victimRegId,
      autopsyId,
      substances: [],
      findings: "no occlusive toxicology",
      analystId: null,
      enteredById,
      fidelity: "true",
    });

    courtRecords.push({
      id: idf.next("court"),
      caseRef: null,
      court: "Circuit Court",
      judgeId: null,
      rulingType: "open",
      ruling: `No disposition entered for ${c.what}.`,
      ruledAt: null,
      parties: [victimRegId, culpritRegId],
      enteredById,
      motive: null,
      fidelity: "true",
    });
  }

  return {
    seed,
    persons,
    bindings,
    locations,
    organizations,
    morticianRecords,
    policeRecords,
    deathCertificates,
    autopsies,
    toxicologies,
    courtRecords,
    idMap,
  };
}
