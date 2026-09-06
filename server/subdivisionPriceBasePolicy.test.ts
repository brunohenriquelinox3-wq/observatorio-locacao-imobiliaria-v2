import * as XLSX from "xlsx";
import { describe, expect, it, vi } from "vitest";
import { listSubdivisionPriceBasePolicies, prepareSubdivisionPriceBasePolicy, previewSubdivisionPriceBaseSource } from "./subdivisionPriceBasePolicy";

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

  it("prepares only reconciled source rows and returns aggregate policy metadata", async () => {
    const sourceContentBase64 = makeSource([["Quadra", "Lote", "Área (m²)", "Valor (m²)"], [1, 1, 100, 500]]);
    const rpc = vi.fn().mockResolvedValue({ data: { policy_id: "00000000-0000-4000-8000-000000000005", line_count: 1, exception_count: 0 }, error: null });
    await expect(prepareSubdivisionPriceBasePolicy(actor, { ...context, developmentId, sourceFileName: "fonte.xlsx", sourceContentBase64, correlationId, versionReference: "PB_TESTE_001", effectiveFrom: "2026-09-05" }, { rpc })).resolves.toEqual({ policyId: "00000000-0000-4000-8000-000000000005", lineCount: 1, exceptionCount: 0 });
    expect(rpc).toHaveBeenCalledWith("subdivision_prepare_price_base_policy_v1", expect.objectContaining({ p_exception_count: 0, p_source_row_count: 1, p_lines: [expect.objectContaining({ block_number: 1, lot_number: 1 })] }));
  });

  it("lists policies only through the selected development scope", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [], error: null });
    await expect(listSubdivisionPriceBasePolicies(actor, { ...context, developmentId }, { rpc })).resolves.toEqual([]);
    expect(rpc).toHaveBeenCalledWith("subdivision_list_price_base_policies_v1", expect.objectContaining({ p_development_id: developmentId, p_organization_id: organizationId }));
  });
});
