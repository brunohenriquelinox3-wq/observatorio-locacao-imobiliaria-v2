import { describe, expect, it } from "vitest";
import { createSubdivisionDevelopmentStudioInputSchema, updateSubdivisionDevelopmentStudioInputSchema } from "./subdivisionDevelopmentStudioContracts";

const context = {
  organizationId: "00000000-0000-4000-8000-000000000001",
  module: "loteadora" as const,
  purposeCode: "SUBDIVISION_STUDIO",
  correlationId: "00000000-0000-4000-8000-000000000002",
};

describe("contratos do estúdio de loteamentos", () => {
  it("aceita o cadastro mínimo de planejamento sem coordenada, matrícula ou financeiro", () => {
    const result = createSubdivisionDevelopmentStudioInputSchema.parse({
      ...context,
      internalReference: "JARDINS_DO_SUL",
      displayName: "Jardins do Sul",
      developmentKind: "residential",
      municipality: "Cidade teste",
      stateCode: "SP",
      plannedStageCount: 3,
      workingPhase: "structuring",
      internalNote: "Preparação interna.",
    });
    expect(result.internalReference).toBe("JARDINS_DO_SUL");
  });

  it("recusa UF sem município e impede dados fora da estrutura tipada", () => {
    expect(() => createSubdivisionDevelopmentStudioInputSchema.parse({
      ...context,
      internalReference: "JARDINS_DO_SUL",
      displayName: "Jardins do Sul",
      developmentKind: "residential",
      municipality: null,
      stateCode: "SP",
      plannedStageCount: 1,
      workingPhase: "preliminary_reference",
      internalNote: null,
    })).toThrow("Município e UF");
    expect(() => updateSubdivisionDevelopmentStudioInputSchema.parse({ ...context, developmentId: "not-a-uuid" })).toThrow();
  });
});
