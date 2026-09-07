import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260907210000_subdivision_buyer_client_directory_total_a290.sql"), "utf8");

describe("A290 aggregate directory total migration", () => {
  it("uses the same protected, contextual authority before counting", () => {
    expect(migration).toContain("private.require_subdivision_draft_authority");
    expect(migration).toContain("security definer");
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain("p_search_term text");
  });

  it("returns only a count and preserves the directory search predicate", () => {
    expect(migration).toContain("returns integer");
    expect(migration).toContain("select count(*)::integer");
    expect(migration).toContain("primary_phone");
    expect(migration).toContain("document_reference");
    expect(migration).not.toContain("returns table");
  });

  it("restricts execution to the protected service path and excludes prohibited domains", () => {
    expect(migration).toContain("revoke all on function public.subdivision_count_draft_buyer_client_directory");
    expect(migration).toContain("to service_role");
    expect(migration).not.toContain("subdivision_sales");
    expect(migration).not.toContain("payments");
    expect(migration).not.toContain("contracts");
  });
});
