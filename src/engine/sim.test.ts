import { describe, it, expect } from "vitest";
import { initSimState, tick, runHistory, step, schedule, BLOC_AGENDAS, BLOC_ACTIONS } from "./sim";
import { formPact } from "./diplomacy";
import { defaultWorld } from "./world";

describe("society-sim: the tick", () => {
  it("runs a deterministic history (same seed -> identical log)", () => {
    const a = runHistory(defaultWorld, 7, 12);
    const b = runHistory(defaultWorld, 7, 12);
    expect(a.log).toEqual(b.log);
    expect(a.tick).toBe(12);
  });

  it("a different seed -> a different history", () => {
    const a = runHistory(defaultWorld, 7, 12);
    const b = runHistory(defaultWorld, 8, 12);
    expect(a.log).not.toEqual(b.log);
  });

  it("every faction acts each tick from its bloc repertoire per its agenda", () => {
    const state = initSimState(defaultWorld, 7);
    const ev = tick(state);
    for (const f of state.factions) {
      const acted = ev.find((e) => e.factionId === f.id && BLOC_ACTIONS[f.bloc!].includes(e.action));
      expect(acted).toBeDefined();
    }
    expect(BLOC_AGENDAS["organized-crime"]).toBe("expand-rackets");
  });

  it("surfaces a scheduled consequence on its due tick (the calendar)", () => {
    const state = initSimState(defaultWorld, 7);
    schedule(state, {
      dueTick: 2,
      kind: "retaliation",
      factionId: "the-syndicate",
      note: "a source goes quiet",
    });
    step(state); // tick 1 — not yet
    expect(state.log.some((e) => e.action.startsWith("consequence:"))).toBe(false);
    step(state); // tick 2 — due
    expect(state.log.some((e) => e.action === "consequence:retaliation")).toBe(true);
  });

  it("pacts erode over ticks when grievances exist between the parties", () => {
    const state = initSimState(defaultWorld, 7);
    state.pacts.push(
      formPact({ id: "p", type: "non-aggression", parties: ["the-syndicate", "the-press"], at: "0" }),
    );
    state.grievances.push({
      wrongedId: "the-press",
      byId: "the-syndicate",
      kind: "muscled in",
      when: "0",
      weight: 3,
    });
    step(state);
    expect(state.pacts[0]!.status).not.toBe("active"); // strained or broken
  });
});
