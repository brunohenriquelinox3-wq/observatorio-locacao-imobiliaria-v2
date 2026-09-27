import { describe, expect, it } from "vitest";
import { formatSubdivisionPurpose } from "./subdivisionContextPresentation";

describe("formatSubdivisionPurpose", () => {
  it("apresenta a finalidade conhecida em linguagem operacional", () => {
    expect(formatSubdivisionPurpose("CADASTRO_INICIAL")).toBe("Cadastro inicial");
    expect(formatSubdivisionPurpose("operacao_interna")).toBe(
      "Operação interna"
    );
    expect(formatSubdivisionPurpose("revisao_cadastral")).toBe(
      "Revisão cadastral"
    );
  });

  it("não expõe enums desconhecidos ao operador", () => {
    expect(formatSubdivisionPurpose("purpose_internal_unknown")).toBe(
      "Finalidade de trabalho"
    );
  });
});
