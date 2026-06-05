import { describe, it, expect } from "vitest";
import {
  BLOCS,
  allBlocs,
  factionsInBloc,
  seedAllegiances,
  publicAllegiance,
  secretAllegiances,
  switchScore,
  evaluateAllegiance,
  moveFactionToBloc,
} from "./allegiance";
import { defaultWorld } from "./world";

describe("society-sim: blocs", () => {
  it("defines the seven blocs", () => {
    expect(allBlocs()).toHaveLength(7);
    expect(BLOCS["organized-crime"].name).toBe("Organized Crime");
  });

  it("assigns the authored factions to blocs", () => {
    expect(factionsInBloc(defaultWorld, "press").map((f) => f.id)).toContain("the-press");
    expect(factionsInBloc(defaultWorld, "political-machine").map((f) => f.id)).toContain("the-machine");
    expect(factionsInBloc(defaultWorld, "business-industry").map((f) => f.id)).toContain("the-syndicate");
  });
});

describe("society-sim: allegiance portfolio", () => {
  it("seeds a public tie for every authored member", () => {
    const ties = seedAllegiances(defaultWorld);
    const members = defaultWorld.factions.flatMap((f) => f.members);
    expect(ties).toHaveLength(members.length);
    expect(ties.every((t) => t.secret === false && t.strength === 1)).toBe(true);
  });

  it("a bought official holds a PUBLIC tie AND a SECRET one (the mole shape)", () => {
    const ties = seedAllegiances(defaultWorld);
    const official = defaultWorld.people[0]!.id; // an authored member (public tie seeded)
    const decision = evaluateAllegiance({
      actorId: official,
      targetFactionId: "the-syndicate",
      incentives: { material: 3, power: 0, survival: 0, coercion: 0, loyalty: 0 },
      costs: { bonds: 1, fear: 0, reputation: 0 },
      secret: true,
      at: "1931",
    });
    expect(decision.switched).toBe(true);
    const portfolio = [...ties, decision.tie!];
    expect(publicAllegiance(portfolio, official)).toBeDefined();
    expect(secretAllegiances(portfolio, official).map((t) => t.factionId)).toContain("the-syndicate");
  });
});

describe("society-sim: incentive engine", () => {
  it("switches only when incentive - cost crosses the threshold", () => {
    expect(
      switchScore(
        { material: 3, power: 0, survival: 0, coercion: 0, loyalty: 0 },
        { bonds: 1, fear: 0, reputation: 0 },
      ),
    ).toBe(2);
    const tempted = evaluateAllegiance({
      actorId: "a",
      targetFactionId: "f",
      incentives: { material: 3, power: 0, survival: 0, coercion: 0, loyalty: 0 },
      costs: { bonds: 1, fear: 0, reputation: 0 },
      at: "t",
    });
    expect(tempted.switched).toBe(true);
    // high fear of retaliation holds the tie (emergent omerta)
    const afraid = evaluateAllegiance({
      actorId: "a",
      targetFactionId: "f",
      incentives: { material: 1, power: 0, survival: 0, coercion: 0, loyalty: 0 },
      costs: { bonds: 1, fear: 3, reputation: 0 },
      at: "t",
    });
    expect(afraid.switched).toBe(false);
  });

  it("is deterministic / pure", () => {
    const opts = {
      actorId: "a",
      targetFactionId: "f",
      incentives: { material: 2, power: 1, survival: 0, coercion: 0, loyalty: 0 },
      costs: { bonds: 1, fear: 0, reputation: 0 },
      at: "t",
    };
    expect(evaluateAllegiance({ ...opts })).toEqual(evaluateAllegiance({ ...opts }));
  });
});

describe("society-sim: bloc fluidity", () => {
  it("a crew can cross blocs (unorganized -> organized)", () => {
    const crew = { id: "x", bloc: "unorganized-crime" as const };
    expect(moveFactionToBloc(crew, "organized-crime").bloc).toBe("organized-crime");
  });
});
