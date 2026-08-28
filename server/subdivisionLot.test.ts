import { describe, expect, it, vi } from "vitest";
import { createDraftSubdivisionLot, listDraftSubdivisionLots } from "./subdivisionLot";
const actor = "550e8400-e29b-41d4-a716-446655440000", organizationId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8", blockId = "7ba7b810-9dad-11d1-80b4-00c04fd430c8", lotId = "8ba7b810-9dad-11d1-80b4-00c04fd430c8", correlationId = "9ba7b810-9dad-11d1-80b4-00c04fd430c8";
const context = { organizationId, module: "loteadora" as const, purposeCode: "CADASTRO_INICIAL" }; const rpc = vi.fn(); const client = { rpc } as never;
describe("subdivision lot server boundary", () => {
  it("requires the Supabase identity before the RPC", async () => { await expect(listDraftSubdivisionLots(undefined, context, blockId, client)).rejects.toThrow("SUBDIVISION_IDENTITY_REQUIRED"); expect(rpc).not.toHaveBeenCalled(); });
  it("reads only the minimized lot summary", async () => { rpc.mockResolvedValueOnce({ data: [{ lot_id: lotId, block_id: blockId, lot_number: 1, created_at: "2026-08-28T00:00:00+00:00" }], error: null }); await expect(listDraftSubdivisionLots(actor, context, blockId, client)).resolves.toEqual([{ lotId, blockId, lotNumber: 1, createdAt: "2026-08-28T00:00:00+00:00" }]); });
  it("uses a contextual server RPC for the lot draft", async () => { rpc.mockResolvedValueOnce({ data: lotId, error: null }); await createDraftSubdivisionLot(actor, { ...context, correlationId, blockId, lotNumber: 1 }, client); expect(rpc).toHaveBeenLastCalledWith("subdivision_create_draft_lot", expect.objectContaining({ p_block_id: blockId, p_lot_number: 1 })); });
});
