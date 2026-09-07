import { describe, expect, it } from "vitest";
import {
  formatLotPriceAdjustmentLabel,
  formatPriceConditionLabel,
  formatPricePolicyLabel,
  formatSubdivisionDevelopmentLabel,
} from "./subdivisionOperationalReference";

describe("referências operacionais curtas de Loteamentos", () => {
  it("substitui códigos técnicos por rótulos curtos e ordenados", () => {
    expect(formatSubdivisionDevelopmentLabel(0)).toBe("Loteamento 01");
    expect(formatPricePolicyLabel(2)).toBe("Política-base 03");
    expect(formatPriceConditionLabel(1, "lot")).toBe("Ajuste 02 · Lote");
  });

  it("mantém o contexto físico do ajuste sem mostrar o código técnico", () => {
    expect(formatLotPriceAdjustmentLabel(10, 1)).toBe("Ajuste · Q10 L1");
  });
});
