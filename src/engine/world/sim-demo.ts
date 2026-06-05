// A demo world spanning several blocs (gangs, the machine, the Unit) so the
// society-sim produces a cold-case backlog. FICTIONAL analogues only (GCD §4.2 —
// no real names/geography). Used by `npm run seed:sim` to populate the Registry
// from the simulation.
import { defineFaction, definePerson, defineWorld } from "../authoring";

export const simDemoWorld = defineWorld({
  people: [
    definePerson("rats-boss", "Cormac Teague").faction("river-rats"),
    definePerson("rats-soldier", "Pell Oding").faction("river-rats"),
    definePerson("crew-boss", "Sil Verga").faction("northside-crew"),
    definePerson("crew-soldier", "Doss Hane").faction("northside-crew"),
    definePerson("captain", "Capt. Hollis").faction("the-unit"),
    definePerson("alderman", "Ald. Renner").faction("the-hall"),
  ],
  factions: [
    defineFaction("river-rats", "The Riverfront Rats")
      .bloc("organized-crime")
      .temperament("vindictive")
      .interests("turf", "bootlegging")
      .member("rats-boss", "boss")
      .member("rats-soldier")
      .rivals("northside-crew")
      .allies("the-hall"),
    defineFaction("northside-crew", "The Northside Crew")
      .bloc("unorganized-crime")
      .temperament("opportunistic")
      .interests("turf")
      .member("crew-boss", "boss")
      .member("crew-soldier")
      .rivals("river-rats"),
    defineFaction("the-unit", "The Cold Case Unit")
      .bloc("law-enforcement")
      .temperament("principled")
      .interests("order", "the truth")
      .member("captain", "captain"),
    defineFaction("the-hall", "City Hall")
      .bloc("political-machine")
      .temperament("opportunistic")
      .interests("graft", "the rulings")
      .member("alderman", "alderman")
      .allies("river-rats"),
  ],
});
