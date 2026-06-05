import { describe, it, expect } from "vitest";
import { publicProjection, goPublic, publishThroughPress, reactionsToPublication } from "./publicView";
import { homicideEvent, emitRecords } from "./eventRecord";
import { seedRelationships } from "./diplomacy";
import { simDemoWorld } from "./world";

const ev = homicideEvent({
  id: "e",
  culpritId: "skell",
  victimId: "crase",
  locationId: "study",
  at: "0115",
  how: "poison",
});
const records = emitRecords(ev, [
  { recordType: "autopsy", title: "Autopsy", author: { enteredById: "me", integrity: 1 } },
  { recordType: "ruling", title: "Death certificate", author: { enteredById: "coroner", integrity: 0 } },
]);

describe("surfaces: public read-model (CQRS) + Go Public", () => {
  it("the public sees only published records; the detective sees all", () => {
    let published = new Set<string>();
    expect(publicProjection(records, published)).toHaveLength(0); // nothing public yet
    published = goPublic(published, records[0]!.id);
    expect(publicProjection(records, published).map((r) => r.id)).toEqual([records[0]!.id]);
    expect(records.length).toBeGreaterThan(publicProjection(records, published).length); // detective sees more
  });

  it("a yellow press re-distorts even a true record on the way out", () => {
    const truth = records[0]!; // a true autopsy
    expect(truth.fidelity).toBe("true");
    const rigorous = publishThroughPress(truth, { enteredById: "gazette", integrity: 1 });
    expect(rigorous.fidelity).toBe("true"); // a rigorous paper keeps it straight
    const yellow = publishThroughPress(truth, { enteredById: "courier", integrity: 0 });
    expect(yellow.fidelity).toBe("false"); // the courier bends it
    expect(yellow.claims.every((c) => !c.truthful)).toBe(true);
  });

  it("going public ripples through the faction graph (allies cool, rivals warm)", () => {
    const rels = seedRelationships(simDemoWorld);
    const reactions = reactionsToPublication(rels, "river-rats");
    const ally = reactions.find((r) => r.factionId === "the-hall"); // river-rats' ally
    const rival = reactions.find((r) => r.factionId === "northside-crew"); // river-rats' rival
    expect(ally?.standingDelta).toBe(-1); // exposing the rats hurts their ally
    expect(rival?.standingDelta).toBe(1); // and helps their rival
  });
});
