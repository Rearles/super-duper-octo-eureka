import { describe, it, expect } from "vitest";
import { generateBacklog } from "./backlog";
import { classifySimCase } from "./eventRecord";
import { defineWorld, defineFaction, definePerson } from "./authoring";
import { defaultWorld } from "./world";

// The default authored world has no gangs, so violent actions never fire. Build a
// small crime world (org-crime vs unorg-crime) so the sim produces homicides.
const crimeWorld = defineWorld({
  people: [
    definePerson("rico", "Rico").faction("egans"),
    definePerson("sal", "Sal").faction("egans"),
    definePerson("vic", "Vic").faction("greens"),
    definePerson("nina", "Nina").faction("greens"),
  ],
  factions: [
    defineFaction("egans", "Egan's Rats")
      .bloc("organized-crime")
      .temperament("vindictive")
      .interests("turf")
      .member("rico")
      .member("sal")
      .rivals("greens"),
    defineFaction("greens", "The Green Ones")
      .bloc("unorganized-crime")
      .temperament("opportunistic")
      .interests("turf")
      .member("vic")
      .member("nina")
      .rivals("egans"),
  ],
});

describe("integration: sim -> cold-case backlog", () => {
  it("mints homicides from violent ticks (a self-refreshing backlog)", () => {
    const { cases, groundTruth } = generateBacklog(crimeWorld, 7, 40);
    expect(cases.length).toBeGreaterThan(0);
    expect(groundTruth.length).toBe(cases.length);
    expect(cases.every((c) => c.state === "cold")).toBe(true);
    expect(cases.every((c) => c.records.length === 3)).toBe(true);
  });

  it("is deterministic (same world+seed+ticks -> identical backlog)", () => {
    expect(generateBacklog(crimeWorld, 7, 40)).toEqual(generateBacklog(crimeWorld, 7, 40));
  });

  it("every case stays fair (a reachable theory; never blank)", () => {
    const { cases } = generateBacklog(crimeWorld, 7, 40);
    expect(cases.every((c) => classifySimCase(c).fair)).toBe(true);
  });

  it("the hidden ground truth is carried per case (the answer key)", () => {
    const { cases } = generateBacklog(crimeWorld, 7, 40);
    expect(cases.every((c) => c.groundTruth.length > 0 && c.culpritId)).toBe(true);
  });

  it("a world with no crime factions yields no homicides", () => {
    expect(generateBacklog(defaultWorld, 7, 40).cases).toHaveLength(0);
  });
});
