// CLI: deterministically seed the Registry from the default authored world.
//   npm run seed            (SEED=7)
//   SEED=42 npm run seed
import { defaultWorld } from "../src/engine/world";
import { seedRegistry } from "./registry";

const SEED = Number(process.env["SEED"] ?? 7);

async function main(): Promise<void> {
  const rows = await seedRegistry(defaultWorld, SEED);
  const forged = rows.morticianRecords.filter((m) => m.fidelity !== "true").length;
  console.log(`Seeded the Registry (seed ${SEED}):`);
  console.log(`  ${rows.persons.length} people (+ ${rows.bindings.length} identity bindings)`);
  console.log(`  ${rows.locations.length} locations, ${rows.organizations.length} organizations`);
  console.log(`  ${rows.morticianRecords.length} mortician + ${rows.policeRecords.length} police records`);
  console.log(`  ${forged} forged record(s) — the cover-up seam (Pillar 1: discoverable lies)`);
}

main()
  .then(() => process.exit(0))
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  });
