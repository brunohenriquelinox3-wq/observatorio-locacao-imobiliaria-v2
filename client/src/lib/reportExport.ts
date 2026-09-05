export type SafeReportRow = {
  section: string;
  indicator: string;
  status: string;
};

export type SafeReport = {
  title: string;
  scopeLabel: string;
  rows: SafeReportRow[];
};

export function sanitizeReportText(value: string): string {
  return value.replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim();
}

export function reportCsvRows(report: SafeReport): Array<Record<string, string>> {
  return report.rows.map((row) => ({
    "Relatório": sanitizeReportText(report.title),
    "Escopo": sanitizeReportText(report.scopeLabel),
    "Seção": sanitizeReportText(row.section),
    "Indicador": sanitizeReportText(row.indicator),
    "Situação": sanitizeReportText(row.status),
  }));
}

export function reportFileStem(value: string): string {
  const normalized = sanitizeReportText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "relatorio";
}
