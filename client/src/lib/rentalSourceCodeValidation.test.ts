import { describe, expect, it } from "vitest";
import { validateRentalSourceCode } from "./rentalSourceCodeValidation";

describe("validateRentalSourceCode", () => {
  it("normaliza e aceita origem permitida", () => expect(validateRentalSourceCode(" operador ")).toEqual({ valid: true, value: "OPERADOR" }));
  it("bloqueia formato inválido", () => expect(validateRentalSourceCode("12")).toEqual({ valid: false, message: "Use um código de 3 a 80 caracteres: letra inicial, letras, números ou sublinhado." }));
});
