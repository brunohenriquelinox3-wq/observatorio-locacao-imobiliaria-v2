import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260926030000_subdivision_restore_archived_development_a392.sql"),
  "utf8",
);

describe("A392 — restauração de Loteamento arquivado", () => {
  it("restaura somente o cadastro arquivado e mantém estruturas físicas separadas", () => {
    expect(migration).toContain("subdivision_restore_archived_development_v1");
    expect(migration).toContain("development.state = 'archived'");
    expect(migration).toContain("set state = 'draft'");
    expect(migration).toContain("physical_structures_remain_archived");
    expect(migration).toContain("attachment_references_remain_archived");
    expect(migration).not.toMatch(/insert\s+into\s+public\.subdivision_(blocks|lots)/i);
    expect(migration).not.toMatch(/delete\s+from\s+public\.subdivision_(developments|blocks|lots)/i);
  });

  it("preserva autorização, replay idempotente e auditoria redigida", () => {
    expect(migration).toContain("private.require_active_subdivision_draft_authority");
    expect(migration).toContain("p_correlation_id");
    expect(migration).toContain("event.correlation_id = p_correlation_id");
    expect(migration).toContain("admin_audit_events");
    expect(migration).toContain("security definer");
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain("revoke all on function");
    expect(migration).toContain("grant execute on function");
    expect(migration).not.toMatch(/paymentStatus|paidAt|pix|split|transfer|repasse|cobrança externa/i);
  });
});
