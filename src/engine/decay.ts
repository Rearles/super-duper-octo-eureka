// Decay, cover-up & the observer effect (society-sim plan 5, GCD §3.2/§3.3).
// Two pressures erode the trail: PASSIVE decay over in-world time (witnesses age
// and die, evidence degrades — tracked as per-record recoverability), and ACTIVE
// cover-up triggered when a case's HEAT (read from the audit-log sensor net —
// every view/edit) crosses a threshold: the guilty faction targets the
// LOAD-BEARING record. So investigating a case can degrade the very trail you're
// following (the observer effect). The engagement floor guarantees a case never
// decays to a blank wall. Counter-play: protect a record (Go Public / corroborate
// quietly before going overt). Pure + deterministic.
import type { CaseRecord } from "./types";
import { classifySimCase, type SimCase } from "./eventRecord";

/** Below this recoverability a record is effectively lost (witness dead, file gone). */
export const UNOBTAINABLE_BELOW = 0.2;
/** Heat (accumulated investigative attention) that triggers active cover-up. */
export const COVERUP_HEAT_THRESHOLD = 3;

export interface DecayState {
  recordId: string;
  /** 0..1 — how obtainable/legible the record still is */
  recoverability: number;
  /** how fast it decays per tick (witness memory fades fastest) */
  fragility: number;
  obtainable: boolean;
  /** locked against decay + cover-up (published / corroborated) */
  protected: boolean;
}

function fragilityOf(r: CaseRecord): number {
  // witness statements fade fastest (memory, then death); hard records persist.
  if (r.type === "witness-statement") return 0.08;
  if (r.type === "phone-records" || r.type === "property-record") return 0.03;
  return 0.05;
}

export function initDecay(records: CaseRecord[]): DecayState[] {
  return records.map((r) => ({
    recordId: r.id,
    recoverability: 1,
    fragility: fragilityOf(r),
    obtainable: true,
    protected: false,
  }));
}

/** Passive decay of a single recoverability value over elapsed ticks. */
export function passiveDecay(recoverability: number, elapsedTicks: number, ratePerTick: number): number {
  return Math.max(0, Number((recoverability - elapsedTicks * ratePerTick).toFixed(3)));
}

/** Advance one tick of passive decay; protected records are immune. */
export function tickDecay(states: DecayState[]): DecayState[] {
  return states.map((s) => {
    if (s.protected) return s;
    const recoverability = passiveDecay(s.recoverability, 1, s.fragility);
    return { ...s, recoverability, obtainable: recoverability >= UNOBTAINABLE_BELOW };
  });
}

/** Heat for a case = the accumulated investigative attention on it (the sensor net). */
export interface AccessEvent {
  caseId: string;
  recordId?: string;
}
export function heatFromAccess(events: AccessEvent[], caseId: string): number {
  return events.filter((e) => e.caseId === caseId).length;
}

export interface CoverUp {
  recordId: string;
  action: "destroy" | "seal" | "fabricate" | "intimidate";
}

/**
 * Active cover-up — the observer effect. When a case's heat crosses the threshold,
 * the guilty faction targets the LOAD-BEARING record (a truthful corroboration of
 * the culprit, not already protected) and degrades it. Looking raised the heat;
 * the trail gets colder for it.
 */
export function activeCoverUp(
  records: CaseRecord[],
  states: DecayState[],
  heat: number,
  culpritId: string,
): { states: DecayState[]; coverUp?: CoverUp } {
  if (heat < COVERUP_HEAT_THRESHOLD) return { states };
  const isProtected = (id: string): boolean => states.find((s) => s.recordId === id)?.protected ?? false;
  const target = records.find(
    (r) => !isProtected(r.id) && r.claims.some((c) => c.subject === culpritId && c.truthful),
  );
  if (!target) return { states };
  const next = states.map((s) => {
    if (s.recordId !== target.id) return s;
    const recoverability = Math.max(0, Number((s.recoverability - 0.5).toFixed(3)));
    return { ...s, recoverability, obtainable: recoverability >= UNOBTAINABLE_BELOW };
  });
  return { states: next, coverUp: { recordId: target.id, action: "destroy" } };
}

/** Counter-play: lock a record against decay + cover-up (Go Public / corroborate quietly). */
export function protectRecord(states: DecayState[], recordId: string): DecayState[] {
  return states.map((s) => (s.recordId === recordId ? { ...s, protected: true } : s));
}

/**
 * The engagement floor under decay: re-classify a case from only its still-obtainable
 * records; if decay/cover-up would push it to a blank wall, preserve one culprit-
 * mentioning record so a reachable theory always survives (never blank — Pillar 1).
 */
export function enforceFloorUnderDecay(
  c: SimCase,
  states: DecayState[],
): { states: DecayState[]; determination: ReturnType<typeof classifySimCase> } {
  const obtainableIds = (ss: DecayState[]): Set<string> =>
    new Set(ss.filter((s) => s.obtainable).map((s) => s.recordId));

  let current = states;
  let survivors: SimCase = { ...c, records: c.records.filter((r) => obtainableIds(current).has(r.id)) };
  let cls = classifySimCase(survivors);
  if (cls.fair) return { states: current, determination: cls };

  // floor breached — preserve one record that mentions the culprit
  const keep = c.records.find((r) => r.claims.some((cl) => cl.subject === c.culpritId));
  if (keep) {
    current = current.map((s) =>
      s.recordId === keep.id ? { ...s, recoverability: UNOBTAINABLE_BELOW, obtainable: true } : s,
    );
    survivors = { ...c, records: c.records.filter((r) => obtainableIds(current).has(r.id)) };
    cls = classifySimCase(survivors);
  }
  return { states: current, determination: cls };
}
