import { describe, expect, it } from "vitest";
import { presentSubdivisionInternalRoleCommandError } from "./subdivisionInternalRoleErrorPresentation";

describe("subdivision internal role error presentation", () => {
  it("orients an ineligible development or role", () => {
    const result = presentSubdivisionInternalRoleCommandError(
      "SUBDIVISION_INTERNAL_ROLE_CONTEXT_DENIED"
    );

    expect(result.title).toBe("Papel não vinculado");
    expect(result.description).toContain("loteamento ou o papel selecionado");
    expect(result.description).not.toMatch(/SUBDIVISION_|SQL|RPC|ID|endpoint/i);
  });

  it("orients an unavailable working context", () => {
    const result = presentSubdivisionInternalRoleCommandError(
      "DOMAIN_CONTEXT_DENIED"
    );

    expect(result.title).toBe("Contexto não liberado");
    expect(result.description).toContain("organização ou a finalidade");
  });

  it("does not expose unexpected details", () => {
    const result = presentSubdivisionInternalRoleCommandError(
      "private identifier and SQL detail"
    );

    expect(result.title).toBe("Papel não vinculado");
    expect(result.description).not.toContain("private identifier");
    expect(result.code).toBeNull();
  });
});
