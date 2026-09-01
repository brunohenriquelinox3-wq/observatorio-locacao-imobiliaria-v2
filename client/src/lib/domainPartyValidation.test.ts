import { describe, expect, it } from "vitest";
import { validateDraftPartyDisplayName } from "./domainPartyValidation";

describe("validateDraftPartyDisplayName", () => {
  it("rejeita valor vazio depois de remover espaços", () => {
    expect(validateDraftPartyDisplayName("   ")).toEqual({
      valid: false,
      message: "Informe o nome de exibição necessário ao rascunho.",
    });
  });

  it("rejeita nome menor que o mínimo do contrato", () => {
    expect(validateDraftPartyDisplayName("A")).toEqual({
      valid: false,
      message: "Use pelo menos 2 caracteres no nome de exibição.",
    });
  });

  it("normaliza um nome válido antes da mutação", () => {
    expect(validateDraftPartyDisplayName("  Parte de teste  ")).toEqual({
      valid: true,
      normalizedValue: "Parte de teste",
    });
  });

  it("rejeita valor maior que o máximo do contrato", () => {
    expect(validateDraftPartyDisplayName("A".repeat(161))).toEqual({
      valid: false,
      message: "Use no máximo 160 caracteres no nome de exibição.",
    });
  });
});
