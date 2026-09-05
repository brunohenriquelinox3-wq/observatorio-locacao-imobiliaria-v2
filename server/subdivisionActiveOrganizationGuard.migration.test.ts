import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "supabase/migrations/20260906162000_subdivision_active_organization_guard_a196.sql"), "utf8");

describe("A196 — guarda transversal de organização ativa na Loteadora", () => {
  it("redefine o helper compartilhado com organização ativa e preserva o bloqueio de módulo e privilégios", () => {
    expect(source).toContain("create or replace function private.require_subdivision_draft_authority");
    expect(source).toContain("p_module <> 'loteadora'::public.operating_module");
    expect(source).toContain("organization.state = 'active'");
    expect(source).toContain("security definer");
    expect(source).toContain("set search_path = ''");
    expect(source).toContain("revoke all on function private.require_subdivision_draft_authority");
  });
});
