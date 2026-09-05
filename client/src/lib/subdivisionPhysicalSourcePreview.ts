import * as XLSX from "xlsx";

export type PhysicalSourceLot = { lotNumber: number; areaSqm: number | null };
export type PhysicalSourceBlock = { blockNumber: number; lots: PhysicalSourceLot[] };
export type PhysicalSourcePreview = {
  blocks: PhysicalSourceBlock[];
  blockCount: number;
  lotCount: number;
  areaCoverageCount: number;
  issues: string[];
};

const MAX_SOURCE_BYTES = 2 * 1024 * 1024;

function normalizeHeader(value: unknown) {
  return String(value ?? "").trim().toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function numericReference(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) return value;
  const match = String(value ?? "").trim().match(/^(?:q(?:uadra)?|l(?:ote)?)?\s*(\d{1,3})$/i);
  return match ? Number(match[1]) : null;
}

function physicalArea(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0 && value <= 1_000_000) return Number(value.toFixed(2));
  const raw = String(value ?? "").trim().replace(/m²|m2/gi, "").replace(/\s/g, "");
  if (!raw) return null;
  const decimal = raw.includes(",") ? Number(raw.replace(/\./g, "").replace(",", ".")) : Number(raw);
  return Number.isFinite(decimal) && decimal > 0 && decimal <= 1_000_000 ? Number(decimal.toFixed(2)) : null;
}

export function buildPhysicalSourcePreview(rows: unknown[][]): PhysicalSourcePreview {
  const headerIndex = rows.findIndex((row) => row.some((cell) => normalizeHeader(cell).includes("quadra")) && row.some((cell) => normalizeHeader(cell).includes("lote")));
  if (headerIndex < 0) throw new Error("SUBDIVISION_PHYSICAL_SOURCE_HEADERS_REQUIRED");
  const headers = rows[headerIndex].map(normalizeHeader);
  const blockColumn = headers.findIndex((header) => header.includes("quadra"));
  const lotColumn = headers.findIndex((header) => header === "lote" || header.startsWith("lote "));
  const areaColumn = headers.findIndex((header) => header.includes("area"));
  if (blockColumn < 0 || lotColumn < 0) throw new Error("SUBDIVISION_PHYSICAL_SOURCE_HEADERS_REQUIRED");

  const seen = new Set<string>();
  const byBlock = new Map<number, PhysicalSourceLot[]>();
  const issues: string[] = [];
  rows.slice(headerIndex + 1).forEach((row, offset) => {
    const blockNumber = numericReference(row[blockColumn]);
    const lotNumber = numericReference(row[lotColumn]);
    if (blockNumber === null && lotNumber === null) return;
    if (blockNumber === null || lotNumber === null || blockNumber > 999 || lotNumber > 100) {
      issues.push(`Linha ${headerIndex + offset + 2}: Quadra e Lote precisam estar entre os limites permitidos.`);
      return;
    }
    const key = `${blockNumber}:${lotNumber}`;
    if (seen.has(key)) {
      issues.push(`Linha ${headerIndex + offset + 2}: Q${blockNumber} · L${lotNumber} está repetido.`);
      return;
    }
    seen.add(key);
    const lots = byBlock.get(blockNumber) ?? [];
    lots.push({ lotNumber, areaSqm: areaColumn >= 0 ? physicalArea(row[areaColumn]) : null });
    byBlock.set(blockNumber, lots);
  });
  const blocks = Array.from(byBlock.entries()).sort(([left], [right]) => left - right).map(([blockNumber, lots]) => ({ blockNumber, lots: [...lots].sort((left, right) => left.lotNumber - right.lotNumber) }));
  if (blocks.length === 0) throw new Error("SUBDIVISION_PHYSICAL_SOURCE_ROWS_REQUIRED");
  if (blocks.length > 50) throw new Error("SUBDIVISION_PHYSICAL_SOURCE_BLOCK_LIMIT");
  const lotCount = blocks.reduce((total, block) => total + block.lots.length, 0);
  if (lotCount > 2_000) throw new Error("SUBDIVISION_PHYSICAL_SOURCE_LOT_LIMIT");
  const areaCoverageCount = blocks.reduce((total, block) => total + block.lots.filter((lot) => lot.areaSqm !== null).length, 0);
  return { blocks, blockCount: blocks.length, lotCount, areaCoverageCount, issues };
}

export async function parsePhysicalSourceFile(file: File): Promise<PhysicalSourcePreview> {
  if (!file.name.toLocaleLowerCase("pt-BR").endsWith(".xlsx") || file.size < 1 || file.size > MAX_SOURCE_BYTES) throw new Error("SUBDIVISION_PHYSICAL_SOURCE_FILE_REJECTED");
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: false, raw: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = sheetName ? workbook.Sheets[sheetName] : undefined;
  if (!sheet) throw new Error("SUBDIVISION_PHYSICAL_SOURCE_SHEET_REQUIRED");
  return buildPhysicalSourcePreview(XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null }));
}
