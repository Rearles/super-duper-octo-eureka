// Splittable, deterministic PRNG for the procgen-v2 framework. Hierarchical
// seeding: a root rng derives independent child streams by label, so realizing
// entity #N yields the same values regardless of order (the lazy-realization
// invariant). Pure (browser + Node); mirrors the mulberry32 shape used elsewhere.

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

function mulberry32(a: number): () => number {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Rng {
  /** next float in [0, 1) */
  next(): number;
  /** integer in [0, maxExclusive) */
  int(maxExclusive: number): number;
  /** uniform pick from a non-empty array */
  pick<T>(arr: readonly T[]): T;
  /** true with probability p (default 0.5) */
  bool(p?: number): boolean;
  /** an independent child stream, deterministic per (this seed, label) and
   *  INDEPENDENT of how many times this rng has been advanced (order-independent) */
  derive(label: string): Rng;
}

export function createRng(seed: number | string): Rng {
  const root = typeof seed === "number" ? seed >>> 0 : xmur3(seed);
  const gen = mulberry32(root);
  return {
    next: () => gen(),
    int: (maxExclusive: number) => Math.floor(gen() * Math.max(1, maxExclusive)),
    pick: <T>(arr: readonly T[]): T => arr[Math.floor(gen() * arr.length)] as T,
    bool: (p = 0.5) => gen() < p,
    derive: (label: string): Rng => createRng(xmur3(`${root}:${label}`)),
  };
}
