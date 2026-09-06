import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [sourcePath, policyResultPath, outputPath] = process.argv.slice(2);
if (!sourcePath || !policyResultPath || !outputPath) throw new Error("A264_POLICY_VERIFY_ARGUMENTS_REQUIRED");

function extractRows(payload) {
  const text = String(payload?.result ?? JSON.stringify(payload))
    .replaceAll("\\u003c", "<")
    .replaceAll("\\u003e", ">")
    .replaceAll("\\n", "\n");
  const start = text.search(/\[\s*\{/);
  const end = text.lastIndexOf("}]");
  if (start < 0 || end < start) throw new Error("A264_POLICY_RESULT_FORMAT_INVALID");
  const fragment = text.slice(start, end + 2).replaceAll('\\"', '"');
  const rows = JSON.parse(fragment);
  if (!Array.isArray(rows)) throw new Error("A264_POLICY_ROWS_INVALID");
  return rows.map((row) => ({
    blockNumber: Number(row.block_number),
    lotNumber: Number(row.lot_number),
    sourceAreaSqm: Number(row.source_area_sqm),
    pricePerSqmBrl: Number(row.base_price_per_sqm_brl),
  }));
}

function pairOf(line) {
  return `${line.blockNumber}:${line.lotNumber}`;
}

const source = JSON.parse(await readFile(sourcePath, "utf8"));
const policyRows = extractRows(JSON.parse(await readFile(policyResultPath, "utf8")));
const sourceLines = Array.isArray(source.lines) ? source.lines : [];
const sourceByPair = new Map(sourceLines.map((line) => [pairOf(line), line]));
const policyByPair = new Map(policyRows.map((line) => [pairOf(line), line]));
if (sourceByPair.size !== sourceLines.length || policyByPair.size !== policyRows.length) throw new Error("A264_POLICY_DUPLICATE_PAIR");

const sourceOnlyCount = [...sourceByPair.keys()].filter((pair) => !policyByPair.has(pair)).length;
const policyOnlyCount = [...policyByPair.keys()].filter((pair) => !sourceByPair.has(pair)).length;
const areaMismatchCount = [...sourceByPair.entries()].filter(([pair, line]) => {
  const policyLine = policyByPair.get(pair);
  return policyLine && Math.abs(line.areaSqm - policyLine.sourceAreaSqm) > 0.005;
}).length;
const priceMismatchCount = [...sourceByPair.entries()].filter(([pair, line]) => {
  const policyLine = policyByPair.get(pair);
  return policyLine && Math.abs(line.pricePerSqmBrl - policyLine.pricePerSqmBrl) > 0.005;
}).length;

const summary = {
  sourceExplicitPriceLineCount: sourceLines.length,
  preparedPolicyLineCount: policyRows.length,
  sourceOnlyCount,
  policyOnlyCount,
  areaMismatchCount,
  priceMismatchCount,
  matchingPreparedLineCount: sourceLines.length - sourceOnlyCount - areaMismatchCount - priceMismatchCount,
};
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, JSON.stringify({ schema: "a264-private-policy-verify-v1", summary }, null, 2), { mode: 0o600 });
console.log(JSON.stringify(summary));
