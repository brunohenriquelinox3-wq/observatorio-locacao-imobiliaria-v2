import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
const source = readFileSync(path.resolve(process.cwd(), "supabase/migrations/20260907235000_subdivision_lot_commercial_state_read_a296.sql"), "utf8");
describe("A296 leitura do estado comercial", () => {
  it("reutiliza autoridade contextual e projeta somente estado do lote", () => { expect(source).toContain("private.require_active_subdivision_draft_authority"); expect(source).toContain("returns table (lot_id uuid, commercial_state"); expect(source).toContain("to service_role"); });
  it("não introduz pagamento, boleto ou comunicação externa", () => { expect(source).not.toContain("payment"); expect(source).not.toContain("boleto"); expect(source).not.toContain("webhook"); });
});
