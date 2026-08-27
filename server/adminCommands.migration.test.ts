import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const migrationPath = new URL(
  "../supabase/migrations/20260827224000_admin_commands_a1.sql",
  import.meta.url,
);

describe("admin commands migration A1", () => {
  it("keeps privileged functions outside browser execution and pins search_path", async () => {
    const sql = await readFile(migrationPath, "utf8");

    expect(sql).toContain("security definer\nset search_path = ''");
    expect(sql).toContain("revoke all on function public.platform_provision_organization");
    expect(sql).toContain("from public, anon, authenticated");
    expect(sql).toContain("grant execute on function public.platform_provision_organization");
    expect(sql).toContain("to service_role");
  });

  it("records the five controlled command paths without hardcoded identity data", async () => {
    const sql = await readFile(migrationPath, "utf8");

    for (const command of [
      "platform_bootstrap_principal",
      "platform_provision_organization",
      "platform_delegate_membership",
      "platform_suspend_membership",
      "platform_revoke_membership",
    ]) {
      expect(sql).toContain(command);
    }
    expect(sql).not.toMatch(/@[a-z0-9.-]+\.[a-z]{2,}/i);
  });
});
