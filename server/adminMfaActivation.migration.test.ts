import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const migrationPath = resolve(import.meta.dirname, "../supabase/migrations/20260827232000_admin_mfa_activation_a4.sql");

describe("A4 MFA activation migration", () => {
  it("requires fresh AAL2/TOTP evidence and a verified recovery channel before activation", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("p_aal <> 'aal2'");
    expect(sql).toContain("p_amr_method <> 'totp'");
    expect(sql).toContain("p_amr_at < now() - interval '15 minutes'");
    expect(sql).toContain("not p_verified_recovery_channel");
    expect(sql).toContain("principal.state = 'pending_activation'");
    expect(sql).toContain("set state = 'active'");
  });

  it("keeps execution server-only and records only redacted assurance metadata", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("security definer");
    expect(sql).toContain("set search_path = ''");
    expect(sql).toContain("from public, anon, authenticated");
    expect(sql).toContain("to service_role");
    expect(sql).toContain("payload_redacted");
    expect(sql).not.toContain("access_token");
    expect(sql).not.toContain("totp_secret");
  });
});
