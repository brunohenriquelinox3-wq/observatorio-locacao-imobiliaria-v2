import { createHash } from "node:crypto";
import * as XLSX from "xlsx";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  approveSubdivisionPriceBasePolicyInputSchema,
  listSubdivisionPriceBasePoliciesInputSchema,
  prepareManualSubdivisionPriceBaseCorrectionInputSchema,
  prepareSubdivisionPriceBasePolicyInputSchema,
  previewSubdivisionPriceBaseSourceInputSchema,
  submitSubdivisionPriceBasePolicyInputSchema,
  withdrawSubdivisionPriceBasePolicyInputSchema,
  type ApproveSubdivisionPriceBasePolicyInput,
  type ListSubdivisionPriceBasePoliciesInput,
  type PrepareManualSubdivisionPriceBaseCorrectionInput,
  type PrepareSubdivisionPriceBasePolicyInput,
  type PreviewSubdivisionPriceBaseSourceInput,
  type SubmitSubdivisionPriceBasePolicyInput,
  type WithdrawSubdivisionPriceBasePolicyInput,
} from "../shared/subdivisionPriceBaseContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;

const SOURCE_SCHEMA_VERSION = "price-base-xlsx-v1";
const MAX_SOURCE_BYTES = 2 * 1024 * 1024;
const allowedHeaderKeys = {
  block: ["quadra", "bloco"],
  lot: ["lote"],
  area: ["aream", "aream2", "areametrosquadrados", "areametroquadrado"],
  price: ["valorm", "valorm2", "precoporm", "precoporm2", "precom2", "precometroquadrado"],
};
const ignoredHeaderKeys = ["status", "valortotal", "valortotalr"];
const personalHeaderMarkers = ["nome", "cpf", "cnpj", "email", "telefone", "celular", "endereco", "cliente", "comprador", "corretor"];

type ParsedLine = {
  source_row: number;
  block_number: number;
  lot_number: number;
  area_sqm: number | null;
  base_price_per_sqm_brl: number;
  row_fingerprint: string;
};

type ParsedSource = {
  sourceFingerprint: string;
  sourceRows: number;
  ignoredHeaders: string[];
  auxiliaryFormulaCount: number;
  validLines: ParsedLine[];
  exceptionCounts: Record<string, number>;
  exceptionRows: Array<{ sourceRow: number; code: string }>;
};

export type PriceBasePreview = {
  sourceRows: number;
  importableLineCount: number;
  exceptionCounts: Record<string, number>;
  exceptionRows: Array<{ sourceRow: number; code: string }>;
  ignoredColumns: string[];
  auxiliaryFormulaCount: number;
  sourceFingerprint: string;
  reconciledLineCount: number;
  unreconciledLineCount: number;
  matrixAreaResolvedLineCount: number;
};

export type PriceBasePolicySummary = {
  policyId: string;
  developmentId: string;
  versionReference: string;
  state: "prepared" | "submitted" | "approved" | "expired" | "withdrawn";
  effectiveFrom: string;
  lineCount: number;
  exceptionCount: number;
  createdAt: string;
  submittedAt: string | null;
  approvedAt: string | null;
};

function requireSubject(subjectId: string | undefined) {
  if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED");
  return subjectId;
}

function normalizeHeader(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[áàâãä]/g, "a")
    .replace(/[éèêë]/g, "e")
    .replace(/[íìîï]/g, "i")
    .replace(/[óòôõö]/g, "o")
    .replace(/[úùûü]/g, "u")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]/g, "");
}

