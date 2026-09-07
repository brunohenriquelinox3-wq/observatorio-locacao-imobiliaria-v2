import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDraftSubdivisionBuyerClientDirectoryTotal, listDraftSubdivisionBuyerClientDirectory, listDraftSubdivisionBuyerClientTimeline } from "./subdivisionBuyerClientDirectory";

const subjectId = "550e8400-e29b-41d4-a716-446655440000";
const organizationId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const buyerClientId = "7ba7b810-9dad-11d1-80b4-00c04fd430c8";
const context = { organizationId, module: "loteadora" as const, purposeCode: "CADASTRO_INICIAL" };
const rpc = vi.fn();
const client = { rpc } as never;

describe("subdivision buyer client directory server boundary", () => {
  beforeEach(() => rpc.mockReset());

  it("requires identity before the contextual directory is read", async () => {
    await expect(listDraftSubdivisionBuyerClientDirectory(undefined, { ...context, searchTerm: null, pageSize: 18, pageOffset: 0 }, client)).rejects.toThrow("SUBDIVISION_IDENTITY_REQUIRED");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("returns only the contextual, minimized directory summary", async () => {
    rpc.mockResolvedValueOnce({ data: [{
      buyer_client_id: buyerClientId, display_name: "Pessoa declarada", party_kind: "individual", registration_state: "base_data_in_progress",
      profile_present: true, contact_channels_recorded: 1, requirements_pending: 2, requirements_total: 3,
      attachment_summary: "awaiting_private_upload", updated_at: "2026-09-07T00:00:00+00:00",
    }], error: null });
    await expect(listDraftSubdivisionBuyerClientDirectory(subjectId, { ...context, searchTerm: null, pageSize: 18, pageOffset: 0 }, client)).resolves.toEqual([{
      buyerClientId, displayName: "Pessoa declarada", partyKind: "individual", registrationState: "base_data_in_progress",
      profilePresent: true, contactChannelsRecorded: 1, requirementsPending: 2, requirementsTotal: 3,
      attachmentSummary: "awaiting_private_upload", updatedAt: "2026-09-07T00:00:00+00:00",
    }]);
    expect(rpc).toHaveBeenLastCalledWith("subdivision_list_draft_buyer_client_directory", expect.objectContaining({ p_actor_user_id: subjectId, p_search_term: null, p_page_size: 18 }));
  });

  it("returns only an aggregate total for the same authorized directory filter", async () => {
    rpc.mockResolvedValueOnce({ data: 109, error: null });
    await expect(getDraftSubdivisionBuyerClientDirectoryTotal(subjectId, { ...context, searchTerm: null, pageSize: 25, pageOffset: 0 }, client)).resolves.toEqual({ total: 109 });
    expect(rpc).toHaveBeenLastCalledWith("subdivision_count_draft_buyer_client_directory", expect.objectContaining({
      p_actor_user_id: subjectId,
      p_organization_id: organizationId,
      p_search_term: null,
    }));
  });

  it("does not pass an invalid aggregate total to the client", async () => {
    rpc.mockResolvedValueOnce({ data: 1_000_001, error: null });
    await expect(getDraftSubdivisionBuyerClientDirectoryTotal(subjectId, { ...context, searchTerm: null, pageSize: 25, pageOffset: 0 }, client)).rejects.toThrow("SUBDIVISION_BUYER_CLIENT_DIRECTORY_TOTAL_READ_DENIED");
  });

  it("accepts only redacted, enumerated events for a contextual timeline", async () => {
    rpc.mockResolvedValueOnce({ data: [{ event_kind: "pendencia_atualizada", occurred_at: "2026-09-07T00:00:00+00:00" }], error: null });
    await expect(listDraftSubdivisionBuyerClientTimeline(subjectId, { ...context, buyerClientId, limit: 20 }, client)).resolves.toEqual([{ eventKind: "pendencia_atualizada", occurredAt: "2026-09-07T00:00:00+00:00" }]);
    expect(rpc).toHaveBeenLastCalledWith("subdivision_list_draft_buyer_client_timeline", expect.objectContaining({ p_buyer_client_id: buyerClientId, p_limit: 20 }));
  });

  it("rejects a malformed timeline event without passing it through", async () => {
    rpc.mockResolvedValueOnce({ data: [{ event_kind: "payment_registered", occurred_at: "2026-09-07T00:00:00+00:00" }], error: null });
    await expect(listDraftSubdivisionBuyerClientTimeline(subjectId, { ...context, buyerClientId, limit: 20 }, client)).rejects.toThrow("SUBDIVISION_BUYER_CLIENT_TIMELINE_READ_DENIED");
  });
});
