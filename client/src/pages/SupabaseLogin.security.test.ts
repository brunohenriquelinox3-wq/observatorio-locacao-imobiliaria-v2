import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("jornada de login Supabase", () => {
  const source = readFileSync(resolve(process.cwd(), "client/src/pages/SupabaseLogin.tsx"), "utf8");

  it("mantém a senha apenas na interação local e não registra seu conteúdo", () => {
    expect(source).toContain("signInWithPassword");
    expect(source).toContain('autoComplete="current-password"');
    expect(source).toContain('setPassword("")');
    expect(source).not.toContain("localStorage");
    expect(source).not.toContain("console.");
  });

  it("encerra somente a sessão local do contexto e deixa alçadas fora do fluxo", () => {
    expect(source).toContain('signOut({ scope: "local" })');
    expect(source).toContain("Não cria organização, membership, grant, escopo, perfil administrativo");
    expect(source).toContain("MFA e validação do servidor");
  });
});
