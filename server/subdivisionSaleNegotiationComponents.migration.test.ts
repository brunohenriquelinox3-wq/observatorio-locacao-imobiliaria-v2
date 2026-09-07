import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const sql = readFileSync("supabase/migrations/20260908030000_subdivision_sale_negotiation_components_a305.sql", "utf8");

describe("A305 modalidades internas de negociação", () => {
  it("representa componentes, reconciliação exata e agenda simultânea", () => {
    expect(sql).toContain("entry_installment_count");
    expect(sql).toContain("cash_settlement_amount_cents");
    expect(sql).toContain("supplemental_amount_cents");
    expect(sql).toContain("trade_in_credit_cents");
    expect(sql).toContain("v_composed_total <> p_negotiated_total_cents");
    expect(sql).toContain("entry_installment");
    expect(sql).toContain("trade_in_credit");
  });

  it("mantém o lote interno como controle sem operações externas", () => {
    expect(sql).toContain("schedule_kind");
    expect(sql).toContain("row_number() over");
    expect(sql).not.toMatch(/linha digitável|remessa|webhook bancário|registrar pagamento/i);
  });
});
