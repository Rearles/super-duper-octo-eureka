import { describe, it, expect } from "vitest";
import {
  newDetective,
  integrityState,
  flipActor,
  coOptDetective,
  filingFidelity,
  compromisingActToAudit,
  leverageFromCaughtAct,
  ending,
} from "./detective";

describe("society-sim: detective integrity", () => {
  it("maps integrity to a branching state", () => {
    expect(integrityState(1)).toBe("clean");
    expect(integrityState(0.5)).toBe("compromised");
    expect(integrityState(0.1)).toBe("owned");
  });
});

describe("society-sim: flipping a witness", () => {
  const base = {
    targetId: "w",
    toFactionId: "law-enforcement",
    incentives: { material: 3, power: 0, survival: 0, coercion: 0, loyalty: 0 },
    targetFear: 3,
    at: "t",
  };
  it("offering protection (cutting fear) is what turns a frightened witness", () => {
    expect(flipActor({ ...base, offerProtection: false }).switched).toBe(false);
    expect(flipActor({ ...base, offerProtection: true }).switched).toBe(true);
  });
});

describe("society-sim: co-opting the detective", () => {
  it("a strong offer flips him — integrity drops, a secret tie + leverage form", () => {
    const d = newDetective("det");
    const { detective, accepted } = coOptDetective(d, {
      factionId: "the-machine",
      incentives: { material: 4, power: 0, survival: 0, coercion: 0, loyalty: 0 },
      at: "1931",
    });
    expect(accepted).toBe(true);
    expect(detective.integrity).toBeLessThan(1);
    expect(detective.allegiances.some((a) => a.factionId === "the-machine" && a.secret)).toBe(true);
    expect(detective.leverageOwed).toHaveLength(1);
  });

  it("a weak offer is refused (he stays clean)", () => {
    const d = newDetective("det");
    const { detective, accepted } = coOptDetective(d, {
      factionId: "the-machine",
      incentives: { material: 1, power: 0, survival: 0, coercion: 0, loyalty: 0 },
      at: "1931",
    });
    expect(accepted).toBe(false);
    expect(detective.integrity).toBe(1);
  });
});

describe("society-sim: the loop closes on the player", () => {
  it("a compromised detective's own filings gain hidden fidelity", () => {
    expect(filingFidelity(newDetective("d"))).toBe("true"); // clean -> honest
    expect(filingFidelity({ ...newDetective("d"), integrity: 0.2 })).toBe("false"); // owned -> he buries it
  });

  it("the sensor net cuts both ways: a caught compromising act becomes leverage", () => {
    const act = compromisingActToAudit({ ...newDetective("d"), integrity: 0.4 }, { kind: "took-a-favor", targetId: "the-machine" });
    expect(act.action).toBe("compromise:took-a-favor");
    expect(leverageFromCaughtAct("the-machine", "d").kind).toBe("blackmail");
  });
});

describe("society-sim: endings (gated, not graded)", () => {
  it("integrity + reform standing select the ending", () => {
    expect(ending(newDetective("d"), 1)).toBe("crusader"); // clean + reform behind him
    expect(ending({ ...newDetective("d"), integrity: 0.1 }, 1)).toBe("owned"); // bought, regardless
    expect(ending(newDetective("d"), -1)).toBe("burned-out"); // clean but alone
  });
});
