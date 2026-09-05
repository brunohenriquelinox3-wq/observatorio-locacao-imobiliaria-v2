import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "supabase/migrations/20260906170000_subdivision_identity_dossier_a206.sql"), "utf8");

describe("migração A206 do dossiê de identificação", () => {
  it("amplia somente o rascunho com classificação e referência territorial controladas", () => {
    expect(source).toContain("add column parceling_mode");
    expect(source).toContain("add column territorial_context");
    expect(source).toContain("add column predominant_use");
    expect(source).toContain("add column territorial_reference");
    expect(source).toContain("add column identification_note");
    expect(source).toContain("add value if not exists 'identity'");
  });

  it("mantém autoridade ativa, funções seguras, auditoria redigida e execução exclusiva do servidor", () => {
    expect(source).toContain("private.require_active_subdivision_draft_authority");
    expect(source).toContain("security definer");
    expect(source).toContain("set search_path = ''");
    expect(source).toContain("payload_redacted");
    expect(source).toContain("revoke all on function public.subdivision_create_draft_development_v3");
    expect(source).toContain("grant execute on function public.subdivision_create_draft_development_v3");
  });

  it("não introduz coluna de pessoa, venda, contrato ou financeiro", () => {
    expect(source).not.toMatch(/add column (cpf|cnpj|email|telefone|preco|valor|venda|contrato|cobranca|pagamento|repasse)\b/i);
  });
});
