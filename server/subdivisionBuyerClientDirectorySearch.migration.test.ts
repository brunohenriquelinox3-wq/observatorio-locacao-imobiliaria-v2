import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260907173000_subdivision_buyer_client_directory_search_a283.sql"), "utf8");
const returnedColumns = migration.slice(
  migration.indexOf("returns table("),
  migration.indexOf("language plpgsql"),
);

describe("A283 busca escalável do diretório de Cliente Loteadora", () => {
  it("mantém a autoridade contextual e limites de paginação adequados a diretórios grandes", () => {
    expect(migration).toContain("private.require_subdivision_draft_authority");
    expect(migration).toContain("p_page_size > 25");
    expect(migration).toContain("p_page_offset > 49975");
    expect(migration).toContain("SUBDIVISION_CLIENT_DIRECTORY_SEARCH_DENIED");
  });

  it("permite busca somente dentro do mesmo contexto por dados declarados, sem retornar seus valores", () => {
    expect(migration).toContain("lower(party.display_name) like v_search_term || '%'");
    expect(migration).toContain("profile.primary_email");
    expect(migration).toContain("profile.primary_phone");
    expect(migration).toContain("profile.messaging_phone");
    expect(migration).toContain("profile.document_reference");
    expect(migration).toContain("profile.identity_document_reference");
    expect(returnedColumns).not.toMatch(/primary_email|primary_phone|messaging_phone|document_reference|identity_document_reference/i);
  });

  it("não cria domínio comercial, financeiro, contratual ou conteúdo documental", () => {
    expect(migration).not.toMatch(/\b(credit|income|score|financing|sale|lot|price|proposal|contract|registry|billing|payment|transfer|file_bytes|document_url)\b/i);
    expect(migration).toContain("security definer");
    expect(migration).toContain("to service_role");
  });
});
