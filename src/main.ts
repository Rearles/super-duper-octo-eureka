import { CaseSession } from "./engine/index";
import { renderDesk } from "./ui/desk";
import { renderBoard } from "./ui/board";
import { renderVerdict } from "./ui/verdict";

const SEED = 7;
const session = new CaseSession(SEED);
const root = document.getElementById("app");

function render(outcome?: string): void {
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
  root.appendChild(
    renderVerdict(session, (culprit, disposition) => {
      const res = session.commitVerdict(culprit, disposition);
      render(`${res.correct ? "Factually sound." : "Factually wrong."} ${res.consequence}`);
    }),
  );

  if (outcome) {
    const box = document.createElement("aside");
    box.className = "outcome";
    box.textContent = outcome;
    root.appendChild(box);
  }
}

render();
