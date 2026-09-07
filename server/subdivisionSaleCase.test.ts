import { describe, expect, it, vi } from "vitest";
import { addSubdivisionSaleCaseJointProponent, lookupSubdivisionBuyerClientByFiscalReference, openSubdivisionSaleCase, removeSubdivisionSaleCaseJointProponent, saveSubdivisionSaleCaseTerms } from "./subdivisionSaleCase";
import { saveSubdivisionSaleCaseTermsInputSchema } from "../shared/subdivisionSaleCaseContracts";

const context = { organizationId: "00000000-0000-4000-8000-000000000001", module: "loteadora" as const, purposeCode: "CADASTRO_INICIAL" };
const actor = "00000000-0000-4000-8000-000000000002";
const lotId = "00000000-0000-4000-8000-000000000003";
const buyerClientId = "00000000-0000-4000-8000-000000000004";
const saleCaseId = "00000000-0000-4000-8000-000000000005";
const structuredTerms = {
  negotiatedTotalCents: 12000000, entryAmountCents: 0, entryDueDate: null,
  entryInstallmentCount: 0, entryInstallmentAmountCents: null, entryFirstDueDate: null, entryDueDay: null,
  installmentCount: 200, installmentAmountCents: 60000, firstDueDate: "2026-10-20", dueDay: 20,
  settlementMode: "structured" as const, cashSettlementAmountCents: null, cashSettlementDueDate: null,
  supplementalAmountCents: null, supplementalDueDate: null, tradeInCreditCents: null, tradeInDueDate: null, tradeInCategory: null, tradeInDescription: null,
};

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
    await expect(saveSubdivisionSaleCaseTerms(actor, { ...context, correlationId: "00000000-0000-4000-8000-000000000006", saleCaseId, ...structuredTerms }, { rpc })).resolves.toMatchObject({ termsVersion: 2 });
    expect(rpc).toHaveBeenCalledWith("subdivision_save_sale_case_terms", expect.objectContaining({ p_installment_count: 200, p_installment_amount_cents: 60000, p_settlement_mode: "structured" }));
    expect(() => saveSubdivisionSaleCaseTermsInputSchema.parse({ ...context, correlationId: "00000000-0000-4000-8000-000000000006", saleCaseId, ...structuredTerms, negotiatedTotalCents: null, installmentCount: 1, installmentAmountCents: null, firstDueDate: null, dueDay: null })).toThrow();
  });

  it("aceita venda à vista e entrada parcelada simultânea às parcelas regulares", () => {
    expect(saveSubdivisionSaleCaseTermsInputSchema.parse({ ...context, correlationId: "00000000-0000-4000-8000-000000000010", saleCaseId, ...structuredTerms, negotiatedTotalCents: 360000, entryInstallmentCount: 2, entryInstallmentAmountCents: 50000, entryFirstDueDate: "2026-10-10", entryDueDay: 10, installmentCount: 2, installmentAmountCents: 130000, firstDueDate: "2026-10-20", dueDay: 20 })).toMatchObject({ entryInstallmentCount: 2, installmentCount: 2 });
    expect(saveSubdivisionSaleCaseTermsInputSchema.parse({ ...context, correlationId: "00000000-0000-4000-8000-000000000011", saleCaseId, ...structuredTerms, negotiatedTotalCents: 400000, installmentCount: 0, installmentAmountCents: null, firstDueDate: null, dueDay: null, settlementMode: "cash", cashSettlementAmountCents: 400000, cashSettlementDueDate: "2026-10-10" })).toMatchObject({ settlementMode: "cash" });
  });

  it("rejeita total divergente, modo incompatível e bem sem metadados declarados", () => {
    expect(() => saveSubdivisionSaleCaseTermsInputSchema.parse({ ...context, correlationId: "00000000-0000-4000-8000-000000000012", saleCaseId, ...structuredTerms, negotiatedTotalCents: 1 })).toThrow();
    expect(() => saveSubdivisionSaleCaseTermsInputSchema.parse({ ...context, correlationId: "00000000-0000-4000-8000-000000000013", saleCaseId, ...structuredTerms, settlementMode: "cash" })).toThrow();
    expect(() => saveSubdivisionSaleCaseTermsInputSchema.parse({ ...context, correlationId: "00000000-0000-4000-8000-000000000014", saleCaseId, ...structuredTerms, negotiatedTotalCents: 12100000, tradeInCreditCents: 100000, tradeInDueDate: "2026-10-10", tradeInCategory: null, tradeInDescription: null })).toThrow();
  });

  it("vincula e remove proponentes conjuntos somente no caso contextual", async () => {
    const addRpc = vi.fn().mockResolvedValue({ data: "00000000-0000-4000-8000-000000000007", error: null });
    await expect(addSubdivisionSaleCaseJointProponent(actor, { ...context, correlationId: "00000000-0000-4000-8000-000000000008", saleCaseId, buyerClientId }, { rpc: addRpc })).resolves.toEqual({ saleCasePartyId: "00000000-0000-4000-8000-000000000007" });
    expect(addRpc).toHaveBeenCalledWith("subdivision_add_sale_case_joint_proponent", expect.objectContaining({ p_sale_case_id: saleCaseId, p_buyer_client_id: buyerClientId }));
    const removeRpc = vi.fn().mockResolvedValue({ data: { sale_case_id: saleCaseId, joint_proponent_removed: true }, error: null });
    await expect(removeSubdivisionSaleCaseJointProponent(actor, { ...context, correlationId: "00000000-0000-4000-8000-000000000009", saleCaseId, buyerClientId }, { rpc: removeRpc })).resolves.toMatchObject({ jointProponentRemoved: true });
  });
});
