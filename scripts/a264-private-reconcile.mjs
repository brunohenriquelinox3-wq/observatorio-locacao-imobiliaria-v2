import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [sourcePath, crmResultPath, outputPath] = process.argv.slice(2);
if (!sourcePath || !crmResultPath || !outputPath) throw new Error("A264_RECONCILIATION_ARGUMENTS_REQUIRED");

function findResultText(value) {
  if (typeof value === "string" && value.includes("untrusted-data")) return value;
  if (!value || typeof value !== "object") return "";
  for (const nested of Object.values(value)) {
    const found = findResultText(nested);
    if (found) return found;
  }
  return "";
}

function readMcpRows(resultPayload) {
  const result = findResultText(resultPayload)
    .replaceAll("\\u003c", "<")
    .replaceAll("\\u003e", ">")
    .replaceAll("\\n", "\n");
  const start = result.indexOf("[{");
  const end = start >= 0 ? result.indexOf("]", start) : -1;
  if (start < 0 || end < 0) throw new Error("A264_CRM_RESULT_FORMAT_INVALID");
  const rows = JSON.parse(result.slice(start, end + 1));
  if (!Array.isArray(rows)) throw new Error("A264_CRM_ROWS_INVALID");
  return rows.map((row) => ({
    blockNumber: Number(row.block_number),
    lotNumber: Number(row.lot_number),
    areaSqm: Number(row.area_sqm),
  }));
}

function pairOf(line) {
  return `${line.blockNumber}:${line.lotNumber}`;
}

function validPhysicalLine(line) {
  return Number.isInteger(line.blockNumber) && line.blockNumber > 0
    && Number.isInteger(line.lotNumber) && line.lotNumber > 0
    && Number.isFinite(line.areaSqm) && line.areaSqm > 0;
}

const source = JSON.parse(await readFile(sourcePath, "utf8"));
const crmRows = readMcpRows(JSON.parse(await readFile(crmResultPath, "utf8")));
const physicalLines = Array.isArray(source.physicalLines) ? source.physicalLines : [];
if (!physicalLines.every(validPhysicalLine) || !crmRows.every(validPhysicalLine)) throw new Error("A264_RECONCILIATION_PHYSICAL_ROW_INVALID");

const sourceByPair = new Map(physicalLines.map((line) => [pairOf(line), line]));
const crmByPair = new Map(crmRows.map((line) => [pairOf(line), line]));
if (sourceByPair.size !== physicalLines.length || crmByPair.size !== crmRows.length) throw new Error("A264_RECONCILIATION_DUPLICATE_PAIR");

const sourceOnlyPairs = [...sourceByPair.keys()].filter((pair) => !crmByPair.has(pair));
const crmOnlyPairs = [...crmByPair.keys()].filter((pair) => !sourceByPair.has(pair));
const areaMismatchPairs = [...sourceByPair.keys()].filter((pair) => {
  const sourceLine = sourceByPair.get(pair);
  const crmLine = crmByPair.get(pair);
  return crmLine && Math.abs(sourceLine.areaSqm - crmLine.areaSqm) > 0.005;
});
const eligiblePriceLines = [...sourceByPair.entries()]
  .filter(([pair, line]) => crmByPair.has(pair) && !areaMismatchPairs.includes(pair) && Number.isFinite(line.pricePerSqmBrl) && line.pricePerSqmBrl > 0)
  .map(([pair, line]) => ({ ...line, crmAreaSqm: crmByPair.get(pair).areaSqm }));

const summary = {
  sourcePhysicalLineCount: physicalLines.length,
  crmPhysicalLineCount: crmRows.length,
  matchingAreaLineCount: physicalLines.length - sourceOnlyPairs.length - areaMismatchPairs.length,
  sourceOnlyCount: sourceOnlyPairs.length,
  crmOnlyCount: crmOnlyPairs.length,
  areaMismatchCount: areaMismatchPairs.length,
  eligiblePriceLineCount: eligiblePriceLines.length,
  intentionalMissingPriceCount: physicalLines.filter((line) => !line.pricePerSqmBrl).length,
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, JSON.stringify({ schema: "a264-private-reconciliation-v1", summary, eligiblePriceLines }, null, 2), { mode: 0o600 });
console.log(JSON.stringify(summary));
