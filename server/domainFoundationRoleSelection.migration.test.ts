import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const migrationPath = resolve(import.meta.dirname, "../supabase/migrations/20260901202000_list_draft_party_roles_a63.sql");

describe("A63 leitura minimizada de papéis temporais", () => {
  it("mantém a leitura contextual, protegida e exclusiva ao servidor", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("domain_list_draft_party_roles");
    expect(sql).toContain("private.require_domain_draft_authority");
    expect(sql).toContain("security definer");
    expect(sql).toContain("set search_path = ''");
    expect(sql).toContain("from public, anon, authenticated");
    expect(sql).toContain("to service_role");
  });

  it("não introduz acesso direto ou dados financeiros, contratuais e documentais", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("assignment.purpose_code = trim(p_purpose_code)");
    expect(sql).not.toContain("create policy");
    expect(sql).not.toContain("cpf");
    expect(sql).not.toContain("cnpj");
    expect(sql).not.toContain("payment");
    expect(sql).not.toContain("contract");
  });
});
