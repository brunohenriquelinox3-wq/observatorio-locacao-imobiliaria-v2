import { describe, expect, it } from "vitest";
import { getPlatformIdentityPresentation } from "./platformIdentityPresentation";

describe("platform identity presentation", () => {
  it("hides manual identity fields after the session is connected", () => {
    const presentation = getPlatformIdentityPresentation("connected");
    expect(presentation.isConnected).toBe(true);
    expect(presentation.description).toContain("não exibir e-mail ou senha");
  });

  it("keeps the manual flow available only without a connected identity", () => {
    expect(getPlatformIdentityPresentation("not_connected").isConnected).toBe(false);
  });
});
