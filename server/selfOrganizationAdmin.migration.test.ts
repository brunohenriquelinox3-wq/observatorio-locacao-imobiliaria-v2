import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";

const migrationPath = new URL(
  "../supabase/migrations/20260901162000_activate_self_organization_admin_a46.sql",
  import.meta.url,
);

describe("self organization admin migration A46", () => {
  it("keeps self-administration server-only, actor-bound and redacted", async () => {
    const sql = await readFile(migrationPath, "utf8");

    expect(sql).toContain("platform_activate_self_organization_admin");
    expect(sql).toContain("platform_list_self_admin_organizations");
    expect(sql).toContain("array['platform_super_admin']::public.admin_role[]");
    expect(sql).toContain("security definer\nset search_path = ''");
    expect(sql).toContain("p_actor_user_id, 'organization_admin', 'active'");
    expect(sql).toContain("'loteadora'");
    expect(sql).toContain("'vendas_urbanas'");
    expect(sql).toContain("'locacao'");
    expect(sql).toContain("payload_redacted");
    expect(sql).toContain("revoke all on function");
    expect(sql).toContain("to service_role");
    expect(sql).not.toMatch(/@[a-z0-9.-]+\.[a-z]{2,}/i);
  });
});
