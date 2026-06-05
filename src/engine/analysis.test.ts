import { describe, it, expect } from "vitest";
import { documentsMentioning, searchRecords, defectionChain, relationshipPath } from "./analysis";
import { homicideEvent, emitRecords } from "./eventRecord";
import { seedRelationships } from "./diplomacy";
import { defineWorld, defineFaction, definePerson } from "./authoring";
import type { AllegianceChange } from "./types";

const ev = homicideEvent({
  id: "e",
  culpritId: "skell",
  victimId: "crase",
  locationId: "study",
  at: "0115",
  how: "poison",
});
const records = emitRecords(ev, [
  { recordType: "autopsy", title: "Autopsy of Crase", author: { enteredById: "me", integrity: 1 } },
  { recordType: "ruling", title: "Death certificate", author: { enteredById: "coroner", integrity: 0 } },
]);

describe("surfaces: analysis tools (reveal, never interpret — Pillar 2)", () => {
  it("lists every document mentioning an entity", () => {
    expect(documentsMentioning(records, "skell")).toHaveLength(2);
    expect(documentsMentioning(records, "nobody")).toHaveLength(0);
  });

  it("token-searches record text (every term must appear)", () => {
    expect(searchRecords(records, "death certificate").map((r) => r.title)).toContain("Death certificate");
    expect(searchRecords(records, "autopsy crase")).toHaveLength(1);
    expect(searchRecords(records, "")).toHaveLength(0);
  });

  it("traces a defection chain over historized allegiance", () => {
    const history: AllegianceChange[] = [
      { actorId: "cop", factionId: "law", kind: "formed", at: "1925" },
      { actorId: "cop", factionId: "gang", kind: "flipped", at: "1931", note: "bought" },
      { actorId: "other", factionId: "x", kind: "formed", at: "1930" },
    ];
    expect(defectionChain(history, "cop").map((c) => c.factionId)).toEqual(["law", "gang"]);
  });

  it("finds a multi-hop path through the relationship graph", () => {
    const world = defineWorld({
      people: [definePerson("p", "P").faction("a")],
      factions: [
        defineFaction("a", "A").temperament("principled").interests("x").member("p").allies("b"),
        defineFaction("b", "B").temperament("principled").interests("x").rivals("c"),
        defineFaction("c", "C").temperament("principled").interests("x"),
      ],
    });
    const rels = seedRelationships(world);
    expect(relationshipPath(rels, "a", "c")).toEqual(["a", "b", "c"]);
    expect(relationshipPath(rels, "a", "a")).toEqual(["a"]);
  });
});
