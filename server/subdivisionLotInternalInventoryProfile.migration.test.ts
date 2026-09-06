import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("migração A269 de perfil interno de estoque", () => {
  it("mantém uma tabela aditiva, RLS e RPCs exclusivas para service role", async () => {
    const sql = await readFile(resolve(import.meta.dirname, "../supabase/migrations/20260908103000_subdivision_internal_inventory_profile_a269.sql"), "utf8");
    expect(sql).toContain("subdivision_lot_internal_inventory_profiles");
    expect(sql).toContain("enable row level security");
    expect(sql).toContain("security definer set search_path = ''");
    expect(sql).toContain("require_active_subdivision_draft_authority");
    expect(sql).toContain("revoke all on table");
    expect(sql).toContain("to service_role");
    expect(sql).not.toMatch(/availability|sale|proposal|contract|financial/i);
  });
});
