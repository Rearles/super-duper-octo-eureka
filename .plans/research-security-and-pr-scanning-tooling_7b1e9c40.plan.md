---
title: "Research & roll out world-class security + PR scanning"
type: "research"
created: "2026-06-05"
status: in-progress
related: ["wire-the-vertical-slice-http-routes-and-desk-ui_3f1a9c20.plan.md"]
---

# Research & roll out world-class security + PR scanning

## Context

Evaluate and adopt the security / supply-chain / PR-scanning tooling that makes
this repo demonstrably world-class, then roll it out in phases. This is a
**research + rollout** plan: each candidate gets weighed against criteria, a
free pick is chosen, the paid alternative is noted, then it lands additively.

**Posture (decided 2026-06-05):**
- **Audience:** solo project *and* a portfolio/showcase piece — so favour
  **visible, point-to-able** best practices (badges, a security policy, signed
  commits, branch protection) while keeping per-PR maintenance low.
- **Budget:** **free now, document paid** — every adopted tool uses a public-repo
  free tier or OSS CLI; paid upgrades (Snyk, Semgrep Pro, Socket paid) are noted
  for later, not adopted now.
- **Gating:** **gate the criticals** — block merges only on high/critical
  findings; everything else advises (annotations + the Security tab).
- **Scope:** all four workstreams below (A–D).

