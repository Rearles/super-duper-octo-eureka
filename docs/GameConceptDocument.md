# [GAME TITLE] — Game Concept Document

**Author:** [ … ]  
**Studio:** [ … ]  
**Version:** 0.1 · Draft · 2026-06-02

-----

## How to Read This Template

This is a collaborative Game Concept Document framework designed for use with Claude Code. Every section contains structured guidance rather than finished content. As decisions get made, replace the guidance with real content.

**Formatting legend:**

- `📝 GUIDANCE:` — explains what content belongs in this section.
- `💬 EXPLORE WITH CLAUDE CODE:` — a prompt or question to work through together.
- `[ … ]` — a decision or piece of content that is deliberately open and waiting to be filled in.
- Plain text — finished content you or Claude Code have written.

**Working agreement for this project:**

The tech stack (engine, language, platform, architecture) is intentionally undecided. Do not assume or lock in any technology until the “Technical Foundation” section, which is meant to be decided collaboratively after the design has taken shape. Every section can be added to, removed, renamed, split, or merged — the headings are a scaffold, not a contract. When significant decisions are made, record both the decision and the reasoning, so future sessions share context.

**Suggested first move:** ask Claude Code to read this document end to end, then start filling in the High Level Concept. Everything else flows from a clear answer there.

-----

## Table of Contents

1. Concept
2. Game Mechanic
3. Challenge
4. World
5. Levels
6. Bosses
7. Enemies
8. Obstacles
9. Player
10. In-Game Economy & Currency
11. Game Flow & Onboarding
12. Controls & User Interface
13. Audio & Visual Identity
14. Technical Foundation *(intentionally left open)*
15. Scope & Roadmap

-----

## 1. Concept

📝 GUIDANCE: The foundation of the whole document. Anyone who reads only this section should understand what the game is, who it is for, and why it is worth making.

-----

### 1.1 High Level Concept

> _Working title (provisional): **Mound City** — candidates still open (see §15.3)._

A cold-case detective game set in an alternate Saint Louis, Missouri. You work forgotten cases from a basement of files: review what little exists — witness statements, interviews, autopsy reports, physical evidence, brittle old records — then request *new* records on almost anyone or anything: the phone bill of a witness no one ever interviewed, a property deed, employment history, financials, travel. Behind every document is a **procedurally-generated ground truth** — a deterministic, internally-consistent simulation of the city, its people, and what really happened. A language model dresses that ground truth into believable documents but can **never alter a fact**, so the world always holds together and every case is genuinely solvable by deduction. Closing a case doesn't just clear it: each one peels back a layer of a hidden structure inside the city, and the cases are **interlinked** — shared people, places, and threads assembling, case by case, into a single larger truth.

The fantasy is the *real* detective's fantasy: not gunplay, but the patient, addictive work of pulling a thread, catching a contradiction, and watching a buried truth surface — in a world honest enough to reward the effort.

**Pitch (one sentence):** In an alternate St. Louis, request any record on anyone to crack decades-old cold cases — backed by a procedurally-generated, hallucination-proof reality where every document is true, every contradiction is real, and every case is solvable.

**Core loop (what the player repeats):** Review the case file → form a question → spend a limited investigative resource to request records (LLM-dressed ground truth) → cross-reference for contradictions and corroboration → build the timeline and relationship web → follow the strongest lead → commit to a conclusion and close the case → uncover the next thread of the city's larger truth.

**What makes it distinct:** Infinite, request-anything investigation with **zero fabricated truth** — the generative depth of an LLM married to the logical integrity of a hand-authored mystery. Curiosity costs something (investigation is resource-bound) and conclusions carry weight (you can be wrong, and the city remembers), so deduction is a chain of real decisions, not a sandbox.

**Tone & setting:** Grounded, investigative, slow-burn. Believable on the surface; a systemic secret underneath. No supernatural — the "alternate" is institutional and historical, something solved cases progressively expose.

**Ambition framing:** The *vision* is an open, living alternate-St. Louis of interlinked cases building to one truth. The *MVP* is a single, fully-solvable case that proves the engine — a deterministic ground-truth fact graph plus a grounded LLM renderer that can dress facts but never contradict them. (See §15.)

-----

### 1.2 Genre & Pillars

**Genre / blend:** A systemic detective / deduction game — the reasoning core of *Return of the Obra Dinn* and *The Case of the Golden Idol*, set on a procedurally-generated, internally-consistent case-world (the systemic integrity of an immersive sim, the document-work of *Papers, Please*) rather than a hand-authored, finite puzzle. An investigative sandbox, not a visual novel.

