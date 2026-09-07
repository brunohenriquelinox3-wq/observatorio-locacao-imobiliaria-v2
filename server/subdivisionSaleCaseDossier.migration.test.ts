import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
const source = readFileSync(path.resolve(process.cwd(), "supabase/migrations/20260908001000_subdivision_sale_case_private_dossier_a298.sql"), "utf8");
describe("A298 dossiê privado do caso de venda", () => {
  it("restringe o dossiê a intenção opaca, revisão humana e autoridade contextual", () => { expect(source).toContain("private.require_active_subdivision_draft_authority"); expect(source).toContain("ready_for_approval"); expect(source).toContain("private_upload_recorded"); expect(source).toContain("to service_role"); });
  it("não introduz URL, download, assinatura, cobrança ou pagamento", () => { expect(source).toContain("Não armazena bytes, nome, URL, download, assinatura, boleto ou pagamento."); expect(source).not.toContain("send_email"); expect(source).not.toContain("payment_status"); expect(source).not.toContain("webhook"); });
});
