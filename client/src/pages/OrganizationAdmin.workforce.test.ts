import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/OrganizationAdmin.tsx"), "utf8");

describe("painel ADM — preparação de equipe", () => {
  it("exige subject Supabase confirmado antes de habilitar o painel de preparação", () => {
    expect(source).toContain("trpc.foundation.identity.useQuery");
    expect(source).toContain('identity.data?.state === "connected"');
    expect(source).toContain("const canPrepareWorkforce = isAuthenticated && identity.data?.state === \"connected\"");
    expect(source).toContain('<WorkforceManagementPanel mode="organization" canPrepare={canPrepareWorkforce} />');
  });

  it("preserva as consultas de módulo condicionadas à autenticação sem conceder contexto", () => {
    expect(source).toContain('trpc.organizationContext.listAuthorizedForModule.useQuery({ module: "loteadora" }, queryOptions)');
    expect(source).toContain("A aparência não substitui membership, grant ou policy.");
  });

  it("deixa a jornada de MFA visível antes de comandos de cadastro ou delegação", () => {
    expect(source).toContain('href="/seguranca-mfa"');
    expect(source).toContain("Configurar ou renovar MFA");
    expect(source).toContain("Valide sua segurança antes de criar ou alterar.");
    expect(source).toContain("você precisa confirmar o MFA.");
  });
});
