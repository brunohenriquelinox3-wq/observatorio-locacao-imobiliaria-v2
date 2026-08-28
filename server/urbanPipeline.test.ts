import { describe, expect, it, vi } from "vitest";
import { createDraftUrbanAgenda, createDraftUrbanLead, listDraftUrbanLeads, transitionDraftUrbanLead } from "./urbanPipeline";

const subjectId = "550e8400-e29b-41d4-a716-446655440000";
const organizationId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const partyId = "7ba7b810-9dad-11d1-80b4-00c04fd430c8";
const leadId = "8ba7b810-9dad-11d1-80b4-00c04fd430c8";
const correlationId = "9ba7b810-9dad-11d1-80b4-00c04fd430c8";
const context = { organizationId, module: "vendas_urbanas" as const, purposeCode: "CADASTRO_INICIAL" };
const rpc = vi.fn();
const client = { rpc } as never;

describe("urban pipeline server boundary", () => {
  it("fails before using the service client when identity is missing", async () => {
    await expect(listDraftUrbanLeads(undefined, context, client)).rejects.toThrow("URBAN_IDENTITY_REQUIRED");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("reads minimized lead rows only through a contextual sales RPC", async () => {
    rpc.mockResolvedValueOnce({ data: [{ lead_id: leadId, party_label: "Parte de teste", source_code: "OPERADOR", interest_kind: "search_profile", stage: "agenda_pending", next_agenda_for: "2026-08-28T14:00:00+00:00", next_agenda_state: "scheduled" }], error: null });
    await expect(listDraftUrbanLeads(subjectId, context, client)).resolves.toEqual([{ leadId, partyLabel: "Parte de teste", sourceCode: "OPERADOR", interestKind: "search_profile", stage: "agenda_pending", nextAgendaFor: "2026-08-28T14:00:00+00:00", nextAgendaState: "scheduled" }]);
    expect(rpc).toHaveBeenLastCalledWith("urban_list_draft_leads", expect.objectContaining({ p_actor_user_id: subjectId, p_module: "vendas_urbanas" }));
  });

  it("uses protected RPCs for lead, stage and agenda commands", async () => {
    rpc.mockResolvedValueOnce({ data: leadId, error: null });
    await createDraftUrbanLead(subjectId, { ...context, correlationId, partyId, sourceCode: "OPERADOR", interestKind: "unspecified" }, client);
    expect(rpc).toHaveBeenLastCalledWith("urban_create_draft_lead", expect.objectContaining({ p_party_id: partyId }));
    rpc.mockResolvedValueOnce({ data: correlationId, error: null });
    await transitionDraftUrbanLead(subjectId, { ...context, correlationId, leadId, nextStage: "qualification" }, client);
    expect(rpc).toHaveBeenLastCalledWith("urban_transition_draft_lead", expect.objectContaining({ p_next_stage: "qualification" }));
    rpc.mockResolvedValueOnce({ data: correlationId, error: null });
    await createDraftUrbanAgenda(subjectId, { ...context, correlationId, leadId, scheduledFor: "2026-08-28T14:00:00.000Z", state: "scheduled" }, client);
    expect(rpc).toHaveBeenLastCalledWith("urban_create_draft_agenda", expect.objectContaining({ p_scheduled_for: "2026-08-28T14:00:00.000Z" }));
  });
});
