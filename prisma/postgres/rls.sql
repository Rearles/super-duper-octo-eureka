-- Row-Level Security for the Registry access tiers (migration plan, v2.0).
-- Postgres enforces clearance IN THE DATABASE, not just the API — defense in depth,
-- and the hard boundary the public read-model (CQRS plan) relies on. Run:
--   psql "$DATABASE_URL" -f prisma/postgres/rls.sql
--
-- Demonstrated on PoliceRecord: a session sets app.clearance + app.role; rows are
-- visible only within clearance. (A sensitivity/tier column is added by the access
-- layer; here we gate on a session GUC to prove the mechanism end-to-end.)

ALTER TABLE "PoliceRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PoliceRecord" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS police_clearance_read ON "PoliceRecord";
CREATE POLICY police_clearance_read ON "PoliceRecord"
  FOR SELECT
  USING (
    -- auditors/admins see everything; everyone else needs clearance >= 1 (the tier
    -- a record carries is wired in by the access layer; default-deny when unset).
    coalesce(current_setting('app.role', true), '') IN ('auditor', 'admin')
    OR coalesce(current_setting('app.clearance', true), '0')::int >= 1
  );

-- Internal-affairs reports are sealed by default: only judges/auditors/admins read
-- them in the DB, mirroring server/seal.ts (until an unseal is granted at the app).
ALTER TABLE "InternalAffairsReport" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InternalAffairsReport" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ia_sealed_read ON "InternalAffairsReport";
CREATE POLICY ia_sealed_read ON "InternalAffairsReport"
  FOR SELECT
  USING (coalesce(current_setting('app.role', true), '') IN ('judge', 'auditor', 'admin'));
