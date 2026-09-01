import { describe, expect, it } from "vitest";
import { attachmentIntentSelectionLabel, buyerClientSelectionLabel, saleDraftSelectionLabel } from "./subdivisionDraftSelection";

const roles = [{ partyRoleAssignmentId: "role-1", displayName: "Parte autorizada", role: "buyer" }];
const clients = [{ buyerClientId: "client-1", partyRoleAssignmentId: "role-1" }];

describe("subdivisionDraftSelection", () => {
  it("compõe um rótulo de cliente com a referência contextual, sem ID técnico", () => {
    expect(buyerClientSelectionLabel(clients[0], roles)).toBe("Cliente comprador · Parte autorizada · Comprador");
  });

  it("mantém rótulos seguros para intenção privada e rascunho de venda", () => {
    expect(attachmentIntentSelectionLabel({ buyerClientId: "client-1" }, clients, roles)).toBe("Intenção privada · Cliente comprador · Parte autorizada · Comprador");
    expect(saleDraftSelectionLabel({ buyerClientId: "client-1" }, clients, roles)).toBe("Rascunho de venda · Cliente comprador · Parte autorizada · Comprador");
  });

  it("falha de forma opaca quando a referência contextual não está disponível", () => {
    expect(buyerClientSelectionLabel({ buyerClientId: "client-2", partyRoleAssignmentId: "role-2" }, roles)).toBe("Cliente comprador em rascunho");
  });
});
