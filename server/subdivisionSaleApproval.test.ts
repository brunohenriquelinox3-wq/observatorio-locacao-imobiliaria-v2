import { describe, expect, it, vi } from "vitest";
import { approveSubdivisionSaleCase, requestSubdivisionSaleReversal } from "./subdivisionSaleApproval";

const input = { organizationId: "00000000-0000-4000-8000-000000000001", module: "loteadora" as const, purposeCode: "subdivision_sale_preparation", saleCaseId: "00000000-0000-4000-8000-000000000002", correlationId: "00000000-0000-4000-8000-000000000003" };
describe("aprovação material de venda", () => {
  it("aprova o caso e marca somente o estado comercial do lote", async () => { const rpc = vi.fn().mockResolvedValue({ data: { sale_case_id: input.saleCaseId, lot_commercial_state: "sold", contract_state: "approved" }, error: null }); await expect(approveSubdivisionSaleCase("00000000-0000-4000-8000-000000000004", input, { rpc })).resolves.toMatchObject({ lotCommercialState: "sold" }); expect(rpc).toHaveBeenCalledWith("subdivision_approve_sale_case", expect.objectContaining({ p_sale_case_id: input.saleCaseId })); });
  it("solicita reversão sem reabrir automaticamente a disponibilidade", async () => { const rpc = vi.fn().mockResolvedValue({ data: { sale_case_id: input.saleCaseId, lot_commercial_state: "reversal_review", contract_state: "approved" }, error: null }); await expect(requestSubdivisionSaleReversal("00000000-0000-4000-8000-000000000004", input, { rpc })).resolves.toMatchObject({ lotCommercialState: "reversal_review" }); expect(rpc).toHaveBeenCalledWith("subdivision_request_sale_reversal", expect.any(Object)); });
});
