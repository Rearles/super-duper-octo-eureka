import type { CaseSession } from "../engine/index";

/** The Board: flags that two held records disagree — never what it means. */
export function renderBoard(session: CaseSession): HTMLElement {
  const el = document.createElement("section");
  el.className = "board";

  const heading = document.createElement("h2");
  heading.textContent = "The Board";
  el.appendChild(heading);

  const contradictions = session.contradictions();
  if (contradictions.length === 0) {
    const p = document.createElement("p");
    p.textContent = "No contradictions surfaced yet.";
    el.appendChild(p);
    return el;
  }

  const ul = document.createElement("ul");
  for (const c of contradictions) {
    const subject = session.graph.entityName(c.subject);
    const a = session.graph.entityName(c.objectA);
    const b = session.graph.entityName(c.objectB);
    const li = document.createElement("li");
    li.className = "contradiction";
    li.textContent = `⚑ ${subject}: “${a}” vs “${b}” — two records disagree.`;
    ul.appendChild(li);
  }
  el.appendChild(ul);
  return el;
}
