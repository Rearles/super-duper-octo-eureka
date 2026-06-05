-- Postgres extensions for the Registry (migration plan).
-- pgcrypto is available on a stock Postgres; AGE + PostGIS require the apache/age
-- image (or a source build) and are only needed by later plans (graph / zones),
-- so they are attempted-but-optional here. Run:
--   psql "$DATABASE_URL" -f prisma/postgres/extensions.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Apache AGE — the property-graph engine for the faction/allegiance/pact graph
-- (graph-analysis plan, #8). Requires the apache/age image; harmless if absent.
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS age;
  LOAD 'age';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'AGE not installed (expected on a stock Postgres) — deferred to the graph plan.';
END $$;

-- PostGIS — zone geometry for the simulation's territory. Deferred to the sim.
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS postgis;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'PostGIS not installed (expected on a stock Postgres) — deferred to the sim.';
END $$;
