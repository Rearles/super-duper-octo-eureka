import { describe, it, expect } from "vitest";
import {
  AuthoringError,
  defineCase,
  defineFaction,
  definePerson,
  definePlace,
  defineWorld,
} from "./authoring";
import { buriedWitnessWorld } from "./world/buriedWitness";

describe("authoring builders", () => {
  it("assembles and validates the starter world", () => {
    expect(buriedWitnessWorld.cases.length).toBe(1);
    expect(buriedWitnessWorld.factions.length).toBe(2);
    expect(buriedWitnessWorld.people.length).toBe(5);
    expect(buriedWitnessWorld.places.length).toBe(2);
  });

  it("rejects an incomplete case core", () => {
    expect(() => defineCase("c").what("a death").build()).toThrow(AuthoringError);
  });

  it("requires culprit and victim to differ", () => {
    const c = defineCase("c")
      .what("x")
      .culprit("p")
      .victim("p")
      .where("here")
      .when("2300")
      .how("y");
    expect(() => c.build()).toThrow(/different/);
  });

  it("requires faction temperament and at least one interest", () => {
    expect(() => defineFaction("f", "F").interests("x").build()).toThrow(/temperament/);
    expect(() => defineFaction("f", "F").temperament("protective").build()).toThrow(/interest/);
  });

  it("rejects a case whose culprit isn't a defined person", () => {
    expect(() =>
      defineWorld({
        people: [definePerson("v", "V")],
        places: [definePlace("scene", "Scene")],
        cases: [
          defineCase("c")
            .what("x")
            .culprit("ghost")
            .victim("v")
            .where("scene")
            .when("2300")
            .how("y"),
        ],
      }),
    ).toThrow(/culprit 'ghost'/);
  });

  it("rejects a faction ally that isn't a defined faction", () => {
    expect(() =>
      defineWorld({
        factions: [
          defineFaction("a", "A").temperament("principled").interests("x").allies("missing"),
        ],
      }),
    ).toThrow(/ally 'missing'/);
  });

  it("accepts a fully-wired minimal world", () => {
    const w = defineWorld({
      people: [definePerson("cul", "Cul").faction("mob"), definePerson("vic", "Vic")],
      places: [definePlace("scene", "Scene")],
      factions: [
        defineFaction("mob", "Mob").temperament("vindictive").interests("turf").member("cul"),
      ],
      cases: [
        defineCase("c")
          .what("x")
          .culprit("cul")
          .victim("vic")
          .where("scene")
          .when("2300")
          .how("y")
          .keyFact("where"),
      ],
    });
    expect(w.people.length).toBe(2);
    expect(w.factions[0].members[0].personId).toBe("cul");
  });
});
