import { describe, expect, it, vi } from "vitest";
import { applySubdivisionPhysicalStructure, listDraftSubdivisionPhysicalStructure, upsertDraftSubdivisionBlockOperationalProfile, upsertDraftSubdivisionLotOperationalProfile, upsertDraftSubdivisionLotPhysicalReservation } from "./subdivisionPhysicalStructure";

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

  it("classifica reserva física por Quadra e Lote sem enviar identificador de Lote pelo navegador", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: { reservation_purpose: "technical_artesian_well" }, error: null });
    await expect(upsertDraftSubdivisionLotPhysicalReservation(subject, { ...context, developmentId, blockId: "00000000-0000-4000-8000-000000000004", lotNumber: 8, reservationPurpose: "technical_artesian_well", correlationId: "00000000-0000-4000-8000-000000000003" }, { rpc })).resolves.toEqual({ reservationPurpose: "technical_artesian_well" });
    expect(rpc).toHaveBeenCalledWith("subdivision_upsert_draft_lot_physical_reservation_v1", expect.objectContaining({ p_block_id: "00000000-0000-4000-8000-000000000004", p_lot_number: 8, p_reservation_purpose: "technical_artesian_well" }));
    expect(rpc.mock.calls[0]?.[1]).not.toHaveProperty("p_lot_id");
  });

  it("atualiza ficha física com nota interna saneada sem enviar preço ou dados comerciais", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: null });
    await expect(upsertDraftSubdivisionLotOperationalProfile(subject, { ...context, developmentId, blockId: "00000000-0000-4000-8000-000000000004", lotNumber: 8, areaSqm: 300, frontageM: 12, depthM: 25, lotTypology: "corner", positionCode: "corner", reservationPurpose: "technical_artesian_well", internalNote: "Área técnica com acesso de obra.", correlationId: "00000000-0000-4000-8000-000000000003" }, { rpc })).resolves.toBeUndefined();
    expect(rpc).toHaveBeenCalledWith("subdivision_upsert_draft_lot_operational_profile_v1", expect.objectContaining({ p_lot_number: 8, p_internal_note: "Área técnica com acesso de obra." }));
    expect(JSON.stringify(rpc.mock.calls[0]?.[1])).not.toMatch(/price|sale|customer|contract|payment/i);
  });

  it("atualiza a ficha física da Quadra com nota saneada e sem dados comerciais", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: null });
    await expect(upsertDraftSubdivisionBlockOperationalProfile(subject, { ...context, developmentId, blockId: "00000000-0000-4000-8000-000000000004", sectorReference: "Setor técnico", blockTypology: "irregular", internalNote: "Acesso operacional em revisão.", correlationId: "00000000-0000-4000-8000-000000000003" }, { rpc })).resolves.toBeUndefined();
    expect(rpc).toHaveBeenCalledWith("subdivision_upsert_draft_block_operational_profile_v1", expect.objectContaining({ p_block_id: "00000000-0000-4000-8000-000000000004", p_sector_reference: "Setor técnico", p_internal_note: "Acesso operacional em revisão." }));
    expect(JSON.stringify(rpc.mock.calls[0]?.[1])).not.toMatch(/price|sale|customer|contract|payment/i);
  });

  it("lê a observação interna da Quadra somente no retorno físico protegido", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [{ block_id: "00000000-0000-4000-8000-000000000004", block_number: 1, sector_reference: "Setor técnico", block_typology: "regular", internal_note: "Acesso operacional em revisão.", lots: [] }], error: null });
    await expect(listDraftSubdivisionPhysicalStructure(subject, context, developmentId, { rpc })).resolves.toEqual([expect.objectContaining({ internalNote: "Acesso operacional em revisão." })]);
    expect(rpc).toHaveBeenCalledWith("subdivision_list_draft_physical_structure_v4", expect.any(Object));
  });
});
