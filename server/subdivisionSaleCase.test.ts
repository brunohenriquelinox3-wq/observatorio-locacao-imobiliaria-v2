import { describe, expect, it, vi } from "vitest";
import { lookupSubdivisionBuyerClientByFiscalReference, openSubdivisionSaleCase, saveSubdivisionSaleCaseTerms } from "./subdivisionSaleCase";
import { saveSubdivisionSaleCaseTermsInputSchema } from "../shared/subdivisionSaleCaseContracts";

const context = { organizationId: "00000000-0000-4000-8000-000000000001", module: "loteadora" as const, purposeCode: "CADASTRO_INICIAL" };
const actor = "00000000-0000-4000-8000-000000000002";
const lotId = "00000000-0000-4000-8000-000000000003";
const buyerClientId = "00000000-0000-4000-8000-000000000004";
const saleCaseId = "00000000-0000-4000-8000-000000000005";

describe("subdivisionSaleCase", () => {
  it("consulta CPF/CNPJ declarado de modo exato e somente retorna o cadastro contextual", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [{ buyer_client_id: buyerClientId, display_name: "Pessoa declarada", party_kind: "individual", profile_registration_state: "complete" }], error: null });
    await expect(lookupSubdivisionBuyerClientByFiscalReference(actor, { ...context, correlationId: "00000000-0000-4000-8000-000000000006", documentReference: "123.456.789-01" }, { rpc })).resolves.toMatchObject({ buyerClientId, displayName: "Pessoa declarada" });
    expect(rpc).toHaveBeenCalledWith("subdivision_lookup_buyer_client_by_fiscal_reference", expect.objectContaining({ p_document_reference: "123.456.789-01", p_correlation_id: "00000000-0000-4000-8000-000000000006" }));
  });

  it("abre o caso idempotente sem misturar a operação com contrato ou financeiro", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: saleCaseId, error: null });
    await expect(openSubdivisionSaleCase(actor, { ...context, correlationId: "00000000-0000-4000-8000-000000000006", lotId, buyerClientId }, { rpc })).resolves.toEqual({ saleCaseId });
    expect(rpc).toHaveBeenCalledWith("subdivision_open_sale_case", expect.objectContaining({ p_lot_id: lotId, p_buyer_client_id: buyerClientId }));
  });

  it("exige todos os dados de parcelamento quando houver parcelas e preserva valores em centavos", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: { sale_case_id: saleCaseId, terms_version: 2, state: "preparation" }, error: null });
    await expect(saveSubdivisionSaleCaseTerms(actor, { ...context, correlationId: "00000000-0000-4000-8000-000000000006", saleCaseId, negotiatedTotalCents: 12000000, entryAmountCents: 0, entryDueDate: null, installmentCount: 200, installmentAmountCents: 60000, firstDueDate: "2026-10-20", dueDay: 20 }, { rpc })).resolves.toMatchObject({ termsVersion: 2 });
    expect(rpc).toHaveBeenCalledWith("subdivision_save_sale_case_terms", expect.objectContaining({ p_installment_count: 200, p_installment_amount_cents: 60000 }));
    expect(() => saveSubdivisionSaleCaseTermsInputSchema.parse({ ...context, correlationId: "00000000-0000-4000-8000-000000000006", saleCaseId, negotiatedTotalCents: null, entryAmountCents: null, entryDueDate: null, installmentCount: 1, installmentAmountCents: null, firstDueDate: null, dueDay: null })).toThrow();
  });
});
