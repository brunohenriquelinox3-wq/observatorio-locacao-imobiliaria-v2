import { describe, expect, it, vi } from "vitest";
import { createDraftUrbanDevelopment, linkDraftUrbanDevelopmentDeveloper, listDraftUrbanDevelopmentDeveloperLinks, listDraftUrbanDevelopments, listDraftUrbanDevelopers, registerDraftUrbanDeveloper } from "./urbanDevelopment";

const subjectId = "550e8400-e29b-41d4-a716-446655440000";
const organizationId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const developmentId = "7ba7b810-9dad-11d1-80b4-00c04fd430c8";
const correlationId = "8ba7b810-9dad-11d1-80b4-00c04fd430c8";
const partyId = "9ba7b810-9dad-11d1-80b4-00c04fd430c8";
const developerProfileId = "0ba7b810-9dad-11d1-80b4-00c04fd430c8";
const linkId = "1ba7b810-9dad-11d1-80b4-00c04fd430c8";
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

  it("registers only a contextual Party reference as a construction company draft", async () => {
    rpc.mockResolvedValueOnce({ data: developerProfileId, error: null });
    await registerDraftUrbanDeveloper(subjectId, { ...context, correlationId, partyId }, client);
    expect(rpc).toHaveBeenLastCalledWith("urban_register_draft_developer", expect.objectContaining({ p_party_id: partyId, p_module: "vendas_urbanas" }));
  });

  it("reads minimized construction company and structural link summaries", async () => {
    rpc.mockResolvedValueOnce({ data: [{ developer_profile_id: developerProfileId, party_id: partyId, display_name: "Empresa em rascunho", created_at: "2026-09-04T00:00:00+00:00" }], error: null });
    await expect(listDraftUrbanDevelopers(subjectId, context, client)).resolves.toEqual([{ developerProfileId, partyId, displayName: "Empresa em rascunho", createdAt: "2026-09-04T00:00:00+00:00" }]);
    rpc.mockResolvedValueOnce({ data: [{ link_id: linkId, development_id: developmentId, development_reference: "TORRE_CENTRAL", developer_profile_id: developerProfileId, display_name: "Empresa em rascunho", relationship: "development_responsible", created_at: "2026-09-04T00:00:00+00:00" }], error: null });
    await expect(listDraftUrbanDevelopmentDeveloperLinks(subjectId, context, client)).resolves.toHaveLength(1);
  });

  it("requires a protected contextual command for structural association", async () => {
    rpc.mockResolvedValueOnce({ data: linkId, error: null });
    await linkDraftUrbanDevelopmentDeveloper(subjectId, { ...context, correlationId, developmentId, developerProfileId, relationship: "development_responsible" }, client);
    expect(rpc).toHaveBeenLastCalledWith("urban_link_draft_development_developer", expect.objectContaining({ p_development_id: developmentId, p_developer_profile_id: developerProfileId }));
  });
});
