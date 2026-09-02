import { describe, expect, it } from "vitest";
import { validateRentalManagementNoteCode } from "./rentalManagementNoteCodeValidation";

describe("validateRentalManagementNoteCode", () => {
  it("mantém o código opcional ausente", () => expect(validateRentalManagementNoteCode(" ")).toEqual({ valid: true, value: undefined }));
  it("normaliza e aceita código permitido", () => expect(validateRentalManagementNoteCode(" em_revisao ")).toEqual({ valid: true, value: "EM_REVISAO" }));
  it("bloqueia formato inválido", () => expect(validateRentalManagementNoteCode("12")).toEqual({ valid: false, message: "Use um código de 3 a 80 caracteres: letra inicial, letras, números ou sublinhado." }));
});
