import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  path.resolve(
    process.cwd(),
    "supabase/migrations/20260925260000_subdivision_internal_receivable_item_lineage_a387.sql",
  ),
  "utf8",
);

describe("A387 — lineage do item nominal", () => {
  it("cria somente uma RPC de leitura protegida e encadeia a função A386.1", () => {
    expect(migration).toContain(
      "subdivision_get_internal_receivable_batch_item_detail_v4",
    );
    expect(migration).toContain(
      "subdivision_get_internal_receivable_batch_item_detail_v3",
    );
    expect(migration).toContain("require_active_subdivision_draft_authority");
    expect(migration).toContain("security definer");
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain("revoke all on function");
    expect(migration).toContain("to service_role");
  });

  it("deriva a coleção física pela função privada tenant-scoped", () => {
    expect(migration).toContain("private.subdivision_sale_case_lot_rows");
    expect(migration).toContain("development_reference");
    expect(migration).toContain("block_number");
    expect(migration).toContain("lot_number");
    expect(migration).toContain("is_primary");
    expect(migration).toContain("physical_lots");
  });

  it("classifica lineage completo, parcial e indisponível sem inventar elos", () => {
    expect(migration).toContain("'complete'");
    expect(migration).toContain("'partial'");
    expect(migration).toContain("'unavailable'");
    expect(migration).toContain("missing_stages");
    expect(migration).toContain("item_nominal");
    expect(migration).toContain("finance_surface");
  });

  it("não expõe IDs técnicos nem executa operação financeira", () => {
    const executableSql = migration.replace(/--[^\n]*/g, "");
    expect(migration).toContain("gerenciar_cobrancas");
    expect(executableSql).not.toMatch(/insert into|update public\.|delete from public\./i);
    expect(executableSql).not.toMatch(
      /paymentStatus|paidAt|settledAt|receivedCents|pix|linha digitável|split bancário|repasse/i,
    );
  });
});
