// Browser-safe client for the Registry API (server/index.ts). The Prisma client
// is Node-only; the browser engine reaches the persisted Registry over HTTP
// through here. ADDITIVE: the in-memory MVP loop still runs without a server —
// this is the seam the persisted-Registry path (and, later, the sim's records)
// flow through. The full async rewire of CaseSession is deferred until a consumer
// needs server-sourced cases (the event->record pipeline plan), so the synchronous
// MVP loop and its tests stay intact.

const BASE =
  (import.meta.env.VITE_REGISTRY_URL as string | undefined) ?? "http://127.0.0.1:8787";

/** A person row as the API returns it (JSON-encoded shim fields as strings). */
export interface RegistryPerson {
  id: string;
  name: string;
  aliases: string;
  features: string;
  binding?: { id: string; personId: string; trueName: string; trueFeatures: string } | null;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Registry ${path}: ${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

export const registryClient = {
  counts: () => get<Record<string, number>>("/registry/counts"),
  people: () => get<RegistryPerson[]>("/registry/people"),
  person: (id: string) => get<RegistryPerson>(`/registry/person/${encodeURIComponent(id)}`),
  recordsAbout: (id: string) =>
    get<{ mortician: unknown[]; police: unknown[] }>(
      `/registry/person/${encodeURIComponent(id)}/records`,
    ),
};
