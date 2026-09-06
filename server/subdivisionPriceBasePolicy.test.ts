import * as XLSX from "xlsx";
import { describe, expect, it, vi } from "vitest";
import { listSubdivisionPriceBasePolicies, prepareManualSubdivisionPriceBaseCorrection, prepareSubdivisionPriceBasePolicy, previewSubdivisionPriceBaseSource, submitSubdivisionPriceBasePolicy, withdrawSubdivisionPriceBasePolicy } from "./subdivisionPriceBasePolicy";

const actor = "00000000-0000-4000-8000-000000000001";
const developmentId = "00000000-0000-4000-8000-000000000002";
const organizationId = "00000000-0000-4000-8000-000000000003";
const correlationId = "00000000-0000-4000-8000-000000000004";

function makeSource(rows: unknown[][]) {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, sheet, "Fonte");
  return XLSX.write(workbook, { bookType: "xlsx", type: "base64" });
}

function makeSourceWithPriceFormula() {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet([["Quadra", "Lote", "Área (m²)", "Valor (m²)"], [1, 1, 100, 500]]);
  sheet.D2 = { t: "n", f: "10*50", v: 500 };
  XLSX.utils.book_append_sheet(workbook, sheet, "Fonte");
  return XLSX.write(workbook, { bookType: "xlsx", type: "base64" });
}

const context = { organizationId, module: "loteadora" as const, purposeCode: "subdivision_structure" };

