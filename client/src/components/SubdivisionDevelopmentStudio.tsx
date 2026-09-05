import type { SubdivisionContext } from "@shared/subdivisionContracts";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { trpc } from "@/lib/trpc";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Archive, BookOpenCheck, CheckCircle2, ClipboardCheck, FilePlus2, FileText, LandPlot, LoaderCircle, MapPinned, PencilLine, Plus, Search, ShieldAlert, ShieldCheck, Trash2, Upload, Workflow } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type DevelopmentKind = "residential" | "mixed_use" | "commercial" | "industrial" | "rural" | "other";
type WorkingPhase = "preliminary_reference" | "structuring" | "review_required";
type AttachmentCategory = "planning" | "municipal" | "registry" | "implementation" | "environmental" | "other";
type StudioModule = "identity" | "structure" | "preparation" | "documents" | "lifecycle";

type DevelopmentStudioProps = {
  context: SubdivisionContext;
  isContextReady: boolean;
  isWorkspaceReady: boolean;
};

const kindLabels: Record<DevelopmentKind, string> = {
  residential: "Residencial",
  mixed_use: "Uso misto",
  commercial: "Comercial",
  industrial: "Industrial",
  rural: "Rural",
  other: "Outro enquadramento",
};

const phaseLabels: Record<WorkingPhase, string> = {
  preliminary_reference: "Referência preliminar",
  structuring: "Em estruturação",
  review_required: "Revisão necessária",
};

const attachmentCategoryLabels: Record<AttachmentCategory, string> = {
  planning: "Planejamento interno",
  municipal: "Preparação municipal",
  registry: "Preparação registral",
  implementation: "Preparação de implantação",
  environmental: "Preparação ambiental",
  other: "Outra evidência interna",
};

const studioModules: Array<{ id: StudioModule; label: string; caption: string; icon: typeof PencilLine }> = [
  { id: "identity", label: "Identificação", caption: "Referência e nome", icon: PencilLine },
  { id: "structure", label: "Estrutura", caption: "Quadras e Lotes", icon: Workflow },
  { id: "preparation", label: "Preparação", caption: "Roteiro interno", icon: ClipboardCheck },
  { id: "documents", label: "Documentos", caption: "Anexos privados", icon: FileText },
  { id: "lifecycle", label: "Ciclo", caption: "Arquivamento", icon: Archive },
];

type StudioForm = {
  internalReference: string;
  displayName: string;
  developmentKind: DevelopmentKind;
  municipality: string;
  stateCode: string;
  plannedStageCount: number;
  workingPhase: WorkingPhase;
  internalNote: string;
};

type StructureRow = {
  blockNumber: number;
  lotCount: number;
};

const emptyForm: StudioForm = {
  internalReference: "",
  displayName: "",
  developmentKind: "residential",
  municipality: "",
  stateCode: "",
  plannedStageCount: 1,
  workingPhase: "preliminary_reference",
  internalNote: "",
};

function toForm(development: { internalReference: string; displayName: string | null; developmentKind: DevelopmentKind | null; municipality: string | null; stateCode: string | null; plannedStageCount: number | null; workingPhase: WorkingPhase; internalNote: string | null }): StudioForm {
  return {
    internalReference: development.internalReference,
    displayName: development.displayName ?? "",
    developmentKind: development.developmentKind ?? "residential",
    municipality: development.municipality ?? "",
    stateCode: development.stateCode ?? "",
    plannedStageCount: development.plannedStageCount ?? 1,
    workingPhase: development.workingPhase,
    internalNote: development.internalNote ?? "",
  };
}

function normalizeReference(value: string) {
  return value.toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, "").slice(0, 80);
}

