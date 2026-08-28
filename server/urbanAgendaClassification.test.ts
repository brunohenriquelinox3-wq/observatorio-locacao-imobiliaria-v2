import { describe, expect, it, vi } from "vitest";
import { listDraftUrbanAgendaClassifications, upsertDraftUrbanAgendaClassification } from "./urbanAgendaClassification";

const subjectId = "550e8400-e29b-41d4-a716-446655440000";
const organizationId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const agendaId = "7ba7b810-9dad-11d1-80b4-00c04fd430c8";
const classificationId = "8ba7b810-9dad-11d1-80b4-00c04fd430c8";
const correlationId = "9ba7b810-9dad-11d1-80b4-00c04fd430c8";
const context = { organizationId, module: "vendas_urbanas" as const, purposeCode: "CADASTRO_INICIAL" };
const rpc = vi.fn();
const client = { rpc } as never;

describe("urban agenda classification server boundary", () => {
  it("fails before using the service client when the Supabase identity is absent", async () => {
    await expect(listDraftUrbanAgendaClassifications(undefined, context, client)).rejects.toThrow("URBAN_IDENTITY_REQUIRED");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("reads only a minimized contextual agenda classification", async () => {
    rpc.mockResolvedValueOnce({ data: [{ classification_id: classificationId, agenda_id: agendaId, classification: "context_preparation", internal_code_present: true, updated_at: "2026-08-28T00:00:00+00:00" }], error: null });
    await expect(listDraftUrbanAgendaClassifications(subjectId, context, client)).resolves.toEqual([{ classificationId, agendaId, classification: "context_preparation", internalCodePresent: true, updatedAt: "2026-08-28T00:00:00+00:00" }]);
    expect(rpc).toHaveBeenLastCalledWith("urban_list_draft_agenda_classifications", expect.objectContaining({ p_actor_user_id: subjectId, p_module: "vendas_urbanas" }));
  });

  it("uses a protected contextual RPC to upsert the agenda classification", async () => {
    rpc.mockResolvedValueOnce({ data: classificationId, error: null });
    await upsertDraftUrbanAgendaClassification(subjectId, { ...context, correlationId, agendaId, classification: "internal_follow_up", internalCode: "EM_REVISAO" }, client);
    expect(rpc).toHaveBeenLastCalledWith("urban_upsert_draft_agenda_classification", expect.objectContaining({ p_agenda_id: agendaId, p_classification: "internal_follow_up", p_correlation_id: correlationId }));
  });
});
