import { describe, expect, it } from "vitest";
import { buildSubdivisionSaleDraftReadiness } from "./subdivisionSaleDraftReadiness";

describe("buildSubdivisionSaleDraftReadiness", () => {
  it("combina cobertura, participantes e revisão sem expor entidades do rascunho", () => {
    const items = buildSubdivisionSaleDraftReadiness(
      [{ saleDraftId: "draft-a" }, { saleDraftId: "draft-b" }],
      [{ saleDraftId: "draft-a", attachmentCoverageState: "attachment_private_upload_recorded" }],
      [{ saleDraftId: "draft-a", workPhase: "attachment_review" }],
      [{ saleDraftId: "draft-a" }, { saleDraftId: "draft-a" }, { saleDraftId: "draft-b" }],
    );

    expect(items).toEqual([
      expect.objectContaining({ ordinalLabel: "Rascunho interno 01", attachmentLabel: "Cobertura privada registrada", participantLabel: "2 co-compradores internos", workLabel: "Revisão de cobertura privada" }),
      expect.objectContaining({ ordinalLabel: "Rascunho interno 02", attachmentLabel: "Revisão de cobertura privada necessária", participantLabel: "1 co-comprador interno", workLabel: "Revisão humana necessária" }),
    ]);
  });

  it("mantém o estado sem participante e sem intenção privada como revisão interna", () => {
    const [item] = buildSubdivisionSaleDraftReadiness([{ saleDraftId: "draft-a" }], [], [], []);
    expect(item).toMatchObject({ linkLabel: "Vínculo interno registrado", attachmentLabel: "Revisão de cobertura privada necessária", participantLabel: "Sem co-comprador interno", workLabel: "Revisão humana necessária" });
  });
});
