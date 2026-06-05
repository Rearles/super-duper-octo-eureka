// Fluent builder API for the hand-authored base layer.
// The author writes case cores, factions, and key people through these;
// `.build()` validates each piece, and `defineWorld(...)` validates the
// cross-references (every reference resolves) before the generator runs.
// See docs/GameConceptDocument.md §2.5 and .plans/author-the-case-core.

import type {
  AuthoredWorld,
  CaseCore,
  CaseFact,
  Entity,
  BlocId,
  Faction,
  FactionMember,
  Person,
  Temperament,
} from "./types";

/** Thrown when authored data is incomplete or internally inconsistent. */
export class AuthoringError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthoringError";
  }
}

// --- Person ----------------------------------------------------------------

export class PersonBuilder {
  private _factionId?: string;
  constructor(
    private readonly _id: string,
    private readonly _name: string,
  ) {}

  /** Mark this person as a member of a faction (the faction must also list them). */
  faction(factionId: string): this {
    this._factionId = factionId;
    return this;
  }

  build(): Person {
    if (!this._id) throw new AuthoringError("person: id is required");
    if (!this._name) throw new AuthoringError(`person '${this._id}': name is required`);
    const person: Person = { id: this._id, type: "person", name: this._name };
    if (this._factionId) person.factionId = this._factionId;
    return person;
  }
}

export function definePerson(id: string, name: string): PersonBuilder {
  return new PersonBuilder(id, name);
}

/** A place is a simple entity — no optional fields, so a direct factory. */
export function definePlace(id: string, name: string): Entity {
  if (!id) throw new AuthoringError("place: id is required");
  if (!name) throw new AuthoringError(`place '${id}': name is required`);
  return { id, type: "place", name };
}

// --- Faction ---------------------------------------------------------------

export class FactionBuilder {
  private _description = "";
  private _temperament?: Temperament;
  private readonly _interests: string[] = [];
  private readonly _members: FactionMember[] = [];
  private readonly _allies: string[] = [];
  private readonly _rivals: string[] = [];
  private _bloc?: BlocId;
  constructor(
    private readonly _id: string,
    private readonly _name: string,
  ) {}

  describe(description: string): this {
    this._description = description;
    return this;
  }

  temperament(temperament: Temperament): this {
    this._temperament = temperament;
    return this;
  }

  /** What the faction cares about — drives emergent stakes (Plan 2). */
  interests(...interests: string[]): this {
    this._interests.push(...interests);
    return this;
  }

  member(personId: string, title?: string): this {
    this._members.push(title ? { personId, title } : { personId });
    return this;
  }

  allies(...factionIds: string[]): this {
    this._allies.push(...factionIds);
    return this;
  }

  rivals(...factionIds: string[]): this {
    this._rivals.push(...factionIds);
    return this;
  }

  /** Which broad bloc this faction belongs to (v2.0 sim; fluid at runtime). */
  bloc(blocId: BlocId): this {
    this._bloc = blocId;
    return this;
  }

  build(): Faction {
    if (!this._id) throw new AuthoringError("faction: id is required");
    if (!this._name) throw new AuthoringError(`faction '${this._id}': name is required`);
    if (!this._temperament)
      throw new AuthoringError(`faction '${this._id}': temperament is required`);
    if (this._interests.length === 0)
      throw new AuthoringError(`faction '${this._id}': at least one interest is required`);
    const faction: Faction = {
      id: this._id,
      name: this._name,
      description: this._description,
      interests: [...this._interests],
      temperament: this._temperament,
      members: [...this._members],
    };
    if (this._allies.length) faction.allies = [...this._allies];
    if (this._rivals.length) faction.rivals = [...this._rivals];
    if (this._bloc) faction.bloc = this._bloc;
    return faction;
  }
}

export function defineFaction(id: string, name: string): FactionBuilder {
  return new FactionBuilder(id, name);
}

// --- Case core -------------------------------------------------------------

export class CaseBuilder {
  private _what?: string;
  private _culpritId?: string;
  private _victimId?: string;
  private _whereId?: string;
  private _when?: string;
  private _how?: string;
  private _keyFact: CaseFact = "where";
  constructor(private readonly _id: string) {}

  /** what happened — the crime/event. */
  what(what: string): this {
    this._what = what;
    return this;
  }

  culprit(personId: string): this {
    this._culpritId = personId;
    return this;
  }

