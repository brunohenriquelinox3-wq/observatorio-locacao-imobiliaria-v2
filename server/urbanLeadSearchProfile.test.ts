import { describe, expect, it, vi } from "vitest";
import { listDraftUrbanLeadSearchProfiles, upsertDraftUrbanLeadSearchProfile } from "./urbanLeadSearchProfile";

const subjectId = "550e8400-e29b-41d4-a716-446655440000";
const organizationId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const leadId = "7ba7b810-9dad-11d1-80b4-00c04fd430c8";
const profileId = "8ba7b810-9dad-11d1-80b4-00c04fd430c8";
const correlationId = "9ba7b810-9dad-11d1-80b4-00c04fd430c8";
const context = { organizationId, module: "vendas_urbanas" as const, purposeCode: "CADASTRO_INICIAL" };
const rpc = vi.fn();
const client = { rpc } as never;

describe("urban lead search profile server boundary", () => {
  it("fails before a service-client call when the Supabase identity is absent", async () => {
    await expect(listDraftUrbanLeadSearchProfiles(undefined, context, client)).rejects.toThrow("URBAN_IDENTITY_REQUIRED");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("reads only a minimized contextual urban search profile", async () => {
    rpc.mockResolvedValueOnce({ data: [{ profile_id: profileId, lead_id: leadId, accepted_asset_kinds: ["house", "apartment"], search_timing: "up_to_90_days", preference_present: true, updated_at: "2026-08-28T00:00:00+00:00" }], error: null });
    await expect(listDraftUrbanLeadSearchProfiles(subjectId, context, client)).resolves.toEqual([{ profileId, leadId, acceptedAssetKinds: ["house", "apartment"], searchTiming: "up_to_90_days", preferencePresent: true, updatedAt: "2026-08-28T00:00:00+00:00" }]);
    expect(rpc).toHaveBeenLastCalledWith("urban_list_draft_lead_search_profiles", expect.objectContaining({ p_actor_user_id: subjectId, p_module: "vendas_urbanas" }));
  });

  it("uses a protected contextual RPC to upsert the search profile", async () => {
    rpc.mockResolvedValueOnce({ data: profileId, error: null });
    await upsertDraftUrbanLeadSearchProfile(subjectId, { ...context, correlationId, leadId, acceptedAssetKinds: ["house"], searchTiming: "immediate", preferenceCode: "MORADIA_URBANA" }, client);
    expect(rpc).toHaveBeenLastCalledWith("urban_upsert_draft_lead_search_profile", expect.objectContaining({ p_lead_id: leadId, p_accepted_asset_kinds: ["house"], p_correlation_id: correlationId }));
  });
});
