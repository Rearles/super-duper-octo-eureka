// The default authored world the engine loads. Swap or extend with more
// authored worlds as the case-author interview produces them.
import { buriedWitnessWorld } from "./buriedWitness";

export { buriedWitnessWorld };

/** The world `CaseSession` loads by default. */
export const defaultWorld = buriedWitnessWorld;
