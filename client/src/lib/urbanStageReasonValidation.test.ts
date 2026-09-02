import { describe, expect, it } from "vitest";
import { validateUrbanStageReason } from "./urbanStageReasonValidation";

describe("validateUrbanStageReason", () => {
  it("não exige motivo fora do encerramento sem ganho", () => expect(validateUrbanStageReason("", false)).toEqual({ valid: true, value: undefined }));
  it("normaliza e aceita o motivo de encerramento", () => expect(validateUrbanStageReason(" desistencia ", true)).toEqual({ valid: true, value: "DESISTENCIA" }));
  it("bloqueia motivo ausente ou inválido", () => expect(validateUrbanStageReason("12", true)).toEqual({ valid: false, message: "Informe um motivo em código de 3 a 80 caracteres: letra inicial, letras, números ou sublinhado." }));
});