function toPositiveInteger(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) return value;
  const matches = String(value ?? "").match(/\d+/g);
  if (!matches || matches.length !== 1) return null;
  const parsed = Number(matches[0]);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function toPositiveDecimal(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const normalized = raw.includes(",")
    ? raw.replace(/[^0-9,.-]/g, "").replace(/\./g, "").replace(",", ".")
    : raw.replace(/[^0-9.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function fingerprint(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function sourceError(code: string): never {
  throw new Error(code);
}

function findHeaderIndex(headers: string[], candidates: string[]) {
  const match = headers.findIndex((header) => candidates.includes(header));
  return match >= 0 ? match : null;
}

function extractParsedSource(sourceContentBase64: string): ParsedSource {
  const bytes = Buffer.from(sourceContentBase64, "base64");
  if (!bytes.length || bytes.length > MAX_SOURCE_BYTES) sourceError("PRICE_SOURCE_SIZE_INVALID");

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(bytes, { type: "buffer", cellFormula: true, cellStyles: false, bookVBA: true });
  } catch {
    sourceError("PRICE_SOURCE_PARSE_FAILED");
  }
  if (workbook.SheetNames.length !== 1 || workbook.vbaraw) sourceError("PRICE_SOURCE_WORKBOOK_INVALID");
  const sheet = workbook.Sheets[workbook.SheetNames[0] ?? ""];
  const rangeRef = sheet?.["!ref"];
  if (!sheet || !rangeRef) sourceError("PRICE_SOURCE_WORKBOOK_EMPTY");
  if ((workbook.Workbook?.Names ?? []).some((entry) => /\[[^\]]+\]/.test(entry.Ref ?? ""))) sourceError("PRICE_SOURCE_EXTERNAL_LINK_BLOCKED");

  const range = XLSX.utils.decode_range(rangeRef);
  if (range.e.r - range.s.r + 1 > 2_001 || range.e.c - range.s.c + 1 > 12) sourceError("PRICE_SOURCE_DIMENSIONS_INVALID");
  const headers: string[] = [];
  const displayHeaders: string[] = [];
  for (let column = range.s.c; column <= range.e.c; column += 1) {
    const cell = sheet[XLSX.utils.encode_cell({ r: range.s.r, c: column })];
    const display = String(cell?.v ?? "").trim();
    const normalized = normalizeHeader(display);
    if (!display || !normalized || headers.includes(normalized)) sourceError("PRICE_SOURCE_HEADERS_INVALID");
    headers.push(normalized);
    displayHeaders.push(display);
  }
  if (headers.some((header) => personalHeaderMarkers.some((marker) => header.includes(marker)))) sourceError("PRICE_SOURCE_PERSONAL_DATA_BLOCKED");

  const indices = {
    block: findHeaderIndex(headers, allowedHeaderKeys.block),
    lot: findHeaderIndex(headers, allowedHeaderKeys.lot),
    area: findHeaderIndex(headers, allowedHeaderKeys.area),
    price: findHeaderIndex(headers, allowedHeaderKeys.price),
  };
  if (Object.values(indices).some((index) => index === null)) sourceError("PRICE_SOURCE_REQUIRED_HEADERS_MISSING");

  const allowedIndices = new Set(Object.values(indices).filter((index): index is number => index !== null));
  const ignoredHeaders: string[] = [];
  const ignoredIndices = new Set<number>();
  headers.forEach((header, index) => {
    if (allowedIndices.has(index)) return;
    if (!ignoredHeaderKeys.includes(header)) sourceError("PRICE_SOURCE_HEADER_NOT_ALLOWED");
    ignoredHeaders.push(displayHeaders[index] ?? header);
    ignoredIndices.add(index);
  });

  const validLines: ParsedLine[] = [];
  const exceptionCounts: Record<string, number> = {};
  const exceptionRows: Array<{ sourceRow: number; code: string }> = [];
  const increment = (code: string, sourceRow: number) => {
    exceptionCounts[code] = (exceptionCounts[code] ?? 0) + 1;
    if (exceptionRows.length < 10) exceptionRows.push({ sourceRow, code });
  };
  let sourceRows = 0;
  let auxiliaryFormulaCount = 0;
  const pairs = new Set<string>();

  for (let row = range.s.r + 1; row <= range.e.r; row += 1) {
    const cells = headers.map((_, column) => sheet[XLSX.utils.encode_cell({ r: row, c: range.s.c + column })]);
    if (!cells.some((cell) => cell?.v !== undefined && cell.v !== null && cell.v !== "")) continue;
    sourceRows += 1;
    if (cells.some((cell, index) => allowedIndices.has(index) && Boolean(cell?.f))) sourceError("PRICE_SOURCE_ALLOWED_FORMULA_BLOCKED");
    cells.forEach((cell, index) => {
      if (ignoredIndices.has(index) && cell?.f) auxiliaryFormulaCount += 1;
    });

    const blockNumber = toPositiveInteger(cells[indices.block ?? 0]?.v);
    const lotNumber = toPositiveInteger(cells[indices.lot ?? 0]?.v);
    const areaSqm = toPositiveDecimal(cells[indices.area ?? 0]?.v);
    const pricePerSqm = toPositiveDecimal(cells[indices.price ?? 0]?.v);
    if (!blockNumber || !lotNumber) {
      increment("PHYSICAL_IDENTIFIER_REQUIRED", row + 1);
      continue;
    }
    if (!pricePerSqm) {
      increment(!areaSqm ? "AREA_AND_PRICE_REQUIRED" : "BASE_PRICE_REQUIRED", row + 1);
      continue;
    }
    const pair = `${blockNumber}:${lotNumber}`;
    if (pairs.has(pair)) {
      increment("PHYSICAL_IDENTIFIER_DUPLICATE", row + 1);
      continue;
    }
    pairs.add(pair);
    const line = { source_row: row + 1, block_number: blockNumber, lot_number: lotNumber, area_sqm: areaSqm, base_price_per_sqm_brl: pricePerSqm };
    validLines.push({ ...line, row_fingerprint: fingerprint(line) });
  }
  if (!validLines.length) sourceError("PRICE_SOURCE_NO_VALID_LINES");
  return {
    sourceFingerprint: fingerprint({ schema: SOURCE_SCHEMA_VERSION, lines: validLines.map(({ row_fingerprint: _hash, ...line }) => line) }),
    sourceRows,
    ignoredHeaders,
    auxiliaryFormulaCount,
    validLines,
    exceptionCounts,
    exceptionRows,
  };
}

export async function previewSubdivisionPriceBaseSource(subjectId: string | undefined, rawInput: PreviewSubdivisionPriceBaseSourceInput, client: RpcClient = getSupabaseAdminClient()): Promise<PriceBasePreview> {
  const actorUserId = requireSubject(subjectId);
  const input = previewSubdivisionPriceBaseSourceInputSchema.parse(rawInput);
  const parsed = extractParsedSource(input.sourceContentBase64);
  const { data, error } = await client.rpc("subdivision_preview_price_base_source_v2", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_development_id: input.developmentId,
    p_lines: parsed.validLines,
  });
  if (error || !data || typeof data !== "object") throw new Error("PRICE_BASE_PREVIEW_DENIED");
  const preview = data as Record<string, unknown>;
  return {
    sourceRows: parsed.sourceRows,
    importableLineCount: parsed.validLines.length,
    exceptionCounts: parsed.exceptionCounts,
    exceptionRows: parsed.exceptionRows,
    ignoredColumns: parsed.ignoredHeaders,
    auxiliaryFormulaCount: parsed.auxiliaryFormulaCount,
    sourceFingerprint: parsed.sourceFingerprint,
    reconciledLineCount: Number(preview.reconciled_line_count ?? 0),
    unreconciledLineCount: Number(preview.unreconciled_line_count ?? 0),
    matrixAreaResolvedLineCount: Number(preview.matrix_area_resolved_line_count ?? 0),
  };
}

export async function prepareSubdivisionPriceBasePolicy(subjectId: string | undefined, rawInput: PrepareSubdivisionPriceBasePolicyInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ policyId: string; lineCount: number; exceptionCount: number }> {
  const actorUserId = requireSubject(subjectId);
  const input = prepareSubdivisionPriceBasePolicyInputSchema.parse(rawInput);
  const parsed = extractParsedSource(input.sourceContentBase64);
  const { data, error } = await client.rpc("subdivision_prepare_price_base_policy_v2", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_development_id: input.developmentId,
    p_version_reference: input.versionReference,
    p_effective_from: input.effectiveFrom,
    p_source_fingerprint: parsed.sourceFingerprint,
    p_source_row_count: parsed.sourceRows,
    p_exception_count: Object.values(parsed.exceptionCounts).reduce((total, count) => total + count, 0),
    p_lines: parsed.validLines,
    p_correlation_id: input.correlationId,
  });
  if (error || !data || typeof data !== "object") throw new Error("PRICE_BASE_PREPARE_DENIED");
  const result = data as Record<string, unknown>;
  return { policyId: String(result.policy_id), lineCount: Number(result.line_count), exceptionCount: Number(result.exception_count) };
}

