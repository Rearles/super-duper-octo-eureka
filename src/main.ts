import { CaseSession } from "./engine/index";
import { renderDesk } from "./ui/desk";
import { renderBoard } from "./ui/board";
import { renderFactions } from "./ui/factions";
import { renderVerdict } from "./ui/verdict";

const SEED = 7;
const session = new CaseSession(SEED);
const root = document.getElementById("app");

function fmt(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}

function render(outcomeLines?: string[]): void {
  if (!root) return;
  root.replaceChildren();

  const header = document.createElement("header");
  const h1 = document.createElement("h1");
  h1.textContent = "Mound City — MVP prototype";
  const sub = document.createElement("p");
  sub.textContent =
    `Cold Case #${SEED}. Read the file, pull records, catch the lie, commit a verdict.`;
  header.append(h1, sub);
  root.appendChild(header);

  root.appendChild(
    renderDesk(session, (id) => {
      session.request(id);
      render();
    }),
  );
  root.appendChild(renderBoard(session));
  root.appendChild(renderFactions(session));
  root.appendChild(
    renderVerdict(session, (culprit, disposition) => {
      const res = session.commitVerdict(culprit, disposition);
      // §2.4 confirmation-by-doing: no "correct/incorrect" grade — the player reads
      // the truth from the world's reaction (the consequence + how the factions move).
      const shifts = res.reactions.map(
        (r) =>
          `${session.factionName(r.factionId)}: Standing ${fmt(r.standingDelta)}, Heat ${fmt(r.heatDelta)} — ${r.reason}`,
      );
      render([res.consequence, ...shifts]);
    }),
  );

  if (outcomeLines && outcomeLines.length > 0) {
    const box = document.createElement("aside");
    box.className = "outcome";
    for (const line of outcomeLines) {
      const p = document.createElement("p");
      p.textContent = line;
      box.appendChild(p);
    }
    root.appendChild(box);
  }
}

render();
