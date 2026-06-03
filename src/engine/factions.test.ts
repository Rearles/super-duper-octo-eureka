import { describe, it, expect } from "vitest";
import { buriedWitnessWorld as world } from "./world/buriedWitness";
import { generateCase } from "./generator";
import {
  applyInterFactionWeb,
  caseFacts,
  factionStake,
  reactToOfficialAct,
  reactToVerdict,
  resolveCore,
  type VerdictAct,
} from "./factions";
import { CaseSession } from "./index";
import { defineCase, defineFaction, definePerson, definePlace, defineWorld } from "./authoring";
import type { Temperament } from "./types";

const gc = generateCase(world, 7);
const core = resolveCore(world, gc);
const facts = caseFacts(gc, core);
const heights = world.factions.find((f) => f.id === "the-heights")!;
const press = world.factions.find((f) => f.id === "the-press")!;
const chargeCulprit: VerdictAct = { accusedId: gc.solution.culpritId, disposition: "charge", correct: true };
const buryCulprit: VerdictAct = { accusedId: gc.solution.culpritId, disposition: "bury", correct: true };

describe("emergent stakes", () => {
  it("a faction whose member is the culprit cares more than an onlooker", () => {
    expect(factionStake(heights, facts)).toBe(3); // "Cole Voss" interest (+1) + member is culprit (+2)
    expect(factionStake(press, facts)).toBe(1); // cares about "Cole Voss", no member involved
    expect(factionStake(heights, facts)).toBeGreaterThan(factionStake(press, facts));
  });

  it("public acts can add stake (the accused's name becomes a topic)", () => {
    const base = factionStake(press, facts);
    expect(factionStake(press, facts, ["Cole Voss"])).toBeGreaterThanOrEqual(base);
  });
});

describe("three-layer reactions", () => {
  it("DIRECTION: charging a faction's culprit-member harms it; burying flips the sign", () => {
    const charge = reactToVerdict(heights, facts, factionStake(heights, facts), chargeCulprit);
    expect(charge.standingDelta).toBeLessThan(0);
    expect(charge.heatDelta).toBeGreaterThan(0);

    const bury = reactToVerdict(heights, facts, factionStake(heights, facts), buryCulprit);
    expect(bury.standingDelta).toBeGreaterThan(0);
    expect(bury.heatDelta).toBeLessThan(0); // Heat is bidirectional — a positive act cools it
  });

  it("MAGNITUDE scales with stake", () => {
    const small = reactToVerdict(heights, facts, 1, chargeCulprit);
    const big = reactToVerdict(heights, facts, 5, chargeCulprit);
    expect(Math.abs(big.standingDelta)).toBeGreaterThan(Math.abs(small.standingDelta));
  });

  it("TEMPERAMENT shapes how: protective spikes heat more than opportunistic", () => {
    const react = (temperament: Temperament) => {
      const w = defineWorld({
        people: [definePerson("cul", "Cul").faction("F"), definePerson("vic", "Vic")],
        places: [definePlace("scene", "Scene")],
        factions: [defineFaction("F", "F").temperament(temperament).interests("x").member("cul")],
        cases: [
          defineCase("c").what("x").culprit("cul").victim("vic").where("scene").when("2300").how("y").keyFact("where"),
        ],
      });
      const g = generateCase(w, 1);
      const f = w.factions[0];
      const fc = caseFacts(g, resolveCore(w, g));
      return reactToVerdict(f, fc, factionStake(f, fc), {
        accusedId: g.solution.culpritId,
        disposition: "charge",
        correct: true,
      });
    };
    expect(react("protective").heatDelta).toBeGreaterThan(react("opportunistic").heatDelta);
  });
});

describe("inter-faction web", () => {
  it("harming a faction pleases its rival; helping it angers the rival", () => {
    const charged = applyInterFactionWeb(
      world,
      world.factions.map((f) => reactToVerdict(f, facts, factionStake(f, facts), chargeCulprit)),
    );
    const pressOnCharge = charged.find((r) => r.factionId === "the-press")!;
    expect(pressOnCharge.standingDelta).toBeGreaterThan(0); // rival of the harmed Heights → pleased

    const buried = applyInterFactionWeb(
      world,
      world.factions.map((f) => reactToVerdict(f, facts, factionStake(f, facts), buryCulprit)),
    );
    const pressOnBury = buried.find((r) => r.factionId === "the-press")!;
    expect(pressOnBury.standingDelta).toBeLessThan(0); // you helped their rival → displeased
    expect(pressOnBury.heatDelta).toBeGreaterThan(0);
  });
});

describe("CaseSession integration", () => {
  it("a verdict applies reactions, logs the Ledger, and floors Heat at 0", () => {
    const s = new CaseSession(7, { world });
    expect(s.factions().every((f) => f.standing === 0 && f.heat === 0)).toBe(true);

    const res = s.commitVerdict(s.gameCase.solution.culpritId, "charge");
    expect(res.reactions.length).toBeGreaterThan(0);

    const h = s.factions().find((f) => f.factionId === "the-heights")!;
    expect(h.standing).toBeLessThan(0);
    expect(h.heat).toBeGreaterThan(0);
    expect(s.factions().every((f) => f.heat >= 0)).toBe(true); // never negative

    expect(s.ledger.length).toBe(1);
    expect(s.ledger[0].note).toContain("charge");
  });

  it("an official act (naming a POI) raises the named faction's Heat", () => {
    const s = new CaseSession(7, { world });
    const reactions = s.nameOfInterest(s.gameCase.solution.culpritId); // a Heights member
    expect(reactions.length).toBeGreaterThan(0);
    const h = s.factions().find((f) => f.factionId === "the-heights")!;
    expect(h.heat).toBeGreaterThan(0);
    expect(s.ledger[0].note).toContain("person of interest");
  });

  it("reactToOfficialAct: naming a non-member onlooker doesn't lower their standing", () => {
    const r = reactToOfficialAct(press, factionStake(press, facts), gc.solution.culpritId);
    expect(r.standingDelta).toBe(0);
  });
});

describe("confirmation-by-doing", () => {
  it("the theory whisper is ripeness-only and never names the culprit", () => {
    const s = new CaseSession(7, { world });
    expect(s.whisper()).toContain("Nothing yet");

    const stmt = s.availableRequests().find((r) => r.type === "witness-statement")!;
    s.request(stmt.id);
    const phone = s.availableRequests().find((r) => r.type === "phone-records")!;
    s.request(phone.id);

    const w = s.whisper();
    expect(w).toContain("enough to make the call");
    expect(w).not.toContain(s.graph.entityName(s.gameCase.solution.culpritId));
  });

  it("keeps an internal correctness signal for the engine/tests", () => {
    const s = new CaseSession(7, { world });
    expect(s.commitVerdict(s.gameCase.solution.culpritId, "charge").correct).toBe(true);
    const s2 = new CaseSession(7, { world });
    const wrong = s2.gameCase.suspects.find((id) => id !== s2.gameCase.solution.culpritId)!;
    expect(s2.commitVerdict(wrong, "charge").correct).toBe(false);
  });
});
