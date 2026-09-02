import { describe, expect, it } from "vitest";
import { validateUrbanAgendaReason } from "./urbanAgendaReasonValidation";

describe("validateUrbanAgendaReason", () => {
  it("não exige motivo nos demais estados", () => expect(validateUrbanAgendaReason("", false)).toEqual({ valid: true, value: undefined }));
  it("normaliza e aceita motivo para cancelamento", () => expect(validateUrbanAgendaReason(" reagendamento ", true)).toEqual({ valid: true, value: "REAGENDAMENTO" }));
  it("bloqueia motivo ausente ou inválido", () => expect(validateUrbanAgendaReason("12", true)).toEqual({ valid: false, message: "Informe um motivo em código de 3 a 80 caracteres: letra inicial, letras, números ou sublinhado." }));
});
