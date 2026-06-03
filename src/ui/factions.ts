import type { CaseSession } from "../engine/index";

/** Glanceable per-faction Standing/Heat indicators (§2.5 / §12.3). */
export function renderFactions(session: CaseSession): HTMLElement {
  const el = document.createElement("section");
  el.className = "board";

  const heading = document.createElement("h2");
  heading.textContent = "Factions";
  el.appendChild(heading);

  const factions = session.factions();
  if (factions.length === 0) {
    const p = document.createElement("p");
    p.textContent = "No factions in play.";
    el.appendChild(p);
    return el;
  }

  for (const f of factions) {
    const row = document.createElement("p");
    if (f.heat >= 5) row.className = "contradiction";
    const heatTag = f.heat >= 5 ? " 🔥" : "";
    row.textContent =
      `${session.factionName(f.factionId)} — Standing ${fmt(f.standing)} · Heat ${f.heat}${heatTag}`;
    el.appendChild(row);
  }
  return el;
}

function fmt(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}
