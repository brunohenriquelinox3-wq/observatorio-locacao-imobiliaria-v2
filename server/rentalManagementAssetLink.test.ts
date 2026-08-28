import { describe, expect, it, vi } from "vitest";
import { linkDraftRentalManagementAsset, listDraftRentalManagementAssetLinks } from "./rentalManagementAssetLink";

const subjectId = "550e8400-e29b-41d4-a716-446655440000";
const organizationId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const intakeId = "7ba7b810-9dad-11d1-80b4-00c04fd430c8";
const assetId = "8ba7b810-9dad-11d1-80b4-00c04fd430c8";
const linkId = "9ba7b810-9dad-11d1-80b4-00c04fd430c8";
const correlationId = "0ba7b810-9dad-11d1-80b4-00c04fd430c8";
const context = { organizationId, module: "locacao" as const, purposeCode: "CADASTRO_INICIAL" };
const rpc = vi.fn();
const client = { rpc } as never;

describe("rental management asset link server boundary", () => {
  it("fails before a service-client call when the Supabase identity is absent", async () => {
    await expect(listDraftRentalManagementAssetLinks(undefined, context, client)).rejects.toThrow("RENTAL_IDENTITY_REQUIRED");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("reads only minimized contextual asset-link fields", async () => {
    rpc.mockResolvedValueOnce({ data: [{ link_id: linkId, intake_id: intakeId, asset_id: assetId, asset_kind: "house", asset_reference_label: "Ativo em rascunho", asset_internal_reference: "LOC-001", linked_at: "2026-08-28T00:00:00+00:00" }], error: null });
    await expect(listDraftRentalManagementAssetLinks(subjectId, context, client)).resolves.toEqual([{ linkId, intakeId, assetId, assetKind: "house", assetReferenceLabel: "Ativo em rascunho", assetInternalReference: "LOC-001", linkedAt: "2026-08-28T00:00:00+00:00" }]);
    expect(rpc).toHaveBeenLastCalledWith("rental_list_draft_management_asset_links", expect.objectContaining({ p_module: "locacao", p_actor_user_id: subjectId }));
  });

  it("uses the protected link RPC with explicit context and correlation", async () => {
    rpc.mockResolvedValueOnce({ data: linkId, error: null });
    await linkDraftRentalManagementAsset(subjectId, { ...context, correlationId, intakeId, assetId }, client);
    expect(rpc).toHaveBeenLastCalledWith("rental_link_draft_management_asset", expect.objectContaining({ p_intake_id: intakeId, p_asset_id: assetId, p_correlation_id: correlationId }));
  });
});
