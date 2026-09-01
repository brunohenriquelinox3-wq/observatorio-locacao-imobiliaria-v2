import { describe, expect, it, vi } from "vitest";
import { createDraftRentalAgenda, createDraftRentalIntake, listDraftRentalAgendas, listDraftRentalIntakes, transitionDraftRentalIntake } from "./rentalPipeline";

const subjectId = "550e8400-e29b-41d4-a716-446655440000";
const organizationId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const partyId = "7ba7b810-9dad-11d1-80b4-00c04fd430c8";
const intakeId = "8ba7b810-9dad-11d1-80b4-00c04fd430c8";
const correlationId = "9ba7b810-9dad-11d1-80b4-00c04fd430c8";
const context = { organizationId, module: "locacao" as const, purposeCode: "CADASTRO_INICIAL" };
const rpc = vi.fn();
const client = { rpc } as never;

describe("rental pipeline server boundary", () => {
  it("fails before using the service client when identity is missing", async () => {
    await expect(listDraftRentalIntakes(undefined, context, client)).rejects.toThrow("RENTAL_IDENTITY_REQUIRED");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("reads minimized administration or tenant intake rows through contextual RPC", async () => {
    rpc.mockResolvedValueOnce({ data: [{ intake_id: intakeId, party_label: "Parte de teste", journey_kind: "management_interest", source_code: "OPERADOR", stage: "agenda_pending", next_agenda_for: "2026-08-28T14:00:00+00:00", next_agenda_state: "scheduled" }], error: null });
    await expect(listDraftRentalIntakes(subjectId, context, client)).resolves.toEqual([{ intakeId, partyLabel: "Parte de teste", journeyKind: "management_interest", sourceCode: "OPERADOR", stage: "agenda_pending", nextAgendaFor: "2026-08-28T14:00:00+00:00", nextAgendaState: "scheduled" }]);
    expect(rpc).toHaveBeenLastCalledWith("rental_list_draft_intakes", expect.objectContaining({ p_actor_user_id: subjectId, p_module: "locacao" }));
  });

  it("reads minimized rental agenda rows through contextual RPC", async () => {
    rpc.mockResolvedValueOnce({ data: [{ agenda_id: correlationId, intake_id: intakeId, intake_label: "Parte de teste", journey_kind: "tenant_interest", scheduled_for: "2026-08-28T14:00:00+00:00", state: "scheduled", reason_code: "must-not-pass" }], error: null });
    await expect(listDraftRentalAgendas(subjectId, context, client)).resolves.toEqual([{ agendaId: correlationId, intakeId, intakeLabel: "Parte de teste", journeyKind: "tenant_interest", scheduledFor: "2026-08-28T14:00:00+00:00", state: "scheduled" }]);
    expect(rpc).toHaveBeenLastCalledWith("rental_list_draft_agendas", expect.objectContaining({ p_actor_user_id: subjectId, p_module: "locacao" }));
  });

  it("uses protected RPCs for intake, stage and agenda commands", async () => {
    rpc.mockResolvedValueOnce({ data: intakeId, error: null });
    await createDraftRentalIntake(subjectId, { ...context, correlationId, partyId, journeyKind: "tenant_interest", sourceCode: "OPERADOR" }, client);
    expect(rpc).toHaveBeenLastCalledWith("rental_create_draft_intake", expect.objectContaining({ p_party_id: partyId }));
    rpc.mockResolvedValueOnce({ data: correlationId, error: null });
    await transitionDraftRentalIntake(subjectId, { ...context, correlationId, intakeId, nextStage: "qualification" }, client);
    expect(rpc).toHaveBeenLastCalledWith("rental_transition_draft_intake", expect.objectContaining({ p_next_stage: "qualification" }));
    rpc.mockResolvedValueOnce({ data: correlationId, error: null });
    await createDraftRentalAgenda(subjectId, { ...context, correlationId, intakeId, scheduledFor: "2026-08-28T14:00:00.000Z", state: "scheduled" }, client);
    expect(rpc).toHaveBeenLastCalledWith("rental_create_draft_agenda", expect.objectContaining({ p_scheduled_for: "2026-08-28T14:00:00.000Z" }));
  });
});
