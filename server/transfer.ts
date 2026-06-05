// SQLite -> Postgres data-transfer (migration plan). Reads the SQLite Registry via
// the existing Prisma client and writes to Postgres via raw `pg`, PRESERVING GUIDs
// (ids are seed-derived; copied verbatim, so determinism survives the move) and
// converting the SQLite JSON-string shims to native arrays/jsonb. Run:
//   npm run seed                                              # populate SQLite
//   PG_URL=postgresql://mound:mound@127.0.0.1:5432/registry npm run transfer
import { Client } from "pg";
import { prisma } from "./db"; // SQLite client (DATABASE_URL unset -> sqlite path)

const PG_URL = process.env["PG_URL"] ?? "postgresql://mound:mound@127.0.0.1:5432/registry";

async function main(): Promise<void> {
  const pg = new Client({ connectionString: PG_URL });
  await pg.connect();

  // Idempotent: clear the destination (children first), then copy verbatim.
  for (const t of ["IdentityBinding", "MorticianRecord", "PersonRegistration", "Location", "Organization"]) {
    await pg.query(`DELETE FROM "${t}"`);
  }

  const persons = await prisma.personRegistration.findMany();
  for (const p of persons) {
    await pg.query(
      `INSERT INTO "PersonRegistration"(id, name, aliases, features) VALUES ($1, $2, $3, $4::jsonb)`,
      [p.id, p.name, JSON.parse(p.aliases) as string[], p.features],
    );
  }
  const bindings = await prisma.identityBinding.findMany();
  for (const b of bindings) {
    await pg.query(
      `INSERT INTO "IdentityBinding"(id, "personId", "trueName", "trueFeatures") VALUES ($1, $2, $3, $4::jsonb)`,
      [b.id, b.personId, b.trueName, b.trueFeatures],
    );
  }
  for (const l of await prisma.location.findMany()) {
    await pg.query(`INSERT INTO "Location"(id, name, kind, "zoneId") VALUES ($1, $2, $3, $4)`, [
      l.id,
      l.name,
      l.kind,
      l.zoneId,
    ]);
  }
  for (const o of await prisma.organization.findMany()) {
    await pg.query(`INSERT INTO "Organization"(id, name, kind) VALUES ($1, $2, $3)`, [o.id, o.name, o.kind]);
  }
  for (const m of await prisma.morticianRecord.findMany()) {
    await pg.query(
      `INSERT INTO "MorticianRecord"(id, "subjectId", "causeOfDeath", "mannerHint", notes, "enteredById", motive, fidelity, "enteredAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::"Fidelity", $9)`,
      [m.id, m.subjectId, m.causeOfDeath, m.mannerHint, m.notes, m.enteredById, m.motive, m.fidelity, m.enteredAt],
    );
  }

  // Verify: counts + a GUID round-trips identically (determinism preserved).
  const n = await pg.query<{ n: number }>(`SELECT count(*)::int AS n FROM "PersonRegistration"`);
  const sample = persons[0];
  const found = sample
    ? await pg.query(`SELECT id FROM "PersonRegistration" WHERE id = $1`, [sample.id])
    : { rowCount: 0 };
  console.log(`Transferred ${persons.length} people -> Postgres has ${n.rows[0]?.n}`);
  console.log(`GUID preserved across the move: ${sample?.id} present in PG = ${found.rowCount === 1}`);

  await pg.end();
  await prisma.$disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  });
