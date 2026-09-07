import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(resolve(process.cwd(), "supabase/migrations/20260908020000_subdivision_sale_case_joint_proponents_calendar_a304.sql"), "utf8");

describe("A304 sale-case joint proponents and calendar", () => {
  it("preserva proponentes conjuntos por caso com contexto, idempotência e auditoria redigida", () => {
    expect(migration).toContain("subdivision_sale_case_parties");
    expect(migration).toContain("joint_proponent");
    expect(migration).toContain("require_active_subdivision_draft_authority");
    expect(migration).toContain("pg_advisory_xact_lock");
    expect(migration).toContain("subdivision_add_sale_case_joint_proponent");
    expect(migration).toContain("payload_redacted");
    expect(migration).not.toMatch(/subdivision_(emit|issue|send|register|settle)_/i);
    expect(migration).not.toContain("bank_api");
  });

  it("reconcilia a negociação e usa o dia de vencimento no calendário mensal", () => {
    expect(migration).toContain("SUBDIVISION_SALE_CASE_TERMS_TOTAL_DENIED");
    expect(migration).toContain("SUBDIVISION_SALE_CASE_TERMS_DUE_DAY_DENIED");
    expect(migration).toContain("pg_catalog.make_date");
    expect(migration).toContain("coalesce(configuration.lead_days, 4)");
  });
});
