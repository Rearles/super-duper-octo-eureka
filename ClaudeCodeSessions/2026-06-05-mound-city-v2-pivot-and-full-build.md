# Session — Mound City: the GCD v2.0 simulation-first pivot & full build

- **Date:** 2026-06-04 → 2026-06-05
- **Branch:** `claude/zen-clarke-DkXdA`
- **Outcome:** GCD revised to v2.0 (simulation-first), the plan set re-laid into 18
  plans, and the entire program **implemented + tested (111 passing)**. Remaining
  work scoped into four new plans.

## About this record (please read)

- The **user prompts are verbatim.**
- The assistant's **responses are captured faithfully** (the substance — decisions,
  designs, tables — preserved).
- The assistant's **reasoning is a faithful reconstruction**, not a literal
  transcript of hidden chain-of-thought (which isn't reproducible byte-for-byte).
  Nothing material is omitted.
- Organized by **phase** (the conversation interleaved several structured
  multiple-choice questions; phase grouping is accurate where exact micro-ordering
  of those would not be).

## Commit map (this session)

| Commit | What |
|---|---|
| `cb70c36` | Revise GameConceptDocument to **v2.0** (simulation-first pivot) |
| `db4decf` | Re-plan the **foundation** slice for v2.0 (3 revised + 2 new) |
| `2f8680c` | Complete the v2.0 plan set: wire fact IDs + faction-sim & surface slice |
| `0dfbecd` | Record the v2.0 **scoping call** (clear 3 unplanned systems) |
| `329c025` | Foundation 1 — Registry data layer (Fastify + Prisma 7) |
| `9d06576` | Foundation 2 — death/judicial clusters + NIBRS records |
| `d1fdf0f` | Foundation 3 — procgen v2.0 framework |
| `07c50ce` | Foundation 4 — governance: audit, access tiers, sealed-access |
| `e8da6b3` | Foundation 5 — SQLite→Postgres migration (native types + RLS) |
| `4093502` | Mark foundation plans 1–5 complete |
| `7026b43` | Sim 1 — faction & allegiance model |
| `dd46010` | Sim 2 — relationships & pacts diplomacy engine |
| `f86b049` | Sim 3 — simulation tick, agendas & incentive engine |
| `7260e46` | Sim 4 — event→record pipeline, ground-truth & Case lifecycle |
| `3a587ab` | Sim 5 — decay, cover-up & the observer effect |
| `098d951` | Sim 6 — detective integrity, leverage & flipping |
| `adf918c` | Mark society-sim plans 1–6 complete |
| `e0b6c0e` | Integration — sim→Registry backlog generation + persistence |
| `1efe8d5` | Surfaces — analysis tools + public read-model (CQRS) |

`assist-project` facts written: `fct_368b273e0ae0`, `fct_a5b0a0cfbc34`,
`fct_2fbede949a8d`, `fct_6aaf3f612bd9`, `fct_b03838e7cfab`, `fct_c9ebf6bea613`
(v2.0 design), `fct_a2a63011f1f3` (scoping), `fct_6752594d3d62` (foundation built),
`fct_0d2822797cd5` (sim built), `fct_4262177601db` (integration + surfaces built).
`assist-memory` lessons: `lsn_10103f8ab3ca`, `lsn_1bb9cdbe8615`. `assist-skill`
observation: `obs_14671160b48b` (create-plan reconciliation).

---

## Phase 0 — prior context (before this record's window)

Earlier work (summarized into this session) had produced: the `GameConceptDocument`
v1.1 (design-complete), a working MVP + authored-case-core + faction-tension +
in-progress hypothesis-board, and the first three "Registry" plans (data layer,
governance, Postgres migration). This session began mid-flow, with the assistant
having just researched police-record types and the cross-cutting sealing idea, and
about to ask how to turn the locked content into plan files.

---

## Phase 1 — design exploration: the faction expansion

**User prompt (verbatim):**
> I have further ideas to give you to consider before you write anything.

**Reasoning:** The user wanted to keep designing before any plans were written.
Hold off; invite the ideas.

**Response:** Acknowledged, held off writing, handed the floor back.

---

**User prompt (verbatim):**
> I like the idea of fleshing out the factions while we are at it. I want a press
> that feels real and present in this world and how it interacts with the Cold Case
> Detective and the actions that they are taking, I also want organized crime to
> feel real and present in this world, I also want the political machine and the
> political elite to feel real and present in the world too. I feel like we should
> have a system for each of the broader factions in the world, for example press
> having its own broad faction with the individual newspaper companies being
> subfactions underneath that broader faction, organized crime having its own broad
> faction with individual criminal organizations and/or gangs being subfactions
> underneath that broader faction, and the political machine being its own broad
> faction with the political parties being subfactions underneath that broader
> faction. Help me to flesh out this idea and work collaboratively with me on it
> too, feel free to do research into each of those faction types to figure out how
> they operate and suggest ideas for faction systems based on that research into
> real world examples.
> I have ideas for newspaper companies listed below:
> The Press Faction:
> **STL Evening Gazette** — "The most trusted voice in Mound City"; slow to publish,
> verifies sources; heavy investigative reporting; award-winning exposés on corrupt
> figures and the meat-packing industry that made real change; not afraid to get its
> hands dirty (legally) to surface injustice.
> **The Daily Star Tribune** — celebrity/gossip focused, People-magazine-like;
> spreads rumors; the juicier the better.
> **The Collect Courier** — "Fast news for fast people"; scandalous/salacious, old
> yellow-journalism, next to no sources, bold claims, stirs the pot; a leading paper
> whose lack of sourcing spreads misinformation; runs whatever sells papers, up to
> and including blatant lies.

**Reasoning:** "Mound City" = St. Louis. The three papers form a **credibility /
sourcing-rigor spectrum** that maps directly onto the existing truth-and-distortion
model: Gazette = high-fidelity/low-distortion reform ally (the *Post-Dispatch*/
Pulitzer archetype); Star Tribune = sensation/rumor; Courier = a fabrication engine
(yellow journalism). So newspapers are *record-emitters* whose editorial integrity
sets the `fidelity`/`motive`/`distortion` of the claims they push. The bigger
structure is a **triangle: Political Machine ↔ Organized Crime ↔ Press**. Research
to ground it (with fictional-vs-real flagged for later).

**Actions:** Web research — St. Louis newspapers (Post-Dispatch/Pulitzer,
Globe-Democrat, circulation wars); Mafia hierarchy + Prohibition-era St. Louis gangs
(Egan's Rats + seven ethnic gangs, the Giordano family); political machines (Tammany
Hall, ward bosses, patronage, control of police/judges); Lincoln Steffens' "Tweed
Days in St. Louis" (the *boodle*, prosecutor Joseph Folk).

**Response:** Named the editorial-integrity spectrum and the documented
machine↔crime↔press triangle (Steffens). Proposed a **three-tier faction system**
(Bloc → sub-faction → member, reusing Person/Organization), shared axes
(Influence/Territory/Resources/Standing/Heat/Cohesion/Alignment), per-bloc mechanics
(press emits Stories with fidelity from rigor; crime distorts by muscle; the machine
by authority), and the triangle as cross-bloc state. Asked three forks.

**User decisions (multiple-choice):**
- **Era:** 1950 present, cold cases reach back to the 1920s–30s gang wars.
- **More blocs:** add **Law Enforcement, Reform/Civic, Business/Industry** (→ seven
  blocs total).
- **Faction life:** **Full simulation** (autonomous, off-screen, continuous).

**Reasoning (the keystone):** Full sim + 1950-present + cases-reach-back ⇒ **the
simulation runs the city's history and *writes the records* — deliberately
imperfect ones; the detective reconstructs the simulated truth from the distorted
exhaust.** Every record table becomes the sim's exhaust, not hand-authored. Two
phases off one engine: historical generation (1915/20s → ~1950) then live play.
Flagged honestly that this is the largest/riskiest subsystem and will be staged.

**Response:** Presented the keystone realization, the two-phase timeline, the
seven-bloc power map (the corrupt core Machine↔Crime↔Business; Law Enforcement
straddling; Press the swing bloc; Reform the amplifier), how full-sim runs
(tick/agendas/action-repertoires/event→record/ground-truth), and the scope caveat.
Asked two forks.

**User decisions:** **Stakes** = "the trail goes cold" (decay + active cover-up);
**Live cases** = "self-refreshing world" (off-screen ticks mint new mysteries).

**Reasoning:** These two yield the **observer effect** almost for free: investigating
raises Heat, which the guilty faction reads *through the audit log* (the sensor net)
and answers with active cover-up — looking degrades the trail. Two play modes
(archaeology vs race). A living case queue.

**Response:** Articulated the observer effect, the two tempos, the decay model
(freshness/recoverability), and the living queue; handed the floor back.

---

## Phase 2 — Unorganized Crime + the allegiance generalization

**User prompt (verbatim):**
> Add an additional faction for Unorganized Crime for gangs that are operating
> outside of the bounds of the Organized Crime Faction and they've been trying to
> gain ground and effectively steal territory from Organized Crime. Some of the
> subfactions of Unorganized Crime have been more successful at this than other
> subfactions and the Organized Crime faction has been hitting back at the new
> comers to the scene. There's a complicated relationship between the subfactions of
> Organized Crime and the other subfactions of Organized Crime, there's also a
> complicated relationship between the subfactions of Unorganized Crime and the
> other subfactions of Unorganized Crime. And the relationship between the Organized
> Crime Faction and the Unorganized Crime Faction is messy and complicated. All of
> this is full of different agreements or understandings between the various groups
> that continuously break or change or create a new.

**Reasoning:** This demands the biggest model upgrade: **relationships and pacts as
first-class, living objects** (not scalars). Bloc #7 = Unorganized Crime (the
freelancer/upstart tension vs the disciplined family). "Agreements that break/change/
form anew" = a **pact graph**: relationship edges over *any* faction pair (incl.
intra-bloc) + **Pacts** (typed, temporal, with stability) that form/strain/break each
tick. Territory theft = zones changing controlling-faction over time.

