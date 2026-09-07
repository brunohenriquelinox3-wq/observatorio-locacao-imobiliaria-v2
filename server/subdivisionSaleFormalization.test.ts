import { describe, expect, it, vi } from "vitest";
import { formalizeSubdivisionSaleCase, listSubdivisionInternalSaleContracts } from "./subdivisionSaleFormalization";

const context = { organizationId: "00000000-0000-4000-8000-000000000001", module: "loteadora" as const, purposeCode: "subdivision_sale_preparation" };

describe("formalização interna da venda", () => {
  it("encaminha apenas o caso e a correlação para gerar contrato interno e agenda", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: { contract_preparation_id: "00000000-0000-4000-8000-000000000101", sale_case_id: "00000000-0000-4000-8000-000000000201", scheduled_item_count: 200, bank_issuance_state: "awaiting_bank_issue" }, error: null });
    await expect(formalizeSubdivisionSaleCase("00000000-0000-4000-8000-000000000301", { ...context, saleCaseId: "00000000-0000-4000-8000-000000000201", correlationId: "00000000-0000-4000-8000-000000000401" }, { rpc })).resolves.toMatchObject({ scheduledItemCount: 200, bankIssuanceState: "awaiting_bank_issue" });
    expect(rpc).toHaveBeenCalledWith("subdivision_formalize_sale_case", expect.objectContaining({ p_sale_case_id: "00000000-0000-4000-8000-000000000201" }));
  });

  it("lê somente o resumo interno autorizado da formalização", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [{ contract_preparation_id: "00000000-0000-4000-8000-000000000101", sale_case_id: "00000000-0000-4000-8000-000000000201", contract_state: "internal_review", terms_version: 2, scheduled_item_count: 200, scheduled_total_cents: 12000000, bank_issuance_state: "awaiting_bank_issue", created_at: "2026-09-07T00:00:00Z", updated_at: "2026-09-07T00:00:00Z" }], error: null });
    await expect(listSubdivisionInternalSaleContracts("00000000-0000-4000-8000-000000000301", context, { rpc })).resolves.toHaveLength(1);
    expect(rpc).toHaveBeenCalledWith("subdivision_list_internal_sale_contracts", expect.objectContaining({ p_module: "loteadora" }));
  });
});
