import { describe, it, expect } from "vitest";
import { generateCase, TemplateRenderer } from "./index";
import { buriedWitnessWorld } from "./world/buriedWitness";

/**
 * Golden snapshot: locks the exact generated + rendered case for a fixed
 * (world, seed). Any future change to the generator or the authored starter
 * world that shifts the case surfaces here as a diff instead of silently.
 * Update intentionally with `vitest -u` when the change is expected.
 */
describe("golden snapshot", () => {
  it("generates a stable case + rendered documents at (buriedWitness, seed 7)", () => {
    const c = generateCase(buriedWitnessWorld, 7);
    const renderer = new TemplateRenderer();
    const snapshot = {
      seed: c.seed,
      entities: c.entities,
      groundTruth: c.groundTruth,
      solution: c.solution,
      suspects: c.suspects,
      caseFileId: c.caseFileId,
      records: c.records.map((r) => ({
        id: r.id,
        type: r.type,
        fidelity: r.fidelity,
        leads: r.leads,
        clearanceCost: r.clearanceCost,
        rendered: renderer.render(r, c),
      })),
    };
    expect(snapshot).toMatchSnapshot();
  });
});
