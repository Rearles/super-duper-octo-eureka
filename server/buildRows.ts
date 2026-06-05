// Pure, deterministic Registry row-builder: maps an AuthoredWorld into Registry
// rows (people, identity bindings, places, orgs, and a starter record layer).
// NO Prisma/DB here — kept pure so determinism is unit-testable (Pillar 1): the
// same seed always yields identical rows. The DB persist lives in registry.ts.
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
export interface RegistryRows {
  seed: number;
  persons: PersonRow[];
  bindings: BindingRow[];
  locations: LocationRow[];
  organizations: OrganizationRow[];
  morticianRecords: MorticianRow[];
  policeRecords: PoliceRow[];
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
    morticianRecords.push({
      id: idf.next("mort"),
      subjectId: victimRegId,
      causeOfDeath: forged ? "natural causes" : c.how,
      mannerHint: forged ? "natural" : "homicide",
      notes: null,
      enteredById,
      motive: forged ? `shield ${faction?.name ?? "the accused"}` : null,
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
  }

  return { seed, persons, bindings, locations, organizations, morticianRecords, policeRecords, idMap };
}
