// Sim -> cold-case backlog (integration). Runs the society-sim and, when a faction
// takes a VIOLENT action that turns lethal, mints a homicide ground-truth event
// attributed to one of its people, fans it into records (a death certificate that
// is FORGED when the killing faction is protected/powerful, against an honest
// autopsy + incident report), and cools it into a cold case. So runHistory's
// unsolved violence becomes the self-refreshing backlog. Deterministic — same
// (world, seed, ticks) -> identical backlog. Pure (no DB; the server persists it).
import { createRng } from "./rng";
import { initSimState, tick } from "./sim";
import {
  coolIntoCase,
  emitRecords,
  homicideEvent,
  type GroundTruthEvent,
  type SimCase,
} from "./eventRecord";
import type { AuthoredWorld, BlocId } from "./types";

const VIOLENT = new Set(["muscle", "raid", "grab-turf"]);
const PROTECTED_BLOCS = new Set<BlocId>(["political-machine", "business-industry", "organized-crime"]);

export interface Backlog {
  groundTruth: GroundTruthEvent[];
  cases: SimCase[];
}

/** Generate a cold-case backlog by running the sim for `ticks` deterministic ticks. */
export function generateBacklog(world: AuthoredWorld, seed: number, ticks: number): Backlog {
  const state = initSimState(world, seed);
  const groundTruth: GroundTruthEvent[] = [];
  const cases: SimCase[] = [];

  const factionPeople = (factionId: string): string[] =>
    state.allegiances.filter((a) => a.factionId === factionId && !a.secret).map((a) => a.actorId);

  for (let i = 0; i < ticks; i++) {
    const events = tick(state);
    const rng = createRng(seed).derive(`backlog:${state.tick}`);
    for (const ev of events) {
      if (!VIOLENT.has(ev.action)) continue;
      if (!rng.bool(0.45)) continue; // not every violent act is lethal
      const own = factionPeople(ev.factionId);
      const others = state.allegiances
        .filter((a) => a.factionId !== ev.factionId)
        .map((a) => a.actorId);
      if (own.length === 0 || others.length === 0) continue;
      const culpritId = rng.pick(own);
      const victimId = rng.pick(others);
      if (!victimId || victimId === culpritId) continue;

      const faction = world.factions.find((f) => f.id === ev.factionId);
      const event = homicideEvent({
        id: `gt_${state.tick}_${ev.factionId}_${culpritId}`,
        culpritId,
        victimId,
        locationId: `zone_${ev.factionId}`,
        at: String(state.tick),
        how: ev.action === "grab-turf" ? "a turf killing" : "a gangland hit",
      });
      groundTruth.push(event);

      const protectedKill = !!faction?.bloc && PROTECTED_BLOCS.has(faction.bloc);
      const records = emitRecords(event, [
        {
          recordType: "ruling",
          title: "Death certificate",
          author: {
            enteredById: ev.factionId,
            integrity: protectedKill ? 0.2 : 0.9, // a protected faction's coroner is bought
            ...(protectedKill ? { motive: `shield ${faction?.name ?? ev.factionId}` } : {}),
          },
        },
        { recordType: "autopsy", title: "Autopsy", author: { enteredById: "medical-examiner", integrity: 0.9 } },
        {
          recordType: "witness-statement",
          title: "Incident report",
          author: { enteredById: "responding-officer", integrity: 0.8 },
        },
      ]);
      cases.push(coolIntoCase(event, records));
    }
  }

  return { groundTruth, cases };
}
