import { describe, expect, it } from "vitest";
import { validateUrbanPreferenceCode } from "./urbanPreferenceCodeValidation";

describe("validateUrbanPreferenceCode", () => {
  it("mantém a preferência opcional ausente", () => expect(validateUrbanPreferenceCode(" ")).toEqual({ valid: true, value: undefined }));
  it("normaliza e aceita preferência permitida", () => expect(validateUrbanPreferenceCode(" moradia_urbana ")).toEqual({ valid: true, value: "MORADIA_URBANA" }));
  it("bloqueia formato inválido", () => expect(validateUrbanPreferenceCode("12")).toEqual({ valid: false, message: "Use um código de 3 a 80 caracteres: letra inicial, letras, números ou sublinhado." }));
});
