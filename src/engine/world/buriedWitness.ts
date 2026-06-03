// Buried Witness — a Buried Witness case core plus two factions.
// Retained as a TEST FIXTURE (engine/authoring/factions/requests/snapshot specs
// import it directly). The live default world is now ./paper-trail (see index.ts).
// This is the HAND-AUTHORED base layer (edit it freely); the generator builds
// the record layer + extra cast on top. Produced via the builder API exactly as
// the case-author interview (docs/authoring-interview.md) would emit it.
//
// The culprit (Cole Voss) is planted inside The Heights so a case implicating
// him gives that faction high emergent stakes (GCD §2.5) — a worked example.

import { defineCase, defineFaction, definePerson, definePlace, defineWorld } from "../authoring";

export const buriedWitnessWorld = defineWorld({
  places: [
    definePlace("flat", "the victim's flat on Delmar"),
    definePlace("heights", "the Heights enclaves"),
  ],

  people: [
    // Principals (authored). Procgen casts the witness + bystanders.
    definePerson("victim", "Mara Hale"),
    definePerson("culprit", "Cole Voss").faction("the-heights"),
    // A couple of faction members who matter.
    definePerson("reporter", "Iris Pike").faction("the-press"),
    definePerson("editor", "Dale Frey").faction("the-press"),
    definePerson("patron", "Vera Mott").faction("the-heights"),
  ],

  factions: [
    defineFaction("the-press", "The City Ledger")
      .describe("The city's newspaper of record — hungry for a scandal, wary of the powerful.")
      .temperament("opportunistic")
      .interests("scandal", "the powerful", "the Registry", "Cole Voss")
      .member("reporter", "reporter")
      .member("editor", "editor")
      .rivals("the-heights"),

    defineFaction("the-heights", "The Heights")
      .describe("Old money in the enclaves — insulated, connected, and protective of its own.")
      .temperament("protective")
      .interests("old money", "the Heights enclaves", "their reputation", "Cole Voss")
      .member("culprit", "scion")
      .member("patron", "patron")
      .rivals("the-press"),
  ],

  cases: [
    defineCase("buried-witness")
      .what("a death at the victim's flat, ruled inconclusive")
      .culprit("culprit")
      .victim("victim")
      .where("flat")
      .when("2300")
      .how("struck during a late-night argument")
      .keyFact("where"),
  ],
});
