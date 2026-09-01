import { describe, expect, it } from "vitest";
import { getPlatformBootstrapPresentation } from "./platformBootstrapPresentation";

describe("platform bootstrap presentation", () => {
  it("does not describe bootstrap as pending after the principal becomes active", () => {
    const presentation = getPlatformBootstrapPresentation({ identityState: "active", mfaVerified: true });
    expect(presentation.actionLabel).toBe("Bootstrap inicial concluído");
    expect(presentation.actionDisabled).toBe(true);
    expect(presentation.headline).toContain("ativo");
    expect(presentation.headline).not.toContain("pendente");
  });

  it("keeps the preparation state non-privileged before activation", () => {
    const presentation = getPlatformBootstrapPresentation({ bootstrapAction: "available", mfaVerified: true });
    expect(presentation.actionLabel).toBe("Preparar bootstrap");
    expect(presentation.actionDisabled).toBe(false);
    expect(presentation.heroText).toContain("nenhuma alçada");
  });
});
