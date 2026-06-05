import { describe, it, expect } from "vitest";
import {
  homicideEvent,
  emitRecords,
  appendGroundTruth,
  coolIntoCase,
  classifySimCase,
  commitCaseVerdict,
} from "./eventRecord";

const ev = homicideEvent({
  id: "e1",
  culpritId: "skell",
  victimId: "crase",
  locationId: "study",
  at: "0115",
  how: "an injection that stops the heart",
});

describe("society-sim: event -> record pipeline", () => {
  it("keeps the ground truth out of the emitted records (it lives in the log)", () => {
    const log = appendGroundTruth([], ev);
    expect(log).toHaveLength(1);
    expect(log[0]!.truth.length).toBeGreaterThan(0);
  });

  it("fans one event into many records; honest agree, the bought one diverges", () => {
    const recs = emitRecords(ev, [
      { recordType: "autopsy", title: "Autopsy", author: { enteredById: "me", integrity: 1 } },
      { recordType: "witness-statement", title: "Incident report", author: { enteredById: "cop", integrity: 1 } },
      {
        recordType: "ruling",
        title: "Death certificate",
        author: { enteredById: "coroner", integrity: 0, motive: "shield the syndicate" },
      },
    ]);
    expect(recs.filter((r) => r.fidelity === "true")).toHaveLength(2);
    const forged = recs.filter((r) => r.fidelity === "false");
    expect(forged).toHaveLength(1);
    expect(forged[0]!.claims.every((c) => !c.truthful)).toBe(true); // it diverges from the truth
  });

  it("cools into a cold case classified provable, never blank", () => {
    const c = coolIntoCase(
      ev,
      emitRecords(ev, [
        { recordType: "autopsy", title: "Autopsy", author: { enteredById: "me", integrity: 1 } },
        { recordType: "witness-statement", title: "Incident", author: { enteredById: "cop", integrity: 1 } },
        { recordType: "ruling", title: "Death cert", author: { enteredById: "coroner", integrity: 0 } },
      ]),
    );
    expect(c.state).toBe("cold");
    const cls = classifySimCase(c);
    expect(cls.determination).toBe("provable");
    expect(cls.fair).toBe(true);
  });

  it("commit-by-doing resolves the three case states", () => {
    const provable = coolIntoCase(
      ev,
      emitRecords(ev, [
        { recordType: "autopsy", title: "A", author: { enteredById: "me", integrity: 1 } },
        { recordType: "witness-statement", title: "B", author: { enteredById: "cop", integrity: 1 } },
      ]),
    );
    expect(commitCaseVerdict(provable, { who: "skell" }, "charge").state).toBe("solved");
    expect(commitCaseVerdict(provable, { who: "okafor" }, "charge").state).toBe("closed-false");

    // only one honest corroboration -> crackable, not provable -> cleared by theory
    const byTheory = coolIntoCase(
      ev,
      emitRecords(ev, [
        { recordType: "autopsy", title: "A", author: { enteredById: "me", integrity: 1 } },
        { recordType: "ruling", title: "cert", author: { enteredById: "coroner", integrity: 0 } },
      ]),
    );
    expect(classifySimCase(byTheory).determination).toBe("crackable");
    expect(commitCaseVerdict(byTheory, { who: "skell" }, "charge").state).toBe("cleared-by-theory");
  });
});
