import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const migrationPath = resolve(import.meta.dirname, "../supabase/migrations/20260827234000_domain_foundation_a5.sql");
const readMigrationPath = resolve(import.meta.dirname, "../supabase/migrations/20260827234500_domain_foundation_read_a5_1.sql");

describe("A5 canonical domain foundation migration", () => {
  it("keeps Party and temporal roles scoped, minimized and protected by RLS", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("create table public.party_records");
    expect(sql).toContain("create table public.party_role_assignments");
    expect(sql).toContain("organization_id uuid not null");
    expect(sql).toContain("alter table public.party_records enable row level security");
    expect(sql).toContain("alter table public.party_role_assignments enable row level security");
    expect(sql).toContain("purpose_code text not null");
    expect(sql).toContain("ends_at is null or ends_at > starts_at");
  });

  it("requires a contextual active grant and keeps creation functions exclusive to service role", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("grant_record.state = 'active'");
    expect(sql).toContain("(grant_record.scope_selector -> 'modules') ? p_module::text");
    expect(sql).toContain("domain_create_draft_party");
    expect(sql).toContain("domain_assign_draft_party_role");
    expect(sql).toContain("from public, anon, authenticated");
    expect(sql).toContain("to service_role");
    expect(sql).not.toContain("cpf");
    expect(sql).not.toContain("cnpj");
  });

  it("keeps contextual draft reading server-only and does not introduce direct browser access", async () => {
    const sql = await readFile(readMigrationPath, "utf8");
    expect(sql).toContain("domain_list_draft_parties");
    expect(sql).toContain("private.require_domain_draft_authority");
    expect(sql).toContain("from public, anon, authenticated");
    expect(sql).toContain("to service_role");
    expect(sql).not.toContain("create policy");
  });
});
