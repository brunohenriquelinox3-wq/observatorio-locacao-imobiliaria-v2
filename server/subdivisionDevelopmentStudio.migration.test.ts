import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "supabase/migrations/20260906160000_subdivision_development_studio_a195.sql"), "utf8");

describe("migração A195 do estúdio de loteamentos", () => {
  it("preserva o rascunho sob RLS, organização ativa e execução exclusiva do servidor", () => {
    expect(source).toContain("alter table public.subdivision_development_attachments enable row level security");
    expect(source).toContain("organization.state = 'active'");
    expect(source).toContain("security definer");
    expect(source).toContain("set search_path = ''");
    expect(source).toContain("grant execute on function public.subdivision_create_draft_development_v2");
  });

  it("implementa edição e arquivamento lógico sem apagar dependências em cascata", () => {
    expect(source).toContain("subdivision_update_draft_development_v2");
    expect(source).toContain("subdivision_archive_draft_development_v2");
    expect(source).toContain("SUBDIVISION_DEVELOPMENT_ARCHIVE_DEPENDENCY_DENIED");
    expect(source).toContain("archive_mode', 'logical'");
    expect(source).toContain("storage_key = null");
  });

  it("não introduz campos proibidos de financeiro, contrato ou documento pessoal", () => {
    expect(source).not.toMatch(/add column (cpf|cnpj|matricula|contrato|pagamento|repasse)\b/i);
    expect(source).not.toMatch(/create table public\.subdivision_development_attachments[\s\S]*?\n\s*(cpf|cnpj|matricula|contrato|pagamento|repasse)\s/i);
  });
});
