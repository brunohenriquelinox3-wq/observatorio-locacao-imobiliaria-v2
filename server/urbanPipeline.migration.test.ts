import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const migrationPath = resolve(import.meta.dirname, "../supabase/migrations/20260828001000_urban_pipeline_foundation_a7.sql");

describe("A7 urban pipeline migration", () => {
  it("keeps lead, stage and agenda structures isolated from proposal, contract, publication and finance", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("create table public.urban_leads");
    expect(sql).toContain("create table public.urban_lead_stage_events");
    expect(sql).toContain("create table public.urban_lead_agendas");
    expect(sql).toContain("enable row level security");
    expect(sql).not.toMatch(/\b(price|proposal|reservation|contract|payment|commission|publish)\b/i);
  });

  it("requires sales module, contextual authority, reason on loss and server-only function execution", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("URBAN_MODULE_DENIED");
    expect(sql).toContain("private.require_domain_draft_authority");
    expect(sql).toContain("URBAN_STAGE_REASON_REQUIRED");
    expect(sql).toContain("p_correlation_id");
    expect(sql).toContain("from public, anon, authenticated");
    expect(sql).toContain("to service_role");
  });

  it("keeps the contextual read minimized and unavailable to browser roles", async () => {
    const sql = await readFile(resolve(import.meta.dirname, "../supabase/migrations/20260828001500_urban_pipeline_read_a7_1.sql"), "utf8");
    expect(sql).toContain("urban_list_draft_leads");
    expect(sql).toContain("private.require_urban_pipeline_authority");
    expect(sql).toContain("from public, anon, authenticated");
    expect(sql).toContain("to service_role");
    expect(sql).not.toMatch(/\b(price|proposal|reservation|contract|payment|commission)\b/i);
  });
});
