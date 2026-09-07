import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerSubdivisionBuyerClientDirect } from "./subdivisionBuyerClientDirect";

const subjectId = "550e8400-e29b-41d4-a716-446655440000";
const organizationId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const buyerClientId = "7ba7b810-9dad-11d1-80b4-00c04fd430c8";
const partyId = "8ba7b810-9dad-11d1-80b4-00c04fd430c8";
const partyRoleAssignmentId = "9ba7b810-9dad-11d1-80b4-00c04fd430c8";
const correlationId = "0ba7b810-9dad-11d1-80b4-00c04fd430c8";
const input = { organizationId, module: "loteadora" as const, purposeCode: "CADASTRO_INICIAL", correlationId, partyKind: "individual" as const, displayName: "Pessoa declarada" };
const rpc = vi.fn();
const client = { rpc } as never;

describe("subdivision direct buyer client boundary", () => {
  beforeEach(() => rpc.mockReset());

  it("requires identity before invoking the composed protected command", async () => {
    await expect(registerSubdivisionBuyerClientDirect(undefined, input, client)).rejects.toThrow("SUBDIVISION_IDENTITY_REQUIRED");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("uses one correlated contextual RPC and returns only internal links", async () => {
    rpc.mockResolvedValueOnce({ data: [{ buyer_client_id: buyerClientId, party_id: partyId, party_role_assignment_id: partyRoleAssignmentId }], error: null });
    await expect(registerSubdivisionBuyerClientDirect(subjectId, input, client)).resolves.toEqual({ buyerClientId, partyId, partyRoleAssignmentId });
    expect(rpc).toHaveBeenLastCalledWith("subdivision_register_buyer_client_direct", expect.objectContaining({ p_actor_user_id: subjectId, p_party_kind: "individual", p_display_name: "Pessoa declarada", p_correlation_id: correlationId }));
  });

  it("rejects unexpected response shapes instead of exposing partial data", async () => {
    rpc.mockResolvedValueOnce({ data: [{ buyer_client_id: buyerClientId }], error: null });
    await expect(registerSubdivisionBuyerClientDirect(subjectId, input, client)).rejects.toThrow("SUBDIVISION_BUYER_CLIENT_DIRECT_COMMAND_DENIED");
  });
});
