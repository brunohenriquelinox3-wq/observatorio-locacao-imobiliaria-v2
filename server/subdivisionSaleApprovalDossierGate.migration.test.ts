import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
const source = readFileSync(path.resolve(process.cwd(), "supabase/migrations/20260908002000_subdivision_sale_approval_dossier_gate_a299.sql"), "utf8");
describe("A299 aprovação com dossiê humano", () => {
  it("exige dossiê revisado antes de promover caso, contrato e lote", () => { expect(source).toContain("dossier_state = 'ready_for_approval'"); expect(source).toContain("SUBDIVISION_SALE_APPROVAL_DOSSIER_DENIED"); expect(source).toContain("pg_advisory_xact_lock"); });
  it("não introduz assinatura, cobrança, envio, baixa ou pagamento", () => { expect(source).toContain("Não assina, emite, envia, cobra, baixa ou paga."); expect(source).not.toContain("send_email"); expect(source).not.toContain("payment_status"); expect(source).not.toContain("webhook"); });
});
