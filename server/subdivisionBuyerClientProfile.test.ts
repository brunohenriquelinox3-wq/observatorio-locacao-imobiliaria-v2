import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getDraftSubdivisionBuyerClientProfile,
  listDraftSubdivisionBuyerClientContactPreferences,
  listDraftSubdivisionBuyerClientProfileSummaries,
  listDraftSubdivisionBuyerClientRequirements,
  upsertDraftSubdivisionBuyerClientContactPreference,
  upsertDraftSubdivisionBuyerClientProfile,
  upsertDraftSubdivisionBuyerClientRequirement,
} from "./subdivisionBuyerClientProfile";

const subjectId = "550e8400-e29b-41d4-a716-446655440000";
const organizationId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const buyerClientId = "7ba7b810-9dad-11d1-80b4-00c04fd430c8";
const profileId = "8ba7b810-9dad-11d1-80b4-00c04fd430c8";
const correlationId = "9ba7b810-9dad-11d1-80b4-00c04fd430c8";
const context = { organizationId, module: "loteadora" as const, purposeCode: "CADASTRO_INICIAL" };
const rpc = vi.fn();
const client = { rpc } as never;

describe("subdivision buyer client profile server boundary", () => {
  beforeEach(() => rpc.mockReset());

  it("fails before service access when identity is absent", async () => {
    await expect(listDraftSubdivisionBuyerClientProfileSummaries(undefined, context, client)).rejects.toThrow("SUBDIVISION_IDENTITY_REQUIRED");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("reads profile summaries without returning contact values or document references", async () => {
    rpc.mockResolvedValueOnce({ data: [{
      profile_id: profileId, buyer_client_id: buyerClientId, party_kind: "individual", registration_state: "base_data_in_progress",
      civil_status: "not_declared", representation_state: "self_represented", document_reference_present: true,
      primary_email_present: true, primary_phone_present: false, messaging_phone_present: false, updated_at: "2026-09-06T00:00:00+00:00",
    }], error: null });
    await expect(listDraftSubdivisionBuyerClientProfileSummaries(subjectId, context, client)).resolves.toEqual([{
      profileId, buyerClientId, partyKind: "individual", registrationState: "base_data_in_progress", civilStatus: "not_declared",
      representationState: "self_represented", documentReferencePresent: true, primaryEmailPresent: true,
      primaryPhonePresent: false, messagingPhonePresent: false, updatedAt: "2026-09-06T00:00:00+00:00",
    }]);
    expect(rpc).toHaveBeenLastCalledWith("subdivision_list_draft_buyer_client_profile_summaries", expect.objectContaining({ p_actor_user_id: subjectId, p_module: "loteadora" }));
  });

  it("returns a selected protected profile only through its contextual buyer client", async () => {
    rpc.mockResolvedValueOnce({ data: [{
      profile_id: profileId, buyer_client_id: buyerClientId, party_kind: "individual", registration_state: "base_data_in_progress",
      document_reference: null, identity_document_reference: null, primary_email: null, primary_phone: null, messaging_phone: null,
      civil_status: "not_declared", representation_state: "not_declared", updated_at: "2026-09-06T00:00:00+00:00",
    }], error: null });
    await expect(getDraftSubdivisionBuyerClientProfile(subjectId, { ...context, buyerClientId }, client)).resolves.toMatchObject({ profileId, buyerClientId, documentReference: null });
    expect(rpc).toHaveBeenLastCalledWith("subdivision_get_draft_buyer_client_profile", expect.objectContaining({ p_buyer_client_id: buyerClientId }));
  });

  it("uses protected, correlated RPCs for profile, requirements, and preferences", async () => {
    rpc.mockResolvedValueOnce({ data: profileId, error: null });
    await expect(upsertDraftSubdivisionBuyerClientProfile(subjectId, {
      ...context, correlationId, buyerClientId, partyKind: "individual", registrationState: "base_data_in_progress",
      documentReference: null, identityDocumentReference: null, primaryEmail: null, primaryPhone: null, messagingPhone: null, civilStatus: "not_declared", representationState: "not_declared",
    }, client)).resolves.toEqual({ profileId });
    expect(rpc).toHaveBeenLastCalledWith("subdivision_upsert_draft_buyer_client_profile", expect.objectContaining({ p_buyer_client_id: buyerClientId, p_correlation_id: correlationId }));

    rpc.mockResolvedValueOnce({ data: { requirement_code: "identity_evidence", requirement_state: "to_confirm" }, error: null });
    await expect(upsertDraftSubdivisionBuyerClientRequirement(subjectId, { ...context, correlationId, buyerClientId, requirementCode: "identity_evidence", requirementState: "to_confirm" }, client)).resolves.toEqual({ requirementCode: "identity_evidence", requirementState: "to_confirm" });
    expect(rpc).toHaveBeenLastCalledWith("subdivision_upsert_draft_buyer_client_requirement", expect.objectContaining({ p_requirement_code: "identity_evidence" }));

    rpc.mockResolvedValueOnce({ data: { contact_purpose: "service_contact", contact_channel: "email", preference_state: "granted" }, error: null });
    await expect(upsertDraftSubdivisionBuyerClientContactPreference(subjectId, { ...context, correlationId, buyerClientId, contactPurpose: "service_contact", contactChannel: "email", preferenceState: "granted" }, client)).resolves.toEqual({ contactPurpose: "service_contact", contactChannel: "email", preferenceState: "granted" });
    expect(rpc).toHaveBeenLastCalledWith("subdivision_upsert_draft_buyer_client_contact_preference", expect.objectContaining({ p_contact_channel: "email" }));
  });

  it("reads only enumerated requirement and preference states", async () => {
    rpc.mockResolvedValueOnce({ data: [{ requirement_code: "legal_entity_governance", requirement_state: "not_applicable", updated_at: "2026-09-06T00:00:00+00:00" }], error: null });
    await expect(listDraftSubdivisionBuyerClientRequirements(subjectId, { ...context, buyerClientId }, client)).resolves.toHaveLength(1);
    rpc.mockResolvedValueOnce({ data: [{ contact_purpose: "marketing_contact", contact_channel: "messaging", preference_state: "revoked", decided_at: "2026-09-06T00:00:00+00:00" }], error: null });
    await expect(listDraftSubdivisionBuyerClientContactPreferences(subjectId, { ...context, buyerClientId }, client)).resolves.toHaveLength(1);
  });
});
