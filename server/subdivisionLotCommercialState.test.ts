import { describe, expect, it, vi } from "vitest";
import { listSubdivisionLotCommercialStates } from "./subdivisionLotCommercialState";
describe("leitura do estado comercial do lote", () => {
  it("projeta somente estado minimizado pelo contexto autorizado", async () => { const rpc = vi.fn().mockResolvedValue({ data: [{ lot_id: "00000000-0000-4000-8000-000000000001", commercial_state: "sold", updated_at: "2026-09-07T00:00:00.000Z" }], error: null }); await expect(listSubdivisionLotCommercialStates("00000000-0000-4000-8000-000000000002", { organizationId: "00000000-0000-4000-8000-000000000003", module: "loteadora", purposeCode: "subdivision_sale_preparation" }, { rpc })).resolves.toEqual([{ lotId: "00000000-0000-4000-8000-000000000001", commercialState: "sold", updatedAt: "2026-09-07T00:00:00.000Z" }]); expect(rpc).toHaveBeenCalledWith("subdivision_list_lot_commercial_states", expect.objectContaining({ p_module: "loteadora" })); });
});
