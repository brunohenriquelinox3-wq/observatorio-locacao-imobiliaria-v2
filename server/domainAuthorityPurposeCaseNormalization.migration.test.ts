import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const migrationPath = resolve(import.meta.dirname, "../supabase/migrations/20260914192000_domain_authority_purpose_case_normalization_a309.sql");

describe("A309 — normalização de finalidade de contexto", () => {
  it("compara somente a caixa da finalidade e preserva todos os demais controles", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("lower(grant_record.purpose_code) = lower(trim(p_purpose_code))");
    expect(sql).toContain("membership.role in ('organization_admin', 'area_admin', 'operator')");
    expect(sql).toContain("membership.state = 'active'");
    expect(sql).toContain("grant_record.state = 'active'");
    expect(sql).toContain("(grant_record.scope_selector -> 'modules') ? p_module::text");
    expect(sql).toContain("subject.lifecycle_state = 'active'");
  });

  it("mantém a função privada e exclusiva da camada de serviço", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("security definer");
    expect(sql).toContain("from public, anon, authenticated");
    expect(sql).toContain("to service_role");
    expect(sql).not.toContain("create policy");
    expect(sql).not.toContain("insert into public.organization_memberships");
    expect(sql).not.toContain("insert into public.administrative_grants");
  });
});
