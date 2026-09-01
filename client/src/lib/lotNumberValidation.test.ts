import { describe, expect, it } from "vitest";
import { validateLotNumber } from "./lotNumberValidation";

describe("validateLotNumber", () => {
  it("aceita os limites válidos de Lote", () => {
    expect(validateLotNumber(1)).toEqual({ valid: true, value: 1 });
    expect(validateLotNumber(100)).toEqual({ valid: true, value: 100 });
  });

  it("bloqueia valores fora do intervalo", () => {
    expect(validateLotNumber(0)).toEqual({ valid: false, message: "Informe um número de Lote entre 1 e 100." });
    expect(validateLotNumber(101)).toEqual({ valid: false, message: "Informe um número de Lote entre 1 e 100." });
  });

  it("bloqueia valores não inteiros", () => {
    expect(validateLotNumber(1.5)).toEqual({ valid: false, message: "Informe um número inteiro de Lote." });
    expect(validateLotNumber(Number.NaN)).toEqual({ valid: false, message: "Informe um número inteiro de Lote." });
  });
});
