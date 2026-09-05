import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const migration = () => readFileSync(path.resolve(process.cwd(), "supabase/migrations/20260906190000_subdivision_structure_builder_a198.sql"), "utf8");

describe("migração A198 de estrutura por Quadras", () => {
  it("mantém funções seguras e execução restrita", () => {
    const sql = migration();
    expect(sql).toContain("security definer set search_path = ''");
    expect(sql).toContain("revoke all on function public.subdivision_apply_draft_structure_v2");
    expect(sql).toContain("grant execute on function public.subdivision_apply_draft_structure_v2");
    expect(sql).toContain("to service_role");
  });

  it("valida limites, serializa a operação e arquiva logicamente", () => {
    const sql = migration();
    expect(sql).toContain("jsonb_array_length(p_blocks) not between 1 and 50");
    expect(sql).toContain("candidate.lot_count not between 1 and 100");
    expect(sql).toContain("pg_advisory_xact_lock");
    expect(sql).toContain("'archived'::public.party_lifecycle_state");
    expect(sql).toContain("SUBDIVISION_STRUCTURE_REPLACEMENT_CONFIRMATION_REQUIRED");
  });
});
