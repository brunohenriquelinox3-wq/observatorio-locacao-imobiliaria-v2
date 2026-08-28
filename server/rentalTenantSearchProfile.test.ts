import { describe, expect, it, vi } from "vitest";
import { listDraftRentalTenantSearchProfiles, upsertDraftRentalTenantSearchProfile } from "./rentalTenantSearchProfile";

const subjectId = "550e8400-e29b-41d4-a716-446655440000";
const organizationId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const intakeId = "7ba7b810-9dad-11d1-80b4-00c04fd430c8";
const profileId = "8ba7b810-9dad-11d1-80b4-00c04fd430c8";
const correlationId = "9ba7b810-9dad-11d1-80b4-00c04fd430c8";
const context = { organizationId, module: "locacao" as const, purposeCode: "CADASTRO_INICIAL" };
const rpc = vi.fn();
const client = { rpc } as never;

describe("rental tenant search profile server boundary", () => {
  it("fails before using the service client when the Supabase identity is absent", async () => {
    await expect(listDraftRentalTenantSearchProfiles(undefined, context, client)).rejects.toThrow("RENTAL_IDENTITY_REQUIRED");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("reads only a minimized contextual search profile", async () => {
    rpc.mockResolvedValueOnce({ data: [{ profile_id: profileId, intake_id: intakeId, accepted_asset_kinds: ["apartment", "kitnet"], occupancy_timing: "up_to_30_days", preference_code: "MORADIA_URBANA", created_at: "2026-08-28T00:00:00+00:00" }], error: null });
    await expect(listDraftRentalTenantSearchProfiles(subjectId, context, client)).resolves.toEqual([{ profileId, intakeId, acceptedAssetKinds: ["apartment", "kitnet"], occupancyTiming: "up_to_30_days", preferenceCode: "MORADIA_URBANA", createdAt: "2026-08-28T00:00:00+00:00" }]);
    expect(rpc).toHaveBeenLastCalledWith("rental_list_draft_tenant_search_profiles", expect.objectContaining({ p_actor_user_id: subjectId, p_module: "locacao" }));
  });

  it("uses a protected contextual RPC to upsert the profile", async () => {
    rpc.mockResolvedValueOnce({ data: profileId, error: null });
    await upsertDraftRentalTenantSearchProfile(subjectId, { ...context, correlationId, intakeId, acceptedAssetKinds: ["apartment"], occupancyTiming: "immediate", preferenceCode: "MORADIA_URBANA" }, client);
    expect(rpc).toHaveBeenLastCalledWith("rental_upsert_draft_tenant_search_profile", expect.objectContaining({ p_intake_id: intakeId, p_accepted_asset_kinds: ["apartment"], p_correlation_id: correlationId }));
  });
});
