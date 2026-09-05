import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/OwnWorkforceAccess.tsx"), "utf8");

describe("OwnWorkforceAccess", () => {
  it("permite a solicitação e o aceite apenas do próprio sujeito autenticado", () => {
    expect(source).toContain("trpc.foundation.identity.useQuery");
    expect(source).toContain('identity.data?.state === "connected"');
    expect(source).toContain("const canRequest = isAuthenticated && hasSupabaseSubject");
    expect(source).toContain("disabled={!canRequest || requestMutation.isPending}");
    expect(source).toContain("requestOwnWorkforceAccess");
    expect(source).toContain("listOwnWorkforceAccessRequests");
    expect(source).toContain("acceptOwnWorkforceAccess");
    expect(source).toContain("Aceitar minha delegação");
  });

  it("explica que solicitação não é acesso e não cria convite ou senha", () => {
    expect(source).toContain("A solicitação não é acesso");
    expect(source).not.toContain('type="email"');
    expect(source).not.toContain('type="password"');
    expect(source).not.toContain("window.location.href");
    expect(source).toContain("A sessão da plataforma, isoladamente, não libera solicitação nem leitura.");
  });
});
