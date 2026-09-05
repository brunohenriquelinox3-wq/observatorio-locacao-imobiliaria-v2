import { describe, expect, it, vi } from "vitest";
import {
  acceptOwnWorkforceAccess,
  listOwnWorkforceAccessRequests,
  prepareOrganizationWorkforceAccess,
  requestOwnWorkforceAccess,
} from "./adminWorkforceAccess";

const subjectId = "11111111-1111-4111-8111-111111111111";
const requestId = "22222222-2222-4222-8222-222222222222";
const correlationId = "33333333-3333-4333-8333-333333333333";

describe("adminWorkforceAccess", () => {
  it("nega solicitação sem subject e não chama RPC", async () => {
    const rpc = vi.fn();
    await expect(requestOwnWorkforceAccess(null, { organizationReference: "Organização", profile: "broker", correlationId }, { rpc } as never)).rejects.toThrow("WORKFORCE_ACCESS_PRECONDITIONS_UNMET");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("encaminha solicitação e aceite próprios para RPCs separadas", async () => {
    const rpc = vi.fn()
      .mockResolvedValueOnce({ data: requestId, error: null })
      .mockResolvedValueOnce({ data: requestId, error: null });
    await expect(requestOwnWorkforceAccess(subjectId, { organizationReference: "Organização", profile: "collaborator", correlationId }, { rpc } as never)).resolves.toEqual({ requestId, state: "requested" });
    await expect(acceptOwnWorkforceAccess(subjectId, { requestId, correlationId }, { rpc } as never)).resolves.toEqual({ requestId, state: "active" });
    expect(rpc).toHaveBeenNthCalledWith(1, "organization_request_workforce_access", expect.objectContaining({ p_actor_user_id: subjectId, p_workforce_profile: "collaborator" }));
    expect(rpc).toHaveBeenNthCalledWith(2, "organization_accept_own_workforce_access", expect.objectContaining({ p_actor_user_id: subjectId, p_request_id: requestId }));
  });

  it("prepara operador com escopo explícito e normaliza listas sem identidade", async () => {
    const rpc = vi.fn()
      .mockResolvedValueOnce({ data: requestId, error: null })
      .mockResolvedValueOnce({ data: [{ request_id: requestId, organization_label: "Organização", workforce_profile: "broker", request_state: "requested", user_id: subjectId }], error: null });
    await expect(prepareOrganizationWorkforceAccess(subjectId, {
      requestId,
      role: "operator",
      scopeSelector: { modules: ["loteadora"] },
      purposeCode: "cadastro_inicial",
      expiresAt: "2026-09-06T00:00:00.000Z",
      correlationId,
    }, { rpc } as never)).resolves.toEqual({ requestId, state: "prepared" });
    await expect(listOwnWorkforceAccessRequests(subjectId, { rpc } as never)).resolves.toEqual([{ requestId, organizationLabel: "Organização", profile: "broker", state: "requested" }]);
    expect(rpc).toHaveBeenNthCalledWith(1, "organization_prepare_workforce_access", expect.objectContaining({ p_role: "operator", p_scope_selector: { modules: ["loteadora"] } }));
  });
});
