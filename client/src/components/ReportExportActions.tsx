import { Download, FileDown, LockKeyhole, Table2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { SafeReport } from "@/lib/reportExport";
import { reportCsvRows, reportFileStem, sanitizeReportText } from "@/lib/reportExport";
import "../report-export.css";

type ReportExportActionsProps = {
  report: SafeReport;
  isAuthorized: boolean;
  description?: string;
};

function downloadBlob(blob: Blob, filename: string) {
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(href), 500);
}

function printableText(value: string): string {
  return sanitizeReportText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, " ");
}

export function ReportExportActions({ report, isAuthorized, description }: ReportExportActionsProps) {
  const [pendingFormat, setPendingFormat] = useState<"pdf" | "csv" | null>(null);
  const disabled = !isAuthorized || pendingFormat !== null;
  const fileStem = reportFileStem(report.title);

  async function exportCsv() {
    if (!isAuthorized) return;
    setPendingFormat("csv");
    try {
      const Papa = (await import("papaparse")).default;
      const csv = Papa.unparse(reportCsvRows(report), { quotes: true, delimiter: ";", newline: "\r\n" });
      downloadBlob(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }), `${fileStem}.csv`);
      toast.success("CSV preparado", { description: "A exportação contém apenas o resumo autorizado e não inclui identificadores técnicos." });
    } catch {
      toast.error("CSV não foi preparado", { description: "Revise o contexto e tente novamente. Nenhuma informação foi enviada para serviço externo." });
    } finally {
      setPendingFormat(null);
    }
  }

  async function exportPdf() {
    if (!isAuthorized) return;
    setPendingFormat("pdf");
    try {
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const document = await PDFDocument.create();
      const regular = await document.embedFont(StandardFonts.Helvetica);
      const bold = await document.embedFont(StandardFonts.HelveticaBold);
      document.setTitle(printableText(report.title));
      document.setAuthor("CRM Imobiliário");
      document.setSubject("Relatório operacional redigido");

      let page = document.addPage([595.28, 841.89]);
      let y = 786;
      const margin = 48;
      const maxWidth = 499;
      const createPage = () => {
        page = document.addPage([595.28, 841.89]);
        y = 786;
      };
      const writeLine = (text: string, size = 10, strong = false, color = rgb(0.09, 0.23, 0.3)) => {
        if (y < 64) createPage();
        page.drawText(printableText(text).slice(0, 160), { x: margin, y, size, font: strong ? bold : regular, color, maxWidth });
        y -= size + 7;
      };

      writeLine(report.title, 18, true, rgb(0.05, 0.28, 0.32));
      writeLine(`Escopo: ${report.scopeLabel}`, 10, false, rgb(0.2, 0.37, 0.38));
      writeLine("Resumo operacional redigido. Dados pessoais, contratos e informações financeiras não são incluídos.", 9, false, rgb(0.3, 0.35, 0.36));
      y -= 10;
      report.rows.forEach((row, index) => {
        writeLine(`${String(index + 1).padStart(2, "0")}  ${row.section}`, 10, true);
        writeLine(`${row.indicator}: ${row.status}`, 10);
        y -= 4;
      });
      writeLine(`Gerado em ${new Date().toLocaleString("pt-BR")}`, 8, false, rgb(0.35, 0.4, 0.4));
      const pdfBytes = await document.save();
      const pdfBuffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer;
      downloadBlob(new Blob([pdfBuffer], { type: "application/pdf" }), `${fileStem}.pdf`);
      toast.success("PDF preparado", { description: "O arquivo foi criado no navegador com o resumo autorizado do painel." });
    } catch {
      toast.error("PDF não foi preparado", { description: "Revise o contexto e tente novamente. Nenhuma informação foi enviada para serviço externo." });
    } finally {
      setPendingFormat(null);
    }
  }

  return <section className="report-export" aria-label="Exportação de relatório">
    <div className="report-export__copy">
      <p>RELATÓRIO REDIGIDO</p>
      <h2>{report.title}</h2>
      <span>{description ?? "Baixe somente a leitura autorizada do painel atual."}</span>
    </div>
    <div className="report-export__actions">
      <button type="button" onClick={exportPdf} disabled={disabled}><FileDown size={16} />{pendingFormat === "pdf" ? "Preparando PDF" : "Exportar PDF"}</button>
      <button type="button" className="report-export__csv" onClick={exportCsv} disabled={disabled}><Table2 size={16} />{pendingFormat === "csv" ? "Preparando CSV" : "Exportar CSV"}</button>
    </div>
    <div className="report-export__note" aria-live="polite">
      {isAuthorized ? <><Download size={15} aria-hidden="true" />Inclui apenas campos redigidos e visíveis no escopo atual.</> : <><LockKeyhole size={15} aria-hidden="true" />A exportação fica bloqueada até identidade, organização e escopo autorizado.</>}
    </div>
  </section>;
}
