import { describe, expect, it, vi } from "vitest";
import { archiveSubdivisionDevelopmentStudio, createSubdivisionDevelopmentStudio, listSubdivisionDevelopmentStudio, updateSubdivisionDevelopmentStudio } from "./subdivisionDevelopmentStudio";

const subjectId = "00000000-0000-4000-8000-000000000001";
const context = { organizationId: "00000000-0000-4000-8000-000000000002", module: "loteadora" as const, purposeCode: "SUBDIVISION_STUDIO" };
const input = { ...context, correlationId: "00000000-0000-4000-8000-000000000003", internalReference: "JARDINS_DO_SUL", displayName: "Jardins do Sul", developmentKind: "residential" as const, municipality: "Cidade teste", stateCode: "SP", plannedStageCount: 2, workingPhase: "structuring" as const, internalNote: "Interno", parcelingMode: "loteamento" as const, territorialContext: "urban" as const, predominantUse: "residential" as const, territorialReference: "Região interna", identificationNote: "Em revisão" };

describe("serviço do estúdio de loteamentos", () => {
  it("nega operações sem subject", async () => {
    const client = { rpc: vi.fn() } as never;
    await expect(createSubdivisionDevelopmentStudio(undefined, input, client)).rejects.toThrow("SUBDIVISION_IDENTITY_REQUIRED");
    await expect(listSubdivisionDevelopmentStudio(undefined, context, client)).rejects.toThrow("SUBDIVISION_IDENTITY_REQUIRED");
  });

  it("mapeia somente o resumo autorizado do loteamento", async () => {
    const client = { rpc: vi.fn().mockResolvedValue({ data: [{ development_id: subjectId, internal_reference: "JARDINS_DO_SUL", display_name: "Jardins do Sul", development_kind: "residential", municipality: "Cidade teste", state_code: "SP", planned_stage_count: 2, working_phase: "structuring", internal_note: "Interno", parceling_mode: "loteamento", territorial_context: "urban", predominant_use: "residential", territorial_reference: "Região interna", identification_note: "Em revisão", created_at: "2026-09-05T00:00:00Z", updated_at: "2026-09-05T00:00:00Z" }], error: null }) } as never;
    await expect(listSubdivisionDevelopmentStudio(subjectId, context, client)).resolves.toEqual([expect.objectContaining({ internalReference: "JARDINS_DO_SUL", developmentKind: "residential", parcelingMode: "loteamento", territorialContext: "urban" })]);
  });

  it("encaminha criação, edição e arquivamento somente para RPCs contextuais", async () => {
    const client = { rpc: vi.fn().mockResolvedValue({ data: subjectId, error: null }) } as never;
    await createSubdivisionDevelopmentStudio(subjectId, input, client);
    await updateSubdivisionDevelopmentStudio(subjectId, { ...input, developmentId: subjectId }, client);
    await archiveSubdivisionDevelopmentStudio(subjectId, { ...context, developmentId: subjectId, correlationId: "00000000-0000-4000-8000-000000000004" }, client);
    expect(client.rpc.mock.calls.map((call: unknown[]) => call[0])).toEqual([
      "subdivision_create_draft_development_v3",
      "subdivision_update_draft_development_v3",
      "subdivision_archive_draft_development_v2",
    ]);
  });
});
