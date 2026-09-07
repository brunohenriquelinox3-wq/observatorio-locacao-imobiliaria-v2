import { describe, expect, it, vi } from "vitest";
import { createSubdivisionSaleCaseDocumentIntent, setSubdivisionSaleCaseDossierReview } from "./subdivisionSaleCaseDossier";
const base = { organizationId: "00000000-0000-4000-8000-000000000002", module: "loteadora" as const, purposeCode: "subdivision_sale_preparation", saleCaseId: "00000000-0000-4000-8000-000000000003", correlationId: "00000000-0000-4000-8000-000000000004" };
describe("dossiê privado do caso", () => {
  it("cria somente uma intenção opaca categorizada", async () => { const rpc = vi.fn().mockResolvedValue({ data: "00000000-0000-4000-8000-000000000005", error: null }); await expect(createSubdivisionSaleCaseDocumentIntent("00000000-0000-4000-8000-000000000001", { ...base, documentCategory: "buyer_identity" }, { rpc })).resolves.toEqual({ attachmentIntentId: "00000000-0000-4000-8000-000000000005" }); expect(rpc).toHaveBeenCalledWith("subdivision_create_sale_case_document_intent", expect.not.objectContaining({ p_storage_key: expect.anything() })); });
  it("exige motivo quando a revisão humana aponta pendência", async () => { await expect(setSubdivisionSaleCaseDossierReview("00000000-0000-4000-8000-000000000001", { ...base, dossierReady: false, reasonCode: null }, { rpc: vi.fn() })).rejects.toThrow("SUBDIVISION_SALE_CASE_DOSSIER_REVIEW_DENIED"); });
});
