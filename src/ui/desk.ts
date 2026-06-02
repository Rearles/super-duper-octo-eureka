import type { CaseSession } from "../engine/index";

/** The Desk: clearance, the whisper, obtained documents, and requestable leads. */
export function renderDesk(
  session: CaseSession,
  onRequest: (recordId: string) => void,
): HTMLElement {
  const el = document.createElement("section");
  el.className = "desk";

  const heading = document.createElement("h2");
  heading.textContent = "The Desk";
  el.appendChild(heading);

  const clearance = document.createElement("p");
  clearance.className = "clearance";
  clearance.innerHTML = `Clearance remaining: <strong>${session.clearance}</strong>`;
  el.appendChild(clearance);

  const whisper = document.createElement("p");
  whisper.className = "whisper";
  whisper.textContent = `“${session.whisper()}”`;
  el.appendChild(whisper);

  const docs = document.createElement("div");
  docs.className = "documents";
  for (const rec of session.obtainedRecords()) {
    const card = document.createElement("article");
    card.className = "doc";
    const pre = document.createElement("pre");
    pre.textContent = session.render(rec.id);
    card.appendChild(pre);
    docs.appendChild(card);
  }
  el.appendChild(docs);

  const leads = document.createElement("div");
  leads.className = "leads";
  const lh = document.createElement("h3");
  lh.textContent = "Requestable leads";
  leads.appendChild(lh);

  const available = session.availableRequests();
  if (available.length === 0) {
    const none = document.createElement("p");
    none.textContent = "No further leads.";
    leads.appendChild(none);
  } else {
    for (const rec of available) {
      const btn = document.createElement("button");
      btn.textContent = `Request: ${rec.title} (clearance ${rec.clearanceCost})`;
      btn.disabled = session.closed || session.clearance < rec.clearanceCost;
      btn.addEventListener("click", () => onRequest(rec.id));
      leads.appendChild(btn);
    }
  }
  el.appendChild(leads);
  return el;
}
