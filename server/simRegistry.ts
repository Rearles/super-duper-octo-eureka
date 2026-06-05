// Persist the society-sim's output into the Registry (integration). Runs the
// backlog generator and writes the HIDDEN ground-truth log (the answer key, never
// exposed via the API), the cold cases (player-facing), and the sim-authored
// records (the distorted exhaust). The browser/engine stays Prisma-free; this is
// the Node bridge.
import { generateBacklog } from "../src/engine/backlog";
import { classifySimCase } from "../src/engine/eventRecord";
import { prisma } from "./db";
import type { AuthoredWorld } from "../src/engine/types";

export async function persistBacklog(
  world: AuthoredWorld,
  seed: number,
  ticks: number,
): Promise<{ groundTruth: number; cases: number; records: number }> {
  const { groundTruth, cases } = generateBacklog(world, seed, ticks);

  await prisma.simRecord.deleteMany();
  await prisma.coldCase.deleteMany();
  await prisma.groundTruthLog.deleteMany();

  await prisma.groundTruthLog.createMany({
    data: groundTruth.map((e) => ({
      id: `gtl_${e.id}`,
      eventId: e.id,
      kind: e.kind,
      culpritId: e.culpritId,
      victimId: e.victimId ?? null,
      locationId: e.locationId ?? null,
      at: e.at,
      truth: JSON.stringify(e.truth),
    })),
  });
  await prisma.coldCase.createMany({
    data: cases.map((c) => ({
      id: c.id,
      eventId: c.eventId,
      state: c.state,
      determination: classifySimCase(c).determination,
    })),
  });
  const records = cases.flatMap((c) =>
    c.records.map((r) => ({
      id: `${c.id}__${r.id}`,
      caseId: c.id,
      type: r.type,
      title: r.title,
      fidelity: r.fidelity,
      claims: JSON.stringify(r.claims),
      enteredById: "sim",
    })),
  );
  await prisma.simRecord.createMany({ data: records });

  return { groundTruth: groundTruth.length, cases: cases.length, records: records.length };
}

/** Player-facing: cold cases WITHOUT the ground truth (the answer key stays hidden). */
export async function listColdCases() {
  return prisma.coldCase.findMany();
}

export async function caseRecords(caseId: string) {
  return prisma.simRecord.findMany({ where: { caseId } });
}

/** Server-internal resolution only — NEVER an API route (it would leak the answer). */
export async function groundTruthForEvent(eventId: string) {
  return prisma.groundTruthLog.findUnique({ where: { eventId } });
}
