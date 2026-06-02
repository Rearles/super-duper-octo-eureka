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

**Pillar 1 — "The world never lies."** The *simulation* is sacrosanct: ground truth is consistent, every contradiction is real and meaningful, and every case is solvable. Records, however, *can* lie — a statement, autopsy, or file may be wrong, partial, biased, or falsified — but every such falsehood is itself a **deterministic, discoverable fact**, and the LLM only ever renders records faithfully (including their built-in falsehoods), never inventing truth. *Rules out:* hallucinated facts, ungrounded red herrings, unsolvable "gotcha" mysteries. *(Refined in §2.4: ground truth vs. the record layer.)*

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

**Open questions & decisions:** Exact ESRB/PEGI rating TBD. ~~How closely to model real St. Louis vs. invent~~ → **resolved in §4.2: fictionalized analogues — no real names/geography.** Whether to fictionalize institution names (lean yes, per §4.2). Sensitivity if cases touch real social issues (poverty, policing, displacement) — to be handled deliberately, not exploitatively.

-----

## 2. Game Mechanic

📝 GUIDANCE: How the game actually works, system by system. This is the heart of the document and will grow the most. Describe rules and relationships, not implementation — implementation gets decided in Technical Foundation.

-----

### 2.1 Core Mechanic

**Core interaction — the request → cross-reference → deduce → verdict loop.**

1. **Form a request.** The player picks an *entity* (a person, address, phone number, business, vehicle…) and a *record type* (phone logs, property deed, employment file, autopsy, bank record…) and submits it, spending **clearance** (the rationed investigative resource — see §10). Two ways to choose an entity:
   - **Leads** — every document surfaces the names, places, dates, and references it mentions as cheap, obvious *requestable leads*. The requestable surface grows from what the player has already learned, so the space is always bounded by their own investigation (no quest markers — Pillar 2).
   - **Hunches** — the player may also free-form request records on *any entity they can name*, even one never mentioned (e.g. a witness no one interviewed), at **higher clearance cost** and lower hit-rate. This preserves the "request anything about anyone" promise while letting cost do the filtering.
