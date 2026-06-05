// The event -> record pipeline, the hidden ground-truth, and the Case lifecycle
// (society-sim plan 4, GCD §5.1 v2.0 — the keystone). A ground-truth event fans
// out into multiple records, each authored by a different actor and distorted by
// THAT author's integrity (the procgen-v2 contract): honest authors agree with the
// truth, a bought one diverges — the motivated contradiction the detective
// triangulates. The ground truth itself is never emitted; it lives in the
// append-only log (the answer key). Cases cool from unsolved events and close by
// proof or by theory. Pure + deterministic.
import { distortClaims, type Author } from "./procgen/contract";
import type { CaseRecord, Claim, Determination, Disposition, RecordType, Theory } from "./types";

/** A canonical, all-truthful record of what really happened — the hidden answer key. */
export interface GroundTruthEvent {
  id: string;
  kind: string;
  culpritId: string;
  victimId?: string;
  locationId?: string;
  at: string;
  how?: string;
  truth: Claim[];
}

function claim(subject: string, predicate: string, object: string, truthful: boolean, text: string): Claim {
  return { subject, predicate, object, truthful, text };
}

/** Build a homicide ground-truth event (the hidden truth a case is reconstructed toward). */
export function homicideEvent(opts: {
  id: string;
  culpritId: string;
  victimId: string;
  locationId: string;
  at: string;
  how: string;
  culpritName?: string;
  victimName?: string;
}): GroundTruthEvent {
  const cN = opts.culpritName ?? opts.culpritId;
  const vN = opts.victimName ?? opts.victimId;
  return {
    id: opts.id,
    kind: "homicide",
    culpritId: opts.culpritId,
    victimId: opts.victimId,
    locationId: opts.locationId,
    at: opts.at,
    how: opts.how,
    truth: [
      claim(opts.culpritId, "killed", opts.victimId, true, `${cN} killed ${vN}.`),
      claim(opts.victimId, "manner", "homicide", true, `${vN}'s death was a homicide.`),
      claim(opts.victimId, "cause", opts.how, true, `Cause of death: ${opts.how}.`),
    ],
  };
}

export interface RecordSpec {
  recordType: RecordType;
  title: string;
  author: Author;
}

/**
 * Fan one ground-truth event into multiple records, each distorted by its author's
 * integrity (the procgen-v2 contract). Honest authors' records agree with the
 * truth; a low-integrity author's record diverges — the motivated contradiction.
 * The ground truth is NOT among the emitted records.
 */
export function emitRecords(event: GroundTruthEvent, specs: RecordSpec[]): CaseRecord[] {
  return specs.map((s, i) => {
    const { claims, distortion } = distortClaims({ claims: event.truth }, s.author);
    return {
      id: `${event.id}_rec${i}`,
      type: s.recordType,
      title: s.title,
      source: event.victimId ?? event.culpritId,
      fidelity: distortion.fidelity,
      claims,
      leads: [event.culpritId, ...(event.victimId ? [event.victimId] : [])],
      clearanceCost: 1,
    };
  });
}

/** The hidden ground-truth log — append-only; the canonical answer key, never rendered. */
export function appendGroundTruth(log: GroundTruthEvent[], ev: GroundTruthEvent): GroundTruthEvent[] {
  return [...log, ev];
}

// --- The Case lifecycle ----------------------------------------------------

export type CaseState = "open" | "cold" | "solved" | "cleared-by-theory" | "closed-false";

export interface SimCase {
  id: string;
  eventId: string;
  state: CaseState;
  records: CaseRecord[];
  /** hidden ground-truth claims for this case */
  groundTruth: Claim[];
  culpritId: string;
  determination?: Determination;
}

/** Cool an unsolved event into a cold case (the self-refreshing backlog). */
export function coolIntoCase(event: GroundTruthEvent, records: CaseRecord[]): SimCase {
  return {
    id: `case_${event.id}`,
    eventId: event.id,
    state: "cold",
    records,
    groundTruth: event.truth,
    culpritId: event.culpritId,
  };
}

/**
 * Classify a case's determination tier and enforce the engagement floor:
 *  provable (>=2 honest records implicate the culprit) / crackable (1) /
 *  underdetermined (records mention the culprit but none prove it) / blank
 *  (FORBIDDEN — fair === false). Never a blank wall.
 */
export function classifySimCase(c: SimCase): {
  determination: Determination;
  corroborationPaths: number;
  fair: boolean;
} {
  const truthfulPaths = c.records.filter((r) =>
    r.claims.some((cl) => cl.subject === c.culpritId && cl.truthful),
  ).length;
  const anyMention = c.records.filter((r) =>
    r.claims.some((cl) => cl.subject === c.culpritId),
  ).length;
  let determination: Determination;
  if (truthfulPaths >= 2) determination = "provable";
  else if (truthfulPaths === 1) determination = "crackable";
  else if (anyMention >= 1) determination = "underdetermined";
  else determination = "blank";
  return { determination, corroborationPaths: truthfulPaths, fair: determination !== "blank" };
}

/**
 * Commit a verdict (confirmation-by-doing): compare the player's theory to the
 * hidden ground truth and write the case state back — solved (named right +
 * provable), cleared-by-theory (named right but not provable — the White Whale),
 * or closed-false (named wrong; the real culprit walks, and the city remembers).
 */
export function commitCaseVerdict(
  c: SimCase,
  theory: Theory,
  _disposition: Disposition,
): { state: CaseState; consequence: string } {
  const right = theory.who === c.culpritId;
  const cls = classifySimCase(c);
  if (right && cls.determination === "provable") {
    return { state: "solved", consequence: "The case is proven and closed." };
  }
  if (right) {
    return {
      state: "cleared-by-theory",
      consequence: "You name your suspect; the theory holds, but conclusive proof never comes.",
    };
  }
  return {
    state: "closed-false",
    consequence: "The wrong name is entered. The real culprit walks, and the city remembers.",
  };
}
