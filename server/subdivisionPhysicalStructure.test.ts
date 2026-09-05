import { describe, expect, it, vi } from "vitest";
import { applySubdivisionPhysicalStructure, listDraftSubdivisionPhysicalStructure } from "./subdivisionPhysicalStructure";

const context = { organizationId: "00000000-0000-4000-8000-000000000001", module: "loteadora" as const, purposeCode: "CADASTRO_INICIAL" };
const subject = "00000000-0000-4000-8000-000000000010";
const developmentId = "00000000-0000-4000-8000-000000000002";

describe("serviço de estrutura física", () => {
  it("envia somente atributos físicos e correlação à RPC protegida", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: { block_count: 1, lot_count: 2, archived_block_count: 0, archived_lot_count: 0 }, error: null });
    const result = await applySubdivisionPhysicalStructure(subject, { ...context, developmentId, correlationId: "00000000-0000-4000-8000-000000000003", replaceExisting: false, blocks: [{ blockNumber: 1, sectorReference: "Setor A", blockTypology: "regular", lots: [{ lotNumber: 1, areaSqm: 300, lotTypology: "standard", positionCode: "internal" }, { lotNumber: 2, areaSqm: null, lotTypology: "corner", positionCode: "corner" }] }] }, { rpc });
    expect(result).toEqual({ blockCount: 1, lotCount: 2, archivedBlockCount: 0, archivedLotCount: 0 });
    expect(rpc).toHaveBeenCalledWith("subdivision_apply_draft_physical_structure_v1", expect.objectContaining({ p_actor_user_id: subject, p_blocks: [expect.objectContaining({ block_number: 1 })] }));
    expect(JSON.stringify(rpc.mock.calls[0][1])).not.toMatch(/price|sale|customer|contract/i);
  });

  it("não busca nem retorna estrutura sem identidade válida", async () => {
    await expect(listDraftSubdivisionPhysicalStructure(undefined, context, developmentId, { rpc: vi.fn() })).rejects.toThrow("SUBDIVISION_IDENTITY_REQUIRED");
  });
});
