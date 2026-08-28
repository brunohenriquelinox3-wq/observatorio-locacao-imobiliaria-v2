import { describe, expect, it, vi } from "vitest";
import { attachDraftAssetParty, createDraftUrbanAsset, listDraftUrbanAssets, setDraftAssetModuleState } from "./assetFoundation";

const subjectId = "550e8400-e29b-41d4-a716-446655440000";
const organizationId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const correlationId = "7ba7b810-9dad-11d1-80b4-00c04fd430c8";
const assetId = "8ba7b810-9dad-11d1-80b4-00c04fd430c8";
const partyId = "9ba7b810-9dad-11d1-80b4-00c04fd430c8";
const rpc = vi.fn();
const client = { rpc } as never;

describe("urban asset server boundary", () => {
  it("fails before using the server credential when identity is absent", async () => {
    await expect(listDraftUrbanAssets(undefined, { organizationId, module: "locacao", purposeCode: "CADASTRO_INICIAL" }, client)).rejects.toThrow("ASSET_IDENTITY_REQUIRED");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("reads minimized asset rows only through contextual RPC", async () => {
    rpc.mockResolvedValueOnce({ data: [{ asset_id: assetId, kind: "apartment", reference_label: "Unidade teste", internal_reference: "VU-001", module_state: "blocked", state_reason_present: true, party_relation_count: 1 }], error: null });
    await expect(listDraftUrbanAssets(subjectId, { organizationId, module: "vendas_urbanas", purposeCode: "CADASTRO_INICIAL" }, client)).resolves.toEqual([{ assetId, kind: "apartment", referenceLabel: "Unidade teste", internalReference: "VU-001", moduleState: "blocked", stateReasonPresent: true, partyRelationCount: 1 }]);
    expect(rpc).toHaveBeenLastCalledWith("domain_list_draft_urban_assets", expect.objectContaining({ p_actor_user_id: subjectId, p_module: "vendas_urbanas" }));
  });

  it("creates assets, links Party and changes module state only through protected RPC names", async () => {
    rpc.mockResolvedValueOnce({ data: assetId, error: null });
    await createDraftUrbanAsset(subjectId, { organizationId, module: "locacao", purposeCode: "CADASTRO_INICIAL", correlationId, kind: "house", referenceLabel: "Casa em rascunho", internalReference: "LC-001" }, client);
    expect(rpc).toHaveBeenLastCalledWith("domain_create_draft_urban_asset", expect.any(Object));
    rpc.mockResolvedValueOnce({ data: "0ba7b810-9dad-11d1-80b4-00c04fd430c8", error: null });
    await attachDraftAssetParty(subjectId, { organizationId, module: "locacao", purposeCode: "CADASTRO_INICIAL", correlationId, assetId, partyId, relation: "management_authority" }, client);
    expect(rpc).toHaveBeenLastCalledWith("domain_attach_draft_asset_party", expect.objectContaining({ p_relation: "management_authority" }));
    rpc.mockResolvedValueOnce({ data: "1ba7b810-9dad-11d1-80b4-00c04fd430c8", error: null });
    await setDraftAssetModuleState(subjectId, { organizationId, module: "locacao", purposeCode: "CADASTRO_INICIAL", correlationId, assetId, state: "blocked", reasonCode: "PENDENCIA_DOCUMENTAL" }, client);
    expect(rpc).toHaveBeenLastCalledWith("domain_set_draft_asset_module_state", expect.objectContaining({ p_state: "blocked", p_reason_code: "PENDENCIA_DOCUMENTAL" }));
  });
});