export function SubdivisionDevelopmentStudio({ context, isContextReady, isWorkspaceReady }: DevelopmentStudioProps) {
  const [selectedDevelopmentId, setSelectedDevelopmentId] = useState("");
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [hasExplicitDraftChoice, setHasExplicitDraftChoice] = useState(false);
  const [activeModule, setActiveModule] = useState<StudioModule>("identity");
  const [form, setForm] = useState<StudioForm>(emptyForm);
  const [recordFilter, setRecordFilter] = useState("");
  const [attachmentCategory, setAttachmentCategory] = useState<AttachmentCategory>("planning");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [structureRows, setStructureRows] = useState<StructureRow[]>([]);
  const [structureLoadedFor, setStructureLoadedFor] = useState("");
  const [replaceStructureConfirmed, setReplaceStructureConfirmed] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const attachmentInput = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const developmentsQuery = trpc.subdivisionFoundation.listDevelopmentStudio.useQuery(context, { enabled: isWorkspaceReady, retry: false });
  const selectedDevelopment = useMemo(() => developmentsQuery.data?.find((development) => development.developmentId === selectedDevelopmentId) ?? null, [developmentsQuery.data, selectedDevelopmentId]);
  const filteredDevelopments = useMemo(() => {
    const query = recordFilter.trim().toLocaleLowerCase("pt-BR");
    if (!query) return developmentsQuery.data ?? [];
    return (developmentsQuery.data ?? []).filter((development) => `${development.internalReference} ${development.displayName ?? ""}`.toLocaleLowerCase("pt-BR").includes(query));
  }, [developmentsQuery.data, recordFilter]);
  const attachmentInputContext = useMemo(() => ({ ...context, developmentId: selectedDevelopmentId }), [context, selectedDevelopmentId]);
  const attachmentsQuery = trpc.subdivisionFoundation.listDevelopmentAttachments.useQuery(attachmentInputContext, { enabled: isWorkspaceReady && Boolean(selectedDevelopmentId), retry: false });
  const structureInput = useMemo(() => ({ ...context, developmentId: selectedDevelopmentId }), [context, selectedDevelopmentId]);
  const structureQuery = trpc.subdivisionFoundation.listDraftStructure.useQuery(structureInput, { enabled: isWorkspaceReady && Boolean(selectedDevelopmentId), retry: false });

  useEffect(() => {
    setHasExplicitDraftChoice(false);
  }, [context.organizationId, context.module, context.purposeCode]);

  useEffect(() => {
    if (selectedDevelopmentId && !developmentsQuery.data?.some((development) => development.developmentId === selectedDevelopmentId)) {
      setSelectedDevelopmentId("");
      setMode("create");
      setForm(emptyForm);
      setActiveModule("identity");
    }
  }, [developmentsQuery.data, selectedDevelopmentId]);

  useEffect(() => {
    const firstAuthorizedDraft = developmentsQuery.data?.[0];
    if (!isWorkspaceReady || hasExplicitDraftChoice || selectedDevelopmentId || mode !== "create" || !firstAuthorizedDraft) return;
    setSelectedDevelopmentId(firstAuthorizedDraft.developmentId);
    setMode("edit");
    setForm(toForm(firstAuthorizedDraft));
    setActiveModule("structure");
    setStructureRows([]);
    setStructureLoadedFor("");
  }, [developmentsQuery.data, hasExplicitDraftChoice, isWorkspaceReady, mode, selectedDevelopmentId]);

  useEffect(() => {
    if (mode === "edit" && selectedDevelopment) setForm(toForm(selectedDevelopment));
  }, [mode, selectedDevelopment]);

  useEffect(() => {
    if (!selectedDevelopmentId) {
      setStructureRows([]);
      setStructureLoadedFor("");
      setReplaceStructureConfirmed(false);
      return;
    }
    if (structureQuery.data && structureLoadedFor !== selectedDevelopmentId) {
      setStructureRows(structureQuery.data.map((block) => ({ blockNumber: block.blockNumber, lotCount: block.lotCount })));
      setStructureLoadedFor(selectedDevelopmentId);
      setReplaceStructureConfirmed(false);
    }
  }, [selectedDevelopmentId, structureLoadedFor, structureQuery.data]);

  const createMutation = trpc.subdivisionFoundation.createDevelopmentStudio.useMutation({
    onSuccess(result) {
      toast.success("Loteamento em rascunho criado", { description: "O cadastro foi salvo como referência interna e não aprova empreendimento, estoque, contrato ou financeiro." });
      setSelectedDevelopmentId(result.developmentId);
      setMode("edit");
      setActiveModule("structure");
      setStructureLoadedFor("");
      void utils.subdivisionFoundation.listDevelopmentStudio.invalidate(context);
      void utils.subdivisionFoundation.listDraftDevelopments.invalidate(context);
    },
    onError() {
      toast.error("Cadastro não criado", { description: "O servidor exige MFA TOTP recente, organização ativa, identidade, alçada, finalidade e contexto autorizado." });
    },
  });

  const updateMutation = trpc.subdivisionFoundation.updateDevelopmentStudio.useMutation({
    onSuccess() {
      toast.success("Módulo atualizado", { description: "A atualização preserva o rascunho e registra somente metadados redigidos em auditoria." });
      void utils.subdivisionFoundation.listDevelopmentStudio.invalidate(context);
      void utils.subdivisionFoundation.listDraftDevelopments.invalidate(context);
    },
    onError() {
      toast.error("Módulo não atualizado", { description: "O servidor não liberou a alteração para o contexto ou para a MFA atual." });
    },
  });

  const archiveMutation = trpc.subdivisionFoundation.archiveDevelopmentStudio.useMutation({
    onSuccess() {
      toast.success("Loteamento arquivado", { description: "A remoção é lógica e não apaga histórico de auditoria. Registros com Quadras ativas não podem ser arquivados." });
      startNew();
      void utils.subdivisionFoundation.listDevelopmentStudio.invalidate(context);
      void utils.subdivisionFoundation.listDraftDevelopments.invalidate(context);
    },
    onError() {
      toast.error("Arquivamento bloqueado", { description: "Remova ou trate primeiro as Quadras ativas vinculadas; o sistema não exclui estruturas em cascata." });
    },
  });

  const createAttachmentIntentMutation = trpc.subdivisionFoundation.createDevelopmentAttachmentIntent.useMutation();
  const archiveAttachmentMutation = trpc.subdivisionFoundation.archiveDevelopmentAttachment.useMutation({
    onSuccess() {
      toast.success("Anexo removido", { description: "A referência de armazenamento foi desvinculada. Nenhuma URL, chave ou conteúdo é exibido." });
      void utils.subdivisionFoundation.listDevelopmentAttachments.invalidate(attachmentInputContext);
    },
    onError() {
      toast.error("Remoção bloqueada", { description: "O servidor exige MFA, contexto e vínculo do anexo com o loteamento selecionado." });
    },
  });

  const applyStructureMutation = trpc.subdivisionFoundation.applyDraftStructure.useMutation({
    onSuccess(result) {
      toast.success("Estrutura de Quadras aplicada", { description: `${result.blockCount} Quadra(s) e ${result.lotCount} Lote(s) em rascunho. Nenhuma disponibilidade, reserva, venda ou contrato foi criado.` });
      setReplaceStructureConfirmed(false);
      setStructureLoadedFor("");
      void utils.subdivisionFoundation.listDraftStructure.invalidate(structureInput);
      void utils.subdivisionFoundation.listDraftBlocks.invalidate(structureInput);
      void utils.subdivisionFoundation.listDraftLotInventoryStates.invalidate(context);
    },
    onError() {
      toast.error("Estrutura não aplicada", { description: "Revise MFA, contexto, numeração única e a confirmação exigida para reduzir ou retirar Quadras e Lotes já salvos." });
    },
  });
  const archiveBlockMutation = trpc.subdivisionFoundation.archiveDraftBlock.useMutation({
    onSuccess(result) {
      toast.success("Quadra arquivada", { description: `${result.archivedLotCount} Lote(s) foram arquivados logicamente. O histórico foi preservado.` });
      setStructureLoadedFor("");
      void utils.subdivisionFoundation.listDraftStructure.invalidate(structureInput);
      void utils.subdivisionFoundation.listDraftBlocks.invalidate(structureInput);
      void utils.subdivisionFoundation.listDraftLotInventoryStates.invalidate(context);
    },
    onError() {
      toast.error("Quadra não arquivada", { description: "O servidor exige MFA, contexto autorizado e vínculo com o loteamento selecionado." });
    },
  });

  const identityReady = form.internalReference.length >= 3 && form.displayName.trim().length >= 3;
  const structureReady = Boolean(form.municipality) === Boolean(form.stateCode) && form.plannedStageCount >= 1;
  const activeAttachmentCount = attachmentsQuery.data?.filter((attachment) => attachment.state === "recorded").length ?? 0;
  const savedStructure = structureQuery.data ?? [];
  const activeSavedStructure = savedStructure.filter((block) => block.lotCount > 0);
  const legacyEmptyBlocks = savedStructure.filter((block) => block.lotCount < 1);
  const normalizedStructureRows = structureRows.filter((row) => Number.isInteger(row.blockNumber) && row.blockNumber >= 1 && row.blockNumber <= 999 && Number.isInteger(row.lotCount) && row.lotCount >= 1 && row.lotCount <= 100);
  const hasDuplicateBlockNumber = new Set(structureRows.map((row) => row.blockNumber)).size !== structureRows.length;
  const structureWouldArchive = savedStructure.some((saved) => {
    const draft = structureRows.find((row) => row.blockNumber === saved.blockNumber);
    return !draft || draft.lotCount < saved.lotCount;
  });
  const savedLotCount = activeSavedStructure.reduce((total, block) => total + block.lotCount, 0);
  const draftLotCount = structureRows.reduce((total, block) => total + (Number.isFinite(block.lotCount) ? block.lotCount : 0), 0);
  const completedModules = [identityReady, activeSavedStructure.length > 0 || structureReady, Boolean(form.workingPhase)].filter(Boolean).length;
  const isBusy = createMutation.isPending || updateMutation.isPending || archiveMutation.isPending || applyStructureMutation.isPending || archiveBlockMutation.isPending || isUploading;
  const selectedModule = studioModules.find((module) => module.id === activeModule) ?? studioModules[0];

  function startNew() {
    setHasExplicitDraftChoice(true);
    setSelectedDevelopmentId("");
    setMode("create");
    setActiveModule("identity");
    setForm(emptyForm);
    setAttachmentFile(null);
    setStructureRows([]);
    setStructureLoadedFor("");
    setReplaceStructureConfirmed(false);
    if (attachmentInput.current) attachmentInput.current.value = "";
  }

  function selectDevelopment(id: string) {
    setHasExplicitDraftChoice(true);
    setSelectedDevelopmentId(id);
    setMode("edit");
    setActiveModule("structure");
    setStructureRows([]);
    setStructureLoadedFor("");
    setReplaceStructureConfirmed(false);
  }

  function addStructureRows(amount: number) {
    setStructureRows((current) => {
      if (current.length >= 50) return current;
      const numbers = new Set(current.map((row) => row.blockNumber));
      const additions: StructureRow[] = [];
      let candidate = 1;
      while (additions.length < amount && current.length + additions.length < 50 && candidate <= 999) {
        if (!numbers.has(candidate)) {
          additions.push({ blockNumber: candidate, lotCount: 1 });
          numbers.add(candidate);
        }
        candidate += 1;
      }
      return [...current, ...additions];
    });
  }

  function updateStructureRow(index: number, patch: Partial<StructureRow>) {
    setStructureRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));
    setReplaceStructureConfirmed(false);
  }

  function removeStructureRow(index: number) {
    setStructureRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
    setReplaceStructureConfirmed(false);
  }

  function applyStructure(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedDevelopmentId || structureRows.length === 0 || normalizedStructureRows.length !== structureRows.length || hasDuplicateBlockNumber) {
      toast.error("Revise as Quadras", { description: "Cada Quadra deve ter número único de 1 a 999 e de 1 a 100 Lotes." });
      return;
    }
    if (structureWouldArchive && !replaceStructureConfirmed) {
      toast.message("Confirmação necessária", { description: "A redução de quantidade ou retirada de uma Quadra arquiva referências em rascunho. Confirme a revisão antes de aplicar." });
      return;
    }
    applyStructureMutation.mutate({
      ...context,
      developmentId: selectedDevelopmentId,
      blocks: [...normalizedStructureRows].sort((left, right) => left.blockNumber - right.blockNumber),
      replaceExisting: structureWouldArchive,
      correlationId: crypto.randomUUID(),
    });
  }

  function openModule(module: StudioModule) {
    if ((module === "documents" || module === "lifecycle") && !selectedDevelopmentId) {
      toast.message("Crie o rascunho antes de avançar", { description: "Documentos e ciclo de cadastro só ficam disponíveis depois que a referência interna é criada." });
      return;
    }
    setActiveModule(module);
  }

  function saveDevelopment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = {
      ...form,
      internalReference: normalizeReference(form.internalReference),
      displayName: form.displayName.trim(),
      municipality: form.municipality.trim() || null,
      stateCode: form.stateCode.trim().toUpperCase() || null,
      internalNote: form.internalNote.trim() || null,
    };
    if (mode === "create") {
      createMutation.mutate({ ...context, ...normalized, correlationId: crypto.randomUUID() });
    } else if (selectedDevelopmentId) {
      updateMutation.mutate({ ...context, developmentId: selectedDevelopmentId, ...normalized, correlationId: crypto.randomUUID() });
    }
  }

  async function uploadAttachment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedDevelopmentId || !attachmentFile || isUploading) return;
    if (attachmentFile.size < 1 || attachmentFile.size > 5 * 1024 * 1024 || !["application/pdf", "image/jpeg", "image/png"].includes(attachmentFile.type)) {
      toast.error("Arquivo não aceito", { description: "Escolha PDF, JPEG ou PNG de até 5 MB. A assinatura do arquivo será conferida novamente no servidor." });
      return;
    }
    setIsUploading(true);
    try {
      const intent = await createAttachmentIntentMutation.mutateAsync({ ...context, developmentId: selectedDevelopmentId, category: attachmentCategory, correlationId: crypto.randomUUID() });
      const { data } = await getSupabaseBrowserClient()?.auth.getSession() ?? { data: { session: null } };
      if (!data.session?.access_token) throw new Error("SUPABASE_SESSION_REQUIRED");
      const body = new FormData();
      body.set("attachment", attachmentFile);
      body.set("organizationId", context.organizationId);
      body.set("purposeCode", context.purposeCode);
      body.set("correlationId", crypto.randomUUID());
      const response = await fetch(`/api/private/subdivision-development-attachments/${intent.attachmentId}`, {
        method: "POST",
        credentials: "include",
        headers: { "X-Supabase-Access-Token": data.session.access_token },
        body,
      });
      if (!response.ok) throw new Error("SUBDIVISION_DEVELOPMENT_ATTACHMENT_REJECTED");
      toast.success("Anexo privado registrado", { description: "O cadastro mostra somente categoria, estado e tipo. Nome, URL, chave e conteúdo continuam protegidos." });
      setAttachmentFile(null);
      if (attachmentInput.current) attachmentInput.current.value = "";
      await utils.subdivisionFoundation.listDevelopmentAttachments.invalidate(attachmentInputContext);
    } catch {
      toast.error("Anexo não registrado", { description: "Nenhum arquivo foi associado ao loteamento. Revise MFA, contexto, tipo, tamanho e permissão." });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="subdivision-studio" aria-labelledby="subdivision-studio-title">
      <header className="subdivision-studio__header">
        <div>
          <p className="subdivision-foundation-eyebrow">02 · ESTÚDIO OPERACIONAL</p>
          <h2 id="subdivision-studio-title">Cadastro de Loteamentos em uma área de trabalho, não em uma página linear.</h2>
          <p>Selecione um rascunho e trabalhe em um módulo por vez. A interface organiza a leitura, mas o servidor continua decidindo contexto, MFA, alçada e autorização.</p>
        </div>
        <div className={`subdivision-studio__trust ${isWorkspaceReady ? "is-ready" : ""}`}><ShieldCheck size={18} /><span>{isWorkspaceReady ? "Cada comando será revalidado pelo servidor." : "Defina o contexto autorizado para iniciar o cadastro."}</span></div>
      </header>

      {!isContextReady && <div className="subdivision-foundation-empty"><ShieldAlert size={18} /><p>Sem contexto autorizado não há lista, cadastro, edição, anexo ou arquivamento.</p></div>}
      {isWorkspaceReady && developmentsQuery.isError && <div className="subdivision-foundation-empty is-error"><ShieldAlert size={18} /><p>A leitura foi negada. O sistema não revela loteamentos de outro contexto.</p></div>}
      {isWorkspaceReady && developmentsQuery.isLoading && <div className="subdivision-foundation-empty"><LoaderCircle className="subdivision-foundation-spinner" /><p>Confirmando o contexto antes de organizar o cadastro.</p></div>}

      <div className="subdivision-studio__workbench">
        <aside className="subdivision-studio__records" aria-label="Loteamentos em rascunho">
          <div className="subdivision-studio__records-head">
            <div><LandPlot size={18} /><div><span>RASCUNHOS</span><strong>Loteamentos em trabalho</strong></div></div>
            <button type="button" className="subdivision-studio__new-record" onClick={startNew} data-active={mode === "create"}><Plus size={16} />Novo</button>
          </div>
          <label className="subdivision-studio__record-search"><Search size={15} /><span className="sr-only">Buscar loteamento em rascunho</span><input value={recordFilter} onChange={(event) => setRecordFilter(event.target.value)} placeholder="Buscar referência" disabled={!isWorkspaceReady} /></label>
          <p className="subdivision-studio__record-count">{developmentsQuery.data ? `${developmentsQuery.data.length} rascunho(s) disponível(is)` : "A lista depende do contexto"}</p>
          <div className="subdivision-studio__record-list">
            {isWorkspaceReady && !developmentsQuery.isLoading && filteredDevelopments.length === 0 && <p className="subdivision-studio__record-empty">{recordFilter ? "Nenhum rascunho corresponde à busca." : "Nenhum loteamento em rascunho foi devolvido."}</p>}
            {filteredDevelopments.map((development) => <button type="button" key={development.developmentId} onClick={() => selectDevelopment(development.developmentId)} data-active={development.developmentId === selectedDevelopmentId}>
              <span>{development.displayName ?? development.internalReference}</span>
              <small>{development.internalReference}</small>
              <em>{phaseLabels[development.workingPhase]}</em>
            </button>)}
          </div>
          <div className="subdivision-studio__records-foot"><ShieldCheck size={15} /><span>A lista revela somente referências autorizadas do contexto atual.</span></div>
        </aside>

        <div className="subdivision-studio__canvas">
          <div className="subdivision-studio__canvas-head">
            <div><p>{mode === "create" ? "NOVO RASCUNHO" : "RASCUNHO SELECIONADO"}</p><h3>{mode === "create" ? "Defina a identificação inicial." : selectedDevelopment?.displayName ?? selectedDevelopment?.internalReference}</h3><span>{mode === "create" ? "Comece pela referência interna e pelo nome de trabalho." : `${selectedDevelopment?.internalReference ?? ""} · ${phaseLabels[selectedDevelopment?.workingPhase ?? form.workingPhase]}`}</span></div>
            <div className="subdivision-studio__module-progress"><b>{completedModules}/3</b><span>módulos-base completos</span></div>
          </div>

          <nav className="subdivision-studio__module-nav" aria-label="Módulos do Cadastro de Loteamentos">
            {studioModules.map((module, index) => {
              const ModuleIcon = module.icon;
              const requiresSavedDraft = module.id === "documents" || module.id === "lifecycle";
              const isComplete = module.id === "identity" ? identityReady : module.id === "structure" ? activeSavedStructure.length > 0 : module.id === "preparation" ? Boolean(form.workingPhase) : module.id === "documents" ? activeAttachmentCount > 0 : false;
              return <button type="button" key={module.id} onClick={() => openModule(module.id)} aria-current={activeModule === module.id ? "step" : undefined} data-active={activeModule === module.id} data-complete={isComplete} disabled={!isWorkspaceReady || (requiresSavedDraft && !selectedDevelopmentId)}>
                <span className="subdivision-studio__module-index">{String(index + 1).padStart(2, "0")}</span><ModuleIcon size={17} /><span><b>{module.label}</b><small>{module.caption}</small></span>{isComplete && <CheckCircle2 size={15} />}
              </button>;
            })}
          </nav>

          <section className="subdivision-studio__active-module" aria-labelledby={`studio-module-${activeModule}`}>
            <div className="subdivision-studio__active-module-heading"><div><p>MÓDULO {String(studioModules.findIndex((module) => module.id === activeModule) + 1).padStart(2, "0")}</p><h4 id={`studio-module-${activeModule}`}>{selectedModule.label}</h4><span>{selectedModule.caption}</span></div><BookOpenCheck size={21} /></div>

            {activeModule === "identity" && <form className="subdivision-studio__module-form" onSubmit={saveDevelopment}>
              <div className="subdivision-studio__field-grid">
                <label>Referência interna<input value={form.internalReference} onChange={(event) => setForm((current) => ({ ...current, internalReference: normalizeReference(event.target.value) }))} placeholder="EX.: JARDINS_DO_SUL" disabled={!isWorkspaceReady || isBusy} required minLength={3} maxLength={80} /></label>
                <label>Nome de trabalho<input value={form.displayName} onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))} placeholder="Nome interno do loteamento" disabled={!isWorkspaceReady || isBusy} required minLength={3} maxLength={120} /></label>
              </div>
              <p className="subdivision-studio__module-note"><MapPinned size={15} />Esta referência organiza o trabalho interno. Ela não representa matrícula, aprovação, estoque, contrato ou disponibilidade comercial.</p>
              <div className="subdivision-studio__module-actions"><button type="submit" disabled={!isWorkspaceReady || isBusy}>{isBusy ? "Validando requisitos" : mode === "create" ? "Criar e avançar para estrutura" : "Salvar identificação"}</button>{mode === "edit" && <button type="button" className="subdivision-studio__secondary" onClick={() => openModule("structure")} disabled={isBusy}>Ir para estrutura</button>}</div>
            </form>}

            {activeModule === "structure" && <div className="subdivision-studio__structure-module">
              {selectedDevelopmentId && <section className="subdivision-studio__structure-visualization" aria-labelledby="subdivision-structure-chart-title">
                <div className="subdivision-studio__structure-visualization-head"><div><span>MATRIZ FÍSICA DO RASCUNHO</span><h5 id="subdivision-structure-chart-title">Quadras e Lotes já estruturados</h5><p>Leitura por Quadra da quantidade de Lotes salva neste loteamento. Este quadro não indica disponibilidade comercial.</p></div><div><b>{activeSavedStructure.length}</b><span>Quadras</span><b>{savedLotCount}</b><span>Lotes</span></div></div>
                {structureQuery.isLoading && <div className="subdivision-studio__structure-chart-empty"><LoaderCircle className="subdivision-foundation-spinner" /><span>Confirmando a matriz autorizada.</span></div>}
                {!structureQuery.isLoading && legacyEmptyBlocks.length > 0 && <p className="subdivision-studio__structure-warning" role="alert"><ShieldAlert size={16} /><span>{legacyEmptyBlocks.length === 1 ? `A Q${legacyEmptyBlocks[0].blockNumber} está registrada sem Lotes ativos.` : `${legacyEmptyBlocks.length} Quadras estão registradas sem Lotes ativos.`} Revise a quantidade no construtor antes de tratar esta matriz como concluída.</span></p>}
                {!structureQuery.isLoading && activeSavedStructure.length === 0 && legacyEmptyBlocks.length === 0 && <div className="subdivision-studio__structure-chart-empty"><LandPlot size={18} /><span>Estruture a primeira Quadra abaixo. A prévia é montada somente com dados que você informar.</span></div>}
                {!structureQuery.isLoading && activeSavedStructure.length > 0 && <div className="subdivision-studio__structure-chart" role="img" aria-label={`Matriz com ${activeSavedStructure.length} Quadras e ${savedLotCount} Lotes em rascunho`}>
                  {activeSavedStructure.map((block) => <div className="subdivision-studio__structure-chart-column" key={block.blockId}><div className="subdivision-studio__structure-chart-value">{block.lotCount}</div><div className="subdivision-studio__structure-chart-bar" style={{ height: `${Math.max(8, Math.round((block.lotCount / Math.max(...activeSavedStructure.map((item) => item.lotCount), 1)) * 100))}%` }} /><b>Q{block.blockNumber}</b><span>{block.lotCount} L</span></div>)}
                </div>}
              </section>}

              <form className="subdivision-studio__module-form subdivision-studio__structure-profile" onSubmit={saveDevelopment}>
                <div className="subdivision-studio__field-grid subdivision-studio__field-grid--three">
                  <label>Enquadramento<select value={form.developmentKind} onChange={(event) => setForm((current) => ({ ...current, developmentKind: event.target.value as DevelopmentKind }))} disabled={!isWorkspaceReady || isBusy}>{Object.entries(kindLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
                  <label>Etapas planejadas<input type="number" min={1} max={20} value={form.plannedStageCount} onChange={(event) => setForm((current) => ({ ...current, plannedStageCount: Number(event.target.value) || 1 }))} disabled={!isWorkspaceReady || isBusy} required /></label>
                  <div className="subdivision-studio__field-callout"><Workflow size={17} /><span>Defina a matriz de Quadras e Lotes abaixo. A quantidade é própria de cada Quadra.</span></div>
                </div>
                <div className="subdivision-studio__field-grid subdivision-studio__field-grid--location">
                  <label>Município de referência <small>Opcional, junto da UF</small><input value={form.municipality} onChange={(event) => setForm((current) => ({ ...current, municipality: event.target.value }))} placeholder="Município" disabled={!isWorkspaceReady || isBusy} maxLength={80} /></label>
                  <label>UF <small>Opcional, junto do município</small><input value={form.stateCode} onChange={(event) => setForm((current) => ({ ...current, stateCode: event.target.value.toUpperCase().slice(0, 2) }))} placeholder="UF" disabled={!isWorkspaceReady || isBusy} minLength={2} maxLength={2} /></label>
                </div>
                <div className="subdivision-studio__module-actions"><button type="submit" disabled={!isWorkspaceReady || isBusy}>{isBusy ? "Validando requisitos" : "Salvar dados estruturais"}</button></div>
              </form>

              {!selectedDevelopmentId && <div className="subdivision-studio__module-empty"><LandPlot size={19} /><p>Salve a identificação do loteamento para montar Quadras e Lotes. A estrutura sempre fica vinculada ao rascunho selecionado.</p></div>}

              {selectedDevelopmentId && <form className="subdivision-studio__structure-builder" onSubmit={applyStructure}>
                <div className="subdivision-studio__structure-builder-head"><div><span>QUADRAS E LOTES</span><h5>Monte a matriz do loteamento por Quadra.</h5><p>Inclua uma linha por Quadra e informe quantos Lotes ela possui. Exemplo: Q1 com 15 Lotes e Q2 com 25 Lotes.</p></div><div className="subdivision-studio__structure-totals"><b>{structureRows.length}</b><span>Quadras</span><b>{draftLotCount}</b><span>Lotes previstos</span></div></div>
                <div className="subdivision-studio__structure-actions"><button type="button" className="subdivision-studio__secondary" onClick={() => addStructureRows(1)} disabled={!isWorkspaceReady || isBusy || structureRows.length >= 50}><Plus size={15} />Adicionar Quadra</button><button type="button" className="subdivision-studio__secondary" onClick={() => addStructureRows(5)} disabled={!isWorkspaceReady || isBusy || structureRows.length >= 50}><Plus size={15} />Adicionar 5 Quadras</button>{structureRows.length === 0 && <button type="button" onClick={() => addStructureRows(1)} disabled={!isWorkspaceReady || isBusy}>Começar por Q1</button>}</div>
                {structureQuery.isLoading && <div className="subdivision-foundation-empty"><LoaderCircle className="subdivision-foundation-spinner" /><p>Carregando a estrutura autorizada do loteamento.</p></div>}
                {structureQuery.isError && <div className="subdivision-foundation-empty is-error"><ShieldAlert size={18} /><p>A estrutura não foi liberada neste contexto. Nenhuma Quadra ou Lote de outro loteamento é exibido.</p></div>}
                {!structureQuery.isLoading && !structureQuery.isError && structureRows.length > 0 && <div className="subdivision-studio__structure-grid" role="list" aria-label="Matriz de Quadras e Lotes"><div className="subdivision-studio__structure-grid-head"><span>Quadra</span><span>Quantidade de Lotes</span><span>Prévia gerada</span><span className="sr-only">Ação</span></div>{structureRows.map((row, index) => <div className="subdivision-studio__structure-row" role="listitem" key={`${row.blockNumber}-${index}`}><label><span className="sr-only">Número da Quadra {index + 1}</span><div className="subdivision-studio__number-input"><em>Q</em><input type="number" min={1} max={999} value={row.blockNumber} onChange={(event) => updateStructureRow(index, { blockNumber: Number(event.target.value) })} disabled={!isWorkspaceReady || isBusy} required /></div></label><label><span className="sr-only">Quantidade de Lotes da Quadra {row.blockNumber || index + 1}</span><div className="subdivision-studio__number-input"><em>L</em><input type="number" min={1} max={100} value={row.lotCount} onChange={(event) => updateStructureRow(index, { lotCount: Number(event.target.value) })} disabled={!isWorkspaceReady || isBusy} required /></div></label><p><b>Q{row.blockNumber || "?"}</b> · L1–L{row.lotCount || "?"}</p><button type="button" className="subdivision-studio__remove-row" onClick={() => removeStructureRow(index)} disabled={!isWorkspaceReady || isBusy}><Trash2 size={15} /><span className="sr-only">Remover Quadra {row.blockNumber}</span></button></div>)}</div>}
                {hasDuplicateBlockNumber && <p className="subdivision-studio__structure-error" role="alert">Cada Quadra precisa de numeração única. Corrija os números repetidos antes de aplicar.</p>}
                {structureWouldArchive && <label className="subdivision-studio__replacement-confirmation"><input type="checkbox" checked={replaceStructureConfirmed} onChange={(event) => setReplaceStructureConfirmed(event.target.checked)} disabled={!isWorkspaceReady || isBusy} /><span><b>Confirmo a revisão da redução estrutural.</b> Quadras removidas e Lotes acima da nova quantidade serão arquivados logicamente; não há exclusão física nem efeito em venda, contrato ou financeiro.</span></label>}
                <div className="subdivision-studio__structure-apply"><div><span>ESTRUTURA SALVA</span><b>{activeSavedStructure.length ? `${activeSavedStructure.length} Quadra(s) · ${savedLotCount} Lote(s)` : legacyEmptyBlocks.length ? "Inconsistência: Quadra sem Lotes ativos" : "Ainda não há Quadras salvas"}</b></div><button type="submit" disabled={!isWorkspaceReady || isBusy || structureRows.length === 0 || normalizedStructureRows.length !== structureRows.length || hasDuplicateBlockNumber || (structureWouldArchive && !replaceStructureConfirmed)}>{applyStructureMutation.isPending ? "Aplicando estrutura" : savedStructure.length ? "Aplicar revisão da estrutura" : "Criar Quadras e Lotes"}</button></div>
                {savedStructure.length > 0 && <div className="subdivision-studio__saved-structure"><div><span>QUADRAS REGISTRADAS</span><p>Quadras sem Lotes ativos exigem revisão. Use o arquivamento apenas para uma Quadra inteira; seus Lotes de rascunho serão arquivados junto dela.</p></div><div>{savedStructure.map((block) => <article key={block.blockId} data-incomplete={block.lotCount < 1}><b>Q{block.blockNumber}</b><span>{block.lotCount > 0 ? `${block.lotCount} Lote(s)` : "Sem Lotes ativos · revisar"}</span><AlertDialog><AlertDialogTrigger asChild><button type="button" className="subdivision-studio__danger" disabled={isBusy}><Archive size={14} />Arquivar</button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Arquivar Q{block.blockNumber}?</AlertDialogTitle><AlertDialogDescription>Os Lotes de rascunho vinculados a esta Quadra serão arquivados logicamente. O histórico é preservado; não há exclusão em cascata, venda, contrato ou efeito financeiro.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => archiveBlockMutation.mutate({ ...context, developmentId: selectedDevelopmentId, blockId: block.blockId, correlationId: crypto.randomUUID() })}>Arquivar Quadra</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></article>)}</div></div>}
                {activeSavedStructure.length > 0 && <a className="subdivision-studio__inventory-link" href="/estoque-lotes"><MapPinned size={16} /><span>Abrir Estoque/Mapa de Lotes</span><small>Revise a matriz Qn · Ln criada neste contexto.</small></a>}
              </form>}
            </div>}

            {activeModule === "preparation" && <form className="subdivision-studio__module-form" onSubmit={saveDevelopment}>
              <div className="subdivision-studio__field-grid">
                <label>Situação de trabalho<select value={form.workingPhase} onChange={(event) => setForm((current) => ({ ...current, workingPhase: event.target.value as WorkingPhase }))} disabled={!isWorkspaceReady || isBusy}>{Object.entries(phaseLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
                <div className="subdivision-studio__field-callout"><ClipboardCheck size={17} /><span>Use o Perfil de Preparação avançado abaixo para aprofundar os marcos internos.</span></div>
              </div>
              <label className="subdivision-studio__text-field">Nota interna de preparação <small>Opcional · sem dados pessoais, matrícula, contrato, valor ou financeiro</small><textarea value={form.internalNote} onChange={(event) => setForm((current) => ({ ...current, internalNote: event.target.value }))} placeholder="Próximo passo interno ou dependência de revisão" disabled={!isWorkspaceReady || isBusy} maxLength={600} /></label>
              <div className="subdivision-studio__module-actions"><button type="submit" disabled={!isWorkspaceReady || isBusy}>{isBusy ? "Validando requisitos" : "Salvar preparação"}</button><button type="button" className="subdivision-studio__secondary" onClick={() => openModule("documents")} disabled={!selectedDevelopmentId || isBusy}>Ir para documentos</button></div>
            </form>}

            {activeModule === "documents" && <div className="subdivision-studio__documents-module">
              <div className="subdivision-studio__module-context"><FilePlus2 size={18} /><p>Os anexos são privados. A tela não expõe nome original, URL, chave, conteúdo ou download.</p></div>
              <form className="subdivision-studio__attachment-form" onSubmit={uploadAttachment}>
                <label>Categoria documental<select value={attachmentCategory} onChange={(event) => setAttachmentCategory(event.target.value as AttachmentCategory)} disabled={!isWorkspaceReady || isUploading}>{Object.entries(attachmentCategoryLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
                <label>Arquivo privado<input ref={attachmentInput} type="file" accept="application/pdf,image/jpeg,image/png" onChange={(event) => setAttachmentFile(event.target.files?.[0] ?? null)} disabled={!isWorkspaceReady || isUploading} /></label>
                <button type="submit" disabled={!isWorkspaceReady || !attachmentFile || isUploading}>{isUploading ? "Registrando" : <><Upload size={15} />Anexar</>}</button>
              </form>
              {attachmentsQuery.isLoading && <div className="subdivision-foundation-empty"><LoaderCircle className="subdivision-foundation-spinner" /><p>Carregando estados autorizados de anexos.</p></div>}
              {attachmentsQuery.isError && <div className="subdivision-foundation-empty is-error"><ShieldAlert size={18} /><p>Os anexos não foram liberados para leitura neste contexto.</p></div>}
              {attachmentsQuery.data?.length === 0 && <div className="subdivision-studio__module-empty"><FileText size={19} /><p>Nenhum anexo foi registrado. PDF, JPEG e PNG de até 5 MB ficam disponíveis após MFA e validação de arquivo.</p></div>}
              {attachmentsQuery.data && attachmentsQuery.data.length > 0 && <div className="subdivision-studio__attachment-list">{attachmentsQuery.data.map((attachment, index) => <article key={attachment.attachmentId}><div><span>DOCUMENTO {String(index + 1).padStart(2, "0")}</span><h5>{attachmentCategoryLabels[attachment.category]}</h5><p>{attachment.state === "recorded" ? "Arquivo privado registrado" : "Aguardando envio privado"} · {attachment.contentType ? attachment.contentType.replace("application/", "") : "tipo ainda não registrado"}</p></div><AlertDialog><AlertDialogTrigger asChild><button type="button" className="subdivision-studio__danger" disabled={archiveAttachmentMutation.isPending}><Trash2 size={15} />Remover</button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remover referência de anexo?</AlertDialogTitle><AlertDialogDescription>A referência será arquivada logicamente e a chave de armazenamento deixará de ficar associada ao loteamento. O arquivo não será exibido nem baixado durante esta ação.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => archiveAttachmentMutation.mutate({ ...context, developmentId: selectedDevelopmentId, attachmentId: attachment.attachmentId, correlationId: crypto.randomUUID() })}>Remover referência</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></article>)}</div>}
            </div>}

            {activeModule === "lifecycle" && <div className="subdivision-studio__lifecycle-module"><div className="subdivision-studio__lifecycle-warning"><Archive size={20} /><div><p>ARQUIVAMENTO CONTROLADO</p><h5>Remova da lista ativa sem apagar a trilha de auditoria.</h5><span>O sistema bloqueia o arquivamento enquanto houver Quadras ativas e não exclui nenhuma estrutura em cascata.</span></div></div><AlertDialog><AlertDialogTrigger asChild><button type="button" className="subdivision-studio__archive-button" disabled={archiveMutation.isPending || isUploading}>Arquivar loteamento</button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Arquivar este loteamento em rascunho?</AlertDialogTitle><AlertDialogDescription>O cadastro sairá da lista ativa, as referências de anexos serão removidas logicamente e o histórico de auditoria será preservado. Esta ação exige MFA recente e falhará se existirem Quadras ativas.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => archiveMutation.mutate({ ...context, developmentId: selectedDevelopmentId, correlationId: crypto.randomUUID() })}>Arquivar rascunho</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div>}
          </section>
        </div>

        <aside className="subdivision-studio__overview" aria-label="Visão operacional do loteamento">
          <div className="subdivision-studio__overview-head"><span>VISÃO OPERACIONAL</span><CheckCircle2 size={18} /></div>
          <div className="subdivision-studio__overview-name"><strong>{mode === "create" ? form.displayName || "Novo loteamento" : selectedDevelopment?.displayName ?? selectedDevelopment?.internalReference}</strong><span>{form.internalReference || "Referência pendente"}</span></div>
          <div className="subdivision-studio__overview-grid">
            <div><span>BASE</span><b>{identityReady ? "Completa" : "Em preenchimento"}</b></div>
            <div><span>ESTRUTURA</span><b>{activeSavedStructure.length ? `${activeSavedStructure.length} Q · ${savedLotCount} L` : legacyEmptyBlocks.length ? "Revisão de estrutura" : structureReady ? "Aguardando Quadras" : "Revisar"}</b></div>
            <div><span>PREPARAÇÃO</span><b>{phaseLabels[form.workingPhase]}</b></div>
            <div><span>DOCUMENTOS</span><b>{selectedDevelopmentId ? `${activeAttachmentCount} privado(s)` : "Após criar"}</b></div>
          </div>
          <div className="subdivision-studio__overview-boundary"><ShieldAlert size={15} /><p>Este setor não contém matrícula, área, lote, estoque, preço, contrato, proposta, cobrança, pagamento ou repasse.</p></div>
        </aside>
      </div>
    </section>
  );
}
