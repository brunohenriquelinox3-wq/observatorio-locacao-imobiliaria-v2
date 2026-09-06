import DashboardLayout, { type DashboardAccessGate, type DashboardNavigationItem } from "@/components/DashboardLayout";
import { ReportExportActions } from "@/components/ReportExportActions";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  buildClientImportPreview,
  clientImportFieldPolicy,
  clientImportProhibitedData,
  clientImportTemplateRows,
  MAX_CLIENT_IMPORT_FILE_BYTES,
  MAX_CLIENT_IMPORT_ROWS,
  type ClientImportPreview,
} from "@/lib/clientImportPreview";
import type { ClientImportRow } from "@shared/clientImportContracts";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CheckCircle2, FileSpreadsheet, FileUp, Info, LockKeyhole, ShieldCheck, Upload, UsersRound, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import "../client-import.css";

const navigationItems: DashboardNavigationItem[] = [
  { icon: ShieldCheck, label: "Central de plataforma", path: "/administracao" },
  { icon: UsersRound, label: "Painel ADM", path: "/adm" },
  { icon: FileSpreadsheet, label: "Importar clientes", path: "/importar-clientes" },
];

const accessGate: DashboardAccessGate = {
  eyebrow: "IMPORTAÇÃO CONTROLADA · PRÉVIA ANTES DE GRAVAÇÃO",
  title: "Importe somente clientes do contexto que o servidor autorizar.",
  description: "O arquivo é analisado primeiro no navegador. A gravação exige MFA, organização ativa, papel administrativo e escopo vigente; não há importação automática.",
  routeTitle: "Rota de importação",
  routeDetail: "Arquivo local → validação → prévia → MFA → policy → rascunho",
  actionLabel: "Acessar importação de clientes",
  footerLabel: "DADOS MÍNIMOS",
  footerValue: "PRÉVIA · CONFIRMAÇÃO",
  footerNote: "CPF/CNPJ, contatos, endereço, documentos, contratos e informações financeiras não são aceitos nesta etapa.",
  railTop: "IMPORTAR",
  railBottom: "CLIENTES",
};

type ContextCandidate = { key: string; organizationId: string; organizationLabel: string; module: "loteadora" | "vendas_urbanas" | "locacao"; purposeCode: string };

const moduleLabels: Record<ContextCandidate["module"], string> = {
  loteadora: "Loteadora",
  vendas_urbanas: "Vendas Urbanas",
  locacao: "Locação",
};

async function fingerprintFile(file: File): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function downloadTemplate() {
  const rows = clientImportTemplateRows();
  const csv = ["Nome;Tipo;Perfil", ...rows.map((row) => `${row.displayName};${row.kind === "individual" ? "Pessoa física" : "Pessoa jurídica"};${row.role === "client" ? "Cliente" : "Comprador"}`)].join("\r\n");
  const href = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = "modelo-importacao-clientes.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(href), 500);
}