export async function prepareManualSubdivisionPriceBaseCorrection(subjectId: string | undefined, rawInput: PrepareManualSubdivisionPriceBaseCorrectionInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ policyId: string; lineCount: number; exceptionCount: number }> {
  const actorUserId = requireSubject(subjectId);
  const input = prepareManualSubdivisionPriceBaseCorrectionInputSchema.parse(rawInput);
  const sourceFingerprint = fingerprint({
    sourcePolicyId: input.sourcePolicyId,
    developmentId: input.developmentId,
    sourceRow: input.sourceRow,
    blockNumber: input.blockNumber,
    lotNumber: input.lotNumber,
    pricePerSqmBrl: input.pricePerSqmBrl,
    effectiveFrom: input.effectiveFrom,
    reasonCode: input.reasonCode,
  });
  const rowFingerprint = fingerprint({
    kind: "manual-price-base-correction-v1",
    developmentId: input.developmentId,
    sourceRow: input.sourceRow,
    blockNumber: input.blockNumber,
    lotNumber: input.lotNumber,
    pricePerSqmBrl: input.pricePerSqmBrl,
  });
  const { data, error } = await client.rpc("subdivision_prepare_manual_price_base_correction_v2", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_development_id: input.developmentId,
    p_source_policy_id: input.sourcePolicyId,
    p_version_reference: input.versionReference,
    p_effective_from: input.effectiveFrom,
    p_source_row: input.sourceRow,
    p_block_number: input.blockNumber,
    p_lot_number: input.lotNumber,
    p_price_per_sqm_brl: input.pricePerSqmBrl,
    p_source_fingerprint: sourceFingerprint,
    p_row_fingerprint: rowFingerprint,
    p_reason_code: input.reasonCode,
    p_document_state: input.documentState,
    p_correlation_id: input.correlationId,
  });
  if (error?.message === "PRICE_BASE_MANUAL_CORRECTION_EVIDENCE_REQUIRED") throw new Error("PRICE_BASE_MANUAL_CORRECTION_EVIDENCE_REQUIRED");
  if (error || !data || typeof data !== "object") throw new Error("PRICE_BASE_MANUAL_CORRECTION_DENIED");
  const result = data as Record<string, unknown>;
  return { policyId: String(result.policy_id), lineCount: Number(result.line_count), exceptionCount: Number(result.exception_count) };
}

