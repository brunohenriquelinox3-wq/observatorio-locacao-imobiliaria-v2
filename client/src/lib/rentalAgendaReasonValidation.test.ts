import { describe, expect, it } from "vitest";
import { validateRentalAgendaReason } from "./rentalAgendaReasonValidation";

describe("validateRentalAgendaReason", () => {
  it("não exige motivo nos demais estados", () => expect(validateRentalAgendaReason("", false)).toEqual({ valid: true, value: undefined }));
  it("normaliza e aceita motivo para cancelamento", () => expect(validateRentalAgendaReason(" reagendamento ", true)).toEqual({ valid: true, value: "REAGENDAMENTO" }));
  it("bloqueia motivo ausente ou inválido", () => expect(validateRentalAgendaReason("12", true)).toEqual({ valid: false, message: "Informe um motivo em código de 3 a 80 caracteres: letra inicial, letras, números ou sublinhado." }));
});
