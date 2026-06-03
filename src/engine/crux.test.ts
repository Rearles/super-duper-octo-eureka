import { describe, it, expect } from "vitest";
import { generateCase, verifySolvable } from "./index";
import { paperTrailWorld } from "./world/paper-trail";
import { defineCase, definePerson, definePlace, defineWorld } from "./authoring";
import type { CaseFact } from "./types";

describe("keyFact-driven lie placement", () => {
  it("crase-natural (how): the lie is a false ruling, disproved by the autopsy", () => {
    const c = generateCase(paperTrailWorld, 7, "crase-natural");
    expect(verifySolvable(c).solvable).toBe(true);
    expect(c.solution.keyFact).toBe("how");
    expect(c.solution.predicate).toBe("cause");
    expect(c.solution.keyContradiction).toEqual(["rec_ruling", "rec_autopsy"]);
    expect(c.records.find((r) => r.type === "ruling")?.fidelity).toBe("false");
    expect(c.records.find((r) => r.type === "autopsy")?.fidelity).toBe("true");
  });

  it("marsh-accident (who): frames the authored innocent, cleared by forensics", () => {
    const c = generateCase(paperTrailWorld, 7, "marsh-accident");
    expect(verifySolvable(c).solvable).toBe(true);
    expect(c.solution.keyFact).toBe("who");
    expect(c.solution.predicate).toBe("responsible");
    // The authored factionless innocent (Danny Okafor / "driver") is the framed POI and accusable.
    expect(c.roles?.["driver"]).toBe("person-of-interest");
    expect(c.suspects).toContain("driver");
    // The cover-up's witness is sourced from the culprit's protective faction (a mouthpiece).
    const witnessId = Object.keys(c.roles ?? {}).find((k) => c.roles?.[k] === "witness");
    expect(witnessId).toBeDefined();
    expect(c.entities[witnessId!]).toBeDefined();
  });

  it("every crux dimension yields a solvable case", () => {
    const cruxes: CaseFact[] = ["where", "who", "when", "how", "what"];
    for (const keyFact of cruxes) {
      const world = defineWorld({
        places: [definePlace("scene", "the scene")],
        people: [definePerson("cul", "Cee"), definePerson("vic", "Vee"), definePerson("inn", "Innocent")],
        cases: [
          defineCase("c").what("an event").culprit("cul").victim("vic").where("scene").when("0100").how("a method").keyFact(keyFact),
        ],
      });
      const c = generateCase(world, 3, "c");
      expect(verifySolvable(c).solvable, `${keyFact} should be solvable`).toBe(true);
      expect(c.solution.keyFact).toBe(keyFact);
      expect(c.solution.predicate).toBe(c.records.find((r) => r.fidelity === "false")?.claims[0].predicate);
    }
  });
});
