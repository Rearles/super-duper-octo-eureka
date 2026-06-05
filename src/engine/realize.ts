// Lazy, deterministic realization (procgen-v2). The sim runs coarse; a person or
// place is fully materialized only when TOUCHED (by an event or the detective) —
// but seed-derived, so realizing entity #N later is identical to realizing it
// early (the lazy-realization invariant). A cache makes repeat touches stable and
// cheap. Pure. The world stays vast without realizing everyone up front.
import { createRng, type Rng } from "./rng";
import type { Entity, EntityType } from "./types";

const FIRST = ["Mara", "Cole", "Iris", "Dale", "Vera", "Otis", "Nell", "Roy", "Ada", "Sol"];
const LAST = ["Hale", "Voss", "Pike", "Frey", "Mott", "Lund", "Crane", "Webb", "Dunn", "Ash"];
const PLACES = ["the Kerry Patch flats", "the Riverfront docks", "the Gateway annex", "the Heights"];

export class Realizer {
  private readonly cache = new Map<string, Entity>();

  constructor(private readonly rootSeed: number | string) {}

  /** Materialize an entity on touch — deterministic per (rootSeed, id), cached. */
  realize(id: string, kind: EntityType = "person"): Entity {
    const hit = this.cache.get(id);
    if (hit) return hit;
    // derive a child stream keyed ONLY by id, so order of realization never matters
    const rng = createRng(this.rootSeed).derive(id);
    const entity = this.materialize(id, kind, rng);
    this.cache.set(id, entity);
    return entity;
  }

  private materialize(id: string, kind: EntityType, rng: Rng): Entity {
    const name =
      kind === "person"
        ? `${rng.pick(FIRST)} ${rng.pick(LAST)}`
        : kind === "place"
          ? rng.pick(PLACES)
          : id;
    return { id, type: kind, name };
  }

  /** The ids realized so far (the touched set). */
  realized(): string[] {
    return [...this.cache.keys()];
  }
}
