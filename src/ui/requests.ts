import type { CaseSession } from "../engine/index";

/** The faction-dealings panel: requests inbox (verify/fulfill/refuse), contacts, and the Ledger (§2.5). */
export function renderRequests(session: CaseSession, onChange: () => void): HTMLElement {
  const el = document.createElement("section");
  el.className = "board";

  const heading = document.createElement("h2");
  heading.textContent = "Faction dealings";
  el.appendChild(heading);

  // --- Requests inbox ---
  const reqs = session.requests();
  if (reqs.length === 0) {
    const p = document.createElement("p");
    p.textContent = "No requests.";
    el.appendChild(p);
  }
  for (const req of reqs) {
    const card = document.createElement("div");
    card.className = "doc";

    const t = document.createElement("p");
    t.textContent = req.text;
    card.appendChild(t);

    if (req.revealed) {
      const fid = document.createElement("p");
      fid.textContent = `Verified — their claim is ${req.fidelity}.`;
      if (req.fidelity === "false" || req.fidelity === "biased") fid.className = "contradiction";
      card.appendChild(fid);
    }

    if (req.status === "open") {
      card.appendChild(
        button(req.revealed ? "Verified" : "Verify (−1 clearance)", () => {
          session.verifyRequest(req.id);
          onChange();
        }, req.revealed),
      );
      card.appendChild(button(`Fulfill (${req.ask})`, () => {
        session.fulfillRequest(req.id);
        onChange();
      }));
      card.appendChild(button("Refuse", () => {
        session.refuseRequest(req.id);
        onChange();
      }));
    } else {
      const s = document.createElement("p");
      s.className = "whisper";
      s.textContent = `— ${req.status}`;
      card.appendChild(s);
    }
    el.appendChild(card);
  }

  // --- Contacts (spend favors for access) ---
  const ch = document.createElement("h3");
  ch.textContent = "Contacts";
  el.appendChild(ch);
  const favorsByFaction = new Map(session.factions().map((f) => [f.factionId, f.favors]));
  for (const c of session.contacts()) {
    const favors = favorsByFaction.get(c.factionId) ?? 0;
    el.appendChild(
      button(
        `Call ${c.name} (${session.factionName(c.factionId)}) — ${favors} favor${favors === 1 ? "" : "s"}`,
        () => {
          session.callContact(c.personId);
          onChange();
        },
        favors < 1,
      ),
    );
  }

  // --- Decision Ledger (recent acts) ---
  if (session.ledger.length > 0) {
    const lh = document.createElement("h3");
    lh.textContent = "Decision Ledger";
    el.appendChild(lh);
    for (const entry of session.ledger.slice(-5)) {
      const p = document.createElement("p");
      p.className = "whisper";
      p.textContent = entry.note;
      el.appendChild(p);
    }
  }

  return el;
}

function button(label: string, onClick: () => void, disabled = false): HTMLButtonElement {
  const b = document.createElement("button");
  b.textContent = label;
  b.disabled = disabled;
  b.addEventListener("click", onClick);
  return b;
}
