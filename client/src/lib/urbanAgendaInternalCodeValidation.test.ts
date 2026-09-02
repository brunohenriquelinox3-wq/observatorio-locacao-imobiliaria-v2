import { describe, expect, it } from "vitest";
import { validateUrbanAgendaInternalCode } from "./urbanAgendaInternalCodeValidation";

describe("validateUrbanAgendaInternalCode", () => {
  it("mantém o código opcional ausente", () => {
    expect(validateUrbanAgendaInternalCode("  ")).toEqual({ valid: true, value: undefined });
  });

  it("normaliza e aceita o código permitido", () => {
    expect(validateUrbanAgendaInternalCode(" em_revisao ")).toEqual({ valid: true, value: "EM_REVISAO" });
  });

  it("bloqueia formato inválido", () => {
    expect(validateUrbanAgendaInternalCode("12")).toEqual({ valid: false, message: "Use um código de 3 a 80 caracteres: letra inicial, letras, números ou sublinhado." });
  });
});
