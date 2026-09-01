import { describe, expect, it } from "vitest";
import { getPlatformPrincipalPresentation } from "./platformPrincipalPresentation";

describe("platform principal presentation", () => {
  it("distingue o SUPER ADM ativo de grants delegados", () => {
    const result = getPlatformPrincipalPresentation({ identityState: "active", commandMode: "ready_for_controlled_commands", platformRole: "platform_super_admin" });
    expect(result.isPlatformSuperAdmin).toBe(true);
    expect(result.identityStatus).toContain("SUPER ADM de plataforma ativo");
    expect(result.bootstrapCardLabel).toBe("Bootstrap inicial concluído");
  });

  it("não presume SUPER ADM apenas por identidade conectada", () => {
    const result = getPlatformPrincipalPresentation({ identityState: "active", commandMode: "ready_for_controlled_commands", platformRole: "platform_support_operator" });
    expect(result.isPlatformSuperAdmin).toBe(false);
    expect(result.identityStatus).not.toContain("SUPER ADM de plataforma ativo");
  });
});
