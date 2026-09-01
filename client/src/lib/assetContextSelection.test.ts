import { describe, expect, it } from "vitest";
import { assetContextSelectionLabel } from "./assetContextSelection";

describe("assetContextSelectionLabel", () => {
  it("descreve o ativo do contexto sem expor seu identificador técnico", () => {
    expect(assetContextSelectionLabel({ referenceLabel: "Ativo de teste", internalReference: "VU-001", kind: "apartment", moduleState: "draft" })).toBe(
      "Ativo de teste · VU-001 · Apartamento · Rascunho",
    );
  });

  it("mantém o estado contextual e um fallback seguro para tipo desconhecido", () => {
    expect(assetContextSelectionLabel({ referenceLabel: "Referência", internalReference: "LOC-002", kind: "unknown", moduleState: "blocked" })).toBe(
      "Referência · LOC-002 · Ativo urbano · Bloqueado",
    );
  });
});
