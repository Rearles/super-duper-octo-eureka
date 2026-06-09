# Mound City

A cold-case detective game where you read the file, pull records, catch the
lie, and commit a verdict — set in an alternate, **fictional** mid-century
St. Louis whose factions react to what you do.

AI-assisted game design and development exploration. The design source of truth
is [docs/GameConceptDocument.md](docs/GameConceptDocument.md) (v2.0);
[CLAUDE.md](CLAUDE.md) orients each working session, and
[ClaudeCodeSessions/](ClaudeCodeSessions/) archives the ones that came before.

## The model: simulation-first (GCD v2.0)

A deterministic **society-sim** runs the city forward — factions take stakes in
cases that touch what they care about, strike and betray pacts, and react to
events — and in doing so authors a deliberately **distorted record**. The
detective reconstructs the truth from that record alone. *Truth → distortion →
record* is a one-way street: the ground truth stays hidden; you only ever see
the paperwork.

- **Determinism is sacred** (Pillar 1) — every id, person, and world is
  seed-derived ([ids.ts](src/engine/ids.ts), [rng.ts](src/engine/rng.ts)): the
  same seed always rebuilds the same city. Some cases are deliberately
  **underdetermined** — provable, crackable, or never solved, like the real
  cold cases they echo.
- **The pure engine is the oracle** — the behavioural modules in
  [src/engine/](src/engine/) define correct behaviour; any server/DB version
  must match them.

## What's built

The v2.0 plan set is implemented and tested (**111 tests**):

- **The Registry** — a typed record layer (people, places, organizations,
  death & judicial clusters, NIBRS-style police records) with procgen v2.0 on top.
- **Governance** — access tiers, a tamper-evident hash-chained audit log, and
  sealed-record access with an unseal-petition flow.
- **The society-sim** — allegiance portfolios, a pacts/diplomacy graph, the
  tick + incentive engine, the event→record pipeline and case lifecycle, record
  decay and the observer effect, and a corruptible detective (integrity,
  leverage, flipping).
- **Integration & surfaces** — the sim generates and persists a cold-case
  backlog; analysis tools and a public (CQRS) read-model sit on top.
- **Storage** — SQLite for dev, with a migration path to Postgres (native
  enums / `text[]` / `jsonb`, row-level security).

## Security

[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/Rearles/super-duper-octo-eureka/badge)](https://securityscorecards.dev/viewer/?uri=github.com/Rearles/super-duper-octo-eureka)

| Control | Detail |
|---|---|
| Dependency updates | Dependabot — grouped weekly + security auto-fix PRs |
| SAST | CodeQL — advanced setup, `security-extended` suite (JS/TS + Actions) |
| Custom SAST rules | Semgrep — repo invariants gate CI (browser/Node boundary, determinism, safe raw SQL) + `p/typescript` advises |
| Secret scanning | GitHub secret scanning + push protection |
| Secret scan (CI) | gitleaks on every push/PR (full history) |
| Repo health | OpenSSF Scorecard (weekly + on push to `develop`) |
| Vulnerability DB scan | OSV-Scanner → Security tab (OSV.dev breadth; PR-diff + full) |
| Dependency signatures | `npm audit signatures` in CI (provenance/registry signatures) |
| SBOM | CycloneDX, per push to `develop` + per release (build artifact) |
| Malicious-package review | Socket.dev GitHub App — install to enable PR risk comments |

Vulnerability disclosure: [SECURITY.md](SECURITY.md)  
Full phased plan: [`.plans/research-security-and-pr-scanning-tooling_7b1e9c40.plan.md`](.plans/research-security-and-pr-scanning-tooling_7b1e9c40.plan.md)

## Architecture

The **browser engine** ([src/](src/)) never imports Prisma. All database access
lives in **[server/](server/)** (Node, Fastify, Prisma 7 driver adapters), and
the browser reaches it over HTTP through
[src/registryClient.ts](src/registryClient.ts).

## Run it

```bash
npm install
npm run dev          # dev server (Vite)
npm test             # 111 tests (vitest)
npm run typecheck    # browser typecheck

# server + data (Node side)
npm run db:generate  # generate the Prisma client
npm run server       # Fastify Registry server (tsx watch)
npm run seed         # seed the Registry
npm run seed:sim     # seed a sim-generated cold-case backlog
npm run transfer     # migrate the Registry SQLite → Postgres
```

## What's next

Four remaining-work plans in [.plans/](.plans/): wire the vertical slice
(HTTP routes + the desk UI, end to end), Postgres `tsvector` full-text search,
persisting sim records into the typed cluster tables, and Apache AGE graph
queries (in a Docker-capable environment).
