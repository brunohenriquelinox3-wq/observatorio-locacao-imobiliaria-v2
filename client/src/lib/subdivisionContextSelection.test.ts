import { describe, expect, it } from "vitest";
import { initialAuthorizedSubdivisionContextId, resolveAuthorizedSubdivisionContext } from "./subdivisionContextSelection";

const contexts = [
  { organizationId: "org-a", organizationLabel: "Organização A", purposeCode: "CADASTRO_INICIAL" },
];

describe("subdivision context selection", () => {
  it("preselects only a single authorized context", () => {
    expect(initialAuthorizedSubdivisionContextId(contexts)).toBe("org-a");
    expect(initialAuthorizedSubdivisionContextId([...contexts, { ...contexts[0], organizationId: "org-b" }])).toBe("");
  });

  it("resolves only a context returned by the authorized list", () => {
    expect(resolveAuthorizedSubdivisionContext("org-a", contexts)?.organizationLabel).toBe("Organização A");
    expect(resolveAuthorizedSubdivisionContext("not-authorized", contexts)).toBeUndefined();
  });
});
