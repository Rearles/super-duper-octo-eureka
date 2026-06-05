import { describe, it, expect } from "vitest";
import {
  seedRelationships,
  relationship,
  factionsAtWarWith,
  addGrievance,
  grievanceWeight,
  formPact,
  pactsInvolving,
  evaluatePact,
  betray,
  controllerOf,
  transferTerritory,
  rippleThroughRelationships,
} from "./diplomacy";
import { defaultWorld } from "./world";

describe("society-sim: relationship graph", () => {
  const rels = seedRelationships(defaultWorld);

  it("seeds allied/rival edges from authored ties (order-insensitive, deduped)", () => {
    expect(relationship(rels, "the-syndicate", "the-machine")?.stance).toBe("allied");
    expect(relationship(rels, "the-press", "the-syndicate")?.stance).toBe("rival");
    // order doesn't matter
    expect(relationship(rels, "the-machine", "the-syndicate")?.stance).toBe("allied");
  });
});

describe("society-sim: grievances", () => {
  it("accumulates weight between two factions either direction", () => {
    let ledger = addGrievance([], { wrongedId: "a", byId: "b", kind: "muscled in", when: "1930", weight: 2 });
    ledger = addGrievance(ledger, { wrongedId: "b", byId: "a", kind: "reprisal", when: "1931", weight: 1 });
    expect(grievanceWeight(ledger, "a", "b")).toBe(3);
  });
});

describe("society-sim: pact lifecycle", () => {
  const pact = formPact({ id: "p1", type: "non-aggression", parties: ["a", "b"], at: "1929" });

  it("forms active and stable", () => {
    expect(pact.status).toBe("active");
    expect(pactsInvolving([pact], "a")).toHaveLength(1);
  });

  it("strains then breaks as grievances erode stability", () => {
    expect(evaluatePact(pact, { grievance: 1 }).status).toBe("active");
    expect(evaluatePact(pact, { grievance: 2 }).status).toBe("strained");
    expect(evaluatePact(pact, { grievance: 3 }).status).toBe("broken");
  });

  it("betrayal cascades: betrayed pact + grievance + war", () => {
    const { pact: broken, grievances, warStances } = betray(pact, "a", "1931");
    expect(broken.status).toBe("betrayed");
    expect(broken.stability).toBe(0);
    expect(grievances[0]).toMatchObject({ wrongedId: "b", byId: "a", weight: 3 });
    expect(warStances[0]?.stance).toBe("at-war");
    expect(factionsAtWarWith(warStances, "a")).toContain("b");
  });
});

describe("society-sim: territory over time", () => {
  it("tracks the controlling faction at a point in time (turf changes hands)", () => {
    let hist = transferTerritory([], "kerry-patch", "egans", "1925");
    hist = transferTerritory(hist, "kerry-patch", "green-ones", "1931");
    expect(controllerOf(hist, "kerry-patch", "1928")).toBe("egans"); // before the takeover
    expect(controllerOf(hist, "kerry-patch", "1931")).toBe("green-ones"); // after
    expect(controllerOf(hist, "kerry-patch", "1920")).toBeUndefined(); // before any control
  });
});

describe("society-sim: graph ripple", () => {
  it("helping a faction lifts allies and harms/heats rivals", () => {
    const rels = seedRelationships(defaultWorld);
    const ripple = rippleThroughRelationships(rels, "the-syndicate", 1);
    expect(ripple.find((r) => r.factionId === "the-machine")?.standingDelta).toBe(1); // ally up
    const press = ripple.find((r) => r.factionId === "the-press"); // rival down + heated
    expect(press?.standingDelta).toBe(-1);
    expect(press?.heatDelta).toBe(1);
  });
});