The four pillars below are tie-breakers: when two features compete, the one that serves a pillar wins. Each rules something out on purpose.

**Pillar 1 — "The world never lies."** Ground truth is sacrosanct: every document is consistent, every contradiction is real and meaningful, and every case is solvable from the evidence alone. *Rules out:* ungrounded red herrings, unsolvable "gotcha" mysteries, anything the LLM invents.

**Pillar 2 — "Deduction, not direction."** The player drives the investigation by reasoning; the game never dictates whom to suspect or what to pull next. *Rules out:* quest markers, objective checklists, "go interview X" hand-holding.

**Pillar 3 — "Every request has a price."** Investigation is resource-bound and conclusions are committal — pulling a thread costs something, and being wrong has consequences the world remembers. *Rules out:* free infinite querying, consequence-free guessing, brute-forcing every document.

**Pillar 4 — "The city is the case."** Cases interlink; each truth exposes a larger structure, and the world persists and remembers. *Rules out:* disposable one-off cases, a static backdrop, resets that erase consequence.

> Atmosphere/noir is treated as flavor, not a pillar. "Paperwork is play" (the tactile pleasure of handling, annotating, and connecting documents) is a first-class UX principle under §12, not a pillar.

-----

### 1.3 Back Story

**Setting / premise:** Alternate Saint Louis, **late 20th century** — a city defined by the **Registry**, a vast municipal apparatus that has, since a turning point in the city's history (specifics deferred), indexed near-everything about everyone: residents, calls, deeds, transactions, deaths. Records are **analog** — paper, microfiche, phone logs, typed reports — which is both the game's tactile texture and a deliberate boundary on the simulation. The Registry is powerful, opaque, and quietly menacing: a bureaucracy with momentum of its own. Its origin and true purpose are the city's **systemic secret** — the shape is pinned (an institutional structure that solved cases progressively expose), the specifics left as design space.

**Player's role:** An investigator in a just-revived **Cold Case Unit**, granted **rationed clearance** to query the Registry. You reopen the cases the institutions let go cold. Crucially, your verdicts are **written back into the Registry** as official truth — you don't merely find answers, you *enter* them, and the city acts on what you enter.

**Stakes / goal:** Short-term, close cold cases by deduction. But the Registry is not a neutral tool: acting within it carries **real, morally grey consequences**. There is always an answer to *find* (Pillar 1 — the world never lies), but rarely a *just* one — closing a case can shield the powerful, harm the innocent, or expose the vulnerable, and you must often decide on **partial information**. Consequences are **real and time-delayed**: some land immediately, some the next day, some not for months — so you act under uncertainty and live with the ripples. Long-term, uncover what the Registry is, who built it, and what it is for. No clean resolutions — only answers, each with a price.

> **Theme:** *The world never lies, but the truth never absolves.* Factual truth is always discoverable; moral outcome is always compromised. Two systems to be designed in §2–§3 carry this: (a) a **delayed, variable-latency consequence system** (the Registry "acts" on an unpredictable clock — and those consequences must themselves be procgen ground truth, never LLM-invented), and (b) a **morally-grey verdict system** where no option is the clean/just answer.

-----

### 1.4 Market Research & Audience

📝 GUIDANCE: Two or three comparable titles, what this game shares with them, and where it diverges. Then the intended audience and, if relevant, an age rating. Comparisons clarify positioning and surface design conventions worth keeping or breaking.

|Comparable title|What’s similar|What’s different|
|----------------|--------------|----------------|
|Return of the Obra Dinn|Honest, fully-solvable deduction from evidence; you reach conclusions the game validates|Procgen and effectively infinite cases vs. one authored ship; request-anything records; morally-grey, delayed consequences|
|The Case of the Golden Idol|Extracting truth from documents and scenes; fill-in-the-blank deduction|Generated, internally-consistent world; open-ended record requests; persistent consequence and a meta-secret|
|Papers, Please|Bureaucratic document-work; moral greyness; a menacing state apparatus; consequence|Investigation/deduction core (not inspection); deep simulation; you query an archive rather than process a queue|
|Her Story / Contradiction|Search-driven investigation through records and testimony|A consistent *generated* world (no hallucinated truth) instead of fixed FMV; you can request *new* records, not only search existing ones|
|Disco Elysium|Detective frame; no clean or just answers; moral weight|Systemic, procgen document-deduction rather than dialogue-driven RPG; the factual truth is always findable|