export async function submitSubdivisionPriceBasePolicy(subjectId: string | undefined, rawInput: SubmitSubdivisionPriceBasePolicyInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ policyId: string; state: "submitted" }> {
  const actorUserId = requireSubject(subjectId);
  const input = submitSubdivisionPriceBasePolicyInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_submit_price_base_policy_v2", { p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_policy_id: input.policyId, p_correlation_id: input.correlationId });
  if (error?.message === "PRICE_BASE_POLICY_EVIDENCE_REQUIRED") throw new Error("PRICE_BASE_POLICY_EVIDENCE_REQUIRED");
  if (error || typeof data !== "string") throw new Error("PRICE_BASE_SUBMIT_DENIED");
  return { policyId: data, state: "submitted" };
}

export async function approveSubdivisionPriceBasePolicy(subjectId: string | undefined, rawInput: ApproveSubdivisionPriceBasePolicyInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ policyId: string; state: "approved" }> {
  const actorUserId = requireSubject(subjectId);
  const input = approveSubdivisionPriceBasePolicyInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_approve_price_base_policy_v1", { p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_policy_id: input.policyId, p_correlation_id: input.correlationId });
  if (error || typeof data !== "string") throw new Error("PRICE_BASE_APPROVE_DENIED");
  return { policyId: data, state: "approved" };
}

export async function withdrawSubdivisionPriceBasePolicy(subjectId: string | undefined, rawInput: WithdrawSubdivisionPriceBasePolicyInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ policyId: string; state: "withdrawn" }> {
  const actorUserId = requireSubject(subjectId);
  const input = withdrawSubdivisionPriceBasePolicyInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_withdraw_price_base_policy_v1", { p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_policy_id: input.policyId, p_correlation_id: input.correlationId });
  if (error || typeof data !== "string") throw new Error("PRICE_BASE_POLICY_WITHDRAW_DENIED");
  return { policyId: data, state: "withdrawn" };
}

export async function listSubdivisionPriceBasePolicies(subjectId: string | undefined, rawInput: ListSubdivisionPriceBasePoliciesInput, client: RpcClient = getSupabaseAdminClient()): Promise<PriceBasePolicySummary[]> {
  const actorUserId = requireSubject(subjectId);
  const input = listSubdivisionPriceBasePoliciesInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_list_price_base_policies_v1", { p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_development_id: input.developmentId });
  if (error || !Array.isArray(data)) throw new Error("PRICE_BASE_LIST_DENIED");
  return data.map((row) => ({
    policyId: String(row.policy_id),
    developmentId: String(row.development_id),
    versionReference: String(row.version_reference),
    state: String(row.policy_state) as PriceBasePolicySummary["state"],
    effectiveFrom: String(row.effective_from),
    lineCount: Number(row.line_count),
    exceptionCount: Number(row.exception_count),
    createdAt: String(row.created_at),
    submittedAt: row.submitted_at ? String(row.submitted_at) : null,
    approvedAt: row.approved_at ? String(row.approved_at) : null,
  }));
}
