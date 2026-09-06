import type { ClientImportRow } from "@shared/clientImportContracts";

export const MAX_CLIENT_IMPORT_FILE_BYTES = 512 * 1024;
export const MAX_CLIENT_IMPORT_ROWS = 200;

export const clientImportFieldPolicy = [
  { field: "Nome", classification: "Identificação mínima", purpose: "Criar rascunho de parte", retention: "Até revisão humana do rascunho" },
  { field: "Tipo", classification: "Classificação cadastral", purpose: "Diferenciar pessoa física ou jurídica", retention: "Até revisão humana do rascunho" },
  { field: "Perfil", classification: "Classificação operacional", purpose: "Definir Cliente ou Comprador", retention: "Até revisão humana do rascunho" },
] as const;

export const clientImportProhibitedData = "CPF/CNPJ, contatos, endereço, documentos, anexos, contratos, valores, cobranças, pagamentos e campos não listados";

type ImportedKind = ClientImportRow["kind"];
type ImportedRole = ClientImportRow["role"];

export type ClientImportPreviewRow = ClientImportRow & {
  line: number;
  issues: string[];
};

export type ClientImportPreview = {
  rows: ClientImportPreviewRow[];
  fileIssues: string[];
  receivedRows: number;
  validRows: number;
  isReady: boolean;
};

const allowedHeaderAliases = new Map<string, "displayName" | "kind" | "role">([
  ["nome", "displayName"],
  ["nome do cliente", "displayName"],
  ["nome completo", "displayName"],
  ["display name", "displayName"],
  ["tipo", "kind"],
  ["natureza", "kind"],
  ["perfil", "role"],
  ["papel", "role"],
  ["funcao", "role"],
]);

function normalizeText(value: unknown): string {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

export function normalizeClientImportHeader(value: string): string {
  return normalizeText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

function parseKind(value: string): ImportedKind | null {
  const normalized = normalizeClientImportHeader(value).replaceAll(" ", "_");
  if (["individual", "pessoa_fisica", "fisica", "pf"].includes(normalized)) return "individual";
  if (["legal_entity", "pessoa_juridica", "juridica", "pj"].includes(normalized)) return "legal_entity";
  return null;
}

function parseRole(value: string): ImportedRole | null {
  const normalized = normalizeClientImportHeader(value).replaceAll(" ", "_");
  if (["client", "cliente"].includes(normalized)) return "client";
  if (["buyer", "comprador"].includes(normalized)) return "buyer";
  return null;
}

export function buildClientImportPreview(rawRows: Array<Record<string, unknown>>, rawHeaders: string[]): ClientImportPreview {
  const resolvedHeaders = new Map<"displayName" | "kind" | "role", string>();
  const unexpectedHeaders: string[] = [];

  for (const rawHeader of rawHeaders) {
    const normalized = normalizeClientImportHeader(rawHeader);
    const field = allowedHeaderAliases.get(normalized);
    if (!field) unexpectedHeaders.push(normalizeText(rawHeader));
    else if (resolvedHeaders.has(field)) unexpectedHeaders.push(normalizeText(rawHeader));
    else resolvedHeaders.set(field, rawHeader);
  }

  const fileIssues: string[] = [];
  for (const required of ["displayName", "kind", "role"] as const) {
    if (!resolvedHeaders.has(required)) {
      fileIssues.push(`A coluna obrigatória ${required === "displayName" ? "Nome" : required === "kind" ? "Tipo" : "Perfil"} não foi encontrada.`);
    }
  }
  if (unexpectedHeaders.length > 0) {
    fileIssues.push("A planilha contém coluna não permitida. Use apenas Nome, Tipo e Perfil; identificadores, contatos, documentos, contratos, valores e campos fora da matriz mínima não são aceitos nesta etapa.");
  }
  if (rawRows.length > MAX_CLIENT_IMPORT_ROWS) {
    fileIssues.push(`O limite é de ${MAX_CLIENT_IMPORT_ROWS} linhas por importação.`);
  }

  const seen = new Set<string>();
  const rows = rawRows.slice(0, MAX_CLIENT_IMPORT_ROWS).map((rawRow, index): ClientImportPreviewRow => {
    const displayName = normalizeText(resolvedHeaders.get("displayName") ? rawRow[resolvedHeaders.get("displayName")!] : "");
    const kind = parseKind(normalizeText(resolvedHeaders.get("kind") ? rawRow[resolvedHeaders.get("kind")!] : ""));
    const role = parseRole(normalizeText(resolvedHeaders.get("role") ? rawRow[resolvedHeaders.get("role")!] : ""));
    const issues: string[] = [];
    if (displayName.length < 2 || displayName.length > 160) issues.push("Nome deve ter entre 2 e 160 caracteres.");
    if (!kind) issues.push("Tipo deve ser Pessoa física ou Pessoa jurídica.");
    if (!role) issues.push("Perfil deve ser Cliente ou Comprador.");
    const key = `${displayName.toLocaleLowerCase("pt-BR")}::${kind ?? ""}::${role ?? ""}`;
    if (displayName && kind && role && seen.has(key)) issues.push("Cliente repetido na mesma planilha.");
    seen.add(key);
    return { line: index + 2, displayName, kind: kind ?? "individual", role: role ?? "client", issues };
  });

  const validRows = rows.filter((row) => row.issues.length === 0).length;
  return { rows, fileIssues, receivedRows: rawRows.length, validRows, isReady: fileIssues.length === 0 && rows.length > 0 && validRows === rows.length };
}

export function clientImportTemplateRows(): ClientImportRow[] {
  return [
    { displayName: "NOME_DO_CLIENTE", kind: "individual", role: "client" },
    { displayName: "RAZAO_SOCIAL_DO_CLIENTE", kind: "legal_entity", role: "buyer" },
  ];
}
