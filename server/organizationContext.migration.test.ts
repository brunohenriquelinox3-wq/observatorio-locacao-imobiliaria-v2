import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("authorized organization context migration", () => {
  it("keeps the context list module-bound, active-only, server-only and minimized", async () => {
    const sql = await readFile(resolve(process.cwd(), "supabase/migrations/20260901190000_list_authorized_subdivision_contexts_a48.sql"), "utf8");
    expect(sql).toContain("security definer");
    expect(sql).toContain("set search_path = ''");
    expect(sql).toContain("p_module <> 'loteadora'");
    expect(sql).toContain("organization.state = 'active'");
    expect(sql).toContain("membership.state = 'active'");
    expect(sql).toContain("grant_record.state = 'active'");
    expect(sql).toContain("revoke all on function");
    expect(sql).toContain("to service_role");
    expect(sql).not.toContain("email");
    expect(sql).not.toContain("access_token");
  });

  it("keeps the A50 expansion constrained to the three ADM modules", async () => {
    const sql = await readFile(resolve(process.cwd(), "supabase/migrations/20260901200000_expand_authorized_context_modules_a50.sql"), "utf8");
    expect(sql).toContain("'loteadora'::public.operating_module");
    expect(sql).toContain("'vendas_urbanas'::public.operating_module");
    expect(sql).toContain("'locacao'::public.operating_module");
    expect(sql).toContain("security definer");
    expect(sql).toContain("set search_path = ''");
    expect(sql).toContain("organization.state = 'active'");
    expect(sql).toContain("to service_role");
    expect(sql).not.toContain("platform_super_admin");
  });
});
