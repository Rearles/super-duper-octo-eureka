import { describe, it, expect } from "vitest";
import { createRng } from "./rng";
import { Realizer } from "./realize";
import { fidelityFromAuthor, distortClaims } from "./procgen/contract";
import { classifyDetermination, distributionTarget } from "./determination";
import { generateCase } from "./generator";
import { defaultWorld } from "./world";

describe("procgen-v2: deterministic splittable rng", () => {
  it("same seed -> same stream", () => {
    const a = createRng(7);
    const b = createRng(7);
    expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()]);
  });

  it("derive is order-independent (the lazy-realization invariant)", () => {
    const a = createRng(7);
    const childBefore = a.derive("witness").next();
    a.next();
    a.next(); // advance the parent
    const childAfter = createRng(7).derive("witness").next();
    expect(childBefore).toEqual(childAfter);
  });
});

describe("procgen-v2: lazy realization", () => {
  it("realizes the same entity identically regardless of order", () => {
    const r1 = new Realizer(7);
    const x1 = r1.realize("per_x"); // realize x first
    const r2 = new Realizer(7);
    r2.realize("per_y"); // touch y first...
    const x2 = r2.realize("per_x"); // ...then x
    expect(x1).toEqual(x2);
  });

  it("caches repeat touches (same reference)", () => {
    const r = new Realizer(7);
    expect(r.realize("per_x")).toBe(r.realize("per_x"));
  });
});

describe("procgen-v2: truth->distortion contract", () => {
  it("maps author integrity to fidelity", () => {
    expect(fidelityFromAuthor(1)).toBe("true");
    expect(fidelityFromAuthor(0.7)).toBe("partial");
    expect(fidelityFromAuthor(0.4)).toBe("biased");
    expect(fidelityFromAuthor(0)).toBe("false");
  });

  it("an honest author keeps claims truthful; a fabricator flips + attributes them", () => {
    const truth = { claims: [{ subject: "a", predicate: "killed", object: "b", truthful: true, text: "x" }] };
    const honest = distortClaims(truth, { enteredById: "e", integrity: 1 });
    expect(honest.claims[0]?.truthful).toBe(true);
    const liar = distortClaims(truth, { enteredById: "e", integrity: 0, motive: "shield the boss" });
    expect(liar.claims[0]?.truthful).toBe(false);
    expect(liar.distortion.motive).toBe("shield the boss");
  });
});

describe("procgen-v2: tiered solvability", () => {
  it("classifies a generated case as solvable-to-a-theory, never blank", () => {
    const gc = generateCase(defaultWorld, 7);
    const d = classifyDetermination(gc);
    expect(d.fair).toBe(true);
    expect(["provable", "crackable", "underdetermined"]).toContain(d.determination);
    expect(d.liveSuspects).toBeGreaterThanOrEqual(2);
  });

  it("targets a case-population mix that is mostly provable and never blank", () => {
    const t = distributionTarget(100);
    expect(t.blank).toBe(0);
    expect(t.provable + t.crackable + t.underdetermined).toBe(100);
    expect(t.provable).toBeGreaterThan(t.underdetermined);
  });
});
