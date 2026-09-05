import { describe, expect, it } from "vitest";
import { reportCsvRows, reportFileStem, sanitizeReportText } from "./reportExport";

describe("exportação redigida de relatórios", () => {
  it("normaliza texto e gera nomes de arquivo seguros", () => {
    expect(sanitizeReportText("  Estado\n autorizado\t ")).toBe("Estado autorizado");
    expect(reportFileStem("Resumo do Painel ADM")).toBe("resumo-do-painel-adm");
  });

  it("prepara somente as colunas do resumo autorizado", () => {
    const rows = reportCsvRows({ title: "Resumo", scopeLabel: "Contexto autorizado", rows: [{ section: "Módulo", indicator: "Loteadora", status: "Disponível" }] });
    expect(rows).toEqual([{ "Relatório": "Resumo", "Escopo": "Contexto autorizado", "Seção": "Módulo", "Indicador": "Loteadora", "Situação": "Disponível" }]);
  });
});
