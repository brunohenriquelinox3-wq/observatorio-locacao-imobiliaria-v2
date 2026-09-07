import { describe, expect, it } from "vitest";
import { attachmentIntentSelectionLabel, buyerClientSelectionLabel, saleDraftSelectionLabel } from "./subdivisionDraftSelection";

const roles = [{ partyRoleAssignmentId: "role-1", displayName: "Parte autorizada", role: "buyer" }];
const clients = [{ buyerClientId: "client-1", partyRoleAssignmentId: "role-1" }];

describe("subdivisionDraftSelection", () => {
  it("compõe um rótulo de cliente com a referência contextual, sem ID técnico", () => {
    expect(buyerClientSelectionLabel(clients[0], roles)).toBe("Cliente · Parte autorizada");
  });

  it("mantém rótulos seguros para documento privado e preparação de venda", () => {
    expect(attachmentIntentSelectionLabel({ buyerClientId: "client-1" }, clients, roles)).toBe("Documento privado · Cliente · Parte autorizada");
    expect(saleDraftSelectionLabel({ buyerClientId: "client-1" }, clients, roles)).toBe("Preparação de venda · Cliente · Parte autorizada");
  });

  it("falha de forma opaca quando a referência contextual não está disponível", () => {
    expect(buyerClientSelectionLabel({ buyerClientId: "client-2", partyRoleAssignmentId: "role-2" }, roles)).toBe("Cliente Loteadora");
  });
});
