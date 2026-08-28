import { describe, expect, it, vi } from "vitest";
import { listDraftRentalManagementDeclaredScopes, upsertDraftRentalManagementDeclaredScope } from "./rentalManagementDeclaredScope";

const subjectId = "550e8400-e29b-41d4-a716-446655440000";
const organizationId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const intakeId = "7ba7b810-9dad-11d1-80b4-00c04fd430c8";
const scopeId = "8ba7b810-9dad-11d1-80b4-00c04fd430c8";
const correlationId = "9ba7b810-9dad-11d1-80b4-00c04fd430c8";
const context = { organizationId, module: "locacao" as const, purposeCode: "CADASTRO_INICIAL" };
const rpc = vi.fn();
const client = { rpc } as never;

describe("rental management declared scope server boundary", () => {
  it("fails before using the service client when the Supabase identity is absent", async () => {
    await expect(listDraftRentalManagementDeclaredScopes(undefined, context, client)).rejects.toThrow("RENTAL_IDENTITY_REQUIRED");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("reads only a minimized contextual management declaration", async () => {
    rpc.mockResolvedValueOnce({ data: [{ scope_id: scopeId, intake_id: intakeId, declared_scope: "full_administration_interest", internal_note_present: true, updated_at: "2026-08-28T00:00:00+00:00" }], error: null });
    await expect(listDraftRentalManagementDeclaredScopes(subjectId, context, client)).resolves.toEqual([{ scopeId, intakeId, declaredScope: "full_administration_interest", internalNotePresent: true, updatedAt: "2026-08-28T00:00:00+00:00" }]);
    expect(rpc).toHaveBeenLastCalledWith("rental_list_draft_management_declared_scopes", expect.objectContaining({ p_actor_user_id: subjectId, p_module: "locacao" }));
  });

  it("uses a protected contextual RPC to upsert the declared scope", async () => {
    rpc.mockResolvedValueOnce({ data: scopeId, error: null });
    await upsertDraftRentalManagementDeclaredScope(subjectId, { ...context, correlationId, intakeId, declaredScope: "undecided", internalNoteCode: "EM_REVISAO" }, client);
    expect(rpc).toHaveBeenLastCalledWith("rental_upsert_draft_management_declared_scope", expect.objectContaining({ p_intake_id: intakeId, p_declared_scope: "undecided", p_correlation_id: correlationId }));
  });
});
