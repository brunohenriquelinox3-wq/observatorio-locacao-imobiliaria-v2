import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(path.resolve(process.cwd(), "supabase/migrations/20260907224000_subdivision_sale_case_fiscal_lookup_correlation_a292.sql"), "utf8");

describe("A292 consulta fiscal correlacionada", () => {
  it("exige contexto, correlação e referência fiscal válida", () => {
    expect(source).toContain("private.require_active_subdivision_draft_authority");
    expect(source).toContain("p_correlation_id is null");
    expect(source).toContain("SUBDIVISION_SALE_CASE_FISCAL_REFERENCE_DENIED");
  });

  it("preserva a minimização e não audita o valor consultado", () => {
    expect(source).toContain("profile.document_reference = v_document_reference");
    expect(source).not.toContain("admin_audit_events");
    expect(source).not.toContain("payload_redacted");
    expect(source).toContain("to service_role");
  });
});
