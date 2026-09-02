import { describe, expect, it } from "vitest";
import { validateAssetReferenceLabel } from "./assetReferenceLabelValidation";

describe("validateAssetReferenceLabel", () => {
  it("normaliza espaços e aceita a referência válida", () => expect(validateAssetReferenceLabel("  Unidade   A  ")).toEqual({ valid: true, value: "Unidade A" }));
  it("bloqueia referência vazia ou curta", () => expect(validateAssetReferenceLabel(" ")).toEqual({ valid: false, message: "Informe uma referência de trabalho entre 2 e 160 caracteres." }));
});
