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
      parcelingMode: "loteamento",
      territorialContext: "urban_expansion",
      predominantUse: "residential",
      territorialReference: "Região de referência",
      identificationNote: "Classificação interna em revisão.",
    });
    expect(result.internalReference).toBe("JARDINS_DO_SUL");
    expect(result.parcelingMode).toBe("loteamento");
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
      parcelingMode: "to_review",
      territorialContext: "to_review",
      predominantUse: "to_review",
      territorialReference: null,
      identificationNote: null,
    })).toThrow("Município e UF");
    expect(() => updateSubdivisionDevelopmentStudioInputSchema.parse({ ...context, developmentId: "not-a-uuid" })).toThrow();
  });

  it("recusa referência territorial curta e valores fora das listas controladas", () => {
    expect(() => createSubdivisionDevelopmentStudioInputSchema.parse({
      ...context,
      internalReference: "JARDINS_DO_SUL",
      displayName: "Jardins do Sul",
      developmentKind: "residential",
      municipality: null,
      stateCode: null,
      plannedStageCount: 1,
      workingPhase: "preliminary_reference",
      internalNote: null,
      parcelingMode: "loteamento",
      territorialContext: "urban",
      predominantUse: "residential",
      territorialReference: "X",
      identificationNote: null,
    })).toThrow();
    expect(() => createSubdivisionDevelopmentStudioInputSchema.parse({
      ...context,
      internalReference: "JARDINS_DO_SUL",
      displayName: "Jardins do Sul",
      developmentKind: "residential",
      municipality: null,
      stateCode: null,
      plannedStageCount: 1,
      workingPhase: "preliminary_reference",
      internalNote: null,
      parcelingMode: "invalid",
      territorialContext: "urban",
      predominantUse: "residential",
      territorialReference: null,
      identificationNote: null,
    })).toThrow();
  });
});
