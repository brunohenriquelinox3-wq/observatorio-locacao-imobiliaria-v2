import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "supabase/migrations/20260906120000_client_import_a192.sql"), "utf8");

describe("migração A192 de importação de clientes", () => {
  it("mantém o lote de importação sob RLS e sem privilégios diretos", () => {
    expect(source).toContain("create table public.client_import_batches");
    expect(source).toContain("alter table public.client_import_batches enable row level security");
    expect(source).toContain("revoke all on table public.client_import_batches from public, anon, authenticated");
  });

  it("requer organização ativa, papel administrativo, escopo e função com search_path seguro", () => {
    expect(source).toContain("organization.state = 'active'");
    expect(source).toContain("membership.role in ('organization_admin', 'area_admin')");
    expect(source).toContain("grant_record.scope_selector");
    expect(source).toContain("security definer");
    expect(source).toContain("set search_path = ''");
  });

  it("limita as colunas importadas, preserva correlação e restringe execução ao servidor", () => {
    expect(source).toContain("jsonb_array_length(p_rows) > 200");
    expect(source).toContain("CLIENT_IMPORT_DUPLICATE_INPUT");
    expect(source).toContain("client_import_batches_actor_correlation_unique");
    expect(source).toContain("payload_redacted");
    expect(source).toContain("grant execute on function public.client_import_draft_parties");
    expect(source).toContain("sem conteúdo, documento, identificador fiscal, contato, contrato ou financeiro");
    expect(source).toContain("p_rows jsonb");
  });
});
