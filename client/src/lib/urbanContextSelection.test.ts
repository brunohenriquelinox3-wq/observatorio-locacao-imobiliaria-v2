import { describe, expect, it } from "vitest";
import { urbanAgendaSelectionLabel, urbanAssetSelectionLabel, urbanLeadSelectionLabel, urbanPartySelectionLabel } from "./urbanContextSelection";

describe("urbanContextSelection", () => {
  it("cria rótulos de Party, Lead e Ativo sem expor IDs técnicos", () => {
    expect(urbanPartySelectionLabel({ partyId: "party-1", displayName: "Parte autorizada", kind: "individual" })).toBe("Party em rascunho · Parte autorizada · Pessoa física");
    expect(urbanLeadSelectionLabel({ leadId: "lead-1", partyLabel: "Parte autorizada", sourceCode: "OPERADOR", interestKind: "urban_asset", stage: "qualification" })).toBe("Lead · Parte autorizada · Qualificação");
    expect(urbanAssetSelectionLabel({ assetId: "asset-1", referenceLabel: "Ativo autorizado", internalReference: "VU_001", kind: "apartment" })).toBe("Ativo em rascunho · Ativo autorizado · Apartamento · VU_001");
  });

  it("cria rótulo de agenda sem data técnica ou identificador", () => {
    expect(urbanAgendaSelectionLabel({ agendaId: "agenda-1", leadId: "lead-1", leadLabel: "Parte autorizada", scheduledFor: "2026-09-01T12:00:00.000Z", state: "scheduled" })).toBe("Agenda interna · Parte autorizada · Agendada");
  });
});