export default function ClientImport() {
  const { isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedContextKey, setSelectedContextKey] = useState("");
  const [preview, setPreview] = useState<ClientImportPreview | null>(null);
  const [fileFingerprint, setFileFingerprint] = useState("");
  const [fileLabel, setFileLabel] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
  const identityQuery = trpc.foundation.identity.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const loteadoraContexts = trpc.organizationContext.listAuthorizedForModule.useQuery({ module: "loteadora" }, { enabled: isAuthenticated, retry: false });
  const urbanContexts = trpc.organizationContext.listAuthorizedForModule.useQuery({ module: "vendas_urbanas" }, { enabled: isAuthenticated, retry: false });
  const rentalContexts = trpc.organizationContext.listAuthorizedForModule.useQuery({ module: "locacao" }, { enabled: isAuthenticated, retry: false });
  const contexts = useMemo<ContextCandidate[]>(() => [
    ...(loteadoraContexts.data ?? []).map((context) => ({ ...context, module: "loteadora" as const, key: `loteadora:${context.organizationId}:${context.purposeCode}` })),
    ...(urbanContexts.data ?? []).map((context) => ({ ...context, module: "vendas_urbanas" as const, key: `vendas_urbanas:${context.organizationId}:${context.purposeCode}` })),
    ...(rentalContexts.data ?? []).map((context) => ({ ...context, module: "locacao" as const, key: `locacao:${context.organizationId}:${context.purposeCode}` })),
  ], [loteadoraContexts.data, rentalContexts.data, urbanContexts.data]);
  const selectedContext = contexts.find((context) => context.key === selectedContextKey) ?? null;
  const canImport = isAuthenticated && identityQuery.data?.state === "connected" && Boolean(selectedContext);
  const utils = trpc.useUtils();
  const importMutation = trpc.clientImport.commit.useMutation({
    onSuccess(result) {
      toast.success("Importação registrada", { description: `${result.createdRows} cadastro(s) em rascunho e ${result.duplicateRows} item(ns) já existentes foram processados sem duplicação.` });
      setPreview(null);
      setFileFingerprint("");
      setFileLabel("");
      setConfirmed(false);
      setPrivacyAcknowledged(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (selectedContext) {
        void utils.domainFoundation.listDraftParties.invalidate(selectedContext);
        if (selectedContext.module === "loteadora") {
          void utils.subdivisionFoundation.listDraftBuyerClients.invalidate({
            organizationId: selectedContext.organizationId,
            module: "loteadora",
            purposeCode: selectedContext.purposeCode,
          });
        }
      }
    },
    onError() {
      toast.error("Importação não registrada", { description: "O servidor exige MFA TOTP recente, identidade ativa, organização ativa, papel administrativo e escopo autorizado. Nenhum item foi gravado." });
    },
  });

  useEffect(() => {
    if (selectedContextKey && !contexts.some((context) => context.key === selectedContextKey)) setSelectedContextKey("");
  }, [contexts, selectedContextKey]);

  async function parseFile(file: File) {
    if (file.size < 1 || file.size > MAX_CLIENT_IMPORT_FILE_BYTES) {
      toast.error("Arquivo não aceito", { description: `Envie um CSV de até ${MAX_CLIENT_IMPORT_FILE_BYTES / 1024} KB.` });
      return;
    }
    setIsParsing(true);
    setPreview(null);
    setConfirmed(false);
    try {
      const Papa = (await import("papaparse")).default;
      const fingerprint = await fingerprintFile(file);
      Papa.parse<Record<string, unknown>>(file, {
        header: true,
        skipEmptyLines: "greedy",
        complete(results) {
          if (results.errors.length > 0) {
            setPreview({ rows: [], fileIssues: ["O CSV possui estrutura inválida ou aspas não fechadas."], receivedRows: 0, validRows: 0, isReady: false });
          } else {
            setPreview(buildClientImportPreview(results.data, results.meta.fields ?? []));
            setFileFingerprint(fingerprint);
            setFileLabel(file.name.replace(/[\r\n]/g, " ").slice(0, 100));
          }
          setIsParsing(false);
        },
        error() {
          setPreview({ rows: [], fileIssues: ["O arquivo não pôde ser lido localmente."], receivedRows: 0, validRows: 0, isReady: false });
          setIsParsing(false);
        },
      });
    } catch {
      setPreview({ rows: [], fileIssues: ["O arquivo não pôde ser preparado para prévia."], receivedRows: 0, validRows: 0, isReady: false });
      setIsParsing(false);
    }
  }

  function clearPreview() {
    setPreview(null);
    setFileFingerprint("");
    setFileLabel("");
    setConfirmed(false);
    setPrivacyAcknowledged(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function commitImport() {
    if (!selectedContext || !preview?.isReady || !confirmed || !privacyAcknowledged || !fileFingerprint) return;
    const rows: ClientImportRow[] = preview.rows.map(({ displayName, kind, role }) => ({ displayName, kind, role }));
    importMutation.mutate({ ...selectedContext, rows, fileFingerprint, confirmation: "CONFIRMO_IMPORTACAO", privacyNoticeVersion: "IMPORTACAO_MINIMA_V1", retentionPurpose: "CADASTRO_RASCUNHO_COM_REVISAO_HUMANA", correlationId: crypto.randomUUID() });
  }

  const reportRows = [
    { section: "Arquivo", indicator: "Prévia", status: preview ? `${preview.validRows} de ${preview.receivedRows} linhas válidas` : "Nenhum arquivo analisado" },
    { section: "Proteção", indicator: "Persistência", status: "Somente após confirmação, MFA e policy" },
    { section: "Escopo", indicator: "Contexto", status: selectedContext ? `${moduleLabels[selectedContext.module]} selecionado` : "Nenhum contexto selecionado" },
  ];

  return <DashboardLayout navigationItems={navigationItems} navigationTitle="Núcleo CRM" accessGate={accessGate}>
    <main className="client-import-page">
      <header className="client-import-page__header">
        <div><p>CADASTRO DE CLIENTES · IMPORTAÇÃO CONTROLADA</p><h1>Importe com prévia, revisão e confirmação separada.</h1><span>Esta primeira etapa aceita somente Nome, Tipo e Perfil. Campos de documento, contato, endereço, contrato ou financeiro não são recebidos nem persistidos.</span></div>
        <Link href="/adm" className="client-import-page__back"><ArrowLeft size={16} />Voltar ao Painel ADM</Link>
      </header>

      <section className="client-import-page__context" aria-labelledby="client-import-context-title">
        <div><p>01 · CONTEXTO AUTORIZADO</p><h2 id="client-import-context-title">A organização e o módulo vêm antes do arquivo.</h2><span>O seletor apresenta apenas contextos que a política devolveu à sessão atual.</span></div>
        <label htmlFor="client-import-context">Contexto de trabalho<select id="client-import-context" value={selectedContextKey} onChange={(event) => setSelectedContextKey(event.target.value)} disabled={!isAuthenticated || loteadoraContexts.isLoading || urbanContexts.isLoading || rentalContexts.isLoading}><option value="">Selecione um contexto autorizado</option>{contexts.map((context) => <option key={context.key} value={context.key}>{context.organizationLabel} · {moduleLabels[context.module]} · {context.purposeCode}</option>)}</select></label>
        <div className={`client-import-page__context-state ${canImport ? "is-ready" : ""}`}><ShieldCheck size={18} /><span>{canImport ? "Contexto selecionado. A confirmação de MFA e alçada volta a ser exigida pelo servidor na gravação." : identityQuery.data?.state === "connected" ? "Selecione um contexto devolvido pela policy para preparar a prévia." : "Conecte a identidade Supabase; a sessão da plataforma não libera importação."}</span></div>
      </section>

      <section className="client-import-page__workspace" aria-labelledby="client-import-file-title">
        <div className="client-import-page__step"><span>02</span><div><p>CSV LOCAL · SEM ENVIO NA PRÉVIA</p><h2 id="client-import-file-title">Valide a planilha antes de gravar qualquer cadastro.</h2></div></div>
        <div className="client-import-page__upload-grid">
          <div className="client-import-page__upload-card"><FileUp size={22} /><h3>Selecionar CSV</h3><p>Até {MAX_CLIENT_IMPORT_FILE_BYTES / 1024} KB e {MAX_CLIENT_IMPORT_ROWS} linhas. A leitura ocorre no navegador e a prévia não cria dados.</p><input ref={fileInputRef} type="file" accept=".csv,text/csv" aria-label="Selecionar arquivo CSV de clientes" disabled={!isAuthenticated || isParsing || importMutation.isPending} onChange={(event) => { const file = event.target.files?.[0]; if (file) void parseFile(file); }} /><small>{fileLabel ? `Arquivo em prévia: ${fileLabel}` : "Nenhum arquivo selecionado"}</small></div>
          <div className="client-import-page__template-card"><FileSpreadsheet size={22} /><h3>Modelo obrigatório</h3><p>Use as colunas Nome, Tipo e Perfil. Tipo aceita Pessoa física/Pessoa jurídica e Perfil aceita Cliente/Comprador.</p><button type="button" onClick={downloadTemplate}><Upload size={15} />Baixar modelo CSV</button><small>Não inclua CPF/CNPJ, telefone, e-mail, endereço, documentos ou valores.</small></div>
        </div>
      </section>

      <section className="client-import-page__context client-import-page__field-policy" aria-labelledby="client-import-policy-title">
        <div><p>02A · MATRIZ MÍNIMA E RETENÇÃO</p><h2 id="client-import-policy-title">Somente três campos sustentam esta etapa.</h2><span>A prévia classifica os cabeçalhos localmente, rejeita qualquer coluna fora da matriz e não envia o arquivo ao servidor.</span></div>
        <div className="client-import-page__table-wrap"><table><thead><tr><th>Campo</th><th>Classe</th><th>Finalidade</th><th>Retenção</th></tr></thead><tbody>{clientImportFieldPolicy.map((field) => <tr key={field.field}><td>{field.field}</td><td>{field.classification}</td><td>{field.purpose}</td><td>{field.retention}</td></tr>)}</tbody></table></div>
        <div className="client-import-page__context-state"><Info size={18} /><span><b>Proibidos nesta etapa:</b> {clientImportProhibitedData}. Não há expurgo automático; qualquer retenção ou descarte exige revisão humana e não ocorre durante a prévia.</span></div>
      </section>

      {preview && <section className={`client-import-page__preview ${preview.isReady ? "is-ready" : "is-blocked"}`} aria-labelledby="client-import-preview-title">
        <div className="client-import-page__preview-heading"><div><p>03 · PRÉVIA EM MEMÓRIA</p><h2 id="client-import-preview-title">{preview.isReady ? "A planilha passou pela validação estrutural." : "A planilha precisa de correção antes da importação."}</h2></div><button type="button" className="client-import-page__clear" onClick={clearPreview}><X size={15} />Limpar prévia</button></div>
        {preview.fileIssues.length > 0 && <div className="client-import-page__issues" role="alert"><Info size={18} /><ul>{preview.fileIssues.map((issue) => <li key={issue}>{issue}</li>)}</ul></div>}
        <div className="client-import-page__preview-summary"><span><b>{preview.receivedRows}</b> linhas lidas</span><span><b>{preview.validRows}</b> válidas</span><span><b>{preview.receivedRows - preview.validRows}</b> com revisão</span></div>
        <div className="client-import-page__table-wrap"><table><thead><tr><th>Linha</th><th>Nome em prévia</th><th>Tipo</th><th>Perfil</th><th>Resultado</th></tr></thead><tbody>{preview.rows.slice(0, 25).map((row) => <tr key={`${row.line}-${row.displayName}`}><td>{row.line}</td><td>{row.displayName || "—"}</td><td>{row.kind === "individual" ? "Pessoa física" : "Pessoa jurídica"}</td><td>{row.role === "client" ? "Cliente" : "Comprador"}</td><td>{row.issues.length ? row.issues.join(" ") : "Pronto para confirmação"}</td></tr>)}</tbody></table></div>
        {preview.rows.length > 25 && <p className="client-import-page__table-limit">Somente as primeiras 25 linhas são exibidas. Todas as linhas continuam submetidas à mesma validação antes da confirmação.</p>}
      </section>}

      <section className="client-import-page__confirmation" aria-labelledby="client-import-confirmation-title">
        <div className="client-import-page__step"><span>04</span><div><p>CONFIRMAÇÃO HUMANA · MFA NO SERVIDOR</p><h2 id="client-import-confirmation-title">A prévia só vira rascunho depois da sua decisão explícita.</h2></div></div>
        <label className="client-import-page__confirm"><input type="checkbox" checked={privacyAcknowledged} onChange={(event) => setPrivacyAcknowledged(event.target.checked)} disabled={!preview?.isReady || !canImport || importMutation.isPending} />Reconheço a matriz mínima IMPORTACAO_MINIMA_V1, a finalidade de cadastro em rascunho com revisão humana e a proibição de campos fora da lista.</label>
        <label className="client-import-page__confirm"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} disabled={!preview?.isReady || !canImport || importMutation.isPending} />Confirmo que possuo autorização para cadastrar estes clientes no contexto selecionado e que revisei a prévia.</label>
        <div className="client-import-page__confirmation-actions"><button type="button" onClick={commitImport} disabled={!preview?.isReady || !confirmed || !privacyAcknowledged || !canImport || !fileFingerprint || importMutation.isPending}>{importMutation.isPending ? "Confirmando requisitos" : "Confirmar importação em rascunho"}</button><span><LockKeyhole size={15} />O servidor verifica MFA TOTP recente, identidade, organização ativa, papel administrativo, escopo, confirmação de privacidade, deduplicação e correlação.</span></div>
      </section>

      <ReportExportActions report={{ title: "Resumo da importação de clientes", scopeLabel: selectedContext ? `${moduleLabels[selectedContext.module]} · contexto autorizado` : "Sem contexto selecionado", rows: reportRows }} isAuthorized={canImport} description="Exporte somente a situação redigida da prévia; o relatório não inclui nomes nem conteúdo do arquivo." />
    </main>
  </DashboardLayout>;
}
