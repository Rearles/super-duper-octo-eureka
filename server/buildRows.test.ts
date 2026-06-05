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
    for (const b of rows.bindings) {
      const p = rows.persons.find((x) => x.id === b.personId);
      expect(b.trueName).toBe(p?.name); // the binding's trueName is ground truth
    }
  });

  it("emits a forgeable record layer with a discoverable lie on a how-crux case", () => {
    const rows = buildRegistryRows(defaultWorld, 7);
    expect(rows.morticianRecords.length).toBe(defaultWorld.cases.length);
    if (defaultWorld.cases.some((c) => c.keyFact === "how")) {
      const forged = rows.morticianRecords.filter((m) => m.fidelity === "false");
      expect(forged.length).toBeGreaterThan(0);
      for (const m of forged) {
        expect(m.enteredById).toBeTruthy(); // attributed
        expect(m.motive).toBeTruthy(); // motivated — never a hallucination
      }
    }
  });

  it("fans a death into a cluster where a forged certificate contradicts an honest autopsy", () => {
    const rows = buildRegistryRows(defaultWorld, 7);
    expect(rows.deathCertificates.length).toBe(defaultWorld.cases.length);
    expect(rows.autopsies.length).toBe(defaultWorld.cases.length);
    expect(rows.toxicologies.length).toBe(defaultWorld.cases.length);
    expect(rows.courtRecords.length).toBe(defaultWorld.cases.length);

    for (const cert of rows.deathCertificates.filter((c) => c.fidelity === "false")) {
      // the cover-up flipped the manner to "natural"...
      expect(cert.mannerOfDeath).toBe("natural");
      // ...but the autopsy for the same subject is honest and disagrees (the seam)
      const autopsy = rows.autopsies.find((a) => a.deathCertId === cert.id);
      expect(autopsy?.fidelity).toBe("true");
      expect(autopsy?.causeFindings).not.toBe(cert.causeOfDeath);
    }
  });
});