  victim(personId: string): this {
    this._victimId = personId;
    return this;
  }

  /** where — a place entity id (authored via definePlace). */
  where(placeId: string): this {
    this._whereId = placeId;
    return this;
  }

  /** when — the time anchor, e.g. "2300". */
  when(when: string): this {
    this._when = when;
    return this;
  }

  /** how — the method. */
  how(how: string): this {
    this._how = how;
    return this;
  }

  /** which 5W+H fact is the crux the cover-up attacks (default "where"). */
  keyFact(keyFact: CaseFact): this {
    this._keyFact = keyFact;
    return this;
  }

  build(): CaseCore {
    if (!this._id) throw new AuthoringError("case: id is required");
    const required: Array<[string, string | undefined]> = [
      ["what", this._what],
      ["culprit", this._culpritId],
      ["victim", this._victimId],
      ["where", this._whereId],
      ["when", this._when],
      ["how", this._how],
    ];
    for (const [field, value] of required) {
      if (value === undefined || value === "")
        throw new AuthoringError(`case '${this._id}': ${field} is required`);
    }
    if (this._culpritId === this._victimId)
      throw new AuthoringError(`case '${this._id}': culprit and victim must be different people`);
    return {
      id: this._id,
      what: this._what!,
      culpritId: this._culpritId!,
      victimId: this._victimId!,
      whereId: this._whereId!,
      when: this._when!,
      how: this._how!,
      keyFact: this._keyFact,
    };
  }
}

export function defineCase(id: string): CaseBuilder {
  return new CaseBuilder(id);
}

// --- World assembly + cross-reference validation ---------------------------

type PersonInput = Person | PersonBuilder;
type FactionInput = Faction | FactionBuilder;
type CaseInput = CaseCore | CaseBuilder;

function assertUniqueIds(ids: string[], kind: string): void {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) throw new AuthoringError(`duplicate ${kind} id '${id}'`);
    seen.add(id);
  }
}

/**
 * Assemble an AuthoredWorld from builders (or already-built objects) and
 * validate every cross-reference: unique ids, faction membership, the
 * ally/rival web, and each case's culprit/victim/where pointing at real data.
 */
export function defineWorld(parts: {
  people?: PersonInput[];
  places?: Entity[];
  factions?: FactionInput[];
  cases?: CaseInput[];
}): AuthoredWorld {
  const people = (parts.people ?? []).map((p) => (p instanceof PersonBuilder ? p.build() : p));
  const places = parts.places ?? [];
  const factions = (parts.factions ?? []).map((f) =>
    f instanceof FactionBuilder ? f.build() : f,
  );
  const cases = (parts.cases ?? []).map((c) => (c instanceof CaseBuilder ? c.build() : c));

  assertUniqueIds(people.map((p) => p.id), "person");
  assertUniqueIds(places.map((p) => p.id), "place");
  assertUniqueIds(factions.map((f) => f.id), "faction");
  assertUniqueIds(cases.map((c) => c.id), "case");

  const personIds = new Set(people.map((p) => p.id));
  const placeIds = new Set(places.map((p) => p.id));
  const factionIds = new Set(factions.map((f) => f.id));

  for (const p of people) {
    if (p.factionId && !factionIds.has(p.factionId))
      throw new AuthoringError(`person '${p.id}': unknown factionId '${p.factionId}'`);
  }

  for (const f of factions) {
    for (const m of f.members) {
      if (!personIds.has(m.personId))
        throw new AuthoringError(`faction '${f.id}': member '${m.personId}' is not a defined person`);
    }
    for (const ally of f.allies ?? []) {
      if (!factionIds.has(ally))
        throw new AuthoringError(`faction '${f.id}': ally '${ally}' is not a defined faction`);
    }
    for (const rival of f.rivals ?? []) {
      if (!factionIds.has(rival))
        throw new AuthoringError(`faction '${f.id}': rival '${rival}' is not a defined faction`);
    }
  }

  for (const c of cases) {
    if (!personIds.has(c.culpritId))
      throw new AuthoringError(`case '${c.id}': culprit '${c.culpritId}' is not a defined person`);
    if (!personIds.has(c.victimId))
      throw new AuthoringError(`case '${c.id}': victim '${c.victimId}' is not a defined person`);
    if (!placeIds.has(c.whereId))
      throw new AuthoringError(`case '${c.id}': where '${c.whereId}' is not a defined place`);
  }

  return { cases, factions, people, places };
}
