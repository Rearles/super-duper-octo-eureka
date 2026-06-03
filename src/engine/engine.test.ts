import { describe, it, expect } from "vitest";
import { generateCase } from "./generator";
import { verifySolvable } from "./solver";
import { CaseSession } from "./index";
import { buriedWitnessWorld as world } from "./world/buriedWitness";

describe("engine", () => {
  it("generates deterministically from an authored world + seed", () => {
    const a = generateCase(world, 42);
    const b = generateCase(world, 42);
    expect(JSON.stringify(a)).toEqual(JSON.stringify(b));
  });

  it("varies the procgen-cast names between seeds; authored facts stay fixed", () => {
    const witnessNames = new Set(
      Array.from({ length: 10 }, (_, i) => generateCase(world, i + 1).entities.witness.name),
    );
    expect(witnessNames.size).toBeGreaterThan(1);
    // authored principals never change with the seed
    expect(generateCase(world, 1).entities.culprit.name).toEqual(
      generateCase(world, 2).entities.culprit.name,
    );
  });

  it("builds the case from the authored core (culprit/victim/scene/when)", () => {
    const c = generateCase(world, 7);
    expect(c.solution.culpritId).toBe("culprit");
    expect(c.entities.culprit.name).toBe("Cole Voss");
    expect(c.entities.victim.name).toBe("Mara Hale");
    // the contested predicate is derived from the authored `when`
    expect(c.solution.predicate).toBe("location@2300");
  });

  it("every generated case is solvable (Pillar 1)", () => {
    for (let seed = 1; seed <= 100; seed++) {
      expect(verifySolvable(generateCase(world, seed)).solvable).toBe(true);
    }
  });

  it("plants a lie that a true record disproves", () => {
    const c = generateCase(world, 7);
    const stmt = c.records.find((r) => r.type === "witness-statement");
    expect(stmt?.claims.some((cl) => !cl.truthful)).toBe(true);
  });

  it("surfaces the contradiction only after the right records are obtained", () => {
    const s = new CaseSession(7);
    expect(s.contradictions().length).toBe(0); // only the case file so far

    const stmt = s.availableRequests().find((r) => r.type === "witness-statement");
    expect(stmt).toBeDefined();
    expect(s.request(stmt!.id).ok).toBe(true);

    const phone = s.availableRequests().find((r) => r.type === "phone-records");
    expect(phone).toBeDefined();
    expect(s.request(phone!.id).ok).toBe(true);

    expect(s.contradictions().length).toBeGreaterThan(0);
  });

  it("spends clearance and refuses unaffordable or un-led requests", () => {
    const s = new CaseSession(7, { clearance: 1 });
    expect(s.request("rec_phone").ok).toBe(true); // led by the case file, costs 1
    expect(s.clearance).toBe(0);
    const more = s.availableRequests()[0];
    if (more) expect(s.request(more.id).ok).toBe(false); // no clearance left
  });

  it("confirms the culprit on a correct verdict and reports a consequence", () => {
    const s = new CaseSession(7);
    const res = s.commitVerdict(s.gameCase.solution.culpritId, "charge");
    expect(res.correct).toBe(true);
    expect(res.consequence.length).toBeGreaterThan(0);
    expect(s.closed).toBe(true);
  });

  it("marks a wrong accusation incorrect", () => {
    const s = new CaseSession(7);
    const wrong = s.gameCase.suspects.find((id) => id !== s.gameCase.solution.culpritId)!;
    expect(s.commitVerdict(wrong, "charge").correct).toBe(false);
  });
});
