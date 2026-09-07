import { describe, expect, it, vi } from "vitest";
import { listSubdivisionInternalReceivableBatches } from "./subdivisionInternalReceivableBatch";
const context = { organizationId: "00000000-0000-4000-8000-000000000002", module: "loteadora" as const, purposeCode: "SUBDIVISION_SALE_PREPARATION" };
describe("lote interno de parcelas", () => {
  it("rejeita identidade ausente sem consultar a base", async () => {
    const rpc = vi.fn(); await expect(listSubdivisionInternalReceivableBatches(undefined, context, { rpc } as never)).rejects.toThrow("SUBDIVISION_IDENTITY_REQUIRED"); expect(rpc).not.toHaveBeenCalled();
  });
  it("lê somente o resumo agregado das projeções internas", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [{ batch_id: "00000000-0000-4000-8000-000000000003", sale_case_id: "00000000-0000-4000-8000-000000000004", contract_preparation_id: "00000000-0000-4000-8000-000000000005", batch_state: "released_internal_control", item_count: 3, total_cents: 120000, participation_snapshot_state: "projected", participation_rule_count: 2, participation_projected_item_count: 4, participation_projected_total_cents: 42000, participation_unallocated_cents: 78000, released_at: "2026-09-08T00:00:00.000Z", updated_at: "2026-09-08T00:00:00.000Z" }], error: null });
    const [batch] = await listSubdivisionInternalReceivableBatches("00000000-0000-4000-8000-000000000001", context, { rpc } as never);
    expect(batch).toMatchObject({ participationSnapshotState: "projected", participationRuleCount: 2, participationProjectedTotalCents: 42000, participationUnallocatedCents: 78000 });
    expect(rpc).toHaveBeenCalledWith("subdivision_list_internal_receivable_batches", expect.objectContaining({ p_module: "loteadora" }));
  });
});
