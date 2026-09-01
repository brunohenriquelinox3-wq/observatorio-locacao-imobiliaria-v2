import { describe, expect, it } from "vitest";
import { getDashboardProfilePresentation } from "./dashboardProfilePresentation";

describe("dashboard profile presentation", () => {
  it("uses session labels instead of identity data", () => {
    const presentation = getDashboardProfilePresentation();
    expect(presentation.avatarLabel).toBe("ADM");
    expect(presentation.sessionLabel).toBe("Sessão autenticada");
    expect(presentation.privacyLabel).toBe("Dados de perfil protegidos");
  });
});
