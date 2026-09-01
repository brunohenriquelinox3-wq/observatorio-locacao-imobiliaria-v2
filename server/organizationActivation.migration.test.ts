import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("organization activation migration", () => {
  it("keeps activation actor-bound, idempotent, server-only and redacted", async () => {
    const sql = await readFile(resolve(process.cwd(), "supabase/migrations/20260901180000_activate_organization_a47.sql"), "utf8");

    expect(sql).toContain("platform_list_activatable_organizations");
    expect(sql).toContain("platform_activate_organization");
    expect(sql).toContain("security definer");
    expect(sql).toContain("set search_path = ''");
    expect(sql).toContain("array['platform_super_admin']::public.admin_role[]");
    expect(sql).toContain("membership.role = 'organization_admin'");
    expect(sql).toContain("organization.state = 'draft'");
    expect(sql).toContain("correlation_id = p_correlation_id");
    expect(sql).toContain("payload_redacted");
    expect(sql).toContain("draft_to_active");
    expect(sql).toContain("revoke all on function");
    expect(sql).toContain("to service_role");
    expect(sql).not.toMatch(/email|password|payment|financial|contract/i);
  });
});
