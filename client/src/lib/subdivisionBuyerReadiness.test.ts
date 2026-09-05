import { describe, expect, it } from "vitest";
import { buildSubdivisionBuyerReadiness } from "./subdivisionBuyerReadiness";

describe("buildSubdivisionBuyerReadiness", () => {
  it("produz rótulos ordinais sem identificar a pessoa e preserva a cobertura opaca", () => {
    const items = buildSubdivisionBuyerReadiness(
      [{ buyerClientId: "buyer-a" }, { buyerClientId: "buyer-b" }],
      [{ buyerClientId: "buyer-b", attachmentState: "private_upload_recorded" }],
    );

    expect(items.map((item) => [item.ordinalLabel, item.attachmentLabel])).toEqual([
      ["Cliente em rascunho 01", "Sem intenção privada registrada"],
      ["Cliente em rascunho 02", "Cobertura privada registrada"],
    ]);
  });

  it("trata o ciclo pendente sem expor dados do anexo", () => {
    const [item] = buildSubdivisionBuyerReadiness(
      [{ buyerClientId: "buyer-a" }],
      [{ buyerClientId: "buyer-a", attachmentState: "awaiting_private_upload" }],
    );

    expect(item).toMatchObject({ attachmentLabel: "Intenção privada aguardando ciclo", reviewLabel: "Revisão humana necessária" });
  });
});
