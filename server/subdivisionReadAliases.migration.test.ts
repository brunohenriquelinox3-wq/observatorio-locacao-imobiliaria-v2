import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const migrationPath = resolve(import.meta.dirname, "../supabase/migrations/20260901203000_fix_subdivision_read_aliases_a64.sql");

describe("A64 correção de aliases de leitura da Loteadora", () => {
  it("qualifica as referências das tabelas em todas as leituras minimizadas afetadas", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("buyer_client.id");
    expect(sql).toContain("intent.id");
    expect(sql).toContain("sale_draft.id");
    expect(sql).toContain("work_state.id");
    expect(sql).toContain("co_buyer.id");
    expect(sql).toContain("rule_set.id");
    expect(sql).toContain("component.id");
    expect(sql).toContain("role_reference.id");
    expect(sql).not.toContain("return query select id,");
  });

  it("mantém as leituras server-only e sem conteúdo econômico, financeiro ou documental", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("private.require_subdivision_draft_authority");
    expect(sql).toContain("security definer");
    expect(sql).toContain("set search_path=''");
    expect(sql).toContain("from public,anon,authenticated");
    expect(sql).toContain("to service_role");
    expect(sql).not.toContain("percentage");
    expect(sql).not.toContain("amount");
    expect(sql).not.toContain("payment");
    expect(sql).not.toContain("document_url");
  });
});
