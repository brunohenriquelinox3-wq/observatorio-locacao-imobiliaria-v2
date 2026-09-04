import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  listDraftSubdivisionDevelopmentPreparationProfiles,
  upsertDraftSubdivisionDevelopmentPreparationProfile,
} from "./subdivisionDevelopmentPreparation";

const subjectId = "550e8400-e29b-41d4-a716-446655440000";
const organizationId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const developmentId = "7ba7b810-9dad-11d1-80b4-00c04fd430c8";
const preparationProfileId = "9ba7b810-9dad-11d1-80b4-00c04fd430c8";
const correlationId = "8ba7b810-9dad-11d1-80b4-00c04fd430c8";
const context = { organizationId, module: "loteadora" as const, purposeCode: "CADASTRO_INICIAL" };
const rpc = vi.fn();
const client = { rpc } as never;

describe("subdivision development preparation server boundary", () => {
  beforeEach(() => rpc.mockReset());

  it("fails before using the service client when the Supabase identity is absent", async () => {
    await expect(listDraftSubdivisionDevelopmentPreparationProfiles(undefined, context, client)).rejects.toThrow("SUBDIVISION_IDENTITY_REQUIRED");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("reads only the minimized contextual preparation summary", async () => {
    rpc.mockResolvedValueOnce({ data: [{ preparation_profile_id: preparationProfileId, development_id: developmentId, planning_state: "internal_study", municipal_preparation_state: "internal_organization", registration_preparation_state: "evidence_for_review", implementation_preparation_state: "internal_planning", responsible_internal_party_role_id: null, updated_at: "2026-09-04T00:00:00+00:00" }], error: null });
    await expect(listDraftSubdivisionDevelopmentPreparationProfiles(subjectId, context, client)).resolves.toEqual([{
      preparationProfileId, developmentId, planningState: "internal_study", municipalPreparationState: "internal_organization", registrationPreparationState: "evidence_for_review", implementationPreparationState: "internal_planning", responsibleInternalPartyRoleId: null, updatedAt: "2026-09-04T00:00:00+00:00",
    }]);
    expect(rpc).toHaveBeenLastCalledWith("subdivision_list_draft_development_preparation_profiles", expect.objectContaining({ p_actor_user_id: subjectId, p_module: "loteadora" }));
  });

  it("uses a protected contextual RPC and requires enumerated preparation values", async () => {
    rpc.mockResolvedValueOnce({ data: preparationProfileId, error: null });
    await upsertDraftSubdivisionDevelopmentPreparationProfile(subjectId, {
      ...context, correlationId, developmentId, planningState: "internal_study", municipalPreparationState: "internal_organization", registrationPreparationState: "evidence_for_review", implementationPreparationState: "internal_planning", responsibleInternalPartyRoleId: null,
    }, client);
    expect(rpc).toHaveBeenLastCalledWith("subdivision_upsert_draft_development_preparation_profile", expect.objectContaining({ p_development_id: developmentId, p_planning_state: "internal_study", p_responsible_internal_party_role_id: null, p_correlation_id: correlationId }));
    await expect(upsertDraftSubdivisionDevelopmentPreparationProfile(subjectId, {
      ...context, correlationId, developmentId, planningState: "invalid" as never, municipalPreparationState: "not_started", registrationPreparationState: "not_started", implementationPreparationState: "not_started", responsibleInternalPartyRoleId: null,
    }, client)).rejects.toThrow();
  });
});
