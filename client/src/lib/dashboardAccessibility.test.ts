import { describe, expect, it } from "vitest";
import { dashboardMainContentId, dashboardSkipLinkLabel } from "./dashboardAccessibility";

describe("atalho para o conteúdo principal", () => {
  it("mantém um destino e rótulo acessíveis em português", () => {
    expect(dashboardMainContentId).toBe("conteudo-principal");
    expect(dashboardSkipLinkLabel).toBe("Pular para o conteúdo principal");
  });
});
