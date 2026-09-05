import { describe, expect, it, vi } from "vitest";
import { applyDraftSubdivisionStructure, archiveDraftSubdivisionBlock, listArchivedDraftSubdivisionStructure, listDraftSubdivisionStructure, restoreDraftSubdivisionBlock } from "./subdivisionStructureBuilder";

const subjectId = "550e8400-e29b-41d4-a716-446655440000";
const organizationId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const developmentId = "7ba7b810-9dad-11d1-80b4-00c04fd430c8";
const blockId = "8ba7b810-9dad-11d1-80b4-00c04fd430c8";
const correlationId = "9ba7b810-9dad-11d1-80b4-00c04fd430c8";
const context = { organizationId, module: "loteadora" as const, purposeCode: "CADASTRO_INICIAL" };
const rpc = vi.fn();
const client = { rpc } as never;

describe("fronteira do construtor de estrutura", () => {
  it("recusa ausência de identidade antes de chamar a RPC", async () => {
    await expect(listDraftSubdivisionStructure(undefined, context, developmentId, client)).rejects.toThrow("SUBDIVISION_IDENTITY_REQUIRED");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("envia Quadras com quantidades próprias de Lotes para a RPC contextual", async () => {
    rpc.mockResolvedValueOnce({ data: { block_count: 2, lot_count: 40, archived_block_count: 0, archived_lot_count: 0 }, error: null });
    await expect(applyDraftSubdivisionStructure(subjectId, {
      ...context,
      developmentId,
      correlationId,
      replaceExisting: false,
      blocks: [{ blockNumber: 1, lotCount: 15 }, { blockNumber: 2, lotCount: 25 }],
    }, client)).resolves.toMatchObject({ blockCount: 2, lotCount: 40 });
    expect(rpc).toHaveBeenLastCalledWith("subdivision_apply_draft_structure_v2", expect.objectContaining({
      p_development_id: developmentId,
      p_blocks: [{ block_number: 1, lot_count: 15 }, { block_number: 2, lot_count: 25 }],
      p_replace_existing: false,
    }));
  });

  it("arquiva somente a Quadra contextual e recebe a contagem redigida", async () => {
    rpc.mockResolvedValueOnce({ data: { block_id: blockId, archived_lot_count: 15 }, error: null });
    await expect(archiveDraftSubdivisionBlock(subjectId, { ...context, developmentId, blockId, correlationId }, client)).resolves.toEqual({ blockId, archivedLotCount: 15 });
    expect(rpc).toHaveBeenLastCalledWith("subdivision_archive_draft_block_v2", expect.objectContaining({ p_block_id: blockId, p_development_id: developmentId }));
  });

  it("lista somente Quadras arquivadas do rascunho contextual", async () => {
    rpc.mockResolvedValueOnce({ data: [{ block_id: blockId, block_number: 3, archived_lot_count: 12 }], error: null });
    await expect(listArchivedDraftSubdivisionStructure(subjectId, context, developmentId, client)).resolves.toEqual([{ blockId, blockNumber: 3, lotCount: 12, archivedLotCount: 12 }]);
    expect(rpc).toHaveBeenLastCalledWith("subdivision_list_archived_draft_structure_v1", expect.objectContaining({ p_development_id: developmentId }));
  });

  it("restaura somente a Quadra arquivada contextual e retorna contagem agregada", async () => {
    rpc.mockResolvedValueOnce({ data: { block_id: blockId, restored_lot_count: 12 }, error: null });
    await expect(restoreDraftSubdivisionBlock(subjectId, { ...context, developmentId, blockId, correlationId }, client)).resolves.toEqual({ blockId, restoredLotCount: 12 });
    expect(rpc).toHaveBeenLastCalledWith("subdivision_restore_draft_block_v1", expect.objectContaining({ p_block_id: blockId, p_development_id: developmentId }));
  });
});
