import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  path.resolve(
    process.cwd(),
    "supabase/migrations/20260925263000_subdivision_internal_receivable_detail_legacy_target_final_a387_4.sql",
  ),
  "utf8",
);

describe("A387.4 — alvo legacy final do detalhe nominal", () => {
  it("delegates to the legacy function installed in the catalog", () => {
    expect(migration).toContain(
      "subdivision_get_internal_receivable_batch_item_detail_v2_legacy(\n",
    );
    expect(migration).not.toContain(
      "subdivision_get_internal_receivable_batch_item_detail_v2_legacy_a385(\n",
    );
  });

  it("preserves the read-only security boundary and payer redaction", () => {
    expect(migration).toContain("security definer");
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain("subdivision_sale_case_primary_payers");
    expect(migration).toContain("revoke all on function");
    expect(migration).toContain("to service_role");

    const executableSql = migration.replace(/--[^\n]*/g, "");
    expect(executableSql).not.toMatch(/insert into|update public\.|delete from public\./i);
    expect(executableSql).not.toMatch(
      /paymentStatus|paidAt|settledAt|receivedCents|pix|linha digitável|split bancário|repasse/i,
    );
  });
});
