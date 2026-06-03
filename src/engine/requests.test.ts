import { describe, it, expect } from "vitest";
import { CaseSession } from "./index";
import { generateCase } from "./generator";
import { resolveCore, verifyClaim } from "./factions";
import { buriedWitnessWorld as world } from "./world/buriedWitness";

const gc = generateCase(world, 7);
const core = resolveCore(world, gc);

describe("verifyClaim (against ground truth)", () => {
  it("true when the claim matches, false when it conflicts, partial when unknown", () => {
    const culprit = gc.solution.culpritId;
    const pred = "location@2300";
    expect(
      verifyClaim({ subject: culprit, predicate: pred, object: core.whereId, truthful: true, text: "" }, gc.groundTruth),
    ).toBe("true");
    expect(
      verifyClaim({ subject: culprit, predicate: pred, object: "across_town", truthful: false, text: "" }, gc.groundTruth),
    ).toBe("false");
    expect(
      verifyClaim({ subject: "nobody", predicate: "x", object: "y", truthful: true, text: "" }, gc.groundTruth),
    ).toBe("partial");
  });
});

describe("faction requests", () => {
  it("generates one request per stake-holding faction, with provenance and hidden fidelity", () => {
    const s = new CaseSession(7);
    const reqs = s.requests();
    const heights = reqs.find((r) => r.factionId === "the-heights")!;
    const press = reqs.find((r) => r.factionId === "the-press")!;
    expect(heights.ask).toBe("bury");
    expect(heights.provenance).toBe("grapevine");
    expect(press.ask).toBe("expose");
    expect(press.provenance).toBe("press");
    expect(reqs.every((r) => r.revealed === false)).toBe(true); // fidelity hidden until verified
  });

  it("verify reveals a grapevine lie as false and costs clearance", () => {
    const s = new CaseSession(7);
    const before = s.clearance;
    const res = s.verifyRequest("req_the-heights");
    expect(res.ok).toBe(true);
    expect(res.fidelity).toBe("false"); // the cover-up exposed
    expect(s.clearance).toBe(before - 1);
    expect(s.requests().find((r) => r.id === "req_the-heights")!.revealed).toBe(true);
    expect(s.verifyRequest("req_the-heights").ok).toBe(false); // already verified
  });

  it("verify is refused without enough clearance", () => {
    const s = new CaseSession(7, { clearance: 0 });
    expect(s.verifyRequest("req_the-heights").ok).toBe(false);
  });

  it("fulfill raises Standing, grants a Favor, and ripples to the rival", () => {
    const s = new CaseSession(7);
    expect(s.fulfillRequest("req_the-heights").ok).toBe(true);
    const h = s.factions().find((f) => f.factionId === "the-heights")!;
    expect(h.standing).toBeGreaterThan(0);
    expect(h.favors).toBe(1);
    const p = s.factions().find((f) => f.factionId === "the-press")!;
    expect(p.standing).toBeLessThan(0); // rival shifts the other way (the web)
    expect(s.requests().find((r) => r.id === "req_the-heights")!.status).toBe("fulfilled");
  });

  it("refuse raises the faction's Heat and marks it refused", () => {
    const s = new CaseSession(7);
    s.refuseRequest("req_the-heights");
    expect(s.factions().find((f) => f.factionId === "the-heights")!.heat).toBeGreaterThan(0);
    expect(s.requests().find((r) => r.id === "req_the-heights")!.status).toBe("refused");
  });

  it("a resolved request cannot be resolved again", () => {
    const s = new CaseSession(7);
    s.fulfillRequest("req_the-heights");
    expect(s.refuseRequest("req_the-heights").ok).toBe(false);
  });
});

describe("contacts & favors", () => {
  it("calling a contact spends a favor for a clearance boost (access, not answers)", () => {
    const s = new CaseSession(7);
    expect(s.callContact("culprit").ok).toBe(false); // no favors yet

    s.fulfillRequest("req_the-heights"); // earn a Heights favor
    const before = s.clearance;
    const call = s.callContact("culprit"); // Cole Voss is a Heights contact
    expect(call.ok).toBe(true);
    expect(s.clearance).toBeGreaterThan(before);
    expect(s.factions().find((f) => f.factionId === "the-heights")!.favors).toBe(0);
  });
});
