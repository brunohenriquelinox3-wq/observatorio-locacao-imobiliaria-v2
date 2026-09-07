import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(path.resolve(process.cwd(), "supabase/migrations/20260907234000_subdivision_sale_case_approval_a295.sql"), "utf8");
describe("A295 aprovação material de venda", () => {
  it("mantém estado comercial separado e preserva os estados físico e de inventário", () => { expect(source).toContain("subdivision_lot_commercial_states"); expect(source).toContain("'sold'"); expect(source).toContain("'reversal_review'"); expect(source).not.toContain("alter type public.subdivision_lot_inventory_phase"); });
  it("exige autoridade, bloqueio concorrente, idempotência e auditoria redigida", () => { expect(source).toContain("private.require_active_subdivision_draft_authority"); expect(source).toContain("pg_advisory_xact_lock"); expect(source).toContain("payload_redacted"); expect(source).toContain("subdivision_approve_sale_case"); expect(source).toContain("to service_role"); });
  it("não emite boleto, não cobra, não registra pagamento e não libera lote automaticamente", () => { expect(source).toContain("Não emite boleto, não cobra, não baixa e não registra pagamento."); expect(source).not.toContain("bank_api_key"); expect(source).not.toContain("payment_status"); expect(source).not.toContain("availability = 'available'"); });
});
