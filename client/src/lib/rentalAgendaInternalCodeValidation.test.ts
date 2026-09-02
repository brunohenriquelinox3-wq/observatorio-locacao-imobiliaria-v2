import { describe, expect, it } from "vitest";
import { validateRentalAgendaInternalCode } from "./rentalAgendaInternalCodeValidation";

describe("validateRentalAgendaInternalCode", () => {
  it("mantém o código opcional ausente", () => expect(validateRentalAgendaInternalCode(" ")).toEqual({ valid: true, value: undefined }));
  it("normaliza e aceita código permitido", () => expect(validateRentalAgendaInternalCode(" em_revisao ")).toEqual({ valid: true, value: "EM_REVISAO" }));
  it("bloqueia formato inválido", () => expect(validateRentalAgendaInternalCode("12")).toEqual({ valid: false, message: "Use um código de 3 a 80 caracteres: letra inicial, letras, números ou sublinhado." }));
});