**Already in place (build on, do NOT duplicate):**
- Dependabot **alerts** + **grouped version updates** (`.github/dependabot.yml`).
- **CodeQL** code scanning via GitHub **default setup** (the "Analyze
  (javascript-typescript)" + "CodeQL" checks). ⚠️ Adding an advanced-setup
  `codeql.yml` *conflicts* with default setup — switch, don't stack.
- **CI gate** (`.github/workflows/ci.yml`): browser + server typecheck, 111-test
  vitest suite, and `npm audit --omit=dev --audit-level=high` (fails on
  high/critical prod advisories). Green on `develop` as of `1057a26`.

**Stack facts that shape tool choice / custom rules:**
- TS strict, ES modules. **Browser engine `src/` must never import Prisma**
  (`@prisma/client` / `./generated`) — Prisma is Node-only, lives in `server/`.
- **Determinism (Pillar 1):** world content is seed-derived (`src/engine/ids.ts`,
  `rng.ts`) — **never `crypto.randomUUID()`** in the engine.
- Raw SQL + **RLS** live in `prisma/postgres/*.sql`; the server uses Prisma
  (`$queryRaw` tagged templates). Postgres target; `apache/age` Docker image.

## Evaluation criteria (score each candidate)

1. **Free on public repos** (hard requirement for adoption now).
2. **Signal-to-noise** — low false positives; a solo maintainer must trust it.
3. **PR-native** — annotations / SARIF into the Security tab; gate criticals.
4. **Low maintenance** — set-and-forget; no babysitting.
5. **Showcase value** — a visible, credible "I know what I'm doing" artifact.
6. **Stack fit** — TS/Node, browser+server split, Prisma/raw-SQL, determinism.

## Workstream A — Code & dependencies

- **SAST — Semgrep (OSS, free).** Add a tokenless workflow running **custom
  rules** that encode this repo's invariants (high showcase value): forbid
  `@prisma/client` / `./generated` imports under `src/`; flag
  `crypto.randomUUID(` in `src/engine/**` (determinism); flag
  `$queryRawUnsafe` / `$executeRawUnsafe`. Add the registry `p/typescript` suite
  for breadth. SARIF → code scanning. *Paid:* Semgrep Pro (cross-file taint).
- **SAST depth — CodeQL.** Decide: keep **default setup**, or switch to
  **advanced** to enable the **`security-extended`** query suite. Confirm
  **Copilot Autofix** is on (free, GA).
- **SCA — Dependabot vs Renovate.** Keep Dependabot (already grouped) or move to
  **Renovate** (richer grouping, scheduled auto-merge of safe minors, dashboards).
  Either way, enable **Dependabot security updates** (auto-fix PRs) in Settings.
- **SCA breadth — OSV-Scanner (Google, OSS).** Optional CI step over the
  lockfile for OSV.dev coverage beyond the npm advisory DB.

## Workstream B — Secrets & supply-chain

- **Secret scanning + push protection** — GitHub native, free on public repos,
  Settings toggle (blocks commits containing keys). Relevant given `DATABASE_URL`.
- **gitleaks (OSS)** — defense-in-depth in CI + a pre-commit hook; scans history.
- **Malicious packages — Socket.dev** — install the **GitHub App** (free tier):
  PR comments flagging risky installs (install scripts, typosquats, exfil) that
  `npm audit`/CodeQL miss. (CLI needs a token — document; the App is the path.)
- **SBOM + provenance** — generate a **CycloneDX SBOM** in CI
  (`@cyclonedx/cyclonedx-npm`) as a release artifact; `npm audit signatures`;
  note **npm provenance / SLSA** for any future published package.

## Workstream C — Repo health & governance (highest showcase ROI)

- **OpenSSF Scorecard** (`ossf/scorecard-action`) — runs the industry checklist,
  publishes results to code scanning **and a README badge**. The single most
  point-to-able "world-class" artifact; directly drives the items below.
- **Branch protection on `develop`** — require the CI `verify` check + CodeQL,
  require a PR before merging, block force-pushes, require linear history.
  (Solo nuance: decide whether to require a self-review / allow admin bypass.)
- **Governance files** — `SECURITY.md` (disclosure policy), `CODEOWNERS`,
  PR + issue templates, `CONTRIBUTING.md`, a license. Cheap, visible, expected.
- **Signed commits** — gpg or **sigstore/gitsign**; earns the "Verified" badge.

## Workstream D — Build / container / runtime

- **Trivy (Aqua, OSS)** — scan the `apache/age` image + filesystem + the
  `docker-compose.yml` (IaC) in CI; **runs only in a Docker-capable env**.
- **hadolint** — lint a `Dockerfile` if/when one is added (none today).
- **Runtime / fuzzing (later, lower priority)** — property-based tests
  (`fast-check`) against the deterministic engine oracle; a light **DAST** pass
  (e.g. ZAP baseline) over the Fastify server once the vertical slice exists.

## Todos (phased — gate criticals; each scanner lands on a branch → PR)

- [x] **Phase 0a — Vite 8 / Vitest 4 upgrade.** Clears GHSA-5xrq-8626-4rwp
      (critical) + Vite/esbuild moderates. 111 tests + both typechecks green.
      `@hono/node-server` moderate (via Prisma CLI) tracked for future Prisma 7
      patch; unfixable without a Prisma major downgrade. Committed `18a0ba0`.
- [x] **Phase 0b — Settings toggles (manual, GitHub UI).** Enabled in
      Settings → Code security: **Secret scanning**, **Push protection**,
      **Dependabot security updates** (auto-fix PRs for known advisories).
- [x] **Phase 1 — governance & visible wins.** OpenSSF Scorecard workflow
      (`.github/workflows/scorecard.yml`) + README badge; `SECURITY.md`,
      `.github/CODEOWNERS`, PR template, issue templates (bug/feature),
      `CONTRIBUTING.md`, `LICENSE` (MIT); gitleaks as second CI job (full
      history scan). README Security section added.
      ⚠️ **Manual remaining:** (a) branch protection on `develop` — enable in
      Settings → Branches: require PR, require checks (`typecheck · test · audit`
      + `Analyze (javascript-typescript)`), block force-push, require linear
      history; (b) commit signing — set up GPG or sigstore/gitsign locally.
- [x] **Phase 2a — Semgrep SAST.** `.github/workflows/semgrep.yml` +
      `.semgrep/mound-city.yml` (3 custom invariant rules: browser/Node
      boundary, engine determinism, safe raw SQL). Two layers: a GATE step
      (custom rules, `--error`, local — no network dependency) and an ADVISE
      step (custom + `p/typescript` → SARIF to the Security tab, best-effort).
      Rules verified with Semgrep 1.165 locally: 0 findings on `src/`+`server/`,
      fire correctly on fixtures, and the `crypto.randomUUID` *comment* in
      `ids.ts` does not false-positive (AST-based, not regex).
      ⚠️ **Manual remaining:** add the `semgrep` check to branch-protection
      required checks to make the invariant gate actually *block* merges
      (today it runs and fails-red but isn't required).
- [ ] **Phase 2b — CodeQL depth (decision).** Keep CodeQL **default setup**
      (zero-maintenance, already running) or switch to **advanced** for the
      `security-extended` query suite. Advanced requires *disabling default
      setup first* (manual UI), then adding a `codeql.yml` — they conflict if
      stacked. Recommendation: stay on default for now (solo/low-maintenance);
      revisit if the Security tab looks thin. Confirm Copilot Autofix is on.
- [ ] **Phase 3 — supply-chain & SBOM.** Socket GitHub App; CycloneDX SBOM
      artifact in CI; `npm audit signatures`; OSV-Scanner step; Dependabot-vs-
      Renovate decision.
- [ ] **Phase 4 — container/runtime (Docker env).** Trivy on the apache/age image
      + compose; note fast-check property tests + a DAST baseline for later.
- [ ] Add a **"Security" section to `README.md`** linking every control (the
      portfolio artifact); record an assist-project `security` fact for the baseline.
- [ ] Verify after each phase: CI stays green; only high/critical gate; commit per phase.

## Definition of done — the "world-class" checklist

- Security tab fed by **CodeQL + Semgrep + secret scanning**; Dependabot grouped
  **and** security-updating; **OpenSSF Scorecard** badge in the README.
- Visible governance: `SECURITY.md`, `CODEOWNERS`, templates, **signed commits**,
  branch protection requiring green CI + CodeQL.
- **SBOM** produced per release; no **critical** advisories outstanding.
- CI **gates criticals** (high/critical block; rest advise) and stays green.

## Open decisions (collaborate before/within each phase)

1. **Dependabot vs Renovate** for version updates?
2. **CodeQL default vs advanced** (`security-extended`)?
3. **Branch protection strictness** when solo — require a review? admin bypass?
4. **Commit signing** — gpg vs sigstore/gitsign?
5. Do the **Vite/Vitest upgrade** as Phase 0 here, or as its own separate PR now?

## Notes

- **Don't duplicate CodeQL** — default setup already runs; advanced means
  disabling default setup first.
- Everything adopted now is **free on public repos**; paid options (Snyk,
  Semgrep Pro, Socket paid, Renovate Mend) are flagged, not adopted.
- Keep changes **additive** and the CI **green**; configure each scanner to
  **block only on high/critical** per the agreed posture.
- **assist-project:** architecture facts `fct_368b273e0ae0` (sim-first),
  `fct_c9ebf6bea613` (server tier / determinism invariant), build-status
  `fct_4262177601db` (what's built / remaining).
