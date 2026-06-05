import { describe, it, expect } from "vitest";
import { buildRegistryRows } from "./buildRows";
import { defaultWorld } from "../src/engine/world";

describe("registry seed determinism (Pillar 1)", () => {
  it("same seed -> byte-identical rows", () => {
    expect(buildRegistryRows(defaultWorld, 7)).toEqual(buildRegistryRows(defaultWorld, 7));
  });

  it("different seed -> different ids", () => {
    const a = buildRegistryRows(defaultWorld, 7);
    const b = buildRegistryRows(defaultWorld, 8);
    expect(a.persons[0]?.id).not.toEqual(b.persons[0]?.id);
  });

  it("registers every authored person with an unforgeable identity binding", () => {
    const rows = buildRegistryRows(defaultWorld, 7);
    expect(rows.persons.length).toBe(defaultWorld.people.length);
    expect(rows.bindings.length).toBe(defaultWorld.people.length);
    // the binding's trueName is ground truth — it matches the registration name
    for (const b of rows.bindings) {
      const p = rows.persons.find((x) => x.id === b.personId);
      expect(b.trueName).toBe(p?.name);
    }
  });

  it("emits a forgeable record layer with a discoverable lie on a how-crux case", () => {
    const rows = buildRegistryRows(defaultWorld, 7);
    expect(rows.morticianRecords.length).toBe(defaultWorld.cases.length);
    if (defaultWorld.cases.some((c) => c.keyFact === "how")) {
      const forged = rows.morticianRecords.filter((m) => m.fidelity === "false");
      expect(forged.length).toBeGreaterThan(0);
      // a forged record is attributed (enteredBy) and motivated — never a hallucination
      for (const m of forged) {
        expect(m.enteredById).toBeTruthy();
        expect(m.motive).toBeTruthy();
      }
    }
  });
});
