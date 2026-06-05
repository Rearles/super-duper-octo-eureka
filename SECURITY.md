# Security Policy

## Supported versions

This is a personal / portfolio project. The `develop` branch is the active
development line; no other branches receive security fixes.

## Reporting a vulnerability

**Please do not open a public GitHub issue for a security vulnerability.**

Use **GitHub's private vulnerability reporting** (preferred):  
Repository → Security tab → "Report a vulnerability"

Or email: jazzbuddy6@gmail.com

**Please include:**
- Description of the vulnerability and its potential impact
- Steps to reproduce (proof-of-concept if possible)
- Which part of the codebase is affected (`src/` browser engine, `server/` Node API, `prisma/` schemas)

**Response timeline:**
- Acknowledgement within 7 days
- Initial assessment within 14 days
- Fix timeline communicated at assessment

## Scope

In scope:
- `src/` — browser engine (TypeScript, deterministic, no Prisma)
- `server/` — Node/Fastify/Prisma 7 API server
- `prisma/` — SQLite and Postgres schemas, raw SQL migrations with RLS

Out of scope: third-party dependency vulnerabilities (please report those to the
upstream project; our response is to upgrade when a fix is available).

## Security controls

See the [Security section of README.md](README.md#security) for the active
control inventory and the phased rollout plan.
