import { describe, expect, it, vi } from "vitest";
import { listSubdivisionLotInternalInventoryProfiles, upsertSubdivisionLotInternalInventoryProfile } from "./subdivisionLotInternalInventoryProfile";

const context = { organizationId: "00000000-0000-4000-8000-000000000001", module: "loteadora" as const, purposeCode: "SUBDIVISION_STUDIO", developmentId: "00000000-0000-4000-8000-000000000002" };
const subjectId = "00000000-0000-4000-8000-000000000003";
const blockId = "00000000-0000-4000-8000-000000000004";

describe("perfil interno de estoque por Lote", () => {
  it("lê somente o perfil interno devolvido pela RPC protegida", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [{ block_id: blockId, block_number: 1, lot_number: 1, profile_recorded: true, inventory_classification: "technical", review_state: "reviewed", map_legend: "technical", internal_note: "Ponto interno", updated_at: "2026-09-08T10:00:00.000Z" }], error: null });
    await expect(listSubdivisionLotInternalInventoryProfiles(subjectId, context, { rpc })).resolves.toEqual([expect.objectContaining({ blockId, profileRecorded: true, inventoryClassification: "technical" })]);
    expect(rpc).toHaveBeenCalledWith("subdivision_list_draft_lot_internal_inventory_profiles_v1", expect.objectContaining({ p_development_id: context.developmentId }));
  });

  it("resolve Quadra e Lote na RPC sem enviar identificador físico pelo navegador", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: "00000000-0000-4000-8000-000000000005", error: null });
    await expect(upsertSubdivisionLotInternalInventoryProfile(subjectId, { ...context, blockId, lotNumber: 1, inventoryClassification: "attention", reviewState: "needs_review", mapLegend: "attention", internalNote: "Revisar referência técnica", correlationId: "00000000-0000-4000-8000-000000000006" }, { rpc })).resolves.toEqual({ lotId: "00000000-0000-4000-8000-000000000005" });
    expect(rpc).toHaveBeenCalledWith("subdivision_upsert_draft_lot_internal_inventory_profile_v1", expect.objectContaining({ p_block_id: blockId, p_lot_number: 1 }));
    expect(rpc.mock.calls[0]?.[1]).not.toHaveProperty("p_lot_id");
    expect(JSON.stringify(rpc.mock.calls[0]?.[1])).not.toMatch(/sale|contract|payment|commercial_price/i);
  });

  it("recusa ausência de identidade antes de chamar a RPC", async () => {
    const rpc = vi.fn();
    await expect(listSubdivisionLotInternalInventoryProfiles(undefined, context, { rpc })).rejects.toThrow("SUBDIVISION_IDENTITY_REQUIRED");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("recusa resposta de leitura malformada antes de expor perfil interno", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: "[]", error: null });
    await expect(listSubdivisionLotInternalInventoryProfiles(subjectId, context, { rpc })).rejects.toThrow("SUBDIVISION_INTERNAL_INVENTORY_PROFILE_READ_DENIED");
  });

  it("recusa enum fora do catálogo, nota longa e contexto inválido antes da RPC", async () => {
    const rpc = vi.fn();
    const validInput = { ...context, blockId, lotNumber: 1, inventoryClassification: "attention", reviewState: "needs_review", mapLegend: "attention", internalNote: "Ponto interno", correlationId: "00000000-0000-4000-8000-000000000006" };
    await expect(upsertSubdivisionLotInternalInventoryProfile(subjectId, { ...validInput, inventoryClassification: "commercial" } as never, { rpc })).rejects.toThrow();
    await expect(upsertSubdivisionLotInternalInventoryProfile(subjectId, { ...validInput, internalNote: "x".repeat(281) }, { rpc })).rejects.toThrow();
    await expect(upsertSubdivisionLotInternalInventoryProfile(subjectId, { ...validInput, purposeCode: "" }, { rpc })).rejects.toThrow();
    expect(rpc).not.toHaveBeenCalled();
  });
});
