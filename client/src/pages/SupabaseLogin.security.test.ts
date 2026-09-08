import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("jornada de login Supabase", () => {
  const source = readFileSync(resolve(process.cwd(), "client/src/pages/SupabaseLogin.tsx"), "utf8");

  it("prioriza Google com retorno interno e não expõe o destino a redirecionamento externo", () => {
    expect(source).toContain("signInWithOAuth");
    expect(source).toContain('provider: "google"');
    expect(source).toContain("window.location.origin}/entrar?proximo=${encodeURIComponent(destination)}");
    expect(source).toContain("Continuar com Google");
    expect(source).not.toContain("window.location.assign(data.url)");
  });

  it("não exige mais sessão de plataforma antes de oferecer o login Google", () => {
    expect(source).not.toContain("useAuth");
    expect(source).not.toContain("startLogin");
    expect(source).toContain('const showSignInForm = state === "missing"');
  });

  it("mantém a senha de contingência apenas na interação local e não registra seu conteúdo", () => {
    expect(source).toContain("signInWithPassword");
    expect(source).toContain('autoComplete="current-password"');
    expect(source).toContain('setPassword("")');
    expect(source).toContain("Usar acesso de contingência com senha");
    expect(source).not.toContain("localStorage");
    expect(source).not.toContain("console.");
  });

  it("encerra somente a sessão local do contexto e deixa alçadas fora do fluxo", () => {
    expect(source).toContain('signOut({ scope: "local" })');
    expect(source).toContain("Não cria organização, membership, grant, escopo, perfil administrativo");
    expect(source).toContain("MFA e validação do servidor");
  });
});
