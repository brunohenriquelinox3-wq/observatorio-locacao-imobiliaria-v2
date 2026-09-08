import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(resolve(process.cwd(), "supabase/migrations/20260908110000_authenticated_google_identity_bootstrap_a308.sql"), "utf8");

describe("A308 — bootstrap de identidade Google", () => {
  it("exige usuário autenticado canônico e não concede alçada", () => {
    expect(migration).toContain("from auth.users auth_user where auth_user.id = p_actor_user_id");
    expect(migration).toContain("insert into public.identity_subjects");
    expect(migration).toContain("on conflict (user_id) do nothing");
    expect(migration).toContain("acesso operacional exige membership, grant, escopo e vigência próprios");
  });

  it("é privado ao serviço e não contém operações financeiras ou comunicação externa", () => {
    expect(migration).toContain("revoke all on function public.ensure_authenticated_identity_subject(uuid) from public, anon, authenticated");
    expect(migration).toContain("grant execute on function public.ensure_authenticated_identity_subject(uuid) to service_role");
    expect(migration).not.toMatch(/payment|transfer|split|boleto|remessa|mensagem|webhook/i);
  });
});
