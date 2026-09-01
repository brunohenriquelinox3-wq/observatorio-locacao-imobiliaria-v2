import { describe, expect, it } from "vitest";
import { rentalAgendaSelectionLabel, rentalAssetSelectionLabel, rentalIntakeSelectionLabel, rentalPartySelectionLabel } from "./rentalContextSelection";

describe("rentalContextSelection", () => {
  it("cria rótulos de Party, entrada e ativo sem IDs técnicos", () => {
    expect(rentalPartySelectionLabel({ partyId: "party-1", displayName: "Parte autorizada", kind: "individual" })).toBe("Party em rascunho · Parte autorizada · Pessoa física");
    expect(rentalIntakeSelectionLabel({ intakeId: "intake-1", partyLabel: "Parte autorizada", journeyKind: "tenant_interest", stage: "qualification" })).toBe("Entrada · Parte autorizada · Interesse de locação · Qualificação");
    expect(rentalAssetSelectionLabel({ assetId: "asset-1", referenceLabel: "Ativo autorizado", internalReference: "LOC_001", kind: "apartment" })).toBe("Ativo em rascunho · Ativo autorizado · Apartamento · LOC_001");
  });
  it("cria rótulo de agenda sem data ou ID técnico", () => {
    expect(rentalAgendaSelectionLabel({ agendaId: "agenda-1", intakeId: "intake-1", intakeLabel: "Parte autorizada", journeyKind: "management_interest", scheduledFor: "2026-09-01T12:00:00.000Z", state: "scheduled" })).toBe("Agenda interna · Parte autorizada · Agendado");
  });
});
