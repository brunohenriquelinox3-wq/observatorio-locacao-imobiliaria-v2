import { readFileSync } from "node:fs"; import path from "node:path"; import { describe, expect, it } from "vitest";
const source = readFileSync(path.resolve(process.cwd(), "supabase/migrations/20260908010000_subdivision_internal_receivable_batches_a302.sql"), "utf8");
describe("A302 lote interno de parcelas", () => {
  it("libera o lote no mesmo comando da aprovação e preserva dossiê, contexto e idempotência", () => { expect(source).toContain("subdivision_approve_sale_case"); expect(source).toContain("ready_for_approval"); expect(source).toContain("subdivision_internal_receivable_batches"); expect(source).toContain("pg_advisory_xact_lock"); expect(source).toContain("payload_redacted"); });
  it("mantém o lote interno fora de emissão, comunicação, banco, baixa e pagamento", () => { expect(source).toContain("Não gera boleto bancário"); expect(source).not.toContain("barcode"); expect(source).not.toContain("send_email"); expect(source).not.toContain("payment_gateway"); });
  it("reverte somente para revisão humana sem apagar o lote", () => { expect(source).toContain("batch_state = 'reversal_review'"); expect(source).toContain("subdivision_release_internal_receivable_batch"); expect(source).toContain("to service_role"); });
});
