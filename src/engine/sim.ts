// The simulation tick, agendas & incentive engine (society-sim plan 3, GCD §2.5/§3.3).
// A DETERMINISTIC clock: each tick every faction pursues its bloc's agenda by
// picking from a per-bloc action repertoire; pacts re-evaluate; the incentive
// engine drives defections (secret ties); and due scheduled consequences surface
// (the calendar). Same seed + world -> identical history. Two phases off one
// engine: runHistory(...) generates the past; step(...) continues it live.
import { createRng } from "./rng";
import { evaluateAllegiance, seedAllegiances } from "./allegiance";
import { evaluatePact, grievanceWeight, seedRelationships } from "./diplomacy";
import type {
  Allegiance,
  AuthoredWorld,
  BlocId,
  Grievance,
  Pact,
  Relationship,
  TerritoryControl,
} from "./types";

/** Each bloc's standing goal — what its factions push toward every tick. */
export const BLOC_AGENDAS: Record<BlocId, string> = {
  press: "circulate",
  "political-machine": "hold-power",
  "organized-crime": "expand-rackets",
  "unorganized-crime": "seize-turf",
  "law-enforcement": "keep-order",
  "reform-civic": "pursue-indictments",
  "business-industry": "buy-influence",
};

/** Each bloc's action repertoire — what its factions can DO toward the agenda. */
export const BLOC_ACTIONS: Record<BlocId, string[]> = {
  press: ["investigate", "publish", "smear"],
  "political-machine": ["appoint", "quash", "graft"],
  "organized-crime": ["muscle", "bribe", "expand"],
  "unorganized-crime": ["raid", "ally", "grab-turf"],
  "law-enforcement": ["patrol", "look-away", "raid"],
  "reform-civic": ["petition", "organize", "publicize"],
  "business-industry": ["pay-boodle", "fund", "suppress"],
};

const BRIBE_ACTIONS = new Set(["bribe", "graft", "pay-boodle", "fund"]);
const HEAT_ACTIONS = new Set(["muscle", "raid", "smear", "grab-turf"]);

export interface FactionSimState {
  id: string;
  bloc?: BlocId;
  resources: number;
  standing: number;
  heat: number;
}

export interface ScheduledEvent {
  dueTick: number;
  kind: string;
  factionId: string;
  note: string;
}

export interface SimEvent {
  tick: number;
  factionId: string;
  action: string;
  note: string;
}

export interface SimState {
  tick: number;
  seed: number;
  factions: FactionSimState[];
  relationships: Relationship[];
  pacts: Pact[];
  grievances: Grievance[];
  territory: TerritoryControl[];
  allegiances: Allegiance[];
  calendar: ScheduledEvent[];
  log: SimEvent[];
}

/** Build the initial sim state from an authored world + seed (the t=0 tableau). */
export function initSimState(world: AuthoredWorld, seed: number): SimState {
  return {
    tick: 0,
    seed,
    factions: world.factions.map((f) => ({
      id: f.id,
      bloc: f.bloc,
      resources: 5,
      standing: 0,
      heat: 0,
    })),
    relationships: seedRelationships(world),
    pacts: [],
    grievances: [],
    territory: [],
    allegiances: seedAllegiances(world),
    calendar: [],
    log: [],
  };
}

/** Schedule a delayed consequence (GCD §3.3) — surfaces on its due tick. */
export function schedule(state: SimState, ev: ScheduledEvent): void {
  state.calendar.push(ev);
}

/**
 * Advance one deterministic tick. Each faction acts; bribe-like actions try to
 * flip a target (the incentive engine, forming a SECRET tie); pacts re-evaluate
 * against accumulated grievances; due scheduled consequences surface. Mutates the
 * state, appends to its log, and returns the events this tick produced.
 */
export function tick(state: SimState): SimEvent[] {
  state.tick += 1;
  const rng = createRng(state.seed).derive(`tick:${state.tick}`);
  const produced: SimEvent[] = [];
  const emit = (factionId: string, action: string, note: string): void => {
    const ev: SimEvent = { tick: state.tick, factionId, action, note };
    produced.push(ev);
    state.log.push(ev);
  };

  for (const f of state.factions) {
    const actions = f.bloc ? BLOC_ACTIONS[f.bloc] : ["wait"];
    const action = rng.pick(actions);
    if (BRIBE_ACTIONS.has(action)) f.resources += 1;
    if (HEAT_ACTIONS.has(action)) f.heat += 1;
    emit(f.id, action, `${f.id}: ${action} (agenda: ${f.bloc ? BLOC_AGENDAS[f.bloc] : "none"})`);

    // The incentive engine in the loop: a bribe-like act can flip an outsider
    // into a SECRET tie (corruption / a mole), spending resources.
    if (BRIBE_ACTIONS.has(action) && f.resources >= 3) {
      const targets = state.allegiances.filter((a) => a.factionId !== f.id && !a.secret);
      const target = targets.length ? rng.pick(targets) : undefined;
      const alreadyOurs =
        target && state.allegiances.some((a) => a.actorId === target.actorId && a.factionId === f.id);
      if (target && !alreadyOurs) {
        const decision = evaluateAllegiance({
          actorId: target.actorId,
          targetFactionId: f.id,
          incentives: { material: 2, power: 0, survival: 0, coercion: 0, loyalty: 0 },
          costs: { bonds: 1, fear: 0, reputation: 0 },
          secret: true,
          at: String(state.tick),
        });
        if (decision.switched && decision.tie) {
          state.allegiances.push(decision.tie);
          f.resources -= 3;
          emit(f.id, "flip", `${f.id} flipped ${target.actorId} into a secret tie`);
        }
      }
    }
  }

  // Re-evaluate pacts against grievances between their parties.
  state.pacts = state.pacts.map((p) => {
    const grievance =
      p.parties.length === 2 ? grievanceWeight(state.grievances, p.parties[0]!, p.parties[1]!) : 0;
    return evaluatePact(p, { grievance });
  });

  // Surface due scheduled consequences (and drop them from the calendar).
  for (const e of state.calendar.filter((e) => e.dueTick <= state.tick)) {
    emit(e.factionId, `consequence:${e.kind}`, e.note);
  }
  state.calendar = state.calendar.filter((e) => e.dueTick > state.tick);

  return produced;
}

/** Generate history: initialize from a world + seed, run `ticks` deterministic ticks. */
export function runHistory(world: AuthoredWorld, seed: number, ticks: number): SimState {
  const state = initSimState(world, seed);
  for (let i = 0; i < ticks; i++) tick(state);
  return state;
}

/** A live single step (the play phase) — the same deterministic tick. */
export function step(state: SimState): SimEvent[] {
  return tick(state);
}
