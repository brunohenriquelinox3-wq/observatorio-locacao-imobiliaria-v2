import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  path.resolve(
    process.cwd(),
    "supabase/migrations/20260925262000_subdivision_internal_receivable_detail_legacy_target_reconciliation_a387_3.sql",
  ),
  "utf8",
);

describe("A387.3 — reconciliação do alvo legacy do detalhe nominal", () => {
  it("delegates to the legacy_a385 function actually applied in the catalog", () => {
    expect(migration).toContain(
      "subdivision_get_internal_receivable_batch_item_detail_v2_legacy_a385(\n",
    );
    expect(migration).not.toContain(
      "subdivision_get_internal_receivable_batch_item_detail_v2_legacy(\n",
    );
  });

  it("keeps the wrapper read-only and protected", () => {
    expect(migration).toContain("security definer");
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain("revoke all on function");
    expect(migration).toContain("to service_role");
    const executableSql = migration.replace(/--[^\n]*/g, "");
    expect(executableSql).not.toMatch(/insert into|update public\.|delete from public\./i);
    expect(executableSql).not.toMatch(
      /paymentStatus|paidAt|settledAt|receivedCents|pix|linha digitável|split bancário|repasse/i,
    );
  });
});
