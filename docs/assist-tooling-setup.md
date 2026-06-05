# assist-* tooling setup (MCP servers + skills)

This project benefits from the **assist-\*** Claude tooling that lives in the
sibling repo **`refactored-tribble`** (a personal monorepo of Claude tooling):
three MCP servers and a set of skills that give Claude persistent memory and a
plan-driven workflow across sessions. `CLAUDE.md` points here so a new session
can wire them up.

You don't need this tooling to build Mound City — the work proceeds without it —
but `assist-project` in particular is where the **build-status** and
**architecture** facts live, so connecting it gives a new session an instant,
accurate read on what's already built and the stack quirks.

## The three servers

| Server | What it stores | Tool prefix |
|---|---|---|
| `assist-project` | Project-specific facts (conventions, schema/API decisions, build status), scoped per repo | `project_` |
| `assist-memory` | Reusable lessons learned (patterns, gotchas, workflows) | `memory_` |
| `assist-skill` | Observations about the skills themselves (improvements, friction) | `skill_` |

All three are stdio MCP servers backed by SQLite + FTS5. Their data lives under
`~/.claude-tools/assist-*/` and persists across sessions independently of either
git repo.

## Try the native tools first

In many environments the assist-\* servers are already connected (the remote
runner may provide them). **Before setting anything up, just try a native tool** —
e.g. `project_list_facts` / `project_relevant_facts`. If it works, you're done;
skip to [Using them on this project](#using-them-on-this-project).

## If they aren't connected

Paths below assume both repos are checked out under `/home/user`; adjust to wherever
`refactored-tribble` actually lives.

### 1. Build the servers + link the skills (idempotent)

`refactored-tribble` is self-bootstrapping. Running its SessionStart hook builds
each server to `dist/index.js`, regenerates that repo's project-scoped `.mcp.json`,
and symlinks every skill into `~/.claude/skills/`. It's safe to re-run:

```bash
bash /home/user/refactored-tribble/.claude/scripts/session-start.sh
```

(If `better-sqlite3` fails to compile, you need a C++ toolchain — on Debian/Ubuntu:
`sudo apt install build-essential python3`.)

### 2. Make the tools callable from *this* repo

That hook registers the servers at **project scope for `refactored-tribble`**, so
they won't auto-connect while your working directory is this repo. Two options:

**Option A — register at user scope (native tools, available in every project).**
Then restart the session so they connect:

```bash
claude mcp add assist-memory  --scope user -- node /home/user/refactored-tribble/mcp-servers/assist-memory/dist/index.js
claude mcp add assist-project --scope user -- node /home/user/refactored-tribble/mcp-servers/assist-project/dist/index.js
claude mcp add assist-skill   --scope user -- node /home/user/refactored-tribble/mcp-servers/assist-skill/dist/index.js
```

**Option B — the fallback wrapper (zero config; works in remote/web sessions).**
This is `refactored-tribble`'s sanctioned path for sessions that didn't connect the
project servers. Same tool names, same JSON args, same returned payload:

```bash
# call a tool
node /home/user/refactored-tribble/scripts/mcp-call.mjs assist-project project_list_facts '{}'
# discover a server's tools / one tool's input schema
node /home/user/refactored-tribble/scripts/mcp-call.mjs assist-project --list
node /home/user/refactored-tribble/scripts/mcp-call.mjs assist-project --schema project_add_fact
```

Servers are `assist-memory`, `assist-project`, `assist-skill`. For 3+ calls at once,
use `--batch` (one process per server). Because the wrapper hits the same SQLite
stores as the native tools, anything written one way is visible the other way.

## Using them on this project

- **assist-project** — at task start, `project_list_facts` / `project_relevant_facts`;
  the **build-status** + **architecture** facts summarize what's built and the stack
  quirks. Add/update facts as the build state changes.
- **assist-memory** — consult relevant lessons before non-trivial work; capture
  durable lessons afterward (the `using-assist-memory` skill gates this behind a
  quality bar + a search-before-add dedup step).
- **assist-skill** — capture observations about the *skills* themselves (not the
  task), via the `using-assist-skill` loop.

The relevant skills (`using-assist-memory`, `using-assist-skill`,
`assist-mcp-fallback`, the plan-lifecycle skills) become available once symlinked
by step 1; run `/skills` to confirm Claude Code sees them.

## Where it's authoritative

`refactored-tribble`'s own docs are the source of truth if anything here drifts:
its `README.md` (repo layout + per-area skill descriptions),
`mcp-servers/assist-memory/README.md` (server setup), and the
`skills/*/SETUP.md` files (per-skill activation).
