import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260905112000_workforce_access_delegation_a185.sql"), "utf8");

describe("A185 workforce access migration", () => {
  it("mantém RLS, RPCs SECURITY DEFINER, idempotência e grants somente de serviço", () => {
    expect(migration).toContain("alter table public.workforce_access_requests enable row level security");
    expect(migration).toContain("security definer");
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain("p_correlation_id");
    expect(migration).toContain("revoke all on function");
    expect(migration).toContain("to service_role");
  });

  it("separa preparação de aceite e veda papéis de plataforma ou escopo platform", () => {
    expect(migration).toContain("organization_prepare_workforce_access");
    expect(migration).toContain("organization_accept_own_workforce_access");
    expect(migration).toContain("if p_role <> 'operator'");
    expect(migration).toContain("module_name not in ('loteadora', 'vendas_urbanas', 'locacao')");
    expect(migration).toContain("platform_super_admin");
  });

  it("não introduz e-mail, tabela de convite automático ou credencial no ciclo de equipe", () => {
    expect(migration).not.toMatch(/email|password|token/i);
    expect(migration).not.toContain("access_invitations");
    expect(migration).not.toContain("recipient_email_digest");
  });
});
