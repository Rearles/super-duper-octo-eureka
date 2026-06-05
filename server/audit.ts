// Tamper-evident audit log (access-tiers plan). Append-only + hash-chained: each
// entry stores hash(prevHash + payload), so recomputing the chain detects ANY edit
// or deletion — "no one can manipulate without the powers that be knowing" (§2.2).
// Kept PURE here (in-memory) so tamper-detection is unit-testable; the API persists
// entries to the AuditLogEntry table. The log doubles as the factions' SENSOR NET:
// every view/edit is a logged, readable event (the observer effect).
import { createHash } from "node:crypto";

export const GENESIS = "0".repeat(64);

export interface AuditFields {
  actorId: string;
  action: string; // view|create|edit|publish|seal|unseal|petition|rule
  targetType: string;
  targetId: string;
  payload?: unknown;
  at?: string;
}

export interface AuditEntry {
  seq: number;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  payload: string;
  at: string;
  prevHash: string;
  hash: string;
}

function hashEntry(prevHash: string, e: Omit<AuditEntry, "prevHash" | "hash">): string {
  const body = [prevHash, e.seq, e.actorId, e.action, e.targetType, e.targetId, e.payload, e.at].join(
    "|",
  );
  return createHash("sha256").update(body).digest("hex");
}

/** Append an entry to an in-memory chain (pure). */
export function appendEntry(chain: AuditEntry[], f: AuditFields): AuditEntry[] {
  const seq = chain.length;
  const prevHash = chain.length ? chain[chain.length - 1]!.hash : GENESIS;
  const core = {
    seq,
    actorId: f.actorId,
    action: f.action,
    targetType: f.targetType,
    targetId: f.targetId,
    payload: JSON.stringify(f.payload ?? {}),
    at: f.at ?? new Date(0).toISOString(),
  };
  return [...chain, { ...core, prevHash, hash: hashEntry(prevHash, core) }];
}

/** Recompute the chain; return the index of the first tampered entry, or -1 if intact. */
export function verifyChain(chain: AuditEntry[]): number {
  let prev = GENESIS;
  for (let i = 0; i < chain.length; i++) {
    const { prevHash, hash, ...core } = chain[i]!;
    if (prevHash !== prev || hash !== hashEntry(prev, core)) return i;
    prev = hash;
  }
  return -1;
}

/** The chain tip (latest hash) — what the triplicate replicas must agree on. */
export function chainTip(chain: AuditEntry[]): string {
  return chain.length ? chain[chain.length - 1]!.hash : GENESIS;
}

/** "In triplicate": N copies of the tip digest. All replicas must agree on verify. */
export function replicate(tip: string, copies = 3): string[] {
  return Array.from({ length: copies }, () => tip);
}

export function verifyTriplicate(replicas: string[]): boolean {
  return replicas.length >= 3 && replicas.every((r) => r === replicas[0]);
}
