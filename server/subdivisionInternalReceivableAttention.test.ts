import { describe, expect, it, vi } from "vitest";
import { listSubdivisionInternalReceivableAttention } from "./subdivisionInternalReceivableAttention";

describe("atenção da agenda interna", () => {
  it("projeta somente as contagens autorizadas sem estado de pagamento ou dados pessoais", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [{ contract_preparation_id: "00000000-0000-4000-8000-000000000001", due_within_four_days_count: 2, past_due_unreconciled_count: 3 }], error: null });
    await expect(listSubdivisionInternalReceivableAttention("00000000-0000-4000-8000-000000000002", { organizationId: "00000000-0000-4000-8000-000000000003", module: "loteadora", purposeCode: "subdivision_sale_preparation" }, { rpc })).resolves.toEqual([{ contractPreparationId: "00000000-0000-4000-8000-000000000001", dueWithinFourDaysCount: 2, pastDueUnreconciledCount: 3 }]);
    expect(rpc).toHaveBeenCalledWith("subdivision_list_internal_receivable_attention", expect.objectContaining({ p_module: "loteadora" }));
  });
});
