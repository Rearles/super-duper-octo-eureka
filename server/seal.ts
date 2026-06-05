// Sealed-access (access-tiers plan, v2.0). A seal can wrap ANY record (court
// ruling, internal-affairs file, personnel, warrant, grand-jury). Access requires
// an UnsealRuling that GRANTED a petition over it — the cold-case detective files
// an evidence bundle, a judge rules (and a machine-owned judge can deny a valid
// petition or grant a crony's: the corrupt-judge hook). Pure.
import type { User } from "./access";

export interface Seal {
  id: string;
  targetType: string;
  targetId: string;
  tier: number;
}

/**
 * Is a sealed record accessible to this user?
 *  - judges / auditors / admins: always (the court compels; the auditor oversees)
 *  - everyone else: only if an UnsealRuling has granted a petition over this seal.
 */
export function canAccessSealed(user: User, seal: Seal, grantedSealIds: Set<string>): boolean {
  if (user.role === "judge" || user.role === "auditor" || user.role === "admin") return true;
  return grantedSealIds.has(seal.id);
}

/**
 * A judge's ruling on an unseal petition. Honest judges grant meritorious petitions;
 * a corrupt judge (low integrity) shielding a patron can deny a valid one. The
 * integrity / patron inputs come from the faction sim later; the mechanism is here.
 */
export function ruleOnPetition(opts: {
  meritorious: boolean;
  judgeIntegrity: number;
  shieldsTarget?: boolean;
}): { granted: boolean; reason: string } {
  if (opts.shieldsTarget && opts.judgeIntegrity < 0.5) {
    return { granted: false, reason: "Petition denied (the bench is not impartial here)." };
  }
  return opts.meritorious
    ? { granted: true, reason: "Petition granted; the seal is lifted." }
    : { granted: false, reason: "Petition denied for insufficient cause." };
}
