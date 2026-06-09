## What changed and why

<!-- 1–3 sentences. -->

## Test plan

- [ ] `npm test` — all 111 tests pass
- [ ] `npm run typecheck` — browser typecheck green
- [ ] `npx tsc -p server/tsconfig.json --noEmit` — server typecheck green
- [ ] `npm audit --omit=dev --audit-level=high` — exits 0

## Invariant checklist

- [ ] No `@prisma/client` or `./generated` imported anywhere under `src/` (browser/Node boundary)
- [ ] No `crypto.randomUUID()` in `src/engine/**` (determinism — Pillar 1)
- [ ] No `$queryRawUnsafe` / `$executeRawUnsafe` (use `$queryRaw` tagged templates)
