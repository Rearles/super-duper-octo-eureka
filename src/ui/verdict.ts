import type { CaseSession, Disposition } from "../engine/index";

/** The two-layer verdict: name the culprit (factual) + choose a disposition (grey). */
export function renderVerdict(
  session: CaseSession,
  onCommit: (culpritId: string, disposition: Disposition) => void,
): HTMLElement {
  const el = document.createElement("section");
  el.className = "verdict";

  const heading = document.createElement("h2");
  heading.textContent = "Commit a verdict";
  el.appendChild(heading);

  if (session.closed) {
    const p = document.createElement("p");
    p.textContent = "The case is closed.";
    el.appendChild(p);
    return el;
  }

  const culpritSelect = document.createElement("select");
  for (const id of session.gameCase.suspects) {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = session.graph.entityName(id);
    culpritSelect.appendChild(opt);
  }
  el.appendChild(labeled("Factual finding — name the culprit:", culpritSelect));

  const dispSelect = document.createElement("select");
  const dispositions: Disposition[] = ["charge", "bury", "expose"];
  for (const d of dispositions) {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    dispSelect.appendChild(opt);
  }
  el.appendChild(labeled("Disposition (no clean answer):", dispSelect));

  const commit = document.createElement("button");
  commit.textContent = "Commit (this cannot be undone)";
  commit.addEventListener("click", () =>
    onCommit(culpritSelect.value, dispSelect.value as Disposition),
  );
  el.appendChild(commit);
  return el;
}

function labeled(text: string, control: HTMLElement): HTMLElement {
  const label = document.createElement("label");
  label.textContent = text;
  label.appendChild(control);
  return label;
}
