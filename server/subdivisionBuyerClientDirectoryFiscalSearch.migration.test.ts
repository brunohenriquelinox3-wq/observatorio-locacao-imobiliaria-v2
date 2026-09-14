import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const migrationPath = resolve(import.meta.dirname, "../supabase/migrations/20260914195800_subdivision_buyer_client_directory_fiscal_search_a310.sql");

describe("A310 — busca fiscal redigida de Clientes Loteadora", () => {
  it("mantém a busca por nome e adiciona comparação exata da referência fiscal normalizada", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("party.display_name ilike '%' || trim(p_search_term) || '%'");
    expect(sql).toContain("regexp_replace(coalesce(trim(p_search_term), ''), '[^0-9]', '', 'g')");
    expect(sql).toContain("profile.document_reference = search_digits");
    expect(sql).toContain("search_digits <> ''");
  });

  it("preserva autoridade, paginação e não retorna a referência fiscal", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("private.require_subdivision_draft_authority");
    expect(sql).toContain("limit p_page_size offset p_page_offset");
    expect(sql).not.toContain("profile.document_reference,");
    expect(sql).toContain("revoke all on function");
    expect(sql).toContain("grant execute on function");
  });
});
