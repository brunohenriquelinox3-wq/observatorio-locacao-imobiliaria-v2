import { describe, expect, it, vi } from "vitest";
import { assignDraftPartyRole, createDraftParty, listDraftParties } from "./domainFoundation";

const subjectId = "550e8400-e29b-41d4-a716-446655440000";
const organizationId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const correlationId = "7ba7b810-9dad-11d1-80b4-00c04fd430c8";
const partyId = "8ba7b810-9dad-11d1-80b4-00c04fd430c8";

const rpc = vi.fn();
const client = { rpc } as never;

describe("canonical domain foundation server boundary", () => {
  it("requires a connected identity before accessing the service credential", async () => {
    await expect(listDraftParties(undefined, { organizationId, module: "locacao", purposeCode: "CADASTRO_INICIAL" }, client)).rejects.toThrow("DOMAIN_IDENTITY_REQUIRED");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("uses contextual server RPCs for list and draft creation without direct table operations", async () => {
    rpc.mockResolvedValueOnce({ data: [{ party_id: partyId, kind: "individual", display_name: "Parte de teste", source_kind: "operator_declaration", role_count: 1 }], error: null });
    await expect(listDraftParties(subjectId, { organizationId, module: "locacao", purposeCode: "CADASTRO_INICIAL" }, client)).resolves.toEqual([{ partyId, kind: "individual", displayName: "Parte de teste", sourceKind: "operator_declaration", roleCount: 1 }]);

    rpc.mockResolvedValueOnce({ data: partyId, error: null });
    await expect(createDraftParty(subjectId, { organizationId, module: "locacao", purposeCode: "CADASTRO_INICIAL", correlationId, kind: "individual", displayName: "Parte de teste", sourceKind: "operator_declaration" }, client)).resolves.toEqual({ partyId });
    expect(rpc).toHaveBeenLastCalledWith("domain_create_draft_party", expect.objectContaining({ p_actor_user_id: subjectId, p_organization_id: organizationId, p_module: "locacao" }));
  });

  it("passes role assignment only through the contextual RPC and preserves temporal fields", async () => {
    rpc.mockResolvedValueOnce({ data: "9ba7b810-9dad-11d1-80b4-00c04fd430c8", error: null });
    await assignDraftPartyRole(subjectId, { organizationId, module: "vendas_urbanas", purposeCode: "CADASTRO_INICIAL", correlationId, partyId, role: "buyer", beginsAt: "2026-08-27T00:00:00.000Z" }, client);
    expect(rpc).toHaveBeenLastCalledWith("domain_assign_draft_party_role", expect.objectContaining({ p_party_id: partyId, p_role: "buyer", p_ends_at: null }));
  });
});
