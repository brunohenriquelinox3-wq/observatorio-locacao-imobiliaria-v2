import { describe, expect, it } from "vitest";
import { buildSubdivisionBuyerReadiness } from "./subdivisionBuyerReadiness";

describe("buildSubdivisionBuyerReadiness", () => {
  it("produz cartões operacionais com nome, situação e contatos mínimos", () => {
    const items = buildSubdivisionBuyerReadiness(
      [
        { buyerClientId: "buyer-a", displayName: "Cliente A", registrationState: "contact_pending", primaryPhone: null, messagingPhone: null },
        { buyerClientId: "buyer-b", displayName: "Cliente B", registrationState: "base_data_review", primaryPhone: "contato", messagingPhone: "mensagem" },
      ],
      [{ buyerClientId: "buyer-b", attachmentState: "private_upload_recorded" }],
    );

    expect(items.map((item) => [item.displayName, item.registrationLabel])).toEqual([
      ["Cliente A", "Contato a organizar"],
      ["Cliente B", "Cadastro em revisão"],
    ]);
    expect(items[1]).toMatchObject({ primaryPhone: "contato", messagingPhone: "mensagem" });
  });

  it("mantém documentos e detalhes fora da projeção operacional", () => {
    const [item] = buildSubdivisionBuyerReadiness(
      [{ buyerClientId: "buyer-a", displayName: "Cliente A", registrationState: "conditional_requirements_pending", primaryPhone: null, messagingPhone: null }],
      [{ buyerClientId: "buyer-a", attachmentState: "awaiting_private_upload" }],
    );

    expect(item).toMatchObject({ registrationLabel: "Conferência pendente", primaryPhone: null, messagingPhone: null });
    expect(item).not.toHaveProperty("attachmentLabel");
    expect(item).not.toHaveProperty("documentReference");
  });
});
