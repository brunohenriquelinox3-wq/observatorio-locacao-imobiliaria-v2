import { describe, expect, it } from "vitest";
import { validateSubdivisionBlockNumber } from "./subdivisionBlockNumberValidation";

describe("validateSubdivisionBlockNumber", () => {
  it("aceita os limites válidos da Quadra", () => {
    expect(validateSubdivisionBlockNumber(1)).toEqual({ valid: true, value: 1 });
    expect(validateSubdivisionBlockNumber(999)).toEqual({ valid: true, value: 999 });
  });

  it("bloqueia valores fora do intervalo", () => {
    expect(validateSubdivisionBlockNumber(0)).toEqual({ valid: false, message: "Informe um número de Quadra entre 1 e 999." });
    expect(validateSubdivisionBlockNumber(1000)).toEqual({ valid: false, message: "Informe um número de Quadra entre 1 e 999." });
  });

  it("bloqueia valores não inteiros", () => {
    expect(validateSubdivisionBlockNumber(1.5)).toEqual({ valid: false, message: "Informe um número inteiro de Quadra." });
    expect(validateSubdivisionBlockNumber(Number.NaN)).toEqual({ valid: false, message: "Informe um número inteiro de Quadra." });
  });
});
