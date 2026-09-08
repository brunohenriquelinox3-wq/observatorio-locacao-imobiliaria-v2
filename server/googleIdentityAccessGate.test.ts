import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const trpcSource = readFileSync(resolve(projectRoot, "server/_core/trpc.ts"), "utf8");
const routerSource = readFileSync(resolve(projectRoot, "server/routers.ts"), "utf8");
const layoutSource = readFileSync(resolve(projectRoot, "client/src/components/DashboardLayout.tsx"), "utf8");

describe("acesso operacional por identidade Google", () => {
  it("exige sujeito Supabase válido nas rotas operacionais, sem exigir conta da plataforma", () => {
    expect(trpcSource).toContain("const requireSupabaseIdentity");
    expect(trpcSource).toContain("if (!ctx.supabaseSubjectId)");
    expect(trpcSource).toContain("export const protectedProcedure = t.procedure.use(requireSupabaseIdentity)");
  });

  it("mantém bootstrap privilegiado vinculado à proteção de plataforma já existente", () => {
    expect(trpcSource).toContain("const requireBootstrapOwner");
    expect(trpcSource).toContain("ctx.user.openId !== ENV.ownerOpenId");
    expect(trpcSource).toContain("export const bootstrapOwnerProcedure");
  });

  it("expõe somente estado mínimo de sessão ao cliente e não o identificador do sujeito", () => {
    expect(routerSource).toContain("await ensureAuthenticatedGoogleIdentity(ctx.supabaseSubjectId)");
    expect(routerSource).toContain('return { authenticated: true, provider: "supabase" as const };');
    expect(routerSource).not.toContain("me: publicProcedure.query(opts => opts.ctx.user)");
  });

  it("direciona o gate visual ao login Google com retorno somente interno", () => {
    expect(layoutSource).toContain("Entrar com Google");
    expect(layoutSource).toContain("/entrar?proximo=${encodeURIComponent(currentPath)}");
    expect(layoutSource).not.toContain("startLogin");
  });
});
