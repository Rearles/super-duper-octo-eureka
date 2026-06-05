// Persist deterministic Registry rows into SQLite, and read them back. The pure
// row-building lives in buildRows.ts; this is the DB-facing half (Prisma).
import { buildRegistryRows, type RegistryRows } from "./buildRows";
import { prisma } from "./db";
import type { AuthoredWorld } from "../src/engine/types";

/** Wipe the Registry and write a fresh deterministic seed. Children first (FKs). */
export async function persistRegistryRows(rows: RegistryRows): Promise<void> {
  // Police per-type tables (FK to PoliceRecord) first.
  await prisma.incidentReport.deleteMany();
  await prisma.arrestReport.deleteMany();
  await prisma.accidentReport.deleteMany();
  await prisma.investigationReport.deleteMany();
  await prisma.analyticalReport.deleteMany();
  await prisma.useOfForceReport.deleteMany();
  await prisma.internalAffairsReport.deleteMany();
  await prisma.criminalCaseReport.deleteMany();
  await prisma.cADDispatchLog.deleteMany();
  await prisma.fieldInterviewCard.deleteMany();
  await prisma.bookingReport.deleteMany();
  await prisma.supplementalReport.deleteMany();
  await prisma.bOLO.deleteMany();
  await prisma.warrant.deleteMany();
  await prisma.evidenceLog.deleteMany();
  await prisma.policeRecord.deleteMany();
  // Standalone record tables.
  await prisma.morticianRecord.deleteMany();
  await prisma.deathCertificate.deleteMany();
  await prisma.autopsyReport.deleteMany();
  await prisma.toxicologyReport.deleteMany();
  await prisma.courtRecord.deleteMany();
  await prisma.identityBinding.deleteMany();
  await prisma.personRegistration.deleteMany();
  await prisma.location.deleteMany();
  await prisma.organization.deleteMany();

  await prisma.personRegistration.createMany({
    data: rows.persons.map((p) => ({
      id: p.id,
      name: p.name,
      aliases: JSON.stringify(p.aliases),
      features: JSON.stringify(p.features),
    })),
  });
  await prisma.identityBinding.createMany({
    data: rows.bindings.map((b) => ({
      id: b.id,
      personId: b.personId,
      trueName: b.trueName,
      trueFeatures: JSON.stringify(b.trueFeatures),
    })),
  });
  await prisma.location.createMany({ data: rows.locations });
  await prisma.organization.createMany({ data: rows.organizations });
  await prisma.morticianRecord.createMany({ data: rows.morticianRecords });
  await prisma.policeRecord.createMany({
    data: rows.policeRecords.map((p) => ({
      id: p.id,
      reportType: p.reportType,
      subjectId: p.subjectId,
      locationId: p.locationId,
      occurredAt: p.occurredAt,
      narrative: p.narrative,
      enteredById: p.enteredById,
      motive: p.motive,
      fidelity: p.fidelity,
    })),
  });
  const incidents = rows.policeRecords.filter((p) => p.incident);
  await prisma.incidentReport.createMany({
    data: incidents.map((p) => ({
      id: p.incident!.id,
      policeRecordId: p.id,
      involved: JSON.stringify(p.incident!.involved),
      witnesses: JSON.stringify(p.incident!.witnesses),
      conditions: p.incident!.conditions,
      preliminaryActions: p.incident!.preliminaryActions,
    })),
  });

  // Death-investigation + judicial clusters.
  await prisma.deathCertificate.createMany({ data: rows.deathCertificates });
  await prisma.autopsyReport.createMany({ data: rows.autopsies });
  await prisma.toxicologyReport.createMany({
    data: rows.toxicologies.map((t) => ({
      id: t.id,
      subjectId: t.subjectId,
      autopsyId: t.autopsyId,
      substances: JSON.stringify(t.substances),
      findings: t.findings,
      analystId: t.analystId,
      enteredById: t.enteredById,
      fidelity: t.fidelity,
    })),
  });
  await prisma.courtRecord.createMany({
    data: rows.courtRecords.map((c) => ({
      id: c.id,
      caseRef: c.caseRef,
      court: c.court,
      judgeId: c.judgeId,
      rulingType: c.rulingType,
      ruling: c.ruling,
      ruledAt: c.ruledAt,
      parties: JSON.stringify(c.parties),
      enteredById: c.enteredById,
      motive: c.motive,
      fidelity: c.fidelity,
    })),
  });
}

/** Build + persist the Registry for an authored world + seed. Returns the rows. */
export async function seedRegistry(world: AuthoredWorld, seed: number): Promise<RegistryRows> {
  const rows = buildRegistryRows(world, seed);
  await persistRegistryRows(rows);
  return rows;
}

// --- read helpers (the API consumes these) ---

export async function getPerson(id: string) {
  return prisma.personRegistration.findUnique({ where: { id }, include: { binding: true } });
}

export async function listPeople() {
  return prisma.personRegistration.findMany();
}

/** Every record about a person — the multi-view fan-out the detective triangulates. */
export async function recordsAbout(personId: string) {
  const [mortician, police, deathCertificates, autopsies, toxicology] = await Promise.all([
    prisma.morticianRecord.findMany({ where: { subjectId: personId } }),
    prisma.policeRecord.findMany({ where: { subjectId: personId }, include: { incident: true } }),
    prisma.deathCertificate.findMany({ where: { subjectId: personId } }),
    prisma.autopsyReport.findMany({ where: { subjectId: personId } }),
    prisma.toxicologyReport.findMany({ where: { subjectId: personId } }),
  ]);
  return { mortician, police, deathCertificates, autopsies, toxicology };
}

export async function registryCounts() {
  const [people, locations, organizations, mortician, police, deathCertificates, autopsies, court] =
    await Promise.all([
      prisma.personRegistration.count(),
      prisma.location.count(),
      prisma.organization.count(),
      prisma.morticianRecord.count(),
      prisma.policeRecord.count(),
      prisma.deathCertificate.count(),
      prisma.autopsyReport.count(),
      prisma.courtRecord.count(),
    ]);
  return { people, locations, organizations, mortician, police, deathCertificates, autopsies, court };
}
