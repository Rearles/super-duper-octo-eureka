# Contributing

This is a solo portfolio project. The primary contributor is the repo owner.
External contributions are welcome but lightweight — here's what you need to know.

## Bug reports and ideas

Open a [GitHub Issue](.github/ISSUE_TEMPLATE/) using the appropriate template.

## Pull requests

1. Fork the repo and create a feature branch off `develop`.
2. Keep all gates green before opening a PR:
   ```bash
   npm run db:generate        # generate the Prisma client
   npm test                   # 111 tests (vitest)
   npm run typecheck          # browser typecheck
   npx tsc -p server/tsconfig.json --noEmit   # server typecheck
   npm audit --omit=dev --audit-level=high    # no high/critical prod advisories
   ```
3. Open the PR against `develop`. The CI workflow will run the same gates.

## Key invariants (non-negotiable)

These are enforced by Semgrep (Phase 2) and must not be violated:

- **Browser / Node boundary** — `src/` (browser engine) **never** imports
  `@prisma/client` or `./generated`. All DB access lives in `server/`.
- **Determinism (Pillar 1)** — `crypto.randomUUID()` is **forbidden** in
  `src/engine/**`. All IDs and world content are seed-derived
  (`src/engine/ids.ts`, `rng.ts`).
- **Safe raw SQL** — use `$queryRaw` tagged templates, **never**
  `$queryRawUnsafe` or `$executeRawUnsafe`.

## Design decisions

Significant decisions live in `§15.3 Decision Log` of
`docs/GameConceptDocument.md`. The four Pillars and the Decision Log are
binding. Surface conflicts before reversing them — don't overwrite
deliberately-reasoned decisions.

## Commit signing

This repo encourages signed commits (GPG or
[sigstore/gitsign](https://github.com/sigstore/gitsign)).
Setup is local; see the linked guides for your platform.
