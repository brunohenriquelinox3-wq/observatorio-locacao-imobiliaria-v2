import { describe, expect, it } from "vitest";
import { validateAssetBlockReason } from "./assetBlockReasonValidation";

describe("validateAssetBlockReason", () => {
  it("não exige motivo fora do estado bloqueado", () => expect(validateAssetBlockReason("", false)).toEqual({ valid: true, value: undefined }));
  it("normaliza e aceita o motivo bloqueado", () => expect(validateAssetBlockReason(" pendencia_documental ", true)).toEqual({ valid: true, value: "PENDENCIA_DOCUMENTAL" }));
  it("bloqueia motivo ausente ou inválido", () => expect(validateAssetBlockReason("12", true)).toEqual({ valid: false, message: "Informe um motivo em código de 3 a 80 caracteres: letra inicial, letras, números ou sublinhado." }));
});
