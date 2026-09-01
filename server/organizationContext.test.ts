import { describe, expect, it, vi } from "vitest";
import { listAuthorizedOrganizationContexts } from "./organizationContext";

describe("authorized organization contexts", () => {
  it("rejects a missing subject before asking the database", async () => {
    const rpc = vi.fn();
    await expect(listAuthorizedOrganizationContexts(undefined, { module: "loteadora" }, { rpc } as never)).rejects.toThrow("ORGANIZATION_CONTEXT_IDENTITY_REQUIRED");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("maps only the minimized context fields returned by the protected RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [{ organization_id: "org-1", organization_label: "Organização autorizada", purpose_code: " cadastro_inicial " }], error: null });
    await expect(listAuthorizedOrganizationContexts("subject-1", { module: "loteadora" }, { rpc } as never)).resolves.toEqual([
      { organizationId: "org-1", organizationLabel: "Organização autorizada", purposeCode: "CADASTRO_INICIAL" },
    ]);
    expect(rpc).toHaveBeenCalledWith("organization_list_authorized_contexts", { p_actor_user_id: "subject-1", p_module: "loteadora" });
  });

  it("fails closed when the RPC denies the read", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { message: "denied" } });
    await expect(listAuthorizedOrganizationContexts("subject-1", { module: "loteadora" }, { rpc } as never)).rejects.toThrow("ORGANIZATION_CONTEXT_READ_DENIED");
  });
});
