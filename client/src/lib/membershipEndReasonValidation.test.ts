import { describe, expect, it } from "vitest";
import { validateMembershipEndReason } from "./membershipEndReasonValidation";

describe("validateMembershipEndReason", () => {
  it("normaliza e aceita um motivo válido", () => expect(validateMembershipEndReason(" acesso_encerrado ")).toEqual({ valid: true, value: "ACESSO_ENCERRADO" }));
  it("bloqueia motivo ausente ou inválido", () => expect(validateMembershipEndReason("12")).toEqual({ valid: false, message: "Informe um motivo em código de 3 a 80 caracteres: letra inicial, letras, números ou sublinhado." }));
});
