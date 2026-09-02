import { describe, expect, it } from "vitest";
import { validateSubdivisionReference } from "./subdivisionReferenceValidation";

describe("validateSubdivisionReference", () => {
  it("normaliza e aceita a referência permitida", () => expect(validateSubdivisionReference(" lt_norte_01 ")).toEqual({ valid: true, value: "LT_NORTE_01" }));
  it("bloqueia referências fora do contrato", () => expect(validateSubdivisionReference("12")).toEqual({ valid: false, message: "Use de 3 a 80 caracteres: letra inicial, letras, números ou sublinhado." }));
});
