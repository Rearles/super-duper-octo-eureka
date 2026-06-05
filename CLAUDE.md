# Mound City — project guide for Claude Code

A cold-case detective deduction game in an alternate, **fictional** St. Louis. The
design is **simulation-first (GCD v2.0)**: a deterministic society-sim authors a
deliberately-distorted record, and the detective reconstructs the truth from it.

## Read these first (every session)

1. **`docs/GameConceptDocument.md`** — the design source of truth (v2.0). Its
   **§15.3 Decision Log** records every significant decision + reasoning. Treat the
   four Pillars and the Decision Log as binding; surface conflicts before reversing them.
2. **`ClaudeCodeSessions/`** — a *running archive* of past Claude Code sessions
   (prompts, decisions, what was built and why). **Skim the latest entry at the
   start of a session** for the good context that came before, and **append** a new
   entry as work proceeds.
3. **`.plans/`** — the plan files. All 18 v2.0 plans are `status: complete`; the
   remaining work is the four `*_2026-06-05`-dated plans (the vertical slice,
   tsvector, typed-cluster persistence, and Apache AGE).
4. **assist-project facts** (if the MCP is available): `project_list_facts` — the
   `build-status` + `architecture` facts summarize what's built and the stack quirks.
   Not connected? **`docs/assist-tooling-setup.md`** wires up the assist-* MCP
   servers + skills from the sibling `refactored-tribble` repo.

## What's built (branch `claude/zen-clarke-DkXdA`)

The entire v2.0 plan set is implemented + tested (**111 tests**). Foundation
(Registry data layer, death/judicial + NIBRS clusters, procgen-v2, governance,
SQLite→Postgres migration), the society-sim (allegiance, pacts, the tick,
event→record, decay/observer-effect, detective integrity), the sim→Registry
integration (backlog generation + persistence), and the surfaces (analysis tools,
public read-model). Detail: the `assist-project` build-status facts + the latest
`ClaudeCodeSessions/` entry.

## Stack + conventions (important)

- TypeScript strict, ES modules. **The browser engine in `src/` NEVER imports
  Prisma** (Prisma is Node-only). All DB/Prisma lives in **`server/`** (Node); the
  browser reaches it via `src/registryClient.ts` over HTTP.
- **Prisma 7**: driver adapters (`@prisma/adapter-better-sqlite3` for SQLite,
  `@prisma/adapter-pg` for Postgres) + `prisma.config.ts` (dotenv). The client
  generates to `server/generated/` (gitignored). Dev db = repo-root `dev.db`.
- **Determinism is sacred** (Pillar 1): all ids/worlds are seed-derived
  (`src/engine/ids.ts`, `rng.ts`) — never `crypto.randomUUID()` for world content.
- Two Prisma schemas: `prisma/schema.prisma` (SQLite, dev default) and
  `prisma/schema.postgres.prisma` (Postgres target — native enums / text[] / jsonb).
- Postgres: provision via Docker (`docker compose up`, **apache/age** image) OR a
  local cluster (`pg_ctlcluster 16 main start`). **Apache AGE + PostGIS need the
  apache/age image** (no Docker daemon in the default remote sandbox);
  **`tsvector` is core Postgres — no Docker needed**.
- The **pure engine modules are the behavioral oracle** — server/DB versions must match them.
- **Fictional analogues only** (§4.2) — no real names/geography. Don't put the
  model's identifier in committed artifacts.

## Gates (every change)

- `npm test` (vitest) · `npm run typecheck` (root, browser) ·
  `tsc -p server/tsconfig.json --noEmit` (server). Keep all green; prefer additive changes.
- Commit per plan; push to the working branch. Mark a plan `status: complete` when done.

## Scripts

`npm run dev` (vite) · `npm test` · `npm run seed` (Registry) ·
`npm run seed:sim` (sim cold-case backlog) · `npm run transfer` (SQLite→Postgres).
