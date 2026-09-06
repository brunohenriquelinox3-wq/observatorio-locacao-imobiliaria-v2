import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import * as XLSX from "xlsx";

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) throw new Error("A264_PRIVATE_SOURCE_ARGUMENTS_REQUIRED");

const allowedHeaderKeys = {
  block: ["quadra", "bloco"],
  lot: ["lote"],
  area: ["aream", "aream2", "areametrosquadrados", "areametroquadrado"],
  price: ["valorm", "valorm2", "precoporm", "precoporm2", "precom2", "precometroquadrado"],
};
const ignoredHeaderKeys = new Set(["status", "valortotal", "valortotalr"]);
const personalHeaderMarkers = ["nome", "cpf", "cnpj", "email", "telefone", "celular", "endereco", "cliente", "comprador", "corretor"];

function normalizeHeader(value) {
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

function toPositiveInteger(value) {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) return value;
  const matches = String(value ?? "").match(/\d+/g);
  if (!matches || matches.length !== 1) return null;
  const parsed = Number(matches[0]);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function toPositiveDecimal(value) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const normalized = raw.includes(",")
    ? raw.replace(/[^0-9,.-]/g, "").replace(/\./g, "").replace(",", ".")
    : raw.replace(/[^0-9.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function auditFailure(code) {
  throw new Error(code);
}

function findHeaderIndex(headers, candidates) {
  const index = headers.findIndex((header) => candidates.includes(header));
  return index >= 0 ? index : null;
}

const workbook = XLSX.read(await readFile(inputPath), { type: "buffer", cellFormula: true, cellStyles: false, bookVBA: true });
if (workbook.SheetNames.length !== 1 || workbook.vbaraw) auditFailure("A264_SOURCE_WORKBOOK_INVALID");
if ((workbook.Workbook?.Names ?? []).some((entry) => /\[[^\]]+\]/.test(entry.Ref ?? ""))) auditFailure("A264_SOURCE_EXTERNAL_LINK_BLOCKED");

const sheet = workbook.Sheets[workbook.SheetNames[0] ?? ""];
const rangeRef = sheet?.["!ref"];
if (!sheet || !rangeRef) auditFailure("A264_SOURCE_WORKBOOK_EMPTY");
const range = XLSX.utils.decode_range(rangeRef);
if (range.e.r - range.s.r + 1 > 2001 || range.e.c - range.s.c + 1 > 12) auditFailure("A264_SOURCE_DIMENSIONS_INVALID");

const headers = [];
for (let column = range.s.c; column <= range.e.c; column += 1) {
  const normalized = normalizeHeader(sheet[XLSX.utils.encode_cell({ r: range.s.r, c: column })]?.v);
  if (!normalized || headers.includes(normalized)) auditFailure("A264_SOURCE_HEADERS_INVALID");
  headers.push(normalized);
}
if (headers.some((header) => personalHeaderMarkers.some((marker) => header.includes(marker)))) auditFailure("A264_SOURCE_PERSONAL_DATA_BLOCKED");

const indices = {
  block: findHeaderIndex(headers, allowedHeaderKeys.block),
  lot: findHeaderIndex(headers, allowedHeaderKeys.lot),
  area: findHeaderIndex(headers, allowedHeaderKeys.area),
  price: findHeaderIndex(headers, allowedHeaderKeys.price),
};
if (Object.values(indices).some((index) => index === null)) auditFailure("A264_SOURCE_REQUIRED_HEADERS_MISSING");

const allowedIndices = new Set(Object.values(indices));
if (headers.some((header, index) => !allowedIndices.has(index) && !ignoredHeaderKeys.has(header))) auditFailure("A264_SOURCE_HEADER_NOT_ALLOWED");

const lines = [];
const physicalLines = [];
const exceptions = {};
const pairs = new Set();
let sourceRows = 0;
let auxiliaryFormulaCount = 0;
for (let row = range.s.r + 1; row <= range.e.r; row += 1) {
  const cells = headers.map((_, column) => sheet[XLSX.utils.encode_cell({ r: row, c: range.s.c + column })]);
  if (!cells.some((cell) => cell?.v !== undefined && cell.v !== null && cell.v !== "")) continue;
  sourceRows += 1;
  if (cells.some((cell, index) => allowedIndices.has(index) && Boolean(cell?.f))) auditFailure("A264_SOURCE_ALLOWED_FORMULA_BLOCKED");
  cells.forEach((cell, index) => { if (!allowedIndices.has(index) && cell?.f) auxiliaryFormulaCount += 1; });
  const blockNumber = toPositiveInteger(cells[indices.block]?.v);
  const lotNumber = toPositiveInteger(cells[indices.lot]?.v);
  const areaSqm = toPositiveDecimal(cells[indices.area]?.v);
  const pricePerSqmBrl = toPositiveDecimal(cells[indices.price]?.v);
  const exception = !blockNumber || !lotNumber
    ? "PHYSICAL_IDENTIFIER_REQUIRED"
    : !areaSqm && !pricePerSqmBrl
      ? "AREA_AND_PRICE_REQUIRED"
      : !areaSqm
        ? "AREA_REQUIRED"
        : !pricePerSqmBrl
          ? "BASE_PRICE_REQUIRED"
          : null;
  if (exception && exception !== "BASE_PRICE_REQUIRED") {
    exceptions[exception] = (exceptions[exception] ?? 0) + 1;
    continue;
  }
  const pair = `${blockNumber}:${lotNumber}`;
  if (pairs.has(pair)) {
    exceptions.PHYSICAL_IDENTIFIER_DUPLICATE = (exceptions.PHYSICAL_IDENTIFIER_DUPLICATE ?? 0) + 1;
    continue;
  }
  pairs.add(pair);
  physicalLines.push({ blockNumber, lotNumber, areaSqm, pricePerSqmBrl: pricePerSqmBrl ?? null });
  if (!pricePerSqmBrl) {
    exceptions.BASE_PRICE_REQUIRED = (exceptions.BASE_PRICE_REQUIRED ?? 0) + 1;
    continue;
  }
  lines.push({ blockNumber, lotNumber, areaSqm, pricePerSqmBrl });
}

const fingerprint = createHash("sha256").update(JSON.stringify(lines)).digest("hex");
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, JSON.stringify({ schema: "a264-private-source-v1", fingerprint, lines, physicalLines }, null, 2), { mode: 0o600 });
console.log(JSON.stringify({ acceptedLineCount: lines.length, physicalLineCount: physicalLines.length, sourceRowCount: sourceRows, exceptionCounts: exceptions, auxiliaryFormulaCount, fingerprintPrefix: fingerprint.slice(0, 12) }));
