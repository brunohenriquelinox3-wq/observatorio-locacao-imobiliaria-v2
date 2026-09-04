import { describe, expect, it, vi } from "vitest";
import { createDraftUrbanDevelopment, listDraftUrbanDevelopments } from "./urbanDevelopment";

const subjectId = "550e8400-e29b-41d4-a716-446655440000";
const organizationId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const developmentId = "7ba7b810-9dad-11d1-80b4-00c04fd430c8";
const correlationId = "8ba7b810-9dad-11d1-80b4-00c04fd430c8";
const context = { organizationId, module: "vendas_urbanas" as const, purposeCode: "CADASTRO_INICIAL" };
const rpc = vi.fn(); const client = { rpc } as never;

describe("urban development server boundary", () => {
  it("fails closed before calling Supabase without a subject", async () => {
    await expect(listDraftUrbanDevelopments(undefined, context, client)).rejects.toThrow("URBAN_IDENTITY_REQUIRED");
    expect(rpc).not.toHaveBeenCalled();
  });
  it("returns only minimized draft development fields", async () => {
    rpc.mockResolvedValueOnce({ data: [{ development_id: developmentId, internal_reference: "TORRE_CENTRAL", development_kind: "tower", working_phase: "structuring", created_at: "2026-09-04T00:00:00+00:00" }], error: null });
    await expect(listDraftUrbanDevelopments(subjectId, context, client)).resolves.toEqual([{ developmentId, internalReference: "TORRE_CENTRAL", developmentKind: "tower", workingPhase: "structuring", createdAt: "2026-09-04T00:00:00+00:00" }]);
  });
  it("sends a contextual audited draft command without commercial fields", async () => {
    rpc.mockResolvedValueOnce({ data: developmentId, error: null });
    await createDraftUrbanDevelopment(subjectId, { ...context, correlationId, internalReference: "TORRE_CENTRAL", developmentKind: "tower", workingPhase: "reference" }, client);
    expect(rpc).toHaveBeenLastCalledWith("urban_create_draft_development", expect.objectContaining({ p_module: "vendas_urbanas", p_internal_reference: "TORRE_CENTRAL", p_development_kind: "tower" }));
  });
});
