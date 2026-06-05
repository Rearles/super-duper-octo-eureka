# ClaudeCodeSessions — the running session archive

A growing, chronological archive of the Claude Code working sessions on this
project. **Purpose:** any new session can read it to understand the good work and
good context that came before — the decisions, the reasoning, and what got built.
`CLAUDE.md` points here so it's referenced at the start of every session.

## How it works

- **One file per session** (or per working day), named `YYYY-MM-DD-<topic>.md`.
- Each entry captures, turn by turn:
  - the **user's prompt — verbatim**;
  - the assistant's **reasoning & decisions** — a *faithful reconstruction*. (The
    model's internal chain-of-thought is not reproducible byte-for-byte, so this is
    an honest, detailed account of the decisions and trade-offs, not a literal
    transcript of hidden reasoning — nothing material is omitted.)
  - the assistant's **response** — captured faithfully;
  - the **actions & outcomes** — files, commits, test results.
- **Append new sessions; never rewrite old ones.** This is a record.
- Don't include secrets or the model's identifier in these files.

## Index

- **`2026-06-05-mound-city-v2-pivot-and-full-build.md`** — the GCD **v2.0
  simulation-first pivot** (reconciling the pillars rather than bulldozing them),
  the re-lay into an 18-plan program, and the **full implementation**: foundation
  (5) + society-sim (6) + the sim→Registry integration + the surfaces (2). ~25
  user turns; ~20 commits; ended at 111 passing tests with the remaining work
  scoped into four new plans.
