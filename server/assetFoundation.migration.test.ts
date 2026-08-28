import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const migrationPath = resolve(import.meta.dirname, "../supabase/migrations/20260828000000_urban_assets_foundation_a6.sql");
const readMigrationPath = resolve(import.meta.dirname, "../supabase/migrations/20260828000500_urban_assets_read_a6_1.sql");

describe("A6 urban asset migration", () => {
  it("keeps asset, Party relation and module-state records isolated and free of address or financial fields", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("create table public.urban_assets");
    expect(sql).toContain("create table public.asset_party_relations");
    expect(sql).toContain("create table public.asset_module_states");
    expect(sql).toContain("party_records_tenant_match unique (id, organization_id)");
    expect(sql).toContain("enable row level security");
    expect(sql).not.toMatch(/\b(address|latitude|longitude|matricula|price|commission|payment)\b/i);
  });

  it("uses contextual functions with correlation, redacted audit and service-only execution", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("private.require_domain_draft_authority");
    expect(sql).toContain("p_correlation_id");
    expect(sql).toContain("payload_redacted");
    expect(sql).toContain("from public, anon, authenticated");
    expect(sql).toContain("to service_role");
  });

  it("keeps the draft-asset read contextual and unavailable to browser roles", async () => {
    const sql = await readFile(readMigrationPath, "utf8");
    expect(sql).toContain("domain_list_draft_urban_assets");
    expect(sql).toContain("private.require_domain_draft_authority");
    expect(sql).toContain("from public, anon, authenticated");
    expect(sql).toContain("to service_role");
  });
});
