import { describe, it, expect } from "vitest";
import {
  initDecay,
  tickDecay,
  passiveDecay,
  heatFromAccess,
  activeCoverUp,
  protectRecord,
  enforceFloorUnderDecay,
  UNOBTAINABLE_BELOW,
} from "./decay";
import { homicideEvent, emitRecords, coolIntoCase } from "./eventRecord";

const ev = homicideEvent({
  id: "e",
  culpritId: "skell",
  victimId: "crase",
  locationId: "study",
  at: "0115",
  how: "an injection",
});
const records = emitRecords(ev, [
  { recordType: "witness-statement", title: "W", author: { enteredById: "w", integrity: 1 } },
  { recordType: "autopsy", title: "A", author: { enteredById: "me", integrity: 1 } },
  { recordType: "ruling", title: "cert", author: { enteredById: "coroner", integrity: 0 } },
]);
const witnessId = records[0]!.id;
const autopsyId = records[1]!.id;

describe("society-sim: passive decay", () => {
  it("decays toward zero over time", () => {
    expect(passiveDecay(1, 5, 0.05)).toBe(0.75);
    expect(passiveDecay(1, 100, 0.05)).toBe(0);
  });

  it("witness memory fades faster than physical/official records", () => {
    let states = initDecay(records);
    for (let i = 0; i < 11; i++) states = tickDecay(states);
    expect(states.find((s) => s.recordId === witnessId)?.obtainable).toBe(false); // gone
    expect(states.find((s) => s.recordId === autopsyId)?.obtainable).toBe(true); // still there
  });

  it("protected records do not decay (counter-play)", () => {
    let states = protectRecord(initDecay(records), witnessId);
    for (let i = 0; i < 20; i++) states = tickDecay(states);
    expect(states.find((s) => s.recordId === witnessId)?.recoverability).toBe(1);
  });
});

describe("society-sim: the observer effect (heat -> cover-up)", () => {
  it("reads heat from the audit-log sensor net", () => {
    const access = [
      { caseId: "case_e" },
      { caseId: "case_e", recordId: witnessId },
      { caseId: "other" },
    ];
    expect(heatFromAccess(access, "case_e")).toBe(2);
  });

  it("does nothing below the heat threshold", () => {
    const { coverUp } = activeCoverUp(records, initDecay(records), 2, "skell");
    expect(coverUp).toBeUndefined();
  });

  it("at threshold, targets a load-bearing truthful record and degrades it", () => {
    const { states, coverUp } = activeCoverUp(records, initDecay(records), 3, "skell");
    expect(coverUp).toBeDefined();
    const degraded = states.find((s) => s.recordId === coverUp!.recordId);
    expect(degraded!.recoverability).toBeLessThan(1);
  });
});

describe("society-sim: engagement floor under decay", () => {
  it("never lets a case decay to a blank wall", () => {
    const c = coolIntoCase(ev, records);
    // everything decayed below the floor
    const dead = initDecay(records).map((s) => ({ ...s, recoverability: 0.1, obtainable: false }));
    const { determination } = enforceFloorUnderDecay(c, dead);
    expect(determination.fair).toBe(true);
    expect(determination.determination).not.toBe("blank");
    expect(UNOBTAINABLE_BELOW).toBeGreaterThan(0);
  });
});
