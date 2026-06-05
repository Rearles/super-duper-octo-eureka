# Postgres migration (migration plan)

The Registry runs on **SQLite** in dev (`prisma/schema.prisma`, the committed
default) and migrates to **Postgres** for production
(`prisma/schema.postgres.prisma`).

## Provision

- With Docker (gives Apache AGE for the graph plan): `docker compose up -d`
- Or a local cluster: `pg_ctlcluster 16 main start`, then create a `registry` db.

## Apply the Postgres schema

```sh
DATABASE_URL=postgresql://mound:mound@127.0.0.1:5432/registry \
  prisma db push --schema prisma/schema.postgres.prisma --url "$DATABASE_URL"
psql "$DATABASE_URL" -f prisma/postgres/extensions.sql   # pgcrypto (+ AGE/PostGIS if present)
psql "$DATABASE_URL" -f prisma/postgres/rls.sql          # row-level access tiers
```

## Transfer data (GUID-preserving)

```sh
npm run seed                                                   # populate SQLite
PG_URL=postgresql://mound:mound@127.0.0.1:5432/registry npm run transfer
```

GUIDs are seed-derived and copied **verbatim**, so determinism survives the move.
The audit hash-chain is pure (provider-independent) and verifies identically after
transfer (`server/audit.ts` + the governance tests).

## Native-type conversions (the SQLite shims become native)

- String-union "enums" → native `enum`s: `Fidelity`, `ReportType`, `MannerOfDeath`,
  `IADisposition`, `UserRole` (hyphenated/reserved values keep their text via `@map`).
- JSON-string arrays → `text[]` (`aliases`, `involved`, `charges`, …).
- JSON-string objects → `jsonb` (`features`, `levels`, `payload`, …).

## Rollback

Revert to SQLite — it stays the committed default. Leave `DATABASE_URL` unset so
`server/db.ts` falls back to the local SQLite file, and use `prisma/schema.prisma`.
The SQLite migrations under `prisma/migrations/` are intact.

## Deferred (no Docker daemon in this environment)

Apache **AGE** (the faction/allegiance/pact graph — graph-analysis plan) and
**PostGIS** (zone geometry — the sim) need the `apache/age` image or a source build.
They are not used by the foundation; `extensions.sql` enables them when present.
