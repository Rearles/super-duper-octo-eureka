import type { CaseRecord, GameCase } from "./types";

/**
 * Renders ground-truth facts into a player-facing document. The LLM renderer
 * (deferred) will implement this same interface — so the LLM is presentation
 * only and the game is correct without it (§14.3).
 */
export interface Renderer {
  render(record: CaseRecord, gameCase: GameCase): string;
}

/** No-LLM renderer: assembles document text from a record's claims. Always available. */
export class TemplateRenderer implements Renderer {
  render(record: CaseRecord, _gameCase: GameCase): string {
    const header = `${record.title}\n[${record.type} · fidelity recorded internally]`;
    const body = record.claims.map((c) => `  • ${c.text}`).join("\n");
    return `${header}\n${body}`;
  }
}
