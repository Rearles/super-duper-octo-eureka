// The default authored world the engine loads. Swap or extend with more
// authored worlds as the case-author interview produces them.
import { paperTrailWorld } from "./paper-trail";

export { paperTrailWorld };

/** The world `CaseSession` loads by default. */
export const defaultWorld = paperTrailWorld;