2. **The world resolves it.** The request is answered against the deterministic **fact graph** (the Registry's ground truth). The LLM **renders** the matching facts as a period-accurate document. Hard constraints: the document is **always true**, it may **only** express the facts that record would *legitimately* contain (the renderer can never leak the solution or invent a fact — Pillar 1), and it may carry **new leads**.
3. **Cross-reference.** The new document is added to the player's evidence board / case file. The game surfaces *that* a new document corroborates or contradicts existing evidence, but never what it **means**. Signal comes from **juxtaposition**; the skill is noticing and interpreting.
4. **Deduce & repeat.** The player builds a timeline and relationship web, narrowing toward an account of what happened — spending clearance on each thread.
5. **Commit a verdict (two layers).**
   - **Factual solution** — reconstruct the verifiable facts (who / how), checked against ground truth. Because the world never lies, this layer is *fair and knowable* (Pillar 1).
   - **Disposition** — choose what truth to *enter into the Registry* and what to do about it. This is the **morally-grey act with no clean answer**; committing it **schedules consequences** (delayed, signposted, surfaced later in the Decision Ledger — see §3).

**Central tension / interesting decision:** *Spend finite clearance to pull a thread of uncertain value, building toward a verdict you must commit on incomplete information — then own the consequences.* Every request trades a scarce resource for information that may corroborate, complicate, or be mundane; every verdict forces a factual call **and** a moral one where the right thing to do is never the obviously correct thing. Resource management + risk/reward + honest deduction + moral weight, in one loop.

**Edge cases & degenerate strategies to guard against:**
- *Brute-forcing every record* → blunted by clearance cost (§10) and, where appropriate, time/consequence pressure (§3): pulling everything is never affordable.
- *Metagaming the renderer* (coaxing the LLM to reveal more than a document should) → structurally prevented: the renderer can only express facts already in the graph that the specific record would contain; there is no hidden "answer" it knows.
- *Verdict guess-spamming* → countered by the stakes of being wrong and limited/committal close attempts (§2.4 / §3): a verdict is a consequential act, not a free guess.
- *Lead explosion / drowning* → bounded by leads-from-what-you-have plus cost; the open "hunch" path is deliberately costlier so it isn't the default.

-----

### 2.2 Interface

**Information shown on screen.** The interface is a **detective's desk**, not a dashboard — the game is framed as working a physical case (the "paperwork is play" UX principle). Core surfaces:

- **The Desk (play space):** the documents you've pulled, spread out, readable and annotatable; period-accurate artifacts (typed reports, carbon copies, microfiche printouts, photographs).
- **The Case File:** the active cold case's original folder plus everything you've gathered for it.
- **The Board:** a corkboard deduction space where entities (people, places, phone numbers, businesses) and documents are tokens the player connects with string; the **timeline and relationship web** live here.
- **The Request slip:** choose an entity + a record type, see the **clearance cost**, confirm. Leads appear as highlighted, requestable references inside documents; "hunch" requests are entered free-form.
- **Clearance meter:** the rationed investigative resource — always glanceable.
- **The Decision Ledger:** past verdicts and the consequences that have since surfaced, each drawn back to the verdict that caused it; quiet until a consequence lands, then it notifies.
- **Analog search (card catalog / microfiche index):** a *diegetic* search layer that fits the late-20th-century setting, so finding records is immersive and usable at once.

**Organization — auto by default, manual by choice.** The game does the heavy lifting: it auto-files documents, extracts entities as draggable tokens, and maintains the search index and an auto-timeline of dated facts. But the player may **re-file and reorganize anything whenever they want** — an *optional* layer of control to arrange documents around their own thinking, engaged only if they feel they need it. Principle: **automate the filing, never the thinking** — the game never draws interpretive connections or reaches conclusions for the player (Pillar 2), it only removes clerical drudgery unless the player chooses to take the wheel.

**What must be readable instantly vs. on demand:**
- *Instant (always glanceable):* clearance remaining; the active case; new-document and new-consequence alerts; the **contradiction/corroboration flag** when a freshly-pulled document touches existing evidence (the flag shows *that* a relationship exists, never what it means).
- *On demand:* full document text; the Board (timeline / relationship web); the Decision Ledger history; the request catalog and analog search.

-----

### 2.3 Player Abilities

City-exploration verbs (walking the streets, visiting locations) belong to the open-world *vision* and are deferred to §4/§15; the core verbs are desk-and-records.

**Primary actions (at the desk):**
- **Request** a record — via a surfaced *lead* or a free-form *hunch* — spending clearance.
- **Read & annotate** documents (highlight, margin notes).
- **Cross-reference** — place documents side by side; the game flags *that* they corroborate or contradict (never what it means).
- **Build the Board** — add entity and document tokens, draw and label connections, assemble the timeline / relationship web.
- **Search** the diegetic card-catalog / microfiche index.
- **Commit a verdict** — the two-layer factual solution + disposition.
- **Publish (Go Public)** — make a Registry record *public*. **Every faction then reacts** to what you publish (the press runs exposés, true or not; the powerful, the public, and others move per their interests — §6.1), applying pressure you trigger but cannot fully control. A consequential act (§2.4): publishing can confirm, contradict, or backfire.

**Secondary / contextual actions:**
- **Re-file / reorganize** documents — the optional manual control over auto-filing.
- **Bookmark / flag** a lead to pursue later.
- **Review the Decision Ledger** — revisit how past verdicts have rippled.
- **Compare across cases** — entities and timelines recur, since cases interlink.
- *(Open question: whether and how a closed case can be re-opened when new consequences or evidence surface — see §5 / §11.)*

**Limited or unlockable abilities:**
- **Clearance** — the rationed resource gating every request (earn/spend in §10).
- **Institutional rank (progression):** working cases raises your standing in the Cold Case Unit, mainly unlocking **higher-sensitivity record types** (sealed, medical, financial, classified) and **new parts of the city / Registry** — *access*, not raw power. Growth you feel without diluting skill-based deduction.
- **Analysis tools (raw-data only):** unlockable aids that reveal/compare/search raw information — overlay two timelines, compare handwriting, transcribe a recording, list every document mentioning an entity — but they **never interpret or flag a conclusion** (Pillar 2). They sharpen the player's eyes; they don't think.

-----

### 2.4 Scoring & Progression Feedback

**How performance is measured.** There is **no score and no morality / karma meter** — a number that rewarded the "right" choice would collapse the game's moral greyness into an optimization target. Performance lives on two separate planes:

- **Factual accuracy — checkable, but *confirmed by doing*.** The world holds a consistent ground truth, so factual conclusions *can* be right or wrong — but the game never grades them with a checklist. Instead: (a) a pre-commit **theory-level whisper** — before committing, the player learns only that their *current overall theory* contains some truth (or feels off), never which piece (the fairness valve that keeps reasoning from becoming flailing); and (b) **confirmation by doing** — specific and partially-correct beliefs resolve *only when the player acts on them* within the Registry, either by committing a verdict/disposition or through **intermediate official acts** (issuing a subpoena, formally naming a person of interest, requesting a sensitive record on a belief), at which point the world reacts and confirms or contradicts what they believed via a consequence. Truth is earned through commitment, not handed over.
- **Standing — multi-factional reputation.** Distinct powers — the Cold Case Unit, the press, the political elite / the powerful, the public, and neutral parties — react both to the player's **dispositions** *and* to **the information the player makes public** (§6.1), creating competing pressures that feed back into access and consequences. **Each faction is a full sub-system** with its own **Standing**, its own **Heat/Exposure** gauge (§9.1), and its own **Contacts & favors** network (§9.2) — so you can be courted by one faction and hunted by another. No single "good" axis; each faction is a lens, none is right. This gives "no clean answer" mechanical teeth without grading morality.

**Rewards for strong play.** Sharp, *economical* deduction is its own reward, surfaced through the **clearance economy** (Pillar 3 / §10): solving with fewer wasted requests leaves surplus clearance. Beyond that the player gains **institutional rank / access** (more record types, more of the city — §2.3), **standing shifts** with the factions, and **narrative revelation** — more of the Registry's larger secret (Pillar 4). Growth and revelation, never points.

> This binds the central tension: because confirmation comes only through consequential action, every verdict and official act is a real decision made on incomplete information — exactly the feeling the game is built to produce.

**Open questions & decisions:** How a *contradicted* belief can be revised after a consequence exposes it (does the case re-open? — §5/§11). The number of factions and their concrete pressures/levers (→ §3 / world). How the theory-level whisper is presented diegetically (a gut cue, a superior's nod?). Tuning the density of intermediate official acts so feedback is steady but not constant.

-----

## 3. Challenge

📝 GUIDANCE: Where difficulty and friction come from. This section catalogs the forces working against the player and how they are tuned. Detailed rosters (enemies, bosses, obstacles) live further down; here, describe the categories and the philosophy.

-----

### 3.1 Sources of Challenge

For a deduction game, challenge is **informational and institutional**, not combat. The primary challenge is **cognitive** — the volume of records, lying/partial/biased documents, separating signal from noise, and assembling a coherent account from fragments under uncertainty.

**Adversaries (overview):** Institutional and human *resistance*, not enemies — witnesses and suspects who lie, cover-ups, gatekeepers who deny or delay access, and the powerful who push back as the player closes in on the systemic secret. *(These reinterpret §6–§8 for a detective game: recurring obstructors become "enemies," a powerful obstructing figure becomes a "boss," and sealed/booby-trapped records become "obstacles.")*

**Environmental / terrain challenges (overview):** The Registry itself is the terrain — sealed records, redactions, dead ends, bureaucratic friction, and the sheer volume of the archive. Navigating *informational space* is this game's analogue of navigating a level.

**Pressure systems (time, scarcity, etc.):** Clearance scarcity (every request costs — §10); time/consequence pressure (the world moves and consequences land on a variable clock — §3.3); multi-factional pressure (the Unit, press, powerful, and public react and constrain — §2.4); and moral weight (committing verdicts and official acts on incomplete information, knowing they are effectively irreversible).

-----

### 3.2 Difficulty Philosophy

**Scaling approach:** Difficulty grows on four layered levers: (1) **the world resists near the truth** — as the player approaches the systemic secret, the powerful obstruct more, access tightens, and records get scrubbed or sealed; (2) **case complexity ramps** — more entities, deeper lies, more interlinked threads; (3) **safety nets thin** — later cases offer less of the theory-level whisper and fewer hints, demanding more independent deduction; (4) **stakes intensify** — later choices carry heavier, longer-latency, harder-to-foresee consequences. Difficulty is driven by *complexity and ambiguity*, never by hidden unsolvable gates.

**Fairness / safety mechanisms:** Core guarantee — **always solvable** from the evidence (Pillar 1); the difficulty is interpretation, not luck. Rails: the pre-commit theory-level whisper, requestable leads, contradiction/corroboration flags, and the clearance margin earned by economical play. **Failure is consequential, not terminal:** a wrong verdict ripples permanently — an innocent harmed, factions shifting, the city remembering — but there is no game-over; the player carries the weight forward. Botched cases can stay botched (you cannot un-harm the innocent) — that *irreversibility*, not a fail screen, is the cost.

-----

### 3.3 The Consequence System — delayed & variable-latency

*(Added section — the deferred system from §1.3/§2.4 formalized here, since it is the game's central pressure system.)*

**The Registry acts.** Verdicts and intermediate official acts mutate the ground-truth graph and **schedule future world events deterministically**. Consequences surface on an unpredictable clock: **immediate**, **near** (next day / next case), or **long** (months / many cases later). Every consequence is itself ground truth — never LLM-invented (Pillar 1).

- **Signposted, not random:** committing an act signals *that* it will ripple (the player feels the weight) but never what or when — dread with agency; known-unknowns, not unknown-unknowns.
- **The Decision Ledger:** every surfaced consequence is recorded against the verdict/act that caused it, drawing the line back to the choice — the "that was me" payload that turns delay into meaning.
- **Confirmation by doing:** because beliefs resolve only when acted on (§2.4), consequences are *also* how factual truth is confirmed or contradicted after the fact — the same loop serves feedback and dread.
- **Design constraints (to tune):** bound the number of live consequence-threads so the player never loses the plot; guarantee every scheduled consequence eventually surfaces legibly via the Ledger; make latency feel **causal** (tie it to in-world triggers — a related case opening, enough time passing) rather than arbitrary.

-----

## 4. World

📝 GUIDANCE: The spaces the game takes place in and how they connect. Set the structure here; specific level and room details come later.

-----

### 4.1 Terrain & Areas

The game has two senses of "world": the Registry's **informational space** (where deduction actually happens) and the **physical alternate St. Louis** the records describe. **"Open world" here means the openness of *information*** — you can investigate anyone or anywhere through records — *not* free-roam geography.

**Area types and their purpose:**
- **The Unit (hub):** the Cold Case Unit office — your desk, the Board, the case files. Home base; most play happens here.
- **The Registry / the Stacks:** the archive you query — card catalog, microfiche, records. Navigated by *request and search*, not on foot; the game's primary "space."
- **The City (alt-St. Louis):** districts and case locations, experienced through the records that describe them and a **map**. The *vision* adds **map-based visits** to key locations for curated, non-free-roam scenes (interviews, site inspections); the *MVP* references the city through records only. No free-roam streets.

**How areas connect / how the player travels between them:** The Unit/desk is the spine. From it the player queries the Registry (information) and consults the city map. In the vision, selecting a location opens a curated scene, and travel may cost time/clearance (pressure). In the MVP, "travel" is abstracted into records — the city comes to the desk.

-----

### 4.2 Environments

Districts are **fictionalized analogues** of St. Louis character — no real names or exact geography — preserving the city's soul while granting license for the alternate-history secret. Each district's social texture *feeds* the kinds of cases found there and the systemic secret beneath them. (Scaffold — add/cut districts freely.)

|Zone / area|Theme|Gameplay role|
|-----------|-----|-------------|
|**Downtown / the Gateway**|Institutional heart — the Registry's seat, courts, civic power; bureaucratic and monumental|Where the systemic secret is most guarded; high-clearance and sealed records; turf of institutional power and gatekeepers|
|**The North Wards**|Neglected, over-policed, under-served; the forgotten parts of the city|Origin of most cold cases (the abandoned); the human cost and the heaviest moral weight; cases the city let go cold|
|**The Heights (enclaves)**|Wealthy, insulated, well-connected; old money and influence|Cover-ups, influence-peddling, sealed/scrubbed records; home turf of the "powerful" faction|
|**The Riverfront / Works**|Industrial docks, factories, rail and transit; where money, goods — and bodies — move|Economic crime, labor disputes, disappearances, smuggling; working-class lives and deaths|

-----

## 5. Levels

📝 GUIDANCE: How the playable space is structured into a journey — whether hand-authored levels, procedural generation, or a mix. Describe the shape of progression from start to finish.

-----

### 5.1 Structure & Generation

For this game a "level" is a **case**, and §5.1 is the procedural **ground-truth engine** the whole design rests on. The LLM never authors truth — it only renders already-decided facts as documents (Pillar 1).

**Level structure (authored / procedural / hybrid):** **Hybrid.** Authored **case grammars** (templates of case shapes and motive/crime patterns) and the overarching **systemic-secret backbone** provide the skeleton; a procedural generator fills them with specific entities, events, relationships, and records. This yields controllable, guaranteed-interesting structures *plus* procedural variety and interlinking. (Concrete generator technology is deferred to §14, where **simulation-first emergence** — simulating lives and letting crimes emerge — is flagged as the ambitious approach to prototype.)

**Building blocks & assembly rules:**
- *Atoms:* **Entities** (people, places, organizations, objects, documents), **Events** (timestamped, causal), **Relationships** (social/financial/institutional), the **Crime** (the true sequence), **Records** (reports with tracked **fidelity** — true / partial / biased / false, each falsehood attributed to *who* and *why*), and **Leads** (intra-record references = requestable edges).
- *Order of assembly:*
  1. **Generate ground truth** — world state + the crime — deterministically from a seed.
  2. **Project the record layer** onto it, applying grounded distortions (lying witnesses, sloppy/biased/scrubbed records). True records agree with ground truth; false ones deviate in bounded, tracked ways, so contradictions are always *meaningful*.
  3. **Verify solvability** — a solver/checker confirms at least one chain of *obtainable* records yields the factual solution within reachable clearance; regenerate or patch otherwise (Pillar 1).
  4. **Thread interlinks** — share entities/events across cases and wire them into the secret backbone (Pillar 4).
  5. **Render on demand** — only at request time does the LLM dress the matching facts as a period document.
- *Constraints:* red herrings are **grounded** (real mundane truth, never fabricated dead-ends); every falsehood is itself a discoverable fact; the secret backbone stays consistent across all cases.

-----

### 5.2 Pacing of Challenge

**Pacing of challenge introduction:** *Within a case:* early leads are clear and low-ambiguity (teach the request → cross-reference loop by doing) → the mid-case opens branches, the first contradictions, and partial truths → the late case is the hard commit on incomplete information (factual solution + disposition). *Across the game:* the four §3.2 levers ramp — the world resists more near the truth, case complexity grows, safety nets (the theory-level whisper, hints) thin, and stakes intensify. New record types and analysis tools are introduced safely in isolation, then combined and layered. Difficulty is always *complexity and ambiguity*, never an unsolvable gate (Pillar 1).

-----

### 5.3 Advancing

**How the player advances:** **Open parallel caseload** — several cold cases are open at once; the player works them in parallel and chooses which thread to pull. Leads, entities, and contradictions from one case can crack another, so progress is web-shaped, not linear (Pillar 4). *(The MVP still starts with a single case to prove the engine; the parallel caseload is the vision layer.)* Advancing the *whole game* means accumulating closed cases and institutional rank, which unlock higher-sensitivity record types and new districts — and surface more of the systemic secret.

**Gates / conditions / branching rules:** Soft-gated by **clearance** and **rank/access** rather than hard walls: you can attempt anything you can reach, but sensitive records and districts open as you rise (§2.3). **Closed cases can reopen** when a later consequence or new evidence surfaces (the city remembers) — you may revisit and revise a verdict, but **harm already suffered stands** (consequential, not terminal — §3.2). Branching is emergent: the order you pull threads and the dispositions you choose shape which leads, consequences, and reopenings appear.

-----

### 5.4 Case Anatomy & Archetypes

*(Reinterpreted — headings are a scaffold. Because cases are procedurally generated, this is not four hand-authored levels but the **anatomy of a case** plus **case archetypes** the grammars produce.)*

**Anatomy of a generated case.** A case is a slice of the fact graph: a **crime** (the true sequence), a cast of **entities** with **relationships**, a spread of **records** of varying fidelity (true / partial / biased / false, each falsehood attributed), a guaranteed **solution path** (verified — §5.1), a set of **leads** wiring it together, one or more **dispositions** the player can enter, and **scheduled consequences** hung off those dispositions. Each case carries one or more **threads into the secret backbone** (Pillar 4) and is sited in a district whose social texture (§4.2) colours its records and lie-patterns.

**Case archetypes (grammars — add freely):**

#### The Staged Accident
- **Shape:** a death ruled accidental that the physical/record evidence quietly contradicts.
- **Lie-pattern:** an authoritative record (autopsy, official report) is *biased or falsified*; the truth hides in mundane corroborating records.
- **District lean:** the Heights (cover-ups) or the Works (industrial "mishaps").

#### The Convenient Disappearance
- **Shape:** a person vanished; was it flight, foul play, or erasure?
- **Lie-pattern:** records *omit* and *misdirect*; absence of a record is itself a clue.
- **District lean:** the North Wards (the forgotten) or the Riverfront (bodies move).

#### The Buried Witness
- **Shape:** a key witness was never interviewed — or was, and lied.
- **Lie-pattern:** a *false statement* whose seams show against phone, travel, or property records.
- **District lean:** anywhere; a workhorse archetype for teaching cross-referencing.

#### The Scrubbed Record
- **Shape:** the trail runs into redactions and sealed files — someone tampered with the Registry itself.
- **Lie-pattern:** the *Registry as unreliable narrator*; the tampering is the lead. Difficulty-scales near the secret.
- **District lean:** Downtown / the Gateway (institutional power).

-----

## 6. Bosses

📝 GUIDANCE: Major set-piece encounters, if the game has them. Start with shared boss conventions, then detail each boss. If the game has no bosses, note that and repurpose this section.

-----

### 6.1 Boss Conventions

*(Reinterpreted — "bosses" are **major obstructing powers**, not combat. They are authored figures/institutions woven into the secret backbone; you overcome them with evidence, leverage, or the press — never violence.)*

**Shared rules (how an obstruction works and resolves):**
- **What they are:** powerful, authored figures or institutions tied to the secret backbone, who obstruct the player's approach to the truth.
- **Escalation (phases):** they begin as *passive* obstruction (denied access, buried records) and, as the player closes in, shift to *active retaliation* — surveillance, clearance revocation, threats, endangering sources, even framing — routed through the consequence system (§3.3). The "telegraph" is the rising heat the player can feel before it lands.
- **How they are overcome (no HP — three levers, each with a cost):**
  1. **Evidence** — amass undeniable ground-truth that forces exposure.
  2. **Leverage** — use findings as a deal or threat; morally grey and consequence-laden.
  3. **Going Public** — make Registry records *public*. **Every faction reacts to what you publish**, each per its own interests (for / against / neutral): the **press** runs exposés (**true or not**); the **political elite and the powerful** move to protect themselves, retaliate, or reposition; the **public** shifts; neutral parties take sides. This outside pressure can **crack *or* harden** an obstruction. Factions act **only** on what the player makes public — so the player triggers the cascade but cannot fully control it, and a distorted exposé or an elite backlash can harm the innocent or misfire.
- **Resolution:** "defeat" = the obstruction collapses or the power is exposed/neutralized — usually at a moral or factional cost, never cleanly. Because going public moves *all* the forces at once, resolving one obstruction can inflame another (Pillar 4).

-----

### 6.2 Boss Roster

📝 GUIDANCE: One subsection per boss. Capture the boss’s role in the story, its mechanical gimmick, and how the player is expected to beat it. Duplicate as needed.

*(Concrete bosses are authored alongside the secret; these are archetypal roles the backbone draws on.)*

#### The Gatekeeper (institutional)
- **Role:** controls access to sealed/sensitive records — the wall between the player and a buried truth.
- **Behavior & escalation:** denies and delays; later revokes clearance and flags the player's requests.
- **Intended counterplay:** rank/access, leverage, or routing around via alternate records; publishing can force a policy crack.

#### The Untouchable (the powerful)
- **Role:** a connected figure the system protects; central to a secret thread, likely a capstone.
- **Behavior & escalation:** insulated by others' lies and scrubbed records; retaliates with threats or framing as the player nears the truth.
- **Intended counterplay:** undeniable evidence or press exposure — at cost; leverage offers a greyer path.

#### The Insider
- **Role:** someone close — within the Unit or the Registry — who misleads or obstructs; a betrayal thread.
- **Behavior & escalation:** feeds false leads, buries the player's filings, watches their moves.
- **Intended counterplay:** catch the inconsistency in their *own* record trail; isolate them.

#### The Registry's Keepers
- **Role:** the institution itself near the core secret — the final, systemic obstruction.
- **Behavior & escalation:** the archive turns against the player (tampering, redactions, surveillance at scale).
- **Intended counterplay:** the endgame — expose the system using its own ground truth, choosing what to make public and what it costs.

-----

## 7. Enemies

📝 GUIDANCE: The standard adversaries the player faces. Begin with a stats overview table for quick balancing, then a short profile for each. Add rows and profiles freely.

-----

### 7.1 Enemy Stats Overview

📝 GUIDANCE: A single table for at-a-glance balancing. Columns are a starting suggestion — adapt to whatever stats matter for this game (speed, range, behavior type, reward).

*(Columns adapted — there is no combat. "Persistence" = how stubbornly it recurs; "Threat" = how it hurts your investigation; "Handled by" = the counter.)*

|Obstructor|Persistence|Threat to the investigation|Handled by|Role|
|----------|-----------|---------------------------|----------|----|
|**The Liar**|Low–med (a specific false statement)|Misdirection; a false lead|Cross-reference against hard records to expose the seam|The core puzzle adversary|
|**The Gatekeeper**|Recurring|Blocks leads; drains clearance/time|Rank/access, leverage, alternate records|Friction & pacing|
|**The Fixer**|High|Corrupts the record layer (scrubs, plants)|Catch the tampering (Scrubbed Record); find the original|Escalation near power|
|**The Biased Official**|Systemic|Subtly false "authoritative" records|Triangulate against neutral sources|Hidden unreliability|
|**The Frightened Witness**|Situational|Missing or withheld testimony|Corroborate elsewhere; reassure or (greyly) pressure|Human/moral texture|

-----

### 7.2 Enemy Profiles

📝 GUIDANCE: A short profile per enemy. The goal is to capture what makes each one a distinct decision for the player to handle. Duplicate as needed.

*(Profiles adapted: "behavior" = how it manifests in records; "threat" = how it hurts the investigation; "tell" = how you catch it.)*

#### The Liar
- **What makes it distinct:** a person whose record (statement, interview) deviates from ground truth — the seam that teaches cross-referencing.
- **Behavior in records:** a confident false account that doesn't square with phone, travel, or property records.
- **Threat:** a tempting false lead that wastes clearance if trusted.
- **Tell / how handled:** the contradiction flag when their statement meets a hard record; confirmation-by-doing if you act on the lie.

#### The Gatekeeper
- **What makes it distinct:** controls a chokepoint of access rather than lying.
- **Behavior in records:** denials, delays, "request refused / clearance required" responses.
- **Threat:** blocks leads, drains clearance and time.
- **Tell / how handled:** rank, leverage, or an alternate record route; publishing can force the gate.

#### The Fixer
- **What makes it distinct:** actively *corrupts* the record layer on power's behalf (the §5.4 Scrubbed Record at human scale).
- **Behavior in records:** scrubbed files, planted documents, suspiciously clean trails.
- **Threat:** poisons the evidence; can frame the innocent.
- **Tell / how handled:** tampering leaves seams (gaps, mismatched provenance); find the original or a witness to the scrub.

#### The Biased Official
- **What makes it distinct:** records skewed by prejudice or interest — *systemically* unreliable while looking authoritative.
- **Behavior in records:** an autopsy, report, or ruling slanted to a foregone conclusion.
- **Threat:** false confidence in an "official" source.
- **Tell / how handled:** triangulate against neutral records; notice the pattern across their output.

#### The Frightened Witness
- **What makes it distinct:** withholds out of fear rather than malice — the human/moral texture.
- **Behavior in records:** absences, recantations, vague statements.
- **Threat:** a missing piece you must source elsewhere.
- **Tell / how handled:** corroborate around them, reassure, or (greyly) pressure — with consequences for how you treat them.

-----

## 8. Obstacles

📝 GUIDANCE: Non-enemy hazards and interactive objects in the world — traps, locked containers, environmental dangers, puzzle elements. Note which the player can interact with or neutralize, and how. Duplicate as needed.

-----

*(Obstacles here are **informational and bureaucratic hazards**, not physical traps.)*

#### Sealed / redacted records
- **What it is and where it appears:** sensitive files behind clearance or actively redacted; common in Downtown / the Gateway.
- **Effect on the player:** blocks a lead; a wall in the evidence chain.
- **How the player can avoid, disarm, or use it (and any risk in doing so):** open via rank, leverage, or press pressure — but a redaction's *existence* is itself a clue (someone wanted this hidden).

#### Dead-ends (grounded mundane leads)
- **What it is and where it appears:** real but irrelevant records — the truthful noise of an honest world; anywhere.
- **Effect on the player:** spends clearance for no payoff.
- **How the player can avoid, disarm, or use it:** judgment about *what to pull*; not all truth is useful — eliminating a thread is still progress.

#### Surveillance flags
- **What it is and where it appears:** acting on or publishing sensitive records near the secret draws attention.
- **Effect on the player:** raises heat → triggers obstructor retaliation (§6.1).
- **How the player can avoid, disarm, or use it:** move carefully — or bait it deliberately to provoke a revealing reaction.

#### Clearance walls
- **What it is and where it appears:** high-sensitivity record types and districts.
- **Effect on the player:** hard cost/rank gate on access.
- **How the player can avoid, disarm, or use it:** advance rank, spend clearance, or find a lower-clearance route to the same fact.

#### Decoy document floods
- **What it is and where it appears:** broad or hunch requests that return a deluge of mundane truth.
- **Effect on the player:** signal-in-noise; drains clearance and attention.
- **How the player can avoid, disarm, or use it:** targeted requests and raw-data analysis tools (§2.3) to filter; precision beats volume.

-----

## 9. Player

📝 GUIDANCE: The player character’s systems — survivability, growth, and the consumables/tools they carry.

-----

### 9.1 Health Mechanics

*(Reinterpreted — no combat, no HP. The player's "health" is **Heat / Exposure**: how much hostile attention they've drawn.)*

**Heat / Exposure (per-faction vulnerability gauges):** Heat is tracked **separately for each faction** (§2.4) — you can be hot with the political elite while cold with the press. A faction's Heat rises with acts that antagonize *it specifically* — pulling records it guards, official acts against its interests, **going public** in ways it dislikes, pressing its protected figures. The nearer the secret, the faster the guarding factions heat up (§3.2).

**Cooling, retaliation & "death":** high Heat **with a faction** triggers *that faction's* **retaliation** (§6.1) — surveillance, clearance revocation, threats, endangered sources, framing — scaled to how hot you are with it. The player cools a faction's Heat by **lying low** toward it (quieter threads, time passing). There is **no death / game-over** (consequential, not terminal — §3.2): maxing a faction's Heat forces hard consequences from *that* faction — a suspension, a burned source, a lost avenue — carried forward, not a fail screen.

-----

### 9.2 Contacts & Favors

*(Reinterpreted — a **contacts & favors network** rather than "power-ups".)*

**Per-faction networks:** the player cultivates a **separate** contacts network *within each faction* (§2.4) — a Unit clerk and coroner, a press reporter, an elite insider, community witnesses. Calling a contact spends **that faction's favors** (§10) and draws on that faction alone: a press source can run a leak but cannot open an elite's sealed file. Calls buy temporary help — a fast-tracked record, a quiet leak, emergency clearance, a warning before retaliation lands — at a cost (a favor owed, standing, or a cooldown). Contacts give **access, never answers** (Pillar 2), and leaning hard on one faction can cost standing or raise Heat with a rival.

-----

### 9.3 Pick-ups

*(Reinterpreted — "pick-ups" are found leads/materials, not health items.)*

#### Found leads & materials
- **What they are and where the player finds them:** unsolicited inputs — an anonymous tip, a leaked or misfiled document, a contact's gift. They inject new leads or records *without* a clearance cost — but, like all records, may be true, partial, or planted (the truth-model applies).

#### Caches
- **Effect:** a bundle of related records that opens a thread quickly.
- **When it is worth using:** when stuck, or to leap ahead — but a cache can be **bait** (a Fixer's plant) that raises Heat or misdirects.
- **How it is acquired:** from contacts, whistleblowers, or earned by progress within a case.

-----

### 9.4 Upgrades Screen

*(Reinterpreted — "upgrades" = institutional growth, not body stats.)*

#### Rank & record access
- **Permanent growth:** rising in the Cold Case Unit unlocks higher-sensitivity record types and new districts/Registry areas (§2.3) — *access*, not power.

#### Analysis tools
- **What grows:** unlock raw-data tools (timeline overlay, handwriting compare, transcription, entity cross-listing — §2.3) that sharpen the eyes but never interpret (Pillar 2).

#### Contacts & standing
- **What grows:** the contacts network (§9.2) and faction standing — relationships, not stats. *(No movement/"speed" upgrades — there is no traversal; that template slot is N/A.)*

**Open questions & decisions:** Tune the progression economy (rank/clearance pace) so access opens neither too slow nor too fast. Whether **Heat** and **clearance** are one resource or two (→ §10). Whether contacts can be permanently burned.

-----

## 10. In-Game Economy & Currency

📝 GUIDANCE: How value flows through the game. Even a simple game has an economy — define the currency, how it is earned, and how it is spent so the loop stays balanced.

-----

### 10.1 Earning

The economy has distinct axes: **Clearance** (a global spend-to-act budget), and — tracked **per faction** (§2.4) — **Heat/Exposure**, **Favors**, and **Standing**. Each faction (Unit, press, political elite/powerful, public, neutral) is its own sub-system; you can be hot with one and cold with another.

**Sources of income:**
- **Clearance** — the primary spendable. A recurring **institutional budget allotment** (a budget cycle), topped by **rank** and by **economical play** (unspent clearance carries — §2.4). Closing cases and good standing raise the allotment.
- **Favors (per faction)** — earned by serving a faction's interests, by dispositions and publications it approves of, and by cultivating that faction's contacts (§9.2). Spendable **only within that faction**.
- **Standing (per faction)** — raised by dispositions and published information a faction likes (§2.4); not "spent," but gates access, contact quality, and whether that faction's Heat turns into help or harm.
- *(Heat is not earned — it accrues as a cost; see §9.1/§10.2.)*

-----

### 10.2 Spending

**Sinks (what currency buys):**
- **Clearance** → record requests (leads cheap, hunches costly — §2.1), intermediate official acts (subpoenas, naming a person of interest), and expediting.
- **Favors (per faction)** → calling that faction's contacts (fast-tracked records, leaks, emergency clearance, warnings — §9.2). Each call draws down *that faction's* favor pool.
- **Heat (per faction)** is the *hidden price* of risky/visible acts: pulling sensitive records, official acts, and going public raise Heat **with the specific factions affected** — and high faction-Heat buys that faction's retaliation (§6.1). The same act can cool one faction and inflame another.
- *Price scaling:* costs rise with record sensitivity, proximity to the secret, and how much an act antagonizes a given faction.

-----

### 10.3 Shop / Acquisition Tables

*(Reinterpreted — there is no shop. These are **acquisition tables**: how access, tools, and faction help are obtained.)*

**Access & tools (by rank / clearance):**

|Unlock|What it grants|Cost / gate|
|------|--------------|-----------|
|Record-type access tiers|Sealed, medical, financial, classified records|Rank threshold + clearance|
|New districts / Registry areas|Reach into more of the city|Rank + standing|
|Raw-data analysis tools|Timeline overlay, handwriting compare, transcription, cross-listing (§2.3)|Rank / case milestones|

**Contacts & favors (per faction — illustrative):**

|Faction|Example contacts|What a favor buys|Risk|
|-------|----------------|-----------------|----|
|The Press|reporter, editor|an exposé run on what you publish|may distort; raises elite Heat|
|Political elite / powerful|aide, insider|sealed access, a quiet word|greyest; inflames Heat elsewhere|
|The Public|community figures, witnesses|tips, testimony|low power, low risk|
|The Unit|clerk, coroner|fast-track, emergency clearance|internal scrutiny / Unit Heat|

💬 EXPLORE WITH CLAUDE CODE: Model the economy in a spreadsheet — feed it expected income per session and check whether the player can afford the intended power curve.

-----

## 11. Game Flow & Onboarding

📝 GUIDANCE: How a player gets from launching the game to mastering it, and how a session is shaped.

-----

### 11.1 Tutorial

📝 GUIDANCE: How new players learn — what is taught, in what order, and how (explicit instruction, guided first run, learn-by-doing). The best tutorials teach through play rather than text walls.

**What the tutorial teaches & how:** Taught **by doing**, through a gentle **starter case** — your first reopened file as a new Unit hire (a *Buried Witness* archetype: low ambiguity, a single clean contradiction). The case walks the player through the core loop without text walls: read the file → follow a highlighted lead → request a record (introducing **clearance**) → spot the contradiction the game flags → commit a small **factual finding**, then a first **disposition** that produces a visible, immediate consequence (introducing the Ledger and stakes). The **theory-level whisper** runs with extra-strong training wheels here, dialing back as competence shows. Advanced systems (hunch requests, Heat, factions, going public, the calendar) are introduced one at a time across the first few cases — safely, then combined (§5.2).

-----

### 11.2 Challenge Scaling

**What scales and what triggers it:** Escalation follows the four §3.2 levers, triggered by **proximity to the systemic secret** and accumulated progress: (1) the **world resists more** — guarding factions' Heat climbs faster, access tightens, records get scrubbed; (2) **case complexity ramps** — more entities, deeper lies, more interlinking; (3) **safety nets thin** — the theory-whisper and hints recede; (4) **stakes intensify** — longer-latency, heavier consequences. The per-faction systems (§2.4/§9/§10) grow more entangled as you accrue standing, Heat, and contacts across factions. What stays **constant**: every case remains solvable (Pillar 1), and difficulty is always complexity/ambiguity, never an unsolvable gate.

-----

### 11.3 Session Loop & Game Flow

**Session loop:** A session is shaped by the **calendar** (days/weeks). Within a day: review the open parallel caseload → pull threads (spend clearance) → cross-reference and build the Board → take official acts or go public (raising per-faction Heat) → manage exposure and call contacts → commit findings/dispositions. Time advances in days: **clearance budgets cycle**, **cases age**, and **scheduled consequences land on the calendar** (§3.3) — so a session both progresses cases and absorbs the fallout of past ones. Lying low to cool a faction's Heat costs days, trading progress for safety.

**Path to completion / win condition:** The interlinked cases thread toward the **core of the Registry's secret** (Pillar 4). The finale is a **definitive endgame**: a climactic, morally-grey **final choice** about the secret — *expose it, bury it, or leverage it* — resolved through the systems the player has been using (evidence, going public, factions). The final choice **plus the accumulated faction state** determines the ending, so there are multiple endings without multiple authored arcs. There is no score to maximize and no clean victory — only the truth you found and what you chose to do with it.

-----

## 12. Controls & User Interface

📝 GUIDANCE: How the player physically interacts and how information is presented. Keep the input scheme abstract until platform is chosen in Technical Foundation.

-----

### 12.1 Controls

📝 GUIDANCE: Map intentions to inputs without committing to a specific device yet. List the actions — concrete bindings can come after platform is decided.

**Actions to bind (input-agnostic):** select / move / spread documents; annotate (highlight, margin notes); pin entities & documents to the Board and draw/label connections; open the Request slip (choose entity + record type; lead or hunch) and submit; query the analog search/index; call a contact; take an official act (subpoena, name a person of interest); **publish / go public**; commit a verdict (factual + disposition); open the Decision Ledger and the Factions screen; advance the calendar / lie low; re-file & reorganize.  
**Note — concrete bindings deferred until platform is decided in Technical Foundation.**

-----

### 12.2 Menus

**Menu structure & navigation:** Hub-and-spoke from **the Office**. Main menu (New / Continue / Settings) → the Office, the central state, from which the player reaches: the **Desk** (active case), **Case & Board select** (the open parallel caseload), the **Registry / analog search**, the **Decision Ledger**, the **Factions screen** (per-faction standing, Heat, and contacts), and the **Calendar**. A pause overlay is available throughout. Everything returns to the Office.

-----

### 12.3 HUD

**HUD elements & priority:** Persistent on the Desk (cross-ref §2.2): **clearance meter**; **active case + date** (the calendar); **per-faction Heat** indicators (compact, glanceable); **alerts** for a new document or a newly-landed consequence; and **contradiction/corroboration flags** on documents (showing *that* a relationship exists, never what it means). *Instant:* clearance, date, Heat, alerts, flags. *On demand:* the Board, the Ledger, full document text, and the analog search.

-----

### 12.4 Camera

**Perspective & camera behavior:** **Top-down desk** — a 2D, top-down view of a physical desk: documents spread out, the corkboard Board, the card catalog. The camera pans and zooms across the desk surface; switching to the Board or the analog search is a framed transition to that surface. Document-centric and readability-first, with tactile drag-and-arrange ("paperwork is play"). No 3D world traversal — consistent with the open-*information*-world decision (§4.1).

-----

### 12.5 Screens

📝 GUIDANCE: Every distinct screen the game presents. The list below is inherited from the reference structure as a checklist — add, remove, or rename to match the actual UX.

#### Settings Page
- **Options exposed to the player:** audio; controls/rebinding (post-§14); **accessibility** — text size, dyslexia-friendly font, colorblind-safe flag colors, reduced motion, and adjustable assist (theory-whisper strength, optional softer timers). Difficulty is expressed through these assists, not a "hard mode."

#### End-of-Day Summary
- **What is shown after a day ends:** consequences that landed (Ledger updates), the clearance budget cycle, per-faction Heat/standing shifts, which cases aged, and what's pending tomorrow. **No score** — a ledger of what changed, not a grade.

#### Play Screen (the Desk)
- **The primary in-action screen:** the top-down desk with HUD, documents, and access to the Board (cross-ref §2.2 and §12.3).

#### Case & Board Select
- **How the player chooses where to work:** pick among the **open parallel caseload** (§5.3); open a case's Board; see which cases are aging or have new developments.

#### Engagement Prompts
- **Optional prompts:** *N/A.* This is a premium PC title — no "rate us," nags, or monetization prompts. The slot is intentionally left empty.

-----

## 13. Audio & Visual Identity

📝 GUIDANCE: The sensory layer — art direction, effects, sound, and music. Even a concept doc benefits from a clear tonal target.

-----

### 13.1 Art Direction

📝 GUIDANCE: The intended visual style and mood in a few words, plus any references. This guides every later asset and effect decision.

**Visual style & mood:** **Stylized illustration / noir.** Hand-illustrated, high-contrast, moody palette (muted earth tones with pools of warm desk-lamp light and deep shadow); period graphic-design flavor on the documents themselves (typewriter faces, official letterhead, microfiche grain, rubber-stamp ink). Atmosphere is quiet institutional dread — bureaucratic, late-night, rain-on-the-window noir — never supernatural. Readability comes first: documents are legible, the desk uncluttered enough to think in.

**References / touchstones:** *Papers, Please* (bureaucratic UI dread), *Return of the Obra Dinn* (high-contrast deduction clarity), *Disco Elysium* (illustrated mood + palette), period detective/noir graphic design and 1970s–80s municipal paperwork.

-----

### 13.2 Visual Effects

📝 GUIDANCE: Key moments that need visual feedback, grouped by event. Feedback on success and failure is almost always worth specifying early.

#### Player Feedback Effects
- **Key feedback moments:** a **contradiction/corroboration flag** snapping onto a document (a clear, restrained mark — never an explanation); a **consequence landing** in the Decision Ledger (a stamped entry, the line drawn back to its verdict); **Heat rising** with a faction (a subtle reddening/heat tell on that faction's indicator); a **publish ripple** as records go public; the **theory-level whisper** (a soft, ambiguous gut-cue, not a checkmark). Clarity without telling the player what anything *means*.

#### Record / Object Feedback Effects
- **Reveals & tells (visual + paired audio):** a **record arriving** (it drops onto the desk); **tampering/redaction** surfacing (a blacked-out bar, a mismatched seam); a **cache** opening; a **retaliation** event intruding (a surveillance note, a revoked-clearance stamp). Each pairs with a tactile period sound (§13.3).

-----

### 13.3 Sound Effects

**Sound effect inventory (by event):** The analog desk is the instrument — **paper shuffle/slap** (moving documents), **typewriter & teletype** (requests submitting, records generating), **microfiche reader whir** (analog search), **rotary phone dial & ring** (calling a contact), **rubber stamp thunk** (committing a verdict/official act), **file-drawer roll & slam** (filing), **pencil scratch** (annotating), a soft **chime/clack** for a contradiction flag, a heavier **stamp** for a consequence landing, and **ambient room tone** (clock, distant office, rain). Sound carries the tactility "paperwork is play" promises.

-----

### 13.4 Music

📝 GUIDANCE: Music direction per context (exploration, tension, combat, menus). Note mood and, if known, specific tracks or composers.

|Context|Mood / direction|Specific tracks (once chosen)|
|-------|----------------|-----------------------------|
|Investigation (the Desk)|Sparse, contemplative noir — muted upright bass, brushed kit, lonely piano/sax; mostly *space* to think|TBD|
|Rising tension (high Heat / nearing the secret)|Low drones and dissonance creep in under the jazz; pulse tightens; dread, not action|TBD|
|Going public / a consequence landing|A short stab or swell that marks the weight of the act|TBD|
|The Office / menus|Quiet, institutional, late-night ambient — almost silence|TBD|
|Endgame (the final choice)|The full theme resolves — heavy, unresolved, morally grey|TBD|

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
|2026-06-02|**§13 Audio & Visual Identity locked.** Art = **stylized illustration / noir** (hand-illustrated, high-contrast, muted palette + desk-lamp light, period document graphic design; quiet institutional dread, no supernatural; readability first). Refs: Papers Please, Obra Dinn, Disco Elysium, period noir/municipal paperwork. VFX: contradiction flags, consequence-landing stamps, per-faction Heat tells, publish ripple, ambiguous whisper cue; record/tamper/redaction/retaliation reveals. SFX: the analog desk as instrument (paper, typewriter/teletype, microfiche whir, rotary phone, rubber stamp, file drawer, pencil, room tone). Music: sparse contemplative noir-jazz on the Desk → drones/dread at high Heat → stabs for publish/consequence → near-silence in the Office → heavy unresolved endgame theme.|
|2026-06-02|**§12 Controls & UI locked.** Input-agnostic actions (select/move/annotate docs, build the Board, request via the slip, search, call contacts, official acts, publish, commit verdict, Ledger/Factions, advance calendar/lie low) — bindings deferred to §14. Menus = hub-and-spoke from **the Office** (Desk · Case/Board select · Registry/search · Ledger · Factions · Calendar). HUD: clearance, date, per-faction Heat, alerts, contradiction flags. Camera = **top-down desk** (2D, document-centric, tactile; no 3D traversal). Screens: Settings (accessibility-forward; difficulty via assists), End-of-Day Summary (no score), Play/Desk, Case & Board select; engagement prompts N/A (premium PC, no nags).|
|2026-06-02|**§11 Flow & Onboarding locked.** 11.1 Tutorial: teach **by doing** via a gentle starter case (Buried Witness) — read→lead→request (introduces clearance)→flagged contradiction→factual finding→first disposition with an immediate consequence; theory-whisper as strong training wheels that ease off; advanced systems (hunches, Heat, factions, going public, calendar) introduced one at a time. 11.2 Scaling: the four §3.2 levers, triggered by proximity to the secret + progress; per-faction systems entangle further; constant = always solvable. 11.3 Session loop on a **calendar (days/weeks)** — clearance cycles, cases age, consequences land on dates; lying low costs days. **Win = definitive endgame: a final morally-grey choice about the secret (expose / bury / leverage); final choice + faction state → multiple endings; no clean victory.**|
|2026-06-02|**Per-faction sub-systems (refinement).** Each faction (Unit, press, political elite/powerful, public, neutral) is a full sub-system with its **own Standing, own Heat/Exposure gauge (§9.1), and own Contacts & favors network (§9.2/§10)**. Heat and favors are no longer global — you can be hot with the elite and cold with the press; a press contact can't open an elite's sealed file. Updates §2.4, §9.1, §9.2.|
|2026-06-02|**§10 Economy locked.** Axes: **Clearance** (global spend-to-act budget — recurring institutional allotment + rank + economical-play carry; closing cases/standing raise it) and, **per faction**, Heat/Exposure, Favors, Standing. Spending: clearance on requests/official acts/expediting; per-faction favors on that faction's contacts; Heat is the hidden price of risky/visible acts (per affected faction). Literal money minimal. §10.3 reinterpreted as acquisition tables (access/tools by rank/clearance; per-faction contacts & favors). Earning: periodic budget + performance.|
|2026-06-02|**§9 Player locked** (reinterpreted, no HP). 9.1 "health" = **Heat / Exposure** gauge: rises with risky/visible acts (sensitive pulls, official acts, going public, pressing the powerful), faster near the secret; high heat → obstructor retaliation; cool by lying low; **no death/game-over** (maxing heat forces hard consequences carried forward). 9.2 = **Contacts & Favors** network (sources called on for access/leaks/clearance/warnings at a cost; faction-tied; access never answers). 9.3 pick-ups = found leads/materials + caches (no clearance cost; may be true/partial/planted; caches can be bait). 9.4 upgrades = rank + record access, raw-data tools, contacts/standing (no speed/body stats). Open: is Heat separate from clearance (→§10); can contacts be burned.|
|2026-06-02|**§6–§8 Institutional Resistance locked** (reinterpreted; no combat). §6 "bosses" = **major obstructing powers** (authored, secret-backbone): the Gatekeeper, the Untouchable, the Insider, the Registry's Keepers; escalate passive → active retaliation; overcome by **evidence / leverage / the press**. **Going-Public mechanic:** the player can **Publish** Registry records; **every faction reacts** to what's made public per its interests (the press runs exposés true-or-not; the political elite/powerful protect or retaliate; the public and neutral parties shift), pressuring obstructions — factions act *only* on player-published info (agency preserved) and can distort or backfire, and resolving one obstruction can inflame another. §7 enemies = recurring **obstructor types** (Liar, Gatekeeper, Fixer, Biased Official, Frightened Witness) — each a record-layer behavior with a tell. §8 obstacles = informational/bureaucratic hazards (sealed/redacted records, grounded dead-ends, surveillance flags, clearance walls, decoy floods). Retaliation escalates near the truth. Added **Publish** to §2.3 abilities.|
|2026-06-02|**§5 Levels completed.** §5.2 Pacing: within-case clear→branching→hard-commit; across-game the four difficulty levers ramp; mechanics introduced safely then combined. §5.3 Advancing: **open parallel caseload** (work several cases at once, leads cross-pollinate; MVP starts single), soft-gated by clearance + rank/access (no hard walls); **closed cases can reopen** when consequences/evidence surface, but harm already done stands (resolves the §2.3/§2.4 reopening question). §5.4 reinterpreted as **case anatomy + archetypes** (Staged Accident, Convenient Disappearance, Buried Witness, Scrubbed Record) — each a grammar with a lie-pattern, district lean, and threads into the secret.|
|2026-06-02|**§5.1 ground-truth engine locked.** A "level" = a **case**. Generation = **hybrid**: authored case grammars + the systemic-secret backbone, procedurally filled with entities/events/relationships/records. Atoms: entities, events (timestamped/causal), relationships, the Crime (true sequence), records (tracked fidelity — true/partial/biased/false, falsehoods attributed), leads (requestable edges). Assembly order: generate ground truth from a seed → project the record layer with grounded distortions → **verify a solution path exists** (solver/checker; regenerate/patch otherwise — Pillar 1) → thread interlinks into the secret (Pillar 4) → LLM renders only at request time. Red herrings grounded; concrete generator tech deferred to §14 (simulation-first flagged as the stretch to prototype).|
|2026-06-02|**§4 World locked.** Two worlds: the Registry's **information** space (where deduction happens) and the physical alt-St.-Louis the records describe. **"Open world" = open *information*-world, not free-roam geography** (major scope decision). Areas: the Unit (hub/desk), the Registry/Stacks (queried, not walked), the City (records + a map; vision adds map-based curated visits; MVP records-only; no free-roam streets). Districts = **fictionalized analogues**: Downtown/Gateway (institutional power, the guarded secret), the North Wards (neglected, origin of cold cases, moral weight), the Heights (wealthy enclaves, cover-ups, the "powerful"), the Riverfront/Works (industrial, economic crime, disappearances). Resolves the §1.4 real-vs-fictional question.|
|2026-06-02|**§3 Challenge locked.** Challenge is cognitive + institutional, not combat: deduction difficulty, lying/partial records, signal-vs-noise. Adversaries = institutional *resistance* (liars, cover-ups, gatekeepers, the powerful) — reinterprets §6–§8. Terrain = the Registry (sealed records, redactions, dead ends, volume). Pressure = clearance scarcity, time/consequence, multi-factional, moral weight. Difficulty scales on **all four levers** (world resists near the truth + complexity ramps + safety nets thin + stakes intensify); always solvable (Pillar 1) — difficulty is interpretation, not luck. Failure = **consequential, not terminal** (no game-over; wrong verdicts ripple permanently; botched cases stay botched). Added **§3.3** formalizing the delayed variable-latency consequence system (scheduled ground-truth events; signposted; Decision Ledger; confirmation-by-doing; bounded live threads; causal latency).|
|2026-06-02|**§2.4 Scoring locked + Pillar 1 sharpened.** **No score / no karma meter.** Truth split: ground truth (consistent, solvable) vs. records (can be wrong/partial/biased/falsified; each falsehood a deterministic, discoverable fact; the LLM renders faithfully, never invents). Factual feedback = **confirmation by doing**: a pre-commit *theory-level whisper* (your overall theory rings true or off — never which piece) + specific/partial truths resolve only when the player ACTS on a belief (final verdict OR intermediate official acts: subpoena, naming a person of interest, sensitive request) and the world reacts. Standing = **multi-factional reputation** (Unit, press, powerful, public) — competing lenses, no "good" axis. Rewards = economical deduction (clearance surplus), rank/access, narrative revelation; never points. Pillar 1 gloss (§1.2) updated to the ground-truth-vs-record-layer reading.|
|2026-06-02|**§2.3 Player Abilities locked.** Core desk verbs: request (lead/hunch), read/annotate, cross-reference, build the Board, search the analog index, commit two-layer verdict. Secondary: optional re-file, bookmark leads, review the Ledger, cross-case compare. Progression = **light institutional rank** (unlocks higher-sensitivity record types + new parts of the city/Registry — access, not power; keeps deduction central). Analysis tools = **raw-data only** (overlay/compare/transcribe/list; never interpret — Pillar 2). City-exploration verbs deferred to §4/§15. Open Q: re-opening closed cases when consequences surface.|
|2026-06-02|**§2.2 Interface locked.** Framed as a detective's **desk** (paperwork-is-play): Desk, Case File, Board (string-corkboard timeline/relationship web), Request slip, Clearance meter, Decision Ledger, and a *diegetic* **analog search** (card-catalog/microfiche) that makes search fit the era. Organization = **auto by default, manual by choice** — game auto-files/indexes/extracts entities + auto-timeline, but the player can optionally re-file/reorganize anytime. Principle: automate the filing, never the thinking (Pillar 2). Instant-read: clearance, active case, alerts, contradiction flags. On-demand: full docs, Board, Ledger, search.|
|2026-06-02|**§2.1 Core Mechanic locked.** Loop = request → cross-reference → deduce → two-layer verdict. Requestable surface = **leads + hunches hybrid** (documents surface cheap requestable leads; free-form "hunch" requests on any nameable entity cost more clearance) — solves signal-vs-noise while preserving request-anyone and "deduction, not direction". Renderer constraint: expresses only the facts a given record would legitimately contain; never leaks the solution or invents (Pillar 1). Verdict = **two-layer**: factual solution (who/how, checked vs. ground truth) + disposition (morally-grey, fires the scheduled consequences). Central tension: spend finite clearance for uncertain info toward a committal, incomplete-information verdict.|
|2026-06-02|**§1.4 audience + consequence-feel steer.** Primary audience = deduction purists (*Obra Dinn* / *Golden Idol* / *Her Story*), with crossover to systems-sim and narrative/moral-choice players; PC-first, niche-but-passionate, depth over a low skill floor. Comparables: Obra Dinn, Golden Idol, Papers Please, Her Story/Contradiction, Disco Elysium. Rating ~M / PEGI 16–18 for theme. **Delayed-consequence feel (steers §2–§3): signpost the risk, hide the specifics, plus a Decision Ledger** that links each surfaced consequence back to the verdict that caused it — dread-with-agency, chosen over fully-hidden or investigate-first.|
|2026-06-02|**Back story: "The Registry."** Alt-St. Louis (late-20th-century, analog) is defined by a total-records municipal archive — the Registry — whose contents ARE the procgen ground-truth graph. Player = revived Cold Case Unit investigator with rationed clearance; verdicts are written back into the Registry as official truth. The Registry's origin/purpose is the deferred systemic secret. **Added stakes (user direction):** the Registry is mysterious AND scary — actions carry real consequences with **variable latency** (immediate / next-day / months+), and verdicts are **morally grey** (no clean/just answer; decide on partial info). Theme: "the world never lies, but the truth never absolves." Two systems flagged for §2–§3: delayed variable-latency consequences (must be procgen ground truth, not LLM-invented) and a morally-grey verdict system. |
|2026-06-02|**Design pillars locked (4):** "The world never lies" (integrity / hallucination-proof as a design law), "Deduction, not direction" (player-driven, no quest markers), "Every request has a price" (cost + consequence), "The city is the case" (interlinked, persistent world). Atmosphere kept as flavor; "Paperwork is play" demoted to a §12 UX principle rather than a 5th pillar. Genre framed as systemic detective/deduction on a procgen case-world (Obra Dinn / Golden Idol × Papers Please / immersive sim).|
|2026-06-02|**Case structure: interlinked web → one truth.** Cases share people/places/threads and assemble into a single larger truth, giving the open world purpose. Alternatives: anthology of standalone cases (kept as the MVP-friendly *starting* shape), or fully emergent sim-generated links (too unpredictable to guarantee satisfying). Vision = interlinked; MVP = one standalone case.|
|2026-06-02|**Central tension: investigation has a cost + stakes of being wrong.** Requests draw on a limited investigative resource, and conclusions can be wrong with consequences the world remembers. Rejected pure free-for-all sandbox (signal/noise drowning risk) as the *primary* driver, though signal-in-noise remains a secondary texture. Makes deduction a chain of real decisions.|
|2026-06-02|**Setting tone: grounded + a systemic secret.** Real-feeling alt-St. Louis, no supernatural; the "alternate" is institutional/historical, exposed layer by layer through solved cases. Chosen over a speculative/weird twist (small risk to the pure-deduction promise) and pure realism (no payoff for "reveals about the world"). Protects the real-deduction hook while giving the world a punchline.|
|2026-06-02|**Engine architecture: deterministic procgen ground-truth fact graph + grounded LLM renderer.** Procedural generation (no LLM) authors a consistent, solvable fact graph; the LLM only renders facts as documents and may never contradict them. This is the novel, defensible core and the first thing to prototype. Ambition: open-world vision, but MVP = one fully-solvable case proving this engine.|

-----

*End of Game Concept Document Template*
