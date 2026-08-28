import { describe, expect, it, vi } from "vitest";
import { linkDraftUrbanLeadAsset, listDraftUrbanLeadAssetLinks } from "./urbanLeadAssetLink";

const subjectId = "550e8400-e29b-41d4-a716-446655440000";
const organizationId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const leadId = "7ba7b810-9dad-11d1-80b4-00c04fd430c8";
const assetId = "8ba7b810-9dad-11d1-80b4-00c04fd430c8";
const linkId = "9ba7b810-9dad-11d1-80b4-00c04fd430c8";
const correlationId = "0ba7b810-9dad-11d1-80b4-00c04fd430c8";
const context = { organizationId, module: "vendas_urbanas" as const, purposeCode: "CADASTRO_INICIAL" };
const rpc = vi.fn();
const client = { rpc } as never;

describe("urban lead asset link server boundary", () => {
  it("fails before a service-client call when the Supabase identity is absent", async () => {
    await expect(listDraftUrbanLeadAssetLinks(undefined, context, client)).rejects.toThrow("URBAN_IDENTITY_REQUIRED");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("reads only minimized contextual asset-link fields", async () => {
    rpc.mockResolvedValueOnce({ data: [{ link_id: linkId, lead_id: leadId, asset_id: assetId, asset_kind: "house", asset_reference_label: "Ativo em rascunho", asset_internal_reference: "URB-001", linked_at: "2026-08-28T00:00:00+00:00" }], error: null });
    await expect(listDraftUrbanLeadAssetLinks(subjectId, context, client)).resolves.toEqual([{ linkId, leadId, assetId, assetKind: "house", assetReferenceLabel: "Ativo em rascunho", assetInternalReference: "URB-001", linkedAt: "2026-08-28T00:00:00+00:00" }]);
    expect(rpc).toHaveBeenLastCalledWith("urban_list_draft_lead_asset_links", expect.objectContaining({ p_module: "vendas_urbanas", p_actor_user_id: subjectId }));
  });

  it("uses the protected link RPC with explicit context and correlation", async () => {
    rpc.mockResolvedValueOnce({ data: linkId, error: null });
    await linkDraftUrbanLeadAsset(subjectId, { ...context, correlationId, leadId, assetId }, client);
    expect(rpc).toHaveBeenLastCalledWith("urban_link_draft_lead_asset", expect.objectContaining({ p_lead_id: leadId, p_asset_id: assetId, p_correlation_id: correlationId }));
  });
});
