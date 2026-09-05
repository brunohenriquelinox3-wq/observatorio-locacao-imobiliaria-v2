import { describe, expect, it } from "vitest";
import { applySubdivisionPhysicalStructureInputSchema, upsertSubdivisionDevelopmentRequirementInputSchema } from "./subdivisionPhysicalStructureContracts";

const context = { organizationId: "00000000-0000-4000-8000-000000000001", module: "loteadora", purposeCode: "CADASTRO_INICIAL" };

describe("contratos da estrutura física de loteamento", () => {
  it("aceita Quadras com Lotes e atributos físicos opcionais", () => {
    const result = applySubdivisionPhysicalStructureInputSchema.parse({ ...context, developmentId: "00000000-0000-4000-8000-000000000002", correlationId: "00000000-0000-4000-8000-000000000003", replaceExisting: false, blocks: [{ blockNumber: 1, sectorReference: "Setor norte", blockTypology: "regular", lots: [{ lotNumber: 1, areaSqm: 300, frontageM: 10, depthM: 30, lotTypology: "standard", positionCode: "internal" }] }] });
    expect(result.blocks[0].lots[0].areaSqm).toBe(300);
  });

  it("recusa repetição de Lote na Quadra e dados fora do limite físico", () => {
    expect(() => applySubdivisionPhysicalStructureInputSchema.parse({ ...context, developmentId: "00000000-0000-4000-8000-000000000002", correlationId: "00000000-0000-4000-8000-000000000003", replaceExisting: false, blocks: [{ blockNumber: 1, lots: [{ lotNumber: 1 }, { lotNumber: 1 }] }] })).toThrow();
    expect(() => applySubdivisionPhysicalStructureInputSchema.parse({ ...context, developmentId: "00000000-0000-4000-8000-000000000002", correlationId: "00000000-0000-4000-8000-000000000003", replaceExisting: false, blocks: [{ blockNumber: 1, lots: [{ lotNumber: 1, areaSqm: 0 }] }] })).toThrow();
  });

  it("restringe estados do dossiê a estados de trabalho, sem aprovação inferida", () => {
    expect(upsertSubdivisionDevelopmentRequirementInputSchema.parse({ ...context, developmentId: "00000000-0000-4000-8000-000000000002", correlationId: "00000000-0000-4000-8000-000000000003", requirementCode: "municipal_approval", requirementState: "pending_evidence" }).requirementState).toBe("pending_evidence");
    expect(() => upsertSubdivisionDevelopmentRequirementInputSchema.parse({ ...context, developmentId: "00000000-0000-4000-8000-000000000002", correlationId: "00000000-0000-4000-8000-000000000003", requirementCode: "municipal_approval", requirementState: "approved" })).toThrow();
  });
});