describe("subdivision price-base policy boundary", () => {
  it("requires a subject before processing a real-price source", async () => {
    const sourceContentBase64 = makeSource([["Quadra", "Lote", "Área (m²)", "Valor (m²)"], [1, 1, 100, 500]]);
    await expect(previewSubdivisionPriceBaseSource(undefined, { ...context, developmentId, sourceFileName: "fonte.xlsx", sourceContentBase64 }, { rpc: vi.fn() })).rejects.toThrow("SUBDIVISION_IDENTITY_REQUIRED");
  });

  it("discards allowed auxiliary columns and never sends them to the protected RPC", async () => {
    const sourceContentBase64 = makeSource([["Quadra", "Lote", "Área (m²)", "Valor (m²)", "Status", "Valor Total (R$)"], [1, 1, 100, 500, "vendido", "=C2*D2"]]);
    const rpc = vi.fn().mockResolvedValue({ data: { reconciled_line_count: 1, unreconciled_line_count: 0 }, error: null });
    const result = await previewSubdivisionPriceBaseSource(actor, { ...context, developmentId, sourceFileName: "fonte.xlsx", sourceContentBase64 }, { rpc });
    expect(result).toMatchObject({ sourceRows: 1, importableLineCount: 1, reconciledLineCount: 1, ignoredColumns: ["Status", "Valor Total (R$)"] });
    const payload = rpc.mock.calls[0]?.[1] as { p_lines: Array<Record<string, unknown>> };
    expect(payload.p_lines[0]).toMatchObject({ block_number: 1, lot_number: 1, area_sqm: 100, base_price_per_sqm_brl: 500 });
    expect(JSON.stringify(payload)).not.toContain("vendido");
  });

  it("blocks personal headers before a preview can reach the database", async () => {
    const sourceContentBase64 = makeSource([["Quadra", "Lote", "Área (m²)", "Valor (m²)", "Cliente"], [1, 1, 100, 500, "teste"]]);
    const rpc = vi.fn();
    await expect(previewSubdivisionPriceBaseSource(actor, { ...context, developmentId, sourceFileName: "fonte.xlsx", sourceContentBase64 }, { rpc })).rejects.toThrow("PRICE_SOURCE_PERSONAL_DATA_BLOCKED");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("blocks a formula in an importable price field", async () => {
    const sourceContentBase64 = makeSourceWithPriceFormula();
    const rpc = vi.fn();
    await expect(previewSubdivisionPriceBaseSource(actor, { ...context, developmentId, sourceFileName: "fonte.xlsx", sourceContentBase64 }, { rpc })).rejects.toThrow("PRICE_SOURCE_ALLOWED_FORMULA_BLOCKED");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("returns only source-row and category for a required-field exception", async () => {
    const sourceContentBase64 = makeSource([["Quadra", "Lote", "Área (m²)", "Valor (m²)"], [1, 1, 100, 500], [1, 2, 100, ""]]);
    const rpc = vi.fn().mockResolvedValue({ data: { reconciled_line_count: 1, unreconciled_line_count: 0 }, error: null });
    const result = await previewSubdivisionPriceBaseSource(actor, { ...context, developmentId, sourceFileName: "fonte.xlsx", sourceContentBase64 }, { rpc });
    expect(result.exceptionRows).toEqual([{ sourceRow: 3, code: "BASE_PRICE_REQUIRED" }]);
    expect(JSON.stringify(result.exceptionRows)).not.toContain("500");
  });

  it("encaminha área ausente somente como candidata à confirmação da matriz física", async () => {
    const sourceContentBase64 = makeSource([["Quadra", "Lote", "Área (m²)", "Valor (m²)"], [1, 1, "", 500]]);
    const rpc = vi.fn().mockResolvedValue({ data: { reconciled_line_count: 1, unreconciled_line_count: 0, matrix_area_resolved_line_count: 1 }, error: null });
    const result = await previewSubdivisionPriceBaseSource(actor, { ...context, developmentId, sourceFileName: "fonte.xlsx", sourceContentBase64 }, { rpc });
    const payload = rpc.mock.calls[0]?.[1] as { p_lines: Array<Record<string, unknown>> };
    expect(rpc).toHaveBeenCalledWith("subdivision_preview_price_base_source_v2", expect.any(Object));
    expect(payload.p_lines[0]).toMatchObject({ block_number: 1, lot_number: 1, area_sqm: null, base_price_per_sqm_brl: 500 });
    expect(result).toMatchObject({ importableLineCount: 1, reconciledLineCount: 1, matrixAreaResolvedLineCount: 1 });
  });

  it("prepares only reconciled source rows and returns aggregate policy metadata", async () => {
    const sourceContentBase64 = makeSource([["Quadra", "Lote", "Área (m²)", "Valor (m²)"], [1, 1, 100, 500]]);
    const rpc = vi.fn().mockResolvedValue({ data: { policy_id: "00000000-0000-4000-8000-000000000005", line_count: 1, exception_count: 0 }, error: null });
    await expect(prepareSubdivisionPriceBasePolicy(actor, { ...context, developmentId, sourceFileName: "fonte.xlsx", sourceContentBase64, correlationId, versionReference: "PB_TESTE_001", effectiveFrom: "2026-09-05" }, { rpc })).resolves.toEqual({ policyId: "00000000-0000-4000-8000-000000000005", lineCount: 1, exceptionCount: 0 });
    expect(rpc).toHaveBeenCalledWith("subdivision_prepare_price_base_policy_v2", expect.objectContaining({ p_exception_count: 0, p_source_row_count: 1, p_lines: [expect.objectContaining({ block_number: 1, lot_number: 1 })] }));
  });

  it("prepares a manual correction only with an explicit price, declared source row and complete backing state", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: { policy_id: "00000000-0000-4000-8000-000000000006", line_count: 164, exception_count: 0 }, error: null });
    await expect(prepareManualSubdivisionPriceBaseCorrection(actor, {
      ...context,
      developmentId,
      sourcePolicyId: "00000000-0000-4000-8000-000000000005",
      versionReference: "PB_CORRECAO_001",
      effectiveFrom: "2026-09-05",
      sourceRow: 29,
      blockNumber: 1,
      lotNumber: 1,
      pricePerSqmBrl: 500,
      reasonCode: "source_correction",
      documentState: "declared_complete",
      correlationId,
    }, { rpc })).resolves.toEqual({ policyId: "00000000-0000-4000-8000-000000000006", lineCount: 164, exceptionCount: 0 });
    expect(rpc).toHaveBeenCalledWith("subdivision_prepare_manual_price_base_correction_v2", expect.objectContaining({
      p_source_row: 29,
      p_block_number: 1,
      p_lot_number: 1,
      p_price_per_sqm_brl: 500,
      p_document_state: "declared_complete",
    }));
  });

  it("rejects a manual correction without a positive explicit price", async () => {
    const rpc = vi.fn();
    await expect(prepareManualSubdivisionPriceBaseCorrection(actor, {
      ...context,
      developmentId,
      sourcePolicyId: "00000000-0000-4000-8000-000000000005",
      versionReference: "PB_CORRECAO_001",
      effectiveFrom: "2026-09-05",
      sourceRow: 29,
      blockNumber: 1,
      lotNumber: 1,
      pricePerSqmBrl: 0,
      reasonCode: "source_correction",
      documentState: "declared_complete",
      correlationId,
    }, { rpc })).rejects.toThrow();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("preserves the redacted evidence-required error before a manual correction can be prepared", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { message: "PRICE_BASE_MANUAL_CORRECTION_EVIDENCE_REQUIRED" } });
    await expect(prepareManualSubdivisionPriceBaseCorrection(actor, {
      ...context,
      developmentId,
      sourcePolicyId: "00000000-0000-4000-8000-000000000005",
      versionReference: "PB_CORRECAO_001",
      effectiveFrom: "2026-09-05",
      sourceRow: 29,
      blockNumber: 1,
      lotNumber: 1,
      pricePerSqmBrl: 500,
      reasonCode: "source_correction",
      documentState: "declared_complete",
      correlationId,
    }, { rpc })).rejects.toThrow("PRICE_BASE_MANUAL_CORRECTION_EVIDENCE_REQUIRED");
  });

  it("lists policies only through the selected development scope", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [], error: null });
    await expect(listSubdivisionPriceBasePolicies(actor, { ...context, developmentId }, { rpc })).resolves.toEqual([]);
    expect(rpc).toHaveBeenCalledWith("subdivision_list_price_base_policies_v1", expect.objectContaining({ p_development_id: developmentId, p_organization_id: organizationId }));
  });

  it("submits a prepared policy only through the evidence-gated function", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: "00000000-0000-4000-8000-000000000005", error: null });
    await expect(submitSubdivisionPriceBasePolicy(actor, { ...context, policyId: "00000000-0000-4000-8000-000000000005", correlationId }, { rpc })).resolves.toEqual({ policyId: "00000000-0000-4000-8000-000000000005", state: "submitted" });
    expect(rpc).toHaveBeenCalledWith("subdivision_submit_price_base_policy_v2", expect.objectContaining({ p_policy_id: "00000000-0000-4000-8000-000000000005" }));
  });

  it("preserves the redacted evidence-required error when the protected function denies submission", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { message: "PRICE_BASE_POLICY_EVIDENCE_REQUIRED" } });
    await expect(submitSubdivisionPriceBasePolicy(actor, { ...context, policyId: "00000000-0000-4000-8000-000000000005", correlationId }, { rpc })).rejects.toThrow("PRICE_BASE_POLICY_EVIDENCE_REQUIRED");
  });

  it("withdraws only through the protected policy-base RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: "00000000-0000-4000-8000-000000000005", error: null });
    await expect(withdrawSubdivisionPriceBasePolicy(actor, { ...context, policyId: "00000000-0000-4000-8000-000000000005", reasonCode: "governance_review", correlationId }, { rpc })).resolves.toEqual({ policyId: "00000000-0000-4000-8000-000000000005", state: "withdrawn" });
    expect(rpc).toHaveBeenCalledWith("subdivision_withdraw_price_base_policy_v2", expect.objectContaining({ p_policy_id: "00000000-0000-4000-8000-000000000005", p_reason_code: "governance_review", p_correlation_id: correlationId }));
  });
});
