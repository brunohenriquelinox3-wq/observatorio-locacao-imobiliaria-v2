import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(path.resolve(process.cwd(), "supabase/migrations/20260907223000_subdivision_sale_case_preparation_a291.sql"), "utf8");

describe("A291 caso de venda em preparação", () => {
  it("separa caso e termos de qualquer efeito contratual ou financeiro", () => {
    expect(source).toContain("Não reserva nem vende lote, não cria contrato, título, boleto, cobrança, pagamento ou integração bancária.");
    expect(source).toContain("subdivision_sale_cases_active_lot_unique");
    expect(source).toContain("subdivision_sale_case_terms_installment_detail");
  });

  it("requer autoridade, contexto, idempotência, bloqueio do lote e auditoria redigida", () => {
    expect(source).toContain("private.require_active_subdivision_draft_authority");
    expect(source).toContain("pg_advisory_xact_lock");
    expect(source).toContain("SUBDIVISION_SALE_CASE_LOT_BUSY");
    expect(source).toContain("SUBDIVISION_SALE_CASE_PHYSICAL_RESTRICTION");
    expect(source).toContain("payload_redacted");
    expect(source).toContain("grant execute on function");
    expect(source).toContain("to service_role");
  });

  it("não armazena identificadores fiscais ou valores individuais na auditoria", () => {
    expect(source).toContain("negotiated_total_present");
    expect(source).toContain("entry_amount_present");
    expect(source).not.toContain("'document_reference', p_document_reference");
    expect(source).not.toContain("'negotiated_total_cents', p_negotiated_total_cents");
  });
});
