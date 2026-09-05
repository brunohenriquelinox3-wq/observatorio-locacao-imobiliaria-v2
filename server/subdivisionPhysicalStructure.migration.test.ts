import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("../supabase/migrations/20260906193000_subdivision_physical_dossier_a202.sql", import.meta.url), "utf8");

describe("migração A202 de estrutura física e dossiê", () => {
  it("mantém somente atributos físicos e estados de pendência no escopo", () => {
    expect(source).toContain("area_sqm numeric");
    expect(source).toContain("subdivision_development_requirements");
    expect(source).not.toMatch(/add column (price|sale|contract|customer|payment)/i);
  });

  it("exige autoridade ativa, RLS e execução exclusiva ao servidor", () => {
    expect(source).toContain("require_active_subdivision_draft_authority");
    expect(source).toContain("enable row level security");
    expect(source).toContain("revoke all on function");
    expect(source).toContain("grant execute on function public.subdivision_apply_draft_physical_structure_v1");
    expect(source).toContain("security definer set search_path = ''");
  });

  it("requer confirmação para retirar Quadras ou Lotes existentes", () => {
    expect(source).toContain("SUBDIVISION_PHYSICAL_STRUCTURE_REPLACEMENT_CONFIRMATION_REQUIRED");
    expect(source).toContain("incoming.lots");
    expect(source).toContain("state = 'archived'");
  });
});
