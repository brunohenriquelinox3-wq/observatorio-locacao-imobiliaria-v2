import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const migrationPath = new URL(
  "../supabase/migrations/20260827225000_admin_bootstrap_identity_a1_1.sql",
  import.meta.url,
);

describe("admin bootstrap identity migration A1.1", () => {
  it("accepts only an existing Supabase Auth subject and keeps activation pending", async () => {
    const sql = await readFile(migrationPath, "utf8");

    expect(sql).toContain("from auth.users auth_user");
    expect(sql).toContain("insert into public.identity_subjects");
    expect(sql).toContain("'pending_activation'");
    expect(sql).not.toMatch(/inviteUserByEmail|recipient_email|@[a-z0-9.-]+\.[a-z]{2,}/i);
  });

  it("restricts the function to service_role with a pinned search path", async () => {
    const sql = await readFile(migrationPath, "utf8");

    expect(sql).toContain("security definer\nset search_path = ''");
    expect(sql).toContain("revoke all on function public.platform_bootstrap_principal(uuid, uuid) from public, anon, authenticated");
    expect(sql).toContain("grant execute on function public.platform_bootstrap_principal(uuid, uuid) to service_role");
  });
});
