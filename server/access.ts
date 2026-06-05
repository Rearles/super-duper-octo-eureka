// Access tiers (access-tiers plan): roles -> permissions, clearance -> record
// sensitivity. Reuses the game's clearance/rank gating (GCD §2.3/§2.4). Pure.

export type Role = "clerk" | "detective" | "prosecutor" | "judge" | "auditor" | "admin";

export type Permission =
  | "read"
  | "submit"
  | "edit"
  | "publish"
  | "seal"
  | "unseal"
  | "read-audit"
  | "official-act";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  clerk: ["submit"],
  detective: ["read", "submit", "official-act"],
  prosecutor: ["read", "publish", "official-act"],
  judge: ["read", "seal", "unseal"],
  auditor: ["read", "read-audit"],
  admin: ["read", "submit", "edit", "publish", "seal", "unseal", "read-audit", "official-act"],
};

export interface User {
  id: string;
  role: Role;
  clearance: number;
}

export function can(user: User, perm: Permission): boolean {
  return ROLE_PERMISSIONS[user.role].includes(perm);
}

/** Read gating: a record's sensitivity tier must be within the user's clearance. */
export function canReadRecord(user: User, recordTier: number): boolean {
  return can(user, "read") && user.clearance >= recordTier;
}

/**
 * The §2.4 asymmetry: a SUBMITTED document is accepted as valid if its required
 * fields are non-empty — there is NO validation on submission. This is precisely
 * the source of forged records (the world accepts them; deduction catches them).
 */
export function acceptsSubmission(required: Record<string, unknown>): boolean {
  return Object.values(required).every((v) => v !== null && v !== undefined && v !== "");
}
