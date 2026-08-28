import { describe, expect, it, vi } from "vitest";
import { createDraftSubdivisionDevelopment, listDraftSubdivisionDevelopments } from "./subdivisionDevelopment";

const subjectId = "550e8400-e29b-41d4-a716-446655440000";
const organizationId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const developmentId = "7ba7b810-9dad-11d1-80b4-00c04fd430c8";
const correlationId = "8ba7b810-9dad-11d1-80b4-00c04fd430c8";
const context = { organizationId, module: "loteadora" as const, purposeCode: "CADASTRO_INICIAL" };
const rpc = vi.fn();
const client = { rpc } as never;

describe("subdivision development server boundary", () => {
  it("fails before using the service client when the Supabase identity is absent", async () => {
    await expect(listDraftSubdivisionDevelopments(undefined, context, client)).rejects.toThrow("SUBDIVISION_IDENTITY_REQUIRED");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("reads only the minimized contextual development summary", async () => {
    rpc.mockResolvedValueOnce({ data: [{ development_id: developmentId, internal_reference: "LT_NORTE_01", working_phase: "structuring", created_at: "2026-08-28T00:00:00+00:00" }], error: null });
    await expect(listDraftSubdivisionDevelopments(subjectId, context, client)).resolves.toEqual([{ developmentId, internalReference: "LT_NORTE_01", workingPhase: "structuring", createdAt: "2026-08-28T00:00:00+00:00" }]);
    expect(rpc).toHaveBeenLastCalledWith("subdivision_list_draft_developments", expect.objectContaining({ p_actor_user_id: subjectId, p_module: "loteadora" }));
  });

  it("uses a protected contextual RPC to create the draft development", async () => {
    rpc.mockResolvedValueOnce({ data: developmentId, error: null });
    await createDraftSubdivisionDevelopment(subjectId, { ...context, correlationId, internalReference: "LT_NORTE_01", workingPhase: "structuring" }, client);
    expect(rpc).toHaveBeenLastCalledWith("subdivision_create_draft_development", expect.objectContaining({ p_internal_reference: "LT_NORTE_01", p_working_phase: "structuring", p_correlation_id: correlationId }));
  });
});
