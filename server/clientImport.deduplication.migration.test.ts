import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "supabase/migrations/20260906133000_client_import_party_reuse_a193.sql"), "utf8");

describe("migração A193 de deduplicação canônica", () => {
  it("reutiliza Party em rascunho antes de criar uma nova atribuição de papel", () => {
    expect(source).toContain("select party.id into v_party_id");
    expect(source).toContain("if v_party_id is not null then");
    expect(source).toContain("select role_assignment.id into v_role_id");
    expect(source).toContain("if v_party_id is null then");
    expect(source).toContain("insert into public.party_role_assignments");
  });

  it("serializa a chave de deduplicação e preserva o escopo seguro da RPC", () => {
    expect(source).toContain("pg_advisory_xact_lock");
    expect(source).toContain("security definer");
    expect(source).toContain("set search_path = ''");
    expect(source).toContain("revoke all on function public.client_import_draft_parties");
    expect(source).toContain("grant execute on function public.client_import_draft_parties");
  });
});
