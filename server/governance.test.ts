import { describe, it, expect } from "vitest";
import {
  appendEntry,
  verifyChain,
  chainTip,
  replicate,
  verifyTriplicate,
  type AuditEntry,
} from "./audit";
import { can, canReadRecord, acceptsSubmission, type User } from "./access";
import { canAccessSealed, ruleOnPetition, type Seal } from "./seal";

function sampleChain(): AuditEntry[] {
  let c: AuditEntry[] = [];
  c = appendEntry(c, { actorId: "u1", action: "view", targetType: "person", targetId: "p1" });
  c = appendEntry(c, { actorId: "u1", action: "edit", targetType: "police", targetId: "r1" });
  c = appendEntry(c, { actorId: "u2", action: "view", targetType: "police", targetId: "r1" });
  return c;
}

describe("governance: tamper-evident audit (hash chain)", () => {
  it("an intact chain verifies", () => {
    expect(verifyChain(sampleChain())).toBe(-1);
  });
  it("detects a tampered entry", () => {
    const c = sampleChain();
    c[1] = { ...c[1]!, payload: JSON.stringify({ forged: true }) };
    expect(verifyChain(c)).toBe(1); // caught at the tampered index
  });
  it("detects a deletion (the chain no longer recomputes)", () => {
    const c = sampleChain();
    c.splice(1, 1);
    expect(verifyChain(c)).not.toBe(-1);
  });
  it("triplicate replicas must agree", () => {
    const reps = replicate(chainTip(sampleChain()));
    expect(verifyTriplicate(reps)).toBe(true);
    reps[2] = "tampered";
    expect(verifyTriplicate(reps)).toBe(false);
  });
});

describe("governance: access tiers", () => {
  const detective: User = { id: "d", role: "detective", clearance: 3 };
  const clerk: User = { id: "c", role: "clerk", clearance: 1 };
  it("roles gate permissions", () => {
    expect(can(detective, "read")).toBe(true);
    expect(can(clerk, "read")).toBe(false);
    expect(can(clerk, "submit")).toBe(true);
  });
  it("clearance gates record reads by tier", () => {
    expect(canReadRecord(detective, 3)).toBe(true);
    expect(canReadRecord(detective, 5)).toBe(false);
  });
  it("submission accepts non-empty required fields with no validation (the forgery seam)", () => {
    expect(acceptsSubmission({ subjectId: "p1", enteredById: "u1" })).toBe(true);
    expect(acceptsSubmission({ subjectId: "", enteredById: "u1" })).toBe(false);
  });
});

describe("governance: sealed-access", () => {
  const seal: Seal = { id: "seal_1", targetType: "internal-affairs", targetId: "ia_1", tier: 3 };
  const detective: User = { id: "d", role: "detective", clearance: 3 };
  const judge: User = { id: "j", role: "judge", clearance: 5 };

  it("withholds a sealed record from a detective until an unseal is granted", () => {
    expect(canAccessSealed(detective, seal, new Set())).toBe(false);
    expect(canAccessSealed(detective, seal, new Set(["seal_1"]))).toBe(true);
  });
  it("a judge can always access (the court compels)", () => {
    expect(canAccessSealed(judge, seal, new Set())).toBe(true);
  });
  it("a corrupt judge can deny a meritorious petition shielding a patron (the hook)", () => {
    expect(ruleOnPetition({ meritorious: true, judgeIntegrity: 0.9 }).granted).toBe(true);
    expect(
      ruleOnPetition({ meritorious: true, judgeIntegrity: 0.2, shieldsTarget: true }).granted,
    ).toBe(false);
  });
});
