import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("A210 — auditoria de restauração", () => {
  const migration = readFileSync(
    new URL("../supabase/migrations/20260906194000_fix_subdivision_restore_a210.sql", import.meta.url),
    "utf8",
  );

  it("normaliza a finalidade com função válida sem alterar o escopo de restauração", () => {
    expect(migration).toContain("pg_catalog.btrim(p_purpose_code)");
    expect(migration).not.toContain("pg_catalog.trim(p_purpose_code)");
    expect(migration).toContain("subdivision_restore_draft_block_v1");
    expect(migration).not.toContain("insert into public.subdivision_lots");
  });
});