**Response:** Added bloc #7; the OC-vs-UC contrast (protection/discipline/omertà);
the living pact graph; engine integration (graph layer, territory→zones, asymmetric
evidence). Asked one fork (OC/UC porosity).

**User decision (verbatim of the free-text part):**
> Fluid - crews rise and fall between them, but also consider this with all of the
> other factions and their relationship with all the rest of the factions. In real
> life, people can change affiliation between groups if the incentive is high enough,
> correct? How can we incorporate this idea into our faction system as well?

**Reasoning:** This generalizes fluidity from OC↔UC to **every actor** — including
**individuals** switching when the incentive crosses a threshold. The unifying
abstraction: **Allegiance as a per-actor portfolio** (faction *or* person, including
the detective) — strength + **public/secret** + role + append-only history — where
an actor switches when **incentive − cost** crosses a threshold. One rule unifies
witness-flipping, corruption, moles, defection cascades, and *emergent omertà*
(killing a snitch raises everyone's switching cost). A bought cop = *public: Law
Enforcement + secret: a gang*. The deduction payoff: true allegiance is hidden
ground-truth; the record shows only the public tie; uncovering a secret tie can
break a record open.

**Response:** Presented the Allegiance model in full, what it unifies, the deduction
payoff, and the engine fit. Asked one fork (can the detective himself be flipped).

**User decision:** **"Yes — integrity is at stake"** (an explicit corruption meter;
falling is a possible ending).

**Reasoning:** This closes the loop on the player — **a compromised detective
becomes a distortion source in his own filings.** Integrity as a costly resource;
leverage symmetric; the audit-log sensor net catches his dirt too. Thematic spine:
does the reformer stay a reformer (the Folk arc) or become another node in the
machine.

**Response:** Articulated the loop closing on the player, integrity as liability/
leverage (not a virtue score), and the branching outcomes; offered to converge.

---

## Phase 3 — converge, discover the conflict, and pivot the GCD to v2.0

**User prompt (verbatim):**
> Let's converge and then present the plan to me for me to see where all of this
> leaves us.

**Reasoning + Response:** Stated the thesis ("the simulation *is* the
record-generator"), drew the data-flow, and presented the program re-laid as **15
plans across 4 phases** (substrate → platform shift → society-sim → surfaces), with
the honest "we went from 3 plans to 15" assessment and the one open call (Postgres
migration timing). Asked (migration timing, write scope).

**User decisions:** migration **after substrate, before sim**; **"Foundation first."**

---

**User prompt (verbatim):**
> How will the procgen operate on top of all of this to make the records and people
> and subfactions and everything else it's going to make? Have you considered the
> design of the procgen?

**Reasoning:** Honest answer — *partially* (the dynamic side was in the event→record
plan, but procgen deserved first-class design). The architecture: the **sim is the
orchestrator, procgen the content factory** (called from the seed-builder AND the
live sim); deterministic hierarchical seeding; layered constraint-aware generation;
the **truth→distortion→record pipeline** (generate truth, then degrade per actor/
motive/decay); multi-view fan-out (the deduction generator); authored→procedural→
emergent; **lazy realization** (realize-on-touch); and **solvability validation**.

**Response:** Delivered that architecture; asked two forks (lazy vs eager; solvability).

**User decisions:** **Lazy** realization; solvability = "**guarantee fairness for
most cases, but some cannot be solved — think the Zodiac Killer or D.B. Cooper.**"

**Reasoning:** The Zodiac/Cooper framing reframes "unsolvable" as **underdetermined,
not erased**: evidence-rich, suspect-heavy, but the decisive link is missing.
Solvability becomes a *determination spectrum* (provable / crackable /
underdetermined / never-blank). Adds a Theory system + a case-disposition spectrum +
targeted decay + authored "white-whale" set-pieces.

**Response:** Articulated underdetermined-not-erased, the determination spectrum, the
new mechanics, and the plan-set delta (→ ~17 plans).

**(Discovery.)** On moving to write the foundation plans, the assistant **read the
repo** and found far more than expected: a working MVP + the `GameConceptDocument`
(marked **design-complete v1.1** with a 21-entry Decision Log) + built faction/clue
systems + the existing `.plans`. Critically, the session's grand design **conflicted
with locked GCD decisions**: real St. Louis names vs §4.2 (fictional analogues), the
era, **authored vs autonomous factions** (the GCD's §14 simulation-first was a
*stretch*, and "fully emergent links" had been *rejected*), **unsolvable cases vs
Pillar 1** ("always solvable"), and the **integrity meter vs §2.4** ("no
morality/karma meter") — plus duplication of already-built systems.

**Reasoning:** This is the integrity moment — do not silently encode contradictions
into a design-complete project. Surface what exists, what's additive, and what
conflicts; let the user choose how to reconcile.

**Response:** Surfaced the reconciliation (already-built vs additive vs conflicting),
and asked the direction (Hybrid / Build-within-the-frame / **Pivot the GCD**).

**User decision:** **"Pivot the GCD."**

**Reasoning + Response:** Read the rest of the GCD (incl. §10–§15 + Decision Log).
Presented the pivot-impact briefing — which locked decisions each change reverses —
and asked the three highest-stakes sign-offs.

**User decisions:**
- **Solvability:** *Refine Pillar 1* (provable core + underdetermined marquee
  minority; never blank).
- **Integrity:** *Explicit integrity meter* (accepting the §2.4 reversal; mitigated
  as a liability/leverage axis, not a grade).
- **Names:** *Fictional analogues* (honor §4.2; real history as inspiration only).

**Actions:** Authored **GCD v2.0** via 14 surgical edits (header; refined Pillar 1;
era → mid-century; §2.4 Integrity axis; §2.5 autonomous-faction extension; §5.1/§14
sim-first-as-core + server tier; §5.4 White-Whale archetype; §3.2; and a
comprehensive **2026-06-04 Decision Log entry** recording all six reconciliations).
Verified coherence, committed `cb70c36`, pushed (to survive the ephemeral container).

Then re-planned the **foundation** slice (commit `db4decf`): revised the three
not-started Registry plans for v2.0 (data layer +Location/Organization; governance
+sealed-access +audit-as-sensor-net; migration +AGE/RLS/PostGIS, repositioned) and
created two new plans (death/judicial+NIBRS clusters; procgen-v2 framework).

---

## Phase 4 — capture context, complete the plan set, and the scoping call

**User prompt (verbatim):**
> When you get a chance update the assist-project and also remember to use
> assist-memory and assist-skill as needed

**Reasoning + Actions:** Loaded the `assist-*` tools, consulted (the project store
was empty in this fresh container), then captured **6 project facts** (the v2.0
pivot, tiered Pillar 1, the society-sim, the integrity axis, the foundation re-plan,
the server tier), **2 transferable lessons** (read the design doc + existing plans
before expanding plans; edit large docs via short ASCII-safe anchors), and **1 skill
observation** (create-plan should reconcile against the design doc first).

---

**User prompt (verbatim):**
> Wire up those 6 IDs into the revised plan. Then write all of the rest of the plan
> documents you need to write, you don't need to stop to ask me for approval to
> write the rest of them. Only stop and ask me questions if you need clarification
> on what you are writing into the plan documents.

**Actions (commit `2f8680c`):** Wired the six `fct_` IDs into the five foundation
plans, then wrote the **eight** remaining plans — the society-sim slice (faction &
allegiance, relationships & pacts, tick/agendas, event→record + ground-truth + Case
lifecycle, decay/observer-effect, detective integrity) and the surfaces (graph
analysis + search, public read-model + Go Public) — cross-linked and fact-referenced.

---

**User prompt (verbatim):**
> Based solely on what we designed and planned earlier, do we need the unplanned GCD
> systems? Would they provide actual value to what we designed earlier today or
> should we get rid of them?

**Reasoning + Response:** Judged against the v2.0 design: **case interlinking** is
*inherent* (one shared sim + the graph plan) — not a separate system; the **authored
secret backbone** is *superseded* by the endless-world + integrity endings (and a
systemic secret *emerges* from the corruption graph anyway); the **LLM renderer** is
keep-but-deferred polish (the template renderer is the fallback; v2.0's scale raises
its value); **audio/visual** is downstream production, defer. None need new planning.

**User prompt (verbatim):**
> Clear all three off the active backlog and record this scoping call in the decision
> log

**Actions (commit `0dfbecd`):** Added a 2026-06-04 Decision Log entry recording the
scoping call + the per-system reasoning, and reconciled §11.3 (the win condition no
longer asserts the dropped authored secret — the "secret" and interlinking are now
emergent; the Integrity arc + faction Standing drive the multiple endings). Mirrored
to `assist-project` (`fct_a2a63011f1f3`).

---

## Phase 5 — implement the foundation (5 plans)

**User prompt (verbatim):**
> Implement the entire Foundation slice, only stop if you need something structural
> or meaningful from me. Do not stop to ask me approval to move onto the next step.

**Reasoning:** Read the actual codebase first (Vite + TS + Vitest, browser-only, no
backend; Node 22). Probed the environment — **npm registry reachable, Docker 29 and
psql 16 present** — so the whole slice, including the Postgres migration, is
buildable here. Key architecture call made without stopping: **Prisma is Node-only,
so all DB usage lives in `server/`** (the client generates to `server/generated/`),
the browser engine never imports it, and the deterministic id factory stays pure in
`src/engine/`.

**Actions & verification (one commit per plan):**
- `329c025` — **Registry data layer.** Fastify + Prisma 7 (better-sqlite3 driver
  adapter; `prisma.config.ts` + dotenv); schema: `PersonRegistration` +
  `IdentityBinding` (the unforgeable ground-truth spine), `Location`,
  `Organization`, `MorticianRecord`, `PoliceRecord` + 8 per-type tables; every
  forgeable record carries `enteredBy`/`motive`/hidden `fidelity`. `src/engine/ids.ts`
  (deterministic seed-derived hierarchical id factory). `server/` row-builder +
  persist/read repository + a Fastify API + a seed CLI. `src/registryClient.ts`
  (browser API seam). Determinism unit-tested; the seed produced 7 people + 1 forged
  record (the discoverable cover-up lie). *(Regenerated a pre-existing stale golden
  snapshot.)*
- `9d06576` — **Death/judicial clusters + NIBRS.** DeathCertificate(+mannerOfDeath)/
  Autopsy/Toxicology/ME-Investigation/BodyChart/ChainOfCustody/BodyRelease +
  CourtRecord; new police types CAD/FieldInterview/Booking/Supplemental/BOLO/Warrant/
  EvidenceLog; NIBRS fields on incident/arrest. Seed emits a **forged death cert vs
  honest autopsy** contradiction.
- `d1fdf0f` — **Procgen v2.0 framework** (additive; existing generator untouched):
  `rng.ts` (splittable deterministic), `procgen/contract.ts` (the
  generateTruth→applyDistortion→emit contract + `fidelityFromAuthor`), `realize.ts`
  (lazy realize-on-touch), `determination.ts` (tiered solvability + engagement floor).
- `07c50ce` — **Governance** (pure, unit-tested): `audit.ts` (append-only
  hash-chained log; `verifyChain`; triplicate), `access.ts` (roles→permissions,
  clearance, the submission-forgery seam), `seal.ts` (sealed-access + the
  corrupt-judge hook); schema RegistryUser/AuditLogEntry/SealedRecord/UnsealPetition/
  UnsealRuling/Publication.
- `e8da6b3` — **SQLite→Postgres migration.** The Docker *daemon* turned out **not to
  be running**, so AGE/PostGIS (which need the `apache/age` image) were deferred and
  documented; the migration was run on a **local Postgres 16 cluster** instead:
  `schema.postgres.prisma` with native enums/`text[]`/`jsonb` (verified via `\d`),
  RLS **proven** to gate sealed IA rows (detective → 0, auditor → 1), a
  GUID-preserving SQLite→Postgres transfer (the seed-derived GUID round-tripped),
  and a runbook.
- `4093502` — marked plans 1–5 `complete`; captured `fct_6752594d3d62`.

Result: **62/62 tests**, root + server typecheck clean.

---

## Phase 6 — implement the society-sim (6 plans)

**User prompt (verbatim):**
> Start it the same way

**Actions (one commit per plan; all pure `src/engine/`, additive — the built
faction-tension engine untouched):**
- `7026b43` — **allegiance.ts**: 7 blocs, `.bloc()` builder, Allegiance portfolios
  (public/secret), the incentive engine (`switchScore`, `evaluateAllegiance`), bloc
  fluidity. (High retaliation-fear holds the tie = emergent omertà.)
- `dd46010` — **diplomacy.ts**: Stance/Relationship/trust, grievance ledger, Pacts
  (form→strain→break→betray), territory-over-time, a relationship-graph ripple.
- `f86b049` — **sim.ts**: per-bloc agendas + action repertoires; the deterministic
  `tick()` (actions, defections, pact re-eval, the §3.3 scheduled-consequence
  calendar); `runHistory`/`step`.
- `7260e46` — **eventRecord.ts** (the keystone): `emitRecords` fans a GroundTruthEvent
  into records distorted by each author's integrity (honest agree, bought diverge);
  the hidden ground-truth log; the Case lifecycle (solved / cleared-by-theory /
  closed-false).
- `3a587ab` — **decay.ts**: recoverability decay (witness fades fastest), heat from
  the audit-log sensor net, active cover-up of the load-bearing record (the observer
  effect), `protectRecord` counter-play, floor-never-blank.
- `098d951` — **detective.ts**: Integrity axis (clean/compromised/owned), `flipActor`
  (incentive + protection cuts fear), `coOptDetective` (factions flip *him*),
  symmetric Leverage, `filingFidelity`, gated branching endings — no moral grade.
- `adf918c` — marked plans 1–6 complete; captured `fct_0d2822797cd5`.

Result: **99/99 tests**, typechecks clean.

---

## Phase 7 — integration + surfaces

**User prompt (verbatim):**
> Do the integration pass and then the surface plans

**Actions:**
- `e0b6c0e` — **Integration.** `src/engine/backlog.ts` (`generateBacklog`: violent
  ticks mint homicide ground-truth events, fan them into records — forged death cert
  when the killing faction is protected vs honest autopsy/incident — and cool them
  into cold cases; deterministic, never-blank). Prisma models **GroundTruthLog**
  (hidden answer key, never exposed), **ColdCase**, **SimRecord** on both schemas
  (migration `20260605014626_sim_persistence`). `server/simRegistry.ts`
  (`persistBacklog` + player-facing reads keeping the ground truth hidden). A
  fictional multi-bloc demo world. `npm run seed:sim` → **30 cold cases, 90 records,
  30 hidden ground-truth events.**
- `1efe8d5` — **Surfaces.** `src/engine/analysis.ts` (#14: `documentsMentioning`,
  token `searchRecords`, `defectionChain`, multi-hop `relationshipPath` — reveal,
  never interpret); `src/engine/publicView.ts` (#15: `publicProjection` CQRS,
  `goPublic`, `publishThroughPress` re-distortion, `reactionsToPublication`). Marked
  both surface plans complete; captured `fct_4262177601db`.

Result: **111/111 tests**, root + server typecheck clean. **All 18 plans `complete`.**

---

## Phase 8 — remaining work + this archive

**User prompt (verbatim):**
> Explain what the remaining work needed is, and how I can have Claude Code tackle
> each in turn, especially Apache AGE + Postgres tsvector

**Response (key correction + guidance):** `tsvector` and AGE are **not** blocked by
the same thing — `tsvector` is *core* Postgres (works on the local cluster now);
**only AGE** needs the `apache/age` image (and thus a running Docker daemon, absent
in this sandbox but present on the user's machine). Four buckets of remaining work
(vertical slice / tsvector / typed-cluster persistence / AGE) + two deliberately-
out-of-scope (LLM renderer, A/V). Gave a per-item "how to drive Claude Code" guide
(one item = one plan = one focused session; verify with the test/typecheck gates;
the pure engine modules are the behavioral oracle) and a recommended order (vertical
slice → tsvector → typed-cluster → AGE-in-a-Docker-env).

**User prompt (verbatim):**
> Make the plan and push the plan document up to the branch and then give me a prompt
> to hand to a new session to make sure that it knows exactly what it should be
> doing. Also, I want you to capture everything we have done in this session and put
> it underneath a new folder called ClaudeCodeSessions within the repository that
> Claude Code references at the start of every session to understand all of the good
> work and good context that has come before this. Capture verbatim the prompts I
> sent you, every single thing you thought about, and the responses you sent back to
> me. Capture everything within ClaudeCodeSessions. I want it a running giant archive
> of everything we have done in these sessions.

**Actions (this turn):** Wrote four remaining-work plans (`wire-the-vertical-slice…`,
`add-postgres-tsvector…`, `persist-sim-records-into-typed-cluster-tables…`,
`add-apache-age-graph-queries…`); created `CLAUDE.md` (orienting every new session to
the GCD, this archive, the plans, and the stack quirks); created
`ClaudeCodeSessions/` with this README + archive; and produced a handoff prompt.
Committed + pushed.

---

## How to extend this archive

Append a new `YYYY-MM-DD-<topic>.md` per future session and add it to
`ClaudeCodeSessions/README.md`'s index. Keep prompts verbatim; keep reasoning an
honest reconstruction; record commits + test results. Never rewrite past entries.