**Target audience:** PC-first, niche-but-passionate. **Primary:** deduction purists (players of *Obra Dinn*, *Golden Idol*, *Her Story*) who want hard, fair, honest deduction as the main course. **Strong crossover:** immersive-sim / systems players drawn to emergent, cascading consequence, and narrative / moral-choice players (*Disco Elysium*, *Papers, Please*) drawn to weight and atmosphere. Not a mass-market title; the design favors depth and integrity over a low skill floor.

**Intended rating / content considerations:** Mature themes — crime, death, autopsy detail, and morally-grey institutional harm — handled with restraint, not gratuitously. Likely **M / PEGI 16–18 for theme** rather than graphic content. Dread is institutional, not supernatural or gory.

**Open questions & decisions:** Exact ESRB/PEGI rating TBD. How closely to model real St. Louis geography/history vs. invent freely (it's an *alternate* city, so we have license). Whether to fictionalize institution names. Sensitivity if cases touch real social issues (poverty, policing, displacement) — to be handled deliberately, not exploitatively.

-----

## 2. Game Mechanic

📝 GUIDANCE: How the game actually works, system by system. This is the heart of the document and will grow the most. Describe rules and relationships, not implementation — implementation gets decided in Technical Foundation.

-----

### 2.1 Core Mechanic

📝 GUIDANCE: The single most important interaction, described step by step. If there is a central tension (risk vs. reward, time pressure, resource management), name it explicitly and explain how it creates interesting decisions.

💬 EXPLORE WITH CLAUDE CODE: Model the core mechanic as inputs → rules → outcomes, then ask what edge cases or degenerate strategies it allows.

**Core interaction:** [ … ]  
**Central tension / interesting decision:** [ … ]

-----

### 2.2 Interface

📝 GUIDANCE: What the player sees and how they read the game state at a glance. Describe the on-screen information and its priority. A rough sketch or wireframe is welcome here — describe it in words first and attach an image when one exists.

**Information shown on screen:** [ … ]  
**What must be readable instantly vs. on demand:** [ … ]

-----

### 2.3 Player Abilities

📝 GUIDANCE: Everything the player can do, grouped by context (e.g. in-action vs. in-hub). Keep verbs concrete: move, attack, interact, manage resources. Note any abilities that are limited, charged, or unlocked over time.

**Primary actions:** [ … ]  
**Secondary / contextual actions:** [ … ]  
**Limited or unlockable abilities:** [ … ]

-----

### 2.4 Scoring & Progression Feedback

📝 GUIDANCE: How the player’s performance is measured and surfaced. Score, multipliers, streaks, ratings — and what the player gains by doing well. Tie this back to the core tension so good play feels rewarded.

💬 EXPLORE WITH CLAUDE CODE: What behavior does the scoring reward, and is that the behavior you actually want to encourage?

**How performance is measured:** [ … ]  
**Rewards for strong play:** [ … ]

**Open questions & decisions:** [ … record mechanic experiments, what was tried, and what was kept or cut … ]

-----

## 3. Challenge

📝 GUIDANCE: Where difficulty and friction come from. This section catalogs the forces working against the player and how they are tuned. Detailed rosters (enemies, bosses, obstacles) live further down; here, describe the categories and the philosophy.

-----

### 3.1 Sources of Challenge

📝 GUIDANCE: Name the broad categories of challenge — adversaries, environmental hazards, time/resource pressure, etc. — and roughly how each contributes to difficulty.

**Adversaries (overview):** [ … ]  
**Environmental / terrain challenges (overview):** [ … ]  
**Pressure systems (time, scarcity, etc.):** [ … ]

-----

### 3.2 Difficulty Philosophy

📝 GUIDANCE: How hard the game intends to be and how it stays fair. Does difficulty scale with the player, with depth/level, or on a fixed curve? Are there safety valves (retries, checkpoints) or deliberate spikes?

💬 EXPLORE WITH CLAUDE CODE: Sketch a difficulty curve and identify where the player is most likely to quit — then decide what catches them.

**Scaling approach:** [ … ]  
**Fairness / safety mechanisms:** [ … ]

-----

## 4. World

📝 GUIDANCE: The spaces the game takes place in and how they connect. Set the structure here; specific level and room details come later.

-----

### 4.1 Terrain & Areas

📝 GUIDANCE: The distinct kinds of space in the game (hub, exploration areas, set-piece/finale spaces) and the role each plays. Describe how the player moves between them.

**Area types and their purpose:** [ … ]  
**How areas connect / how the player travels between them:** [ … ]

-----

### 4.2 Environments

📝 GUIDANCE: Group the world into zones or biomes if applicable. For each: theme, what the player does there, and how it differs mechanically from the others. Add or remove zones freely — three is just a starting scaffold.

|Zone / area   |Theme|Gameplay role|
|--------------|-----|-------------|
|Zone 1 — [ … ]|[ … ]|[ … ]        |
|Zone 2 — [ … ]|[ … ]|[ … ]        |
|Zone 3 — [ … ]|[ … ]|[ … ]        |

-----

## 5. Levels

📝 GUIDANCE: How the playable space is structured into a journey — whether hand-authored levels, procedural generation, or a mix. Describe the shape of progression from start to finish.

-----

### 5.1 Structure & Generation

📝 GUIDANCE: Are levels fixed, procedurally generated, or hybrid? What are the building blocks (rooms, tiles, chunks) and the rules for assembling them?

💬 EXPLORE WITH CLAUDE CODE: If procedural, what are the constraints that keep generated content fair and interesting? Consider prototyping a generator early.

**Level structure (authored / procedural / hybrid):** [ … ]  
**Building blocks & assembly rules:** [ … ]

-----

### 5.2 Pacing of Challenge

📝 GUIDANCE: How challenge is distributed and introduced across a level or run. New mechanics should be introduced safely, then combined and intensified.

**Pacing of challenge introduction:** [ … ]

-----

### 5.3 Advancing

📝 GUIDANCE: The rules for moving forward — how the player progresses to the next space, what gates progress, and whether backtracking or branching is possible. Connectivity rules belong here.

**How the player advances:** [ … ]  
**Gates / conditions / branching rules:** [ … ]

-----

### 5.4 Zone / Level Breakdown

📝 GUIDANCE: One subsection per major level, zone, or generated space. For each: its identity, what the player encounters, and any unique rules. Duplicate the block below as many times as needed; rename freely.

#### Zone / Level 1 — [ … ]

- **Identity & theme:** [ … ]
- **What the player encounters:** [ … ]
- **Unique rules or mechanics introduced here:** [ … ]
- **How it connects to what comes before and after:** [ … ]

#### Zone / Level 2 — [ … ]

- **Identity & theme:** [ … ]
- **What the player encounters:** [ … ]
- **Unique rules or mechanics introduced here:** [ … ]
- **How it connects to what comes before and after:** [ … ]

#### Zone / Level 3 — [ … ]

- **Identity & theme:** [ … ]
- **What the player encounters:** [ … ]
- **Unique rules or mechanics introduced here:** [ … ]
- **How it connects to what comes before and after:** [ … ]

#### Zone / Level 4 — [ … ]

- **Identity & theme:** [ … ]
- **What the player encounters:** [ … ]
- **Unique rules or mechanics introduced here:** [ … ]
- **How it connects to what comes before and after:** [ … ]

-----

## 6. Bosses

📝 GUIDANCE: Major set-piece encounters, if the game has them. Start with shared boss conventions, then detail each boss. If the game has no bosses, note that and repurpose this section.

-----

### 6.1 Boss Conventions

📝 GUIDANCE: Rules that apply to all bosses — how they take damage, how attacks are telegraphed, invulnerability/recovery windows, phase changes, feedback on hits.

**Shared boss rules:** [ … ]

-----

### 6.2 Boss Roster

📝 GUIDANCE: One subsection per boss. Capture the boss’s role in the story, its mechanical gimmick, and how the player is expected to beat it. Duplicate as needed.

#### Boss 1 — [ … ]

- **Role:** [ … where this boss sits in the game and its narrative/mechanical significance … ]
- **Behavior & gimmick:** [ … the central mechanic that defines the fight … ]
- **Intended counterplay:** [ … what the player must learn or acquire to win … ]
- **Stats / tuning:** [ … health, damage, phases, timing — fill in once tuning begins … ]

#### Boss 2 — [ … ]

- **Role:** [ … ]
- **Behavior & gimmick:** [ … ]
- **Intended counterplay:** [ … ]
- **Stats / tuning:** [ … ]

#### Boss 3 — [ … ]

- **Role:** [ … ]
- **Behavior & gimmick:** [ … ]
- **Intended counterplay:** [ … ]
- **Stats / tuning:** [ … ]

#### Boss 4 — [ … ]

- **Role:** [ … ]
- **Behavior & gimmick:** [ … ]
- **Intended counterplay:** [ … ]
- **Stats / tuning:** [ … ]

-----

## 7. Enemies

📝 GUIDANCE: The standard adversaries the player faces. Begin with a stats overview table for quick balancing, then a short profile for each. Add rows and profiles freely.

-----

### 7.1 Enemy Stats Overview

📝 GUIDANCE: A single table for at-a-glance balancing. Columns are a starting suggestion — adapt to whatever stats matter for this game (speed, range, behavior type, reward).

|Enemy|Health|Damage|Reward|Behavior / role|
|-----|------|------|------|---------------|
|[ … ]|[ … ] |[ … ] |[ … ] |[ … ]          |
|[ … ]|[ … ] |[ … ] |[ … ] |[ … ]          |
|[ … ]|[ … ] |[ … ] |[ … ] |[ … ]          |
|[ … ]|[ … ] |[ … ] |[ … ] |[ … ]          |
|[ … ]|[ … ] |[ … ] |[ … ] |[ … ]          |

-----

### 7.2 Enemy Profiles

📝 GUIDANCE: A short profile per enemy. The goal is to capture what makes each one a distinct decision for the player to handle. Duplicate as needed.

#### Enemy 1 — [ … ]

- **Role / what makes it distinct:** [ … ]
- **Movement & behavior:** [ … ]
- **Attack & threat to the player:** [ … ]
- **Stats:** [ … keep in sync with the overview table … ]

#### Enemy 2 — [ … ]

- **Role / what makes it distinct:** [ … ]
- **Movement & behavior:** [ … ]
- **Attack & threat to the player:** [ … ]
- **Stats:** [ … ]

#### Enemy 3 — [ … ]

- **Role / what makes it distinct:** [ … ]
- **Movement & behavior:** [ … ]
- **Attack & threat to the player:** [ … ]
- **Stats:** [ … ]

#### Enemy 4 — [ … ]

- **Role / what makes it distinct:** [ … ]
- **Movement & behavior:** [ … ]
- **Attack & threat to the player:** [ … ]
- **Stats:** [ … ]

#### Enemy 5 — [ … ]

- **Role / what makes it distinct:** [ … ]
- **Movement & behavior:** [ … ]
- **Attack & threat to the player:** [ … ]
- **Stats:** [ … ]

-----

## 8. Obstacles

📝 GUIDANCE: Non-enemy hazards and interactive objects in the world — traps, locked containers, environmental dangers, puzzle elements. Note which the player can interact with or neutralize, and how. Duplicate as needed.

-----

#### Obstacle 1 — [ … ]

- **What it is and where it appears:** [ … ]
- **Effect on the player:** [ … ]
- **How the player can avoid, disarm, or use it (and any risk in doing so):** [ … ]

#### Obstacle 2 — [ … ]

- **What it is and where it appears:** [ … ]
- **Effect on the player:** [ … ]
- **How the player can avoid, disarm, or use it:** [ … ]

#### Obstacle 3 — [ … ]

- **What it is and where it appears:** [ … ]
- **Effect on the player:** [ … ]
- **How the player can avoid, disarm, or use it:** [ … ]

#### Obstacle 4 — [ … ]

- **What it is and where it appears:** [ … ]
- **Effect on the player:** [ … ]
- **How the player can avoid, disarm, or use it:** [ … ]

#### Obstacle 5 — [ … ]

- **What it is and where it appears:** [ … ]
- **Effect on the player:** [ … ]
- **How the player can avoid, disarm, or use it:** [ … ]

-----

## 9. Player

📝 GUIDANCE: The player character’s systems — survivability, growth, and the consumables/tools they carry.

-----

### 9.1 Health Mechanics

📝 GUIDANCE: Starting health, how it changes, how the player heals or dies, and how survivability scales with progression. State numbers once tuning starts.

**Starting health & how it changes:** [ … ]  
**Healing & death rules:** [ … ]

-----

### 9.2 Power-ups

📝 GUIDANCE: Temporary boosts that change the player’s capabilities for a limited time or use. For each: effect, duration/trigger, and how the player obtains it.

**Power-up list & effects:** [ … ]

-----

### 9.3 Pick-ups

📝 GUIDANCE: Items collected during play. The two subsections below are inherited from the reference structure as examples — replace with whatever categories this game actually uses.

#### Health Pickups

- **What they restore, how they look, and where the player finds them:** [ … ]

#### Special Pickup — [ … e.g. Smart Bomb, Power Surge, etc. … ]

- **Effect:** [ … ]
- **When it is worth using:** [ … ]
- **How it is acquired:** [ … ]

-----

### 9.4 Upgrades Screen

📝 GUIDANCE: The interface and systems for permanent character growth — what can be upgraded, how it is presented, and how upgrades are unlocked or purchased.

#### Body / Core Upgrades

- **Permanent improvements to the character:** [ … health, capacity, movement, etc. … ]

#### Health Bar Upgrades

- **How maximum health grows and what drives it:** [ … ]

#### Speed Upgrades

- **[ to be determined — does movement or action speed upgrade, and if so, how? ]**

**Open questions & decisions:** [ … track the progression economy here — it is easy to make upgrades feel too slow or too fast … ]

-----

## 10. In-Game Economy & Currency

📝 GUIDANCE: How value flows through the game. Even a simple game has an economy — define the currency, how it is earned, and how it is spent so the loop stays balanced.

-----

### 10.1 Earning

📝 GUIDANCE: Every source of currency or resources and roughly how much each yields. Note whether income scales with progression.

**Sources of income:** [ … ]

-----

### 10.2 Spending

📝 GUIDANCE: Everything the player can spend on, and where. Note how prices scale relative to income.

**Sinks (what currency buys):** [ … ]

-----

### 10.3 Shop / Acquisition Tables

📝 GUIDANCE: If the game has a shop or item catalog, lay it out below for easy balancing. Duplicate and adapt the table per category (weapons, consumables, upgrades, etc.).

**Weapons:**

|Item |Effect / stats|Cost |
|-----|--------------|-----|
|[ … ]|[ … ]         |[ … ]|
|[ … ]|[ … ]         |[ … ]|

**Consumables / misc:**

|Item |Effect|Cost |
|-----|------|-----|
|[ … ]|[ … ] |[ … ]|
|[ … ]|[ … ] |[ … ]|

💬 EXPLORE WITH CLAUDE CODE: Model the economy in a spreadsheet — feed it expected income per session and check whether the player can afford the intended power curve.

-----

## 11. Game Flow & Onboarding

📝 GUIDANCE: How a player gets from launching the game to mastering it, and how a session is shaped.

-----

### 11.1 Tutorial

📝 GUIDANCE: How new players learn — what is taught, in what order, and how (explicit instruction, guided first run, learn-by-doing). The best tutorials teach through play rather than text walls.

💬 EXPLORE WITH CLAUDE CODE: What is the minimum the player must understand before the game is fun, and can that be taught without stopping play?

**What the tutorial teaches & how:** [ … ]

-----

### 11.2 Challenge Scaling

📝 GUIDANCE: How the game grows with the player over a full playthrough — what gets harder, what stays constant, and what triggers escalation. Connect this to the Difficulty Philosophy in Section 3.

**What scales and what triggers it:** [ … ]

-----

### 11.3 Session Loop & Game Flow

📝 GUIDANCE: The shape of a typical session and the overall arc to completion. Describe the loop the player repeats and the long-term goal that gives it direction.

**Session loop:** [ … ]  
**Path to completion / win condition:** [ … ]

-----

## 12. Controls & User Interface

📝 GUIDANCE: How the player physically interacts and how information is presented. Keep the input scheme abstract until platform is chosen in Technical Foundation.

-----

### 12.1 Controls

📝 GUIDANCE: Map intentions to inputs without committing to a specific device yet. List the actions — concrete bindings can come after platform is decided.

**Actions to bind (input-agnostic):** [ … ]  
**Note — concrete bindings deferred until platform is decided in Technical Foundation.**

-----

### 12.2 Menus

📝 GUIDANCE: The menu structure — main menu, pause, and how the player navigates between major states. A simple flow diagram described in words is enough to start.

**Menu structure & navigation:** [ … ]

-----

### 12.3 HUD

📝 GUIDANCE: The persistent in-action display. List each element, what it communicates, and its priority. Cross-reference the Interface section.

**HUD elements & priority:** [ … ]

-----

### 12.4 Camera

📝 GUIDANCE: Perspective and camera behavior (first-person, top-down, side-on, etc.) and how it moves or frames the action. This choice has wide design consequences — decide deliberately.

**Perspective & camera behavior:** [ … ]

-----

### 12.5 Screens

📝 GUIDANCE: Every distinct screen the game presents. The list below is inherited from the reference structure as a checklist — add, remove, or rename to match the actual UX.

#### Settings Page

- **Options exposed to the player:** [ … audio, controls, accessibility, etc. … ]

#### Gameplay Summary Screen

- **What is shown after a session ends:** [ … performance, rewards, stats worth surfacing … ]

#### Play Screen

- **The primary in-action screen:** [ … cross-reference HUD and Interface … ]

#### Level / Stage Select

- **If applicable, how the player chooses where to play:** [ … ]

#### Rate Us / Engagement Prompts

- **Optional prompts:** [ … note placement so they do not interrupt flow … ]

-----

## 13. Audio & Visual Identity

📝 GUIDANCE: The sensory layer — art direction, effects, sound, and music. Even a concept doc benefits from a clear tonal target.

-----

### 13.1 Art Direction

📝 GUIDANCE: The intended visual style and mood in a few words, plus any references. This guides every later asset and effect decision.

**Visual style & mood:** [ … ]  
**References / touchstones:** [ … ]

-----

### 13.2 Visual Effects

📝 GUIDANCE: Key moments that need visual feedback, grouped by event. Feedback on success and failure is almost always worth specifying early.

#### Player Feedback Effects

- **Visual response when the player is hit, succeeds, or fails:** [ … clarity here makes the game feel responsive … ]

#### Enemy / Object Feedback Effects

- **Visual (and paired audio) response when enemies or objects are defeated or activated:** [ … ]

-----

### 13.3 Sound Effects

📝 GUIDANCE: The key sounds the game needs, organized by event. A simple mapping of game events to sound needs is a good starting inventory.

**Sound effect inventory (by event):** [ … ]

-----

### 13.4 Music

📝 GUIDANCE: Music direction per context (exploration, tension, combat, menus). Note mood and, if known, specific tracks or composers.

|Context                    |Mood / direction|Specific tracks (once chosen)|
|---------------------------|----------------|-----------------------------|
|[ … e.g. Exploration ]     |[ … ]           |[ … ]                        |
|[ … e.g. Combat / Tension ]|[ … ]           |[ … ]                        |
|[ … e.g. Hub / Menus ]     |[ … ]           |[ … ]                        |

-----

## 14. Technical Foundation

> ⚠️ **This section is intentionally left open.** Engine, language, platform, and architecture are to be decided collaboratively with Claude Code — and only after the design above has taken enough shape to make those choices informed rather than assumed. Do not fill this in by default.

-----

### 14.1 Decision Criteria

📝 GUIDANCE: Before choosing any technology, agree on what matters. Capture the constraints and priorities that will drive the decision so it is reasoned, not defaulted.

💬 EXPLORE WITH CLAUDE CODE: List the design requirements from the sections above that actually constrain the tech (e.g. procedural generation, real-time physics, target platforms), and rank them by importance.

💬 EXPLORE WITH CLAUDE CODE: Explicitly decide what you want to learn or test here — this project exists partly to explore unfamiliar technology, so weigh novelty against risk on purpose.

**Hard requirements the tech must satisfy:** [ … ]  
**What you want to explore / learn:** [ … ]  
**Constraints (team size, timeline, target platforms, budget):** [ … ]

-----

### 14.2 Engine / Stack — TO BE DECIDED

📝 GUIDANCE: Do not fill this in until the discussion in 14.1 has happened. Record the chosen stack and, crucially, the reasoning behind it.

**Engine / framework:** [ … ]  
**Language(s):** [ … ]  
**Target platform(s):** [ … ]  
**Rationale (why this, over the alternatives considered):** [ … ]

-----

### 14.3 Architecture & Risks

📝 GUIDANCE: Once a stack is chosen — the high-level architecture, the riskiest technical unknowns, and a plan to de-risk them early through spikes, prototypes, or proofs of concept.

💬 EXPLORE WITH CLAUDE CODE: Identify the single riskiest technical assumption and build the smallest possible prototype to validate it before committing.

**High-level architecture:** [ … ]  
**Top technical risks & how to de-risk them:** [ … ]

-----

## 15. Scope & Roadmap

📝 GUIDANCE: A concept document is also a scoping tool. Use this section to keep ambition honest — define the smallest version worth building, then what comes after.

-----

### 15.1 Minimum Viable Slice

📝 GUIDANCE: The smallest build that proves the core loop is fun. Which sections above are essential for that slice, and which are deferred? Be ruthless.

💬 EXPLORE WITH CLAUDE CODE: Trace the absolute minimum set of mechanics, one enemy, and one space needed to test whether the core loop works — build that first.

**What the MVP must include:** [ … ]  
**What is explicitly deferred:** [ … ]

-----

### 15.2 Milestones

📝 GUIDANCE: A rough sequence of build targets from prototype to complete. Keep it light — milestones, not a schedule. Reorder as the project teaches you what matters.

|Milestone     |Goal — what “done” means                                  |
|--------------|----------------------------------------------------------|
|Prototype     |Prove the core loop in the roughest playable form.        |
|Vertical slice|One area, fully realized, representative of final quality.|
|Content build |Breadth — remaining zones, enemies, systems.              |
|Polish & ship |Tuning, feedback, audio/visual finish, release prep.      |

-----

### 15.3 Living Decision Log

📝 GUIDANCE: A running record of significant decisions and their reasoning, newest at the top. This is the single most useful thing to maintain when working with Claude Code across many sessions — it preserves shared context that would otherwise be lost between conversations.

|Date |Decision & reasoning                                                      |
|-----|--------------------------------------------------------------------------|
|2026-06-02|**§1.4 audience + consequence-feel steer.** Primary audience = deduction purists (*Obra Dinn* / *Golden Idol* / *Her Story*), with crossover to systems-sim and narrative/moral-choice players; PC-first, niche-but-passionate, depth over a low skill floor. Comparables: Obra Dinn, Golden Idol, Papers Please, Her Story/Contradiction, Disco Elysium. Rating ~M / PEGI 16–18 for theme. **Delayed-consequence feel (steers §2–§3): signpost the risk, hide the specifics, plus a Decision Ledger** that links each surfaced consequence back to the verdict that caused it — dread-with-agency, chosen over fully-hidden or investigate-first.|
|2026-06-02|**Back story: "The Registry."** Alt-St. Louis (late-20th-century, analog) is defined by a total-records municipal archive — the Registry — whose contents ARE the procgen ground-truth graph. Player = revived Cold Case Unit investigator with rationed clearance; verdicts are written back into the Registry as official truth. The Registry's origin/purpose is the deferred systemic secret. **Added stakes (user direction):** the Registry is mysterious AND scary — actions carry real consequences with **variable latency** (immediate / next-day / months+), and verdicts are **morally grey** (no clean/just answer; decide on partial info). Theme: "the world never lies, but the truth never absolves." Two systems flagged for §2–§3: delayed variable-latency consequences (must be procgen ground truth, not LLM-invented) and a morally-grey verdict system. |
|2026-06-02|**Design pillars locked (4):** "The world never lies" (integrity / hallucination-proof as a design law), "Deduction, not direction" (player-driven, no quest markers), "Every request has a price" (cost + consequence), "The city is the case" (interlinked, persistent world). Atmosphere kept as flavor; "Paperwork is play" demoted to a §12 UX principle rather than a 5th pillar. Genre framed as systemic detective/deduction on a procgen case-world (Obra Dinn / Golden Idol × Papers Please / immersive sim).|
|2026-06-02|**Case structure: interlinked web → one truth.** Cases share people/places/threads and assemble into a single larger truth, giving the open world purpose. Alternatives: anthology of standalone cases (kept as the MVP-friendly *starting* shape), or fully emergent sim-generated links (too unpredictable to guarantee satisfying). Vision = interlinked; MVP = one standalone case.|
|2026-06-02|**Central tension: investigation has a cost + stakes of being wrong.** Requests draw on a limited investigative resource, and conclusions can be wrong with consequences the world remembers. Rejected pure free-for-all sandbox (signal/noise drowning risk) as the *primary* driver, though signal-in-noise remains a secondary texture. Makes deduction a chain of real decisions.|
|2026-06-02|**Setting tone: grounded + a systemic secret.** Real-feeling alt-St. Louis, no supernatural; the "alternate" is institutional/historical, exposed layer by layer through solved cases. Chosen over a speculative/weird twist (small risk to the pure-deduction promise) and pure realism (no payoff for "reveals about the world"). Protects the real-deduction hook while giving the world a punchline.|
|2026-06-02|**Engine architecture: deterministic procgen ground-truth fact graph + grounded LLM renderer.** Procedural generation (no LLM) authors a consistent, solvable fact graph; the LLM only renders facts as documents and may never contradict them. This is the novel, defensible core and the first thing to prototype. Ambition: open-world vision, but MVP = one fully-solvable case proving this engine.|

-----

*End of Game Concept Document Template*
