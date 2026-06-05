// CLI: run the society-sim and persist its cold-case backlog into the Registry.
//   npm run seed:sim                 (SEED=7, TICKS=60)
//   SEED=42 TICKS=120 npm run seed:sim
import { simDemoWorld } from "../src/engine/world";
import { persistBacklog } from "./simRegistry";

const SEED = Number(process.env["SEED"] ?? 7);
const TICKS = Number(process.env["TICKS"] ?? 60);

async function main(): Promise<void> {
  const r = await persistBacklog(simDemoWorld, SEED, TICKS);
  console.log(`Sim backlog persisted (seed ${SEED}, ${TICKS} ticks):`);
  console.log(`  ${r.cases} cold cases, ${r.records} sim-authored records`);
  console.log(`  ${r.groundTruth} hidden ground-truth events (the answer key — never exposed)`);
}

main()
  .then(() => process.exit(0))
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  });
