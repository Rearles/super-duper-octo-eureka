// The Registry API (Fastify). Read-only for now: query a person and the records
// about them. The browser engine talks to this over HTTP (the Prisma client is
// Node-only and never enters the bundle). Governance/seal/publish routes arrive
// in the access-tiers plan.
import Fastify from "fastify";
import { getPerson, listPeople, recordsAbout, registryCounts } from "./registry";

const app = Fastify({ logger: true });

app.get("/health", async () => ({ ok: true }));
app.get("/registry/counts", async () => registryCounts());
app.get("/registry/people", async () => listPeople());

app.get<{ Params: { id: string } }>("/registry/person/:id", async (req, reply) => {
  const person = await getPerson(req.params.id);
  if (!person) return reply.code(404).send({ error: "not found" });
  return person;
});

app.get<{ Params: { id: string } }>("/registry/person/:id/records", async (req) =>
  recordsAbout(req.params.id),
);

const port = Number(process.env["PORT"] ?? 8787);
app
  .listen({ port, host: "127.0.0.1" })
  .then((addr) => app.log.info(`Registry API on ${addr}`))
  .catch((e: unknown) => {
    app.log.error(e);
    process.exit(1);
  });
