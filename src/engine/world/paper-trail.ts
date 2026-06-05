// Paper Trail — a hand-authored Mound City world with two linked cold cases.
//
// This is the HAND-AUTHORED base layer (edit it freely); the generator builds
// the record layer + extra cast on top. Produced via the builder API exactly as
// the case-author interview (docs/authoring-interview.md) would emit it.
//
// PREMISE: a chained cover-up. A bought permits official (Edmund Crase) dies,
// ruled natural causes; the reporter who exposed the corrupt Calder Row deal
// (June Marsh) dies too, ruled an accidental hit-and-run. ONE fixer (Roy Skell)
// did both, on behalf of the Calder Group development syndicate, with City Hall
// issuing the tidy rulings.
//
// What the AUTHOR fixed as ground truth (here): the two scenes, the seven key
// people, the three factions, and the two case cores (the real culprit + crux).
//
// What PROCGEN owns and will layer on top (NOT authored here):
//   - the false theories that muddy Skell's guilt ("boss + enforcer", "two
//     different hands") — red herrings planted against each case's keyFact;
//   - June Marsh's vanished body + the compromised mortician (morgue thread,
//     surfaced via a death report);
//   - the lost notes; the sham trial + bribed judge that imprisoned the innocent
//     driver; the ongoing intimidation of the remaining press;
//   - the case-2 "where" deepening (a secondary contradiction beyond the "who" crux);
//   - the rest of the cast (witnesses, bystanders) and ALL records/leads/distortions.

import { defineCase, defineFaction, definePerson, definePlace, defineWorld } from "../authoring";

export const paperTrailWorld = defineWorld({
  places: [
    // The two scenes the player starts with. The morgue, newsroom, City Hall
    // permits office, and Calder Row development are discovered through play.
    definePlace("study", "Edmund Crase's home study"),
    definePlace("garage", "the City Ledger parking garage"),
  ],

  people: [
    // Principals (authored). Procgen casts the remaining witnesses & bystanders.
    definePerson("official", "Edmund Crase").faction("the-machine"),
    definePerson("reporter", "June Marsh").faction("the-press"),
    definePerson("fixer", "Roy Skell").faction("the-syndicate"),
    // The innocent driver the RECORD falsely implicates — authored, but NOT the
    // culprit. Wrong place, wrong time; now imprisoned after a sham trial.
    definePerson("driver", "Danny Okafor"),
    // Faction members who matter.
    definePerson("developer", "Sloane Calder").faction("the-syndicate"),
    definePerson("editor", "Margaret Dorn").faction("the-press"),
    definePerson("mortician", "Elias Pruitt").faction("the-machine"),
  ],

  factions: [
    defineFaction("the-syndicate", "The Calder Group")
      .bloc("business-industry")
      .describe(
        "A development syndicate that buys what it needs and erases what it can't — insulated, moneyed, and protective of its own.",
      )
      .temperament("protective")
      .interests(
        "the Calder Row development",
        "the rezoning deal",
        "money",
        "Roy Skell",
        "keeping the case rulings closed",
      )
      .member("developer", "developer")
      .member("fixer", "fixer")
      .allies("the-machine")
      .rivals("the-press"),

    defineFaction("the-press", "The City Ledger")
      .bloc("press")
      .describe(
        "The city's paper of record, gutted by intimidation but not silenced — still chasing the story that killed June Marsh.",
      )
      .temperament("principled")
      .interests(
        "the story",
        "June Marsh",
        "the lost notes",
        "scandal involving the powerful",
        "the Calder Row deal",
      )
      .member("reporter", "reporter")
      .member("editor", "editor")
      .rivals("the-syndicate", "the-machine"),

    defineFaction("the-machine", "City Hall")
      .bloc("political-machine")
      .describe(
        "The permits-and-coroner apparatus that issues tidy rulings — natural causes, accidental death — for the right friends.",
      )
      .temperament("opportunistic")
      .interests(
        "its own reputation",
        "the case rulings",
        "the Calder Row permits",
        "the favor it owes the Syndicate",
        "avoiding scandal",
      )
      .member("official", "permits official")
      .member("mortician", "mortician")
      .allies("the-syndicate")
      .rivals("the-press"),
  ],

  cases: [
    // Case 1 — the official's death, ruled natural causes. Crux: HOW he died.
    defineCase("crase-natural")
      .what("a fatal 'heart attack' closed and buried by morning — no autopsy, no inquiry")
      .culprit("fixer")
      .victim("official")
      .where("study")
      .when("0115")
      .how("injected with a drug that stops the heart, leaving a scene that reads as natural")
      .keyFact("how"),

    // Case 2 — the reporter's death, ruled an accident. Crux: WHO really did it.
    defineCase("marsh-accident")
      .what(
        "a death ruled an accidental hit-and-run, pinned on an innocent driver now imprisoned after a sham trial — the body since lost",
      )
      .culprit("fixer")
      .victim("reporter")
      .where("garage")
      .when("2300")
      .how("shoved into the path of a passing car so an innocent driver struck her, staging an accident")
      .keyFact("who"),
  ],
});
