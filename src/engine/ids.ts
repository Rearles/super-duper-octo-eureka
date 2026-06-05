// Deterministic, seed-derived id generation for the Registry.
//
// Same seed -> identical ids, so generated worlds and persisted rows are
// reproducible (GCD determinism / Pillar 1). NEVER use crypto.randomUUID() for
// world content. This is pure (browser + Node safe) and mirrors the engine's
// mulberry32 PRNG shape (src/engine/generator.ts). The hierarchical `derive`
// gives the procgen-v2 framework its splittable, order-independent seeding.

/** xmur3 string hash -> 32-bit unsigned seed. */
function xmur3(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

/** mulberry32 PRNG — matches the generator's PRNG so streams stay consistent. */
function mulberry32(a: number): () => number {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hex(rng: () => number, len: number): string {
  let s = "";
  while (s.length < len) s += Math.floor(rng() * 16).toString(16);
  return s.slice(0, len);
}

/** A GUID-shaped deterministic id body: 8-4-4-4-12 hex. */
function guidBody(rng: () => number): string {
  return `${hex(rng, 8)}-${hex(rng, 4)}-${hex(rng, 4)}-${hex(rng, 4)}-${hex(rng, 12)}`;
}

export interface IdFactory {
  /**
   * Next deterministic id in a named stream (e.g. "person", "police"). Stable
   * per (seed, namespace, call-order): the Nth `next("person")` is always the
   * same id. Shaped `pre_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`.
   */
  next(namespace: string): string;
  /**
   * A child factory deterministically derived from this one + a label
   * (hierarchical / splittable seeding). Realizing entity #N via a child factory
   * yields the same id regardless of when it's realized — the lazy-realization
   * invariant the procgen-v2 framework relies on.
   */
  derive(label: string): IdFactory;
}

/** Create a deterministic id factory rooted at a numeric or string seed. */
export function createIdFactory(seed: number | string): IdFactory {
  const root = typeof seed === "number" ? seed >>> 0 : xmur3(seed);
  const counters = new Map<string, number>();
  return {
    next(namespace: string): string {
      const n = counters.get(namespace) ?? 0;
      counters.set(namespace, n + 1);
      const rng = mulberry32(xmur3(`${root}:${namespace}:${n}`));
      const prefix = (namespace.slice(0, 3) || "id").toLowerCase();
      return `${prefix}_${guidBody(rng)}`;
    },
    derive(label: string): IdFactory {
      return createIdFactory(xmur3(`${root}:${label}`));
    },
  };
}
