import type { SubdivisionContext } from "@shared/subdivisionContracts";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { trpc } from "@/lib/trpc";
import { parsePhysicalSourceFile, type PhysicalSourcePreview } from "@/lib/subdivisionPhysicalSourcePreview";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Archive, ArchiveRestore, BookOpenCheck, Calculator, CheckCircle2, ClipboardCheck, FilePlus2, FileText, LandPlot, LoaderCircle, MapPinned, PencilLine, Plus, Ruler, Search, ShieldAlert, ShieldCheck, TableProperties, Trash2, Upload, Workflow } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type DevelopmentKind = "residential" | "mixed_use" | "commercial" | "industrial" | "rural" | "other";
type WorkingPhase = "preliminary_reference" | "structuring" | "review_required";
type ParcelingMode = "loteamento" | "desmembramento" | "condominio_lotes" | "acesso_controlado" | "other" | "to_review";
type TerritorialContext = "urban" | "urban_expansion" | "specific_urbanization" | "to_review";
type PredominantUse = "residential" | "mixed_use" | "commercial" | "industrial" | "institutional" | "to_review";
type AttachmentCategory = "identity" | "planning" | "municipal" | "registry" | "implementation" | "environmental" | "other";
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

const parcelingModeLabels: Record<ParcelingMode, string> = {
  loteamento: "Loteamento",
  desmembramento: "Desmembramento",
  condominio_lotes: "Condomínio de lotes",
  acesso_controlado: "Loteamento de acesso controlado",
  other: "Outra modalidade",
  to_review: "A confirmar na revisão",
};

const territorialContextLabels: Record<TerritorialContext, string> = {
  urban: "Área urbana",
  urban_expansion: "Expansão urbana",
  specific_urbanization: "Urbanização específica",
  to_review: "A confirmar na revisão",
};

const predominantUseLabels: Record<PredominantUse, string> = {
  residential: "Residencial",
  mixed_use: "Uso misto",
  commercial: "Comercial",
  industrial: "Industrial",
  institutional: "Institucional",
  to_review: "A confirmar na revisão",
};

const lotTypologyLabels: Record<string, string> = {
  standard: "Padrão",
  corner: "Esquina",
  irregular: "Irregular",
  other: "Outro",
};

const lotPositionLabels: Record<string, string> = {
  not_declared: "Não informada",
  internal: "Interna",
  corner: "Esquina",
  end: "Final de Quadra",
};

const phaseLabels: Record<WorkingPhase, string> = {
  preliminary_reference: "Referência preliminar",
  structuring: "Em estruturação",
  review_required: "Revisão necessária",
};

const attachmentCategoryLabels: Record<AttachmentCategory, string> = {
  identity: "Identificação inicial",
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
  parcelingMode: ParcelingMode;
  territorialContext: TerritorialContext;
  predominantUse: PredominantUse;
  territorialReference: string;
  identificationNote: string;
};

type StructureRow = {
  blockNumber: number;
  lotCount: number;
};

const requirementDefinitions = [
  ["municipal_approval", "Prefeitura · aprovação"],
  ["municipal_technical_project", "Prefeitura · projeto técnico"],
  ["registry_matriculation", "Cartório · matrícula"],
  ["registry_memorial", "Cartório · memorial"],
  ["legal_review", "Jurídico · revisão"],
  ["legal_registration", "Jurídico · registros"],
  ["works_infrastructure", "Obras · infraestrutura"],
  ["works_access", "Obras · acessos"],
  ["environmental_license", "Ambiental · licença"],
  ["technical_survey", "Técnico · levantamento"],
  ["technical_layout", "Técnico · implantação"],
] as const;
type RequirementCode = (typeof requirementDefinitions)[number][0];
type RequirementState = "not_started" | "pending_evidence" | "under_review" | "declared_complete" | "review_required";
const requirementStateLabels: Record<RequirementState, string> = {
  not_started: "Não iniciado",
  pending_evidence: "Aguardando evidência",
  under_review: "Em revisão",
  declared_complete: "Declarado completo",
  review_required: "Revisão necessária",
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
  parcelingMode: "to_review",
  territorialContext: "to_review",
  predominantUse: "to_review",
  territorialReference: "",
  identificationNote: "",
};

function toForm(development: { internalReference: string; displayName: string | null; developmentKind: DevelopmentKind | null; municipality: string | null; stateCode: string | null; plannedStageCount: number | null; workingPhase: WorkingPhase; internalNote: string | null; parcelingMode: ParcelingMode | null; territorialContext: TerritorialContext | null; predominantUse: PredominantUse | null; territorialReference: string | null; identificationNote: string | null }): StudioForm {
  return {
    internalReference: development.internalReference,
    displayName: development.displayName ?? "",
    developmentKind: development.developmentKind ?? "residential",
    municipality: development.municipality ?? "",
    stateCode: development.stateCode ?? "",
    plannedStageCount: development.plannedStageCount ?? 1,
    workingPhase: development.workingPhase,
    internalNote: development.internalNote ?? "",
    parcelingMode: development.parcelingMode ?? "to_review",
    territorialContext: development.territorialContext ?? "to_review",
    predominantUse: development.predominantUse ?? "to_review",
    territorialReference: development.territorialReference ?? "",
    identificationNote: development.identificationNote ?? "",
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
  const [attachmentCategory, setAttachmentCategory] = useState<AttachmentCategory>("identity");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [structureRows, setStructureRows] = useState<StructureRow[]>([]);
  const [structureLoadedFor, setStructureLoadedFor] = useState("");
  const [replaceStructureConfirmed, setReplaceStructureConfirmed] = useState(false);
  const [physicalSourcePreview, setPhysicalSourcePreview] = useState<PhysicalSourcePreview | null>(null);
  const [physicalSourceError, setPhysicalSourceError] = useState("");
  const [declaredLotTotal, setDeclaredLotTotal] = useState("");
  const [physicalStructureConfirmed, setPhysicalStructureConfirmed] = useState(false);
  const [lotSearch, setLotSearch] = useState("");
  const [lotBlockFilter, setLotBlockFilter] = useState("all");
  const [lotPhysicalStatusFilter, setLotPhysicalStatusFilter] = useState<"all" | "pending" | "complete">("all");
  const [pricePerSqmPreview, setPricePerSqmPreview] = useState("");
  const [priceScopeBlock, setPriceScopeBlock] = useState("all");
  const [isUploading, setIsUploading] = useState(false);
  const attachmentInput = useRef<HTMLInputElement>(null);
  const physicalSourceInput = useRef<HTMLInputElement>(null);
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
  const archivedStructureQuery = trpc.subdivisionFoundation.listArchivedDraftStructure.useQuery(structureInput, { enabled: isWorkspaceReady && Boolean(selectedDevelopmentId), retry: false });
  const physicalStructureQuery = trpc.subdivisionFoundation.listDraftPhysicalStructure.useQuery(structureInput, { enabled: isWorkspaceReady && Boolean(selectedDevelopmentId), retry: false });
  const requirementsQuery = trpc.subdivisionFoundation.listDraftDevelopmentRequirements.useQuery(structureInput, { enabled: isWorkspaceReady && Boolean(selectedDevelopmentId), retry: false });
  const structuralReconciliationState = requirementsQuery.data?.find((requirement) => requirement.requirementCode === "technical_layout")?.requirementState as RequirementState | undefined;
  const structuralReconciliationPending = structuralReconciliationState === "review_required";
  const physicalLots = useMemo(() => (physicalStructureQuery.data ?? []).flatMap((block) => block.lots.map((lot) => ({ ...lot, blockNumber: block.blockNumber }))), [physicalStructureQuery.data]);
  const searchedLots = useMemo(() => {
    const query = lotSearch.trim().toLocaleLowerCase("pt-BR");
    const blockNumber = lotBlockFilter === "all" ? null : Number(lotBlockFilter);
    return physicalLots.filter((lot) => {
      const matchesBlock = blockNumber === null || lot.blockNumber === blockNumber;
      const matchesSearch = !query || `q${lot.blockNumber} l${lot.lotNumber} ${lot.lotTypology} ${lot.positionCode}`.toLocaleLowerCase("pt-BR").includes(query);
      const hasPhysicalPending = typeof lot.areaSqm !== "number" || typeof lot.frontageM !== "number" || typeof lot.depthM !== "number" || lot.positionCode === "not_declared" || lot.lotTypology === "standard";
      const matchesPhysicalStatus = lotPhysicalStatusFilter === "all" || (lotPhysicalStatusFilter === "pending" ? hasPhysicalPending : !hasPhysicalPending);
      return matchesBlock && matchesSearch && matchesPhysicalStatus;
    });
  }, [lotSearch, lotBlockFilter, lotPhysicalStatusFilter, physicalLots]);
  const visibleLotBlocks = useMemo(() => {
    const groups: Array<{ blockNumber: number; lots: typeof physicalLots }> = [];
    searchedLots.forEach((lot) => {
      const group = groups.find((candidate) => candidate.blockNumber === lot.blockNumber);
      if (group) group.lots.push(lot);
      else groups.push({ blockNumber: lot.blockNumber, lots: [lot] });
    });
    return groups.sort((left, right) => left.blockNumber - right.blockNumber).map((group) => ({
      ...group,
      totalAreaSqm: group.lots.reduce((total, lot) => total + (lot.areaSqm ?? 0), 0),
      areasPending: group.lots.filter((lot) => typeof lot.areaSqm !== "number").length,
      lotsWithPhysicalPending: group.lots.filter((lot) => typeof lot.areaSqm !== "number" || typeof lot.frontageM !== "number" || typeof lot.depthM !== "number" || lot.positionCode === "not_declared" || lot.lotTypology === "standard").length,
    }));
  }, [searchedLots]);
  const visibleLotCount = searchedLots.length;
  const visibleBlockCount = visibleLotBlocks.length;
  const lotsWithArea = physicalLots.filter((lot) => typeof lot.areaSqm === "number");
  const totalAreaSqm = lotsWithArea.reduce((total, lot) => total + (lot.areaSqm ?? 0), 0);
  const physicalCoverage = [
    { key: "area", label: "Área", available: lotsWithArea.length },
    { key: "frontage", label: "Frente", available: physicalLots.filter((lot) => typeof lot.frontageM === "number").length },
    { key: "depth", label: "Profundidade", available: physicalLots.filter((lot) => typeof lot.depthM === "number").length },
    { key: "position", label: "Posição", available: physicalLots.filter((lot) => lot.positionCode !== "not_declared").length },
    { key: "typology", label: "Tipologia", available: physicalLots.filter((lot) => lot.lotTypology !== "standard").length },
  ];
  const physicalCoverageComplete = physicalCoverage.filter((item) => item.available === physicalLots.length).length;
  const emptyLotFilterMessage = lotPhysicalStatusFilter === "complete"
    ? "Nenhum Lote possui todos os atributos físicos confirmados na fonte. Complete a conferência em fonte física antes de registrar qualquer informação."
    : lotPhysicalStatusFilter === "pending"
      ? "Nenhum Lote com pendência física corresponde aos filtros atuais. Ajuste apenas os filtros de leitura para ampliar a consulta."
      : "Nenhum Lote físico corresponde aos filtros informados.";
  const selectedPriceLots = priceScopeBlock === "all" ? physicalLots : physicalLots.filter((lot) => lot.blockNumber === Number(priceScopeBlock));
  const pricePerSqmNumber = Number(pricePerSqmPreview);
  const previewPriceEligibleLots = selectedPriceLots.filter((lot) => typeof lot.areaSqm === "number");
  const previewBaseTotal = Number.isFinite(pricePerSqmNumber) && pricePerSqmNumber > 0 ? previewPriceEligibleLots.reduce((total, lot) => total + ((lot.areaSqm ?? 0) * pricePerSqmNumber), 0) : null;

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
      toast.success("Cadastro em estruturação criado", { description: "O cadastro foi salvo como referência interna e não aprova empreendimento, estoque, contrato ou financeiro." });
      setHasExplicitDraftChoice(true);
      setRecordFilter("");
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
      toast.success("Módulo atualizado", { description: "A atualização preserva o cadastro em estruturação e registra somente metadados redigidos em auditoria." });
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
      toast.success("Estrutura de Quadras aplicada", { description: `${result.blockCount} Quadra(s) e ${result.lotCount} Lote(s) no cadastro em estruturação. Nenhuma disponibilidade, reserva, venda ou contrato foi criado.` });
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
      void utils.subdivisionFoundation.listArchivedDraftStructure.invalidate(structureInput);
      void utils.subdivisionFoundation.listDraftBlocks.invalidate(structureInput);
      void utils.subdivisionFoundation.listDraftLotInventoryStates.invalidate(context);
    },
    onError() {
      toast.error("Quadra não arquivada", { description: "O servidor exige MFA, contexto autorizado e vínculo com o loteamento selecionado." });
    },
  });
  const restoreBlockMutation = trpc.subdivisionFoundation.restoreDraftBlock.useMutation({
    onSuccess(result) {
      toast.success("Quadra restaurada", { description: `${result.restoredLotCount} Lote(s) arquivados voltaram ao cadastro em estruturação. Nenhum Lote novo foi criado.` });
      setStructureLoadedFor("");
      void utils.subdivisionFoundation.listDraftStructure.invalidate(structureInput);
      void utils.subdivisionFoundation.listArchivedDraftStructure.invalidate(structureInput);
      void utils.subdivisionFoundation.listDraftBlocks.invalidate(structureInput);
      void utils.subdivisionFoundation.listDraftLotInventoryStates.invalidate(context);
    },
    onError() {
      toast.error("Restauração bloqueada", { description: "O servidor exige MFA recente, contexto autorizado e vínculo da Quadra arquivada com este cadastro." });
    },
  });
  const applyPhysicalStructureMutation = trpc.subdivisionFoundation.applyDraftPhysicalStructure.useMutation({
    onSuccess(result) {
      toast.success("Matriz física aplicada", { description: `${result.blockCount} Quadra(s) e ${result.lotCount} Lote(s) no cadastro em estruturação. Nenhuma disponibilidade, venda, contrato ou preço foi criado.` });
      setPhysicalStructureConfirmed(false);
      void utils.subdivisionFoundation.listDraftPhysicalStructure.invalidate(structureInput);
      void utils.subdivisionFoundation.listDraftStructure.invalidate(structureInput);
      void utils.subdivisionFoundation.listDraftLotInventoryStates.invalidate(context);
    },
    onError() {
      toast.error("Matriz física não aplicada", { description: "Revise a fonte local, a divergência de total, a confirmação, MFA e o contexto autorizado." });
    },
  });
  const upsertRequirementMutation = trpc.subdivisionFoundation.upsertDraftDevelopmentRequirement.useMutation({
    onSuccess() {
      void utils.subdivisionFoundation.listDraftDevelopmentRequirements.invalidate(structureInput);
    },
    onError() {
      toast.error("Pendência não atualizada", { description: "O servidor exige MFA, contexto autorizado e um cadastro de loteamento em estruturação." });
    },
  });

  const identityReady = form.internalReference.length >= 3 && form.displayName.trim().length >= 3;
  const classificationReady = form.parcelingMode !== "to_review" && form.predominantUse !== "to_review";
  const territorialReady = Boolean(form.municipality) && Boolean(form.stateCode) && form.territorialContext !== "to_review";
  const identificationDetailed = identityReady && classificationReady && territorialReady;
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
  const completedModules = [identificationDetailed, activeSavedStructure.length > 0, Boolean(form.workingPhase)].filter(Boolean).length;
  const isBusy = createMutation.isPending || updateMutation.isPending || archiveMutation.isPending || applyStructureMutation.isPending || archiveBlockMutation.isPending || restoreBlockMutation.isPending || applyPhysicalStructureMutation.isPending || upsertRequirementMutation.isPending || isUploading;
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
    setPhysicalSourcePreview(null);
    setPhysicalSourceError("");
    setDeclaredLotTotal("");
    setPhysicalStructureConfirmed(false);
    setLotPhysicalStatusFilter("all");
    if (attachmentInput.current) attachmentInput.current.value = "";
    if (physicalSourceInput.current) physicalSourceInput.current.value = "";
  }

  function selectDevelopment(id: string) {
    setHasExplicitDraftChoice(true);
    setSelectedDevelopmentId(id);
    setMode("edit");
    setActiveModule("structure");
    setStructureRows([]);
    setStructureLoadedFor("");
    setReplaceStructureConfirmed(false);
    setPhysicalSourcePreview(null);
    setPhysicalSourceError("");
    setDeclaredLotTotal("");
    setPhysicalStructureConfirmed(false);
    setLotPhysicalStatusFilter("all");
    if (physicalSourceInput.current) physicalSourceInput.current.value = "";
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
      toast.message("Confirmação necessária", { description: "A redução de quantidade ou retirada de uma Quadra arquiva referências do cadastro em estruturação. Confirme a revisão antes de aplicar." });
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

  async function loadPhysicalSource(file: File | null) {
    setPhysicalSourcePreview(null);
    setPhysicalSourceError("");
    setPhysicalStructureConfirmed(false);
    if (!file) return;
    try {
      setPhysicalSourcePreview(await parsePhysicalSourceFile(file));
    } catch {
      setPhysicalSourceError("A fonte local precisa ser uma planilha XLSX de até 2 MB com as colunas Quadra e Lote. Somente Área é lida como atributo físico opcional.");
    }
  }

  function applyPhysicalSource() {
    if (!selectedDevelopmentId || !physicalSourcePreview) return;
    const declaredTotal = Number(declaredLotTotal);
    if (!Number.isInteger(declaredTotal) || declaredTotal < 1 || declaredTotal !== physicalSourcePreview.lotCount || physicalSourcePreview.issues.length > 0 || !physicalStructureConfirmed) {
      toast.error("Revise a matriz física", { description: "O total declarado deve coincidir com a fonte, não pode haver inconsistência e a revisão precisa ser confirmada." });
      return;
    }
    applyPhysicalStructureMutation.mutate({
      ...context,
      developmentId: selectedDevelopmentId,
      blocks: physicalSourcePreview.blocks.map((block) => ({
        blockNumber: block.blockNumber,
        sectorReference: null,
        blockTypology: "regular" as const,
        lots: block.lots.map((lot) => ({ lotNumber: lot.lotNumber, areaSqm: lot.areaSqm, frontageM: null, depthM: null, lotTypology: "standard" as const, positionCode: "not_declared" as const })),
      })),
      replaceExisting: savedStructure.length > 0,
      correlationId: crypto.randomUUID(),
    });
  }

  function openModule(module: StudioModule) {
    if ((module === "documents" || module === "lifecycle") && !selectedDevelopmentId) {
      toast.message("Crie o cadastro antes de avançar", { description: "Documentos e ciclo de cadastro só ficam disponíveis depois que a referência interna é criada." });
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
      territorialReference: form.territorialReference.trim() || null,
      identificationNote: form.identificationNote.trim() || null,
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
          <p>Selecione um cadastro em estruturação e trabalhe em um módulo por vez. A interface organiza a leitura, mas o servidor continua decidindo contexto, MFA, alçada e autorização.</p>
        </div>
        <div className={`subdivision-studio__trust ${isWorkspaceReady ? "is-ready" : ""}`}><ShieldCheck size={18} /><span>{isWorkspaceReady ? "Cada comando será revalidado pelo servidor." : "Defina o contexto autorizado para iniciar o cadastro."}</span></div>
      </header>

      {!isContextReady && <div className="subdivision-foundation-empty"><ShieldAlert size={18} /><p>Sem contexto autorizado não há lista, cadastro, edição, anexo ou arquivamento.</p></div>}
      {isWorkspaceReady && developmentsQuery.isError && <div className="subdivision-foundation-empty is-error"><ShieldAlert size={18} /><p>A leitura foi negada. O sistema não revela loteamentos de outro contexto.</p></div>}
      {isWorkspaceReady && developmentsQuery.isLoading && <div className="subdivision-foundation-empty"><LoaderCircle className="subdivision-foundation-spinner" /><p>Confirmando o contexto antes de organizar o cadastro.</p></div>}

      <div className="subdivision-studio__workbench">
        <aside className="subdivision-studio__records" aria-label="Cadastros de loteamentos em estruturação">
          <div className="subdivision-studio__records-head">
            <div><LandPlot size={18} /><div><span>CADASTROS</span><strong>Loteamentos em estruturação</strong></div></div>
            <button type="button" className="subdivision-studio__new-record" onClick={startNew} data-active={mode === "create"}><Plus size={16} />Novo</button>
          </div>
          <label className="subdivision-studio__record-search"><Search size={15} /><span className="sr-only">Buscar cadastro de loteamento</span><input value={recordFilter} onChange={(event) => setRecordFilter(event.target.value)} placeholder="Buscar referência" disabled={!isWorkspaceReady} /></label>
          <p className="subdivision-studio__record-count">{developmentsQuery.data ? `${developmentsQuery.data.length} cadastro(s) disponível(is)` : "A lista depende do contexto"}</p>
          <div className="subdivision-studio__record-list">
            {isWorkspaceReady && !developmentsQuery.isLoading && filteredDevelopments.length === 0 && <p className="subdivision-studio__record-empty">{recordFilter ? "Nenhum cadastro corresponde à busca." : "Nenhum cadastro em estruturação foi devolvido."}</p>}
            {filteredDevelopments.map((development) => <button type="button" key={development.developmentId} onClick={() => selectDevelopment(development.developmentId)} data-active={development.developmentId === selectedDevelopmentId}>
              <span>{development.displayName ?? development.internalReference}</span>
              <small><b>Referência</b>{development.internalReference}</small>
              <em><b>Fase</b>{phaseLabels[development.workingPhase]}<i>Abrir cadastro →</i></em>
            </button>)}
          </div>
          <div className="subdivision-studio__records-foot"><ShieldCheck size={15} /><span>A lista revela somente referências autorizadas do contexto atual.</span></div>
        </aside>

        <div className="subdivision-studio__canvas">
          <div className="subdivision-studio__canvas-head">
            <div><p>{mode === "create" ? "NOVO CADASTRO" : "CADASTRO SELECIONADO"}</p><h3>{mode === "create" ? "Defina a identificação inicial." : selectedDevelopment?.displayName ?? selectedDevelopment?.internalReference}</h3><span>{mode === "create" ? "Comece pela referência interna e pelo nome de trabalho." : `${selectedDevelopment?.internalReference ?? ""} · ${phaseLabels[selectedDevelopment?.workingPhase ?? form.workingPhase]}`}</span></div>
            <div className="subdivision-studio__module-progress"><b>{completedModules}/3</b><span>módulos-base completos</span></div>
          </div>

          <nav className="subdivision-studio__module-nav" aria-label="Módulos do Cadastro de Loteamentos">
            {studioModules.map((module, index) => {
              const ModuleIcon = module.icon;
              const requiresSavedDraft = module.id === "documents" || module.id === "lifecycle";
              const isComplete = module.id === "identity" ? identificationDetailed : module.id === "structure" ? activeSavedStructure.length > 0 : module.id === "preparation" ? Boolean(form.workingPhase) : module.id === "documents" ? activeAttachmentCount > 0 : false;
              return <button type="button" key={module.id} onClick={() => openModule(module.id)} aria-current={activeModule === module.id ? "step" : undefined} data-active={activeModule === module.id} data-complete={isComplete} disabled={!isWorkspaceReady || (requiresSavedDraft && !selectedDevelopmentId)}>
                <span className="subdivision-studio__module-index">{String(index + 1).padStart(2, "0")}</span><ModuleIcon size={17} /><span><b>{module.label}</b><small>{module.caption}</small></span>{isComplete && <CheckCircle2 size={15} />}
              </button>;
            })}
          </nav>

          <section className="subdivision-studio__active-module" aria-labelledby={`studio-module-${activeModule}`}>
            <div className="subdivision-studio__active-module-heading"><div><p>MÓDULO {String(studioModules.findIndex((module) => module.id === activeModule) + 1).padStart(2, "0")}</p><h4 id={`studio-module-${activeModule}`}>{selectedModule.label}</h4><span>{selectedModule.caption}</span></div><BookOpenCheck size={21} /></div>

            {activeModule === "identity" && <div className="subdivision-studio__identity-module">
              <form className="subdivision-studio__module-form" onSubmit={saveDevelopment}>
                <section className="subdivision-studio__identity-section" aria-labelledby="identity-base-title">
                  <div className="subdivision-studio__identity-section-heading"><span>01 · BASE DO CADASTRO</span><h5 id="identity-base-title">Como este loteamento será reconhecido internamente?</h5><p>Comece com a referência e o nome. Estes campos organizam o cadastro, não certificam aprovação, estoque ou disponibilidade comercial.</p></div>
                  <div className="subdivision-studio__field-grid">
                    <label>Referência interna <small>Obrigatória · código de trabalho</small><input value={form.internalReference} onChange={(event) => setForm((current) => ({ ...current, internalReference: normalizeReference(event.target.value) }))} placeholder="EX.: JARDINS_DO_SUL" disabled={!isWorkspaceReady || isBusy} required minLength={3} maxLength={80} /></label>
                    <label>Nome de trabalho <small>Obrigatório · como a equipe identifica o projeto</small><input value={form.displayName} onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))} placeholder="Nome interno do loteamento" disabled={!isWorkspaceReady || isBusy} required minLength={3} maxLength={120} /></label>
                  </div>
                </section>

                <section className="subdivision-studio__identity-section" aria-labelledby="identity-framework-title">
                  <div className="subdivision-studio__identity-section-heading"><span>02 · ENQUADRAMENTO DECLARADO</span><h5 id="identity-framework-title">Classifique sem presumir validade técnica ou jurídica.</h5><p>Escolha o que a equipe sabe hoje. Quando não houver confirmação, mantenha “A confirmar na revisão”.</p></div>
                  <div className="subdivision-studio__field-grid">
                    <label>Modalidade declarada<select value={form.parcelingMode} onChange={(event) => setForm((current) => ({ ...current, parcelingMode: event.target.value as ParcelingMode }))} disabled={!isWorkspaceReady || isBusy}>{Object.entries(parcelingModeLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
                    <label>Classificação interna<select value={form.developmentKind} onChange={(event) => setForm((current) => ({ ...current, developmentKind: event.target.value as DevelopmentKind }))} disabled={!isWorkspaceReady || isBusy}>{Object.entries(kindLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
                    <label>Uso predominante declarado<select value={form.predominantUse} onChange={(event) => setForm((current) => ({ ...current, predominantUse: event.target.value as PredominantUse }))} disabled={!isWorkspaceReady || isBusy}>{Object.entries(predominantUseLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
                    <label>Etapas planejadas <small>Estimativa interna</small><input type="number" min={1} max={20} value={form.plannedStageCount} onChange={(event) => setForm((current) => ({ ...current, plannedStageCount: Number(event.target.value) || 1 }))} disabled={!isWorkspaceReady || isBusy} required /></label>
                  </div>
                </section>

                <section className="subdivision-studio__identity-section" aria-labelledby="identity-territory-title">
                  <div className="subdivision-studio__identity-section-heading"><span>03 · TERRITÓRIO DE REFERÊNCIA</span><h5 id="identity-territory-title">Registre o contexto amplo, não o endereço preciso.</h5><p>Município e UF devem ser informados juntos. A referência territorial não deve conter matrícula, coordenada, endereço ou dados de terceiros.</p></div>
                  <div className="subdivision-studio__field-grid subdivision-studio__field-grid--territory">
                    <label>Município <small>Preencha junto da UF</small><input value={form.municipality} onChange={(event) => setForm((current) => ({ ...current, municipality: event.target.value }))} placeholder="Município de referência" disabled={!isWorkspaceReady || isBusy} maxLength={80} /></label>
                    <label>UF <small>Preencha junto do município</small><input value={form.stateCode} onChange={(event) => setForm((current) => ({ ...current, stateCode: event.target.value.toUpperCase().slice(0, 2) }))} placeholder="UF" disabled={!isWorkspaceReady || isBusy} minLength={2} maxLength={2} /></label>
                    <label>Contexto territorial<select value={form.territorialContext} onChange={(event) => setForm((current) => ({ ...current, territorialContext: event.target.value as TerritorialContext }))} disabled={!isWorkspaceReady || isBusy}>{Object.entries(territorialContextLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
                    <label>Referência territorial ampla <small>Opcional · sem endereço, coordenada ou matrícula</small><input value={form.territorialReference} onChange={(event) => setForm((current) => ({ ...current, territorialReference: event.target.value }))} placeholder="Ex.: setor, região ou frente de planejamento" disabled={!isWorkspaceReady || isBusy} minLength={2} maxLength={120} /></label>
                  </div>
                </section>

                <section className="subdivision-studio__identity-section" aria-labelledby="identity-status-title">
                  <div className="subdivision-studio__identity-section-heading"><span>04 · SITUAÇÃO E PENDÊNCIAS</span><h5 id="identity-status-title">Diga em que ponto o trabalho está, sem declarar aprovação.</h5><p>As pendências detalhadas de município, cartório, jurídico, obras, ambiente e técnico são tratadas no Dossiê de Documentos.</p></div>
                  <div className="subdivision-studio__field-grid">
                    <label>Situação de trabalho<select value={form.workingPhase} onChange={(event) => setForm((current) => ({ ...current, workingPhase: event.target.value as WorkingPhase }))} disabled={!isWorkspaceReady || isBusy}>{Object.entries(phaseLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
                    <label>Nota de identificação <small>Opcional · sem pessoa, matrícula, processo, contrato ou valor</small><textarea value={form.identificationNote} onChange={(event) => setForm((current) => ({ ...current, identificationNote: event.target.value }))} placeholder="Contexto interno, dúvida de classificação ou próximo passo de identificação" disabled={!isWorkspaceReady || isBusy} maxLength={600} /></label>
                  </div>
                </section>

                <p className="subdivision-studio__module-note"><MapPinned size={15} />A identificação organiza o trabalho interno. Ela não representa matrícula, aprovação, estoque, venda, contrato, preço, cobrança ou disponibilidade comercial.</p>
                <div className="subdivision-studio__module-actions"><button type="submit" disabled={!isWorkspaceReady || isBusy}>{isBusy ? "Validando requisitos" : mode === "create" ? "Criar cadastro de identificação" : "Salvar identificação"}</button>{mode === "edit" && <button type="button" className="subdivision-studio__secondary" onClick={() => openModule("structure")} disabled={isBusy}>Ir para estrutura</button>}</div>
              </form>

              <section className="subdivision-studio__identity-dossier" aria-labelledby="identity-dossier-title">
                <div><span>DOSSIÊ INICIAL</span><h5 id="identity-dossier-title">O primeiro documento começa aqui.</h5><p>{selectedDevelopmentId ? "O cadastro já está em estruturação. Abra o dossiê privado para anexar uma evidência inicial de identificação, planejamento, município, cartório, implantação ou ambiente." : "Salve a identificação mínima para habilitar o dossiê privado. O sistema não recebe arquivos antes de vincular o anexo a um cadastro autorizado."}</p></div>
                <div className="subdivision-studio__identity-dossier-status"><b>{selectedDevelopmentId ? activeAttachmentCount : 0}</b><span>{selectedDevelopmentId ? "documento(s) privado(s) registrado(s)" : "documentos após salvar"}</span></div>
                <button type="button" onClick={() => { setAttachmentCategory("identity"); openModule("documents"); }} disabled={!selectedDevelopmentId || !isWorkspaceReady || isBusy}><FilePlus2 size={16} />{selectedDevelopmentId ? "Adicionar documento inicial" : "Salve o cadastro para anexar"}</button>
              </section>
            </div>}

            {activeModule === "structure" && <div className="subdivision-studio__structure-module">
              {selectedDevelopmentId && <section className="subdivision-studio__structure-visualization" aria-labelledby="subdivision-structure-chart-title">
                <div className="subdivision-studio__structure-visualization-head"><div><span>MATRIZ FÍSICA DO CADASTRO</span><h5 id="subdivision-structure-chart-title">Quadras e Lotes já estruturados</h5><p>Leitura por Quadra da quantidade de Lotes salva neste loteamento. Este quadro não indica disponibilidade comercial.</p></div><div><b>{activeSavedStructure.length}</b><span>Quadras</span><b>{savedLotCount}</b><span>Lotes</span></div></div>
                {structureQuery.isLoading && <div className="subdivision-studio__structure-chart-empty"><LoaderCircle className="subdivision-foundation-spinner" /><span>Confirmando a matriz autorizada.</span></div>}
                {!structureQuery.isLoading && legacyEmptyBlocks.length > 0 && <p className="subdivision-studio__structure-warning" role="alert"><ShieldAlert size={16} /><span>{legacyEmptyBlocks.length === 1 ? `A Q${legacyEmptyBlocks[0].blockNumber} está registrada sem Lotes ativos.` : `${legacyEmptyBlocks.length} Quadras estão registradas sem Lotes ativos.`} Revise a quantidade no construtor antes de tratar esta matriz como concluída.</span></p>}
                {!structureQuery.isLoading && activeSavedStructure.length === 0 && legacyEmptyBlocks.length === 0 && <div className="subdivision-studio__structure-chart-empty"><LandPlot size={18} /><span>Estruture a primeira Quadra abaixo. A prévia é montada somente com dados que você informar.</span></div>}
                {!structureQuery.isLoading && activeSavedStructure.length > 0 && <div className="subdivision-studio__structure-chart" role="img" aria-label={`Matriz com ${activeSavedStructure.length} Quadras e ${savedLotCount} Lotes em estruturação`}>
                  {activeSavedStructure.map((block) => <div className="subdivision-studio__structure-chart-column" key={block.blockId}><div className="subdivision-studio__structure-chart-value">{block.lotCount}</div><div className="subdivision-studio__structure-chart-bar" style={{ height: `${Math.max(8, Math.round((block.lotCount / Math.max(...activeSavedStructure.map((item) => item.lotCount), 1)) * 100))}%` }} /><b>Q{block.blockNumber}</b><span>{block.lotCount} L</span></div>)}
                </div>}
              </section>}

              {selectedDevelopmentId && <section className="subdivision-studio__reconciliation" data-pending={structuralReconciliationPending} aria-labelledby="structural-reconciliation-title">
                <div><span>RECONCILIAÇÃO ESTRUTURAL</span><h5 id="structural-reconciliation-title">Não inclua Lotes por estimativa.</h5><p>{structuralReconciliationPending ? "A matriz está protegida enquanto a divergência aguarda uma fonte física conciliada." : "Quando o total de referência e a fonte física não coincidirem, registre a revisão antes de alterar a matriz."}</p></div>
                <div className="subdivision-studio__reconciliation-status"><b>{structuralReconciliationPending ? "Revisão obrigatória" : "Sem revisão registrada"}</b><span>{structuralReconciliationPending ? "Nova fonte deve identificar cada par Quadra–Lote." : "A confirmação não cria nem completa Lotes automaticamente."}</span></div>
                <button type="button" onClick={() => upsertRequirementMutation.mutate({ ...context, developmentId: selectedDevelopmentId, requirementCode: "technical_layout", requirementState: "review_required", correlationId: crypto.randomUUID() })} disabled={!isWorkspaceReady || isBusy || requirementsQuery.isLoading || structuralReconciliationPending}>{structuralReconciliationPending ? "Pendência registrada" : "Registrar pendência de conciliação"}</button>
              </section>}

              {selectedDevelopmentId && <section className="subdivision-studio__physical-source" aria-labelledby="physical-source-title">
                <div className="subdivision-studio__physical-source-head"><div><span>FONTE FÍSICA LOCAL</span><h5 id="physical-source-title">Concilie a matriz antes de criar Quadras e Lotes.</h5><p>A planilha fica neste navegador. O sistema lê somente Quadra, Lote e Área; status, valores, vendas e dados pessoais são descartados.</p></div><TableProperties size={22} /></div>
                <div className="subdivision-studio__physical-source-controls"><label>Planilha estrutural <input ref={physicalSourceInput} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(event) => void loadPhysicalSource(event.target.files?.[0] ?? null)} disabled={!isWorkspaceReady || isBusy} /></label><label>Total de Lotes declarado <input type="number" min={1} max={2000} value={declaredLotTotal} onChange={(event) => { setDeclaredLotTotal(event.target.value); setPhysicalStructureConfirmed(false); }} placeholder="Confirme o total" disabled={!isWorkspaceReady || isBusy || !physicalSourcePreview} /></label></div>
                {physicalSourceError && <p className="subdivision-studio__structure-error" role="alert">{physicalSourceError}</p>}
                {physicalSourcePreview && <div className="subdivision-studio__physical-source-preview"><div className="subdivision-studio__physical-source-summary"><div><b>{physicalSourcePreview.blockCount}</b><span>Quadras lidas</span></div><div><b>{physicalSourcePreview.lotCount}</b><span>Lotes na fonte</span></div><div><b>{physicalSourcePreview.areaCoverageCount}</b><span>Áreas declaradas</span></div><div data-match={Number(declaredLotTotal) === physicalSourcePreview.lotCount}><b>{declaredLotTotal || "—"}</b><span>{Number(declaredLotTotal) === physicalSourcePreview.lotCount ? "Total conciliado" : "Total a conciliar"}</span></div></div><div className="subdivision-studio__physical-source-blocks">{physicalSourcePreview.blocks.map((block) => <span key={block.blockNumber}>Q{block.blockNumber} · {block.lots.length} Lotes</span>)}</div>{physicalSourcePreview.issues.length > 0 && <p className="subdivision-studio__structure-error" role="alert">A fonte apresenta {physicalSourcePreview.issues.length} inconsistência(s) estrutural(is). Corrija a planilha antes de aplicar.</p>}<label className="subdivision-studio__replacement-confirmation"><input type="checkbox" checked={physicalStructureConfirmed} onChange={(event) => setPhysicalStructureConfirmed(event.target.checked)} disabled={!isWorkspaceReady || isBusy || physicalSourcePreview.issues.length > 0 || Number(declaredLotTotal) !== physicalSourcePreview.lotCount} /><span><b>Confirmo a matriz física revisada.</b> A aplicação usa somente estes dados físicos e pode arquivar logicamente estruturas do cadastro em estruturação que não apareçam na fonte.</span></label><button type="button" onClick={applyPhysicalSource} disabled={!isWorkspaceReady || isBusy || !physicalStructureConfirmed || physicalSourcePreview.issues.length > 0 || Number(declaredLotTotal) !== physicalSourcePreview.lotCount}>{applyPhysicalStructureMutation.isPending ? "Aplicando matriz física" : "Aplicar matriz física revisada"}</button></div>}
                {physicalStructureQuery.isLoading && <p className="subdivision-studio__physical-source-status"><LoaderCircle className="subdivision-foundation-spinner" />Confirmando os atributos físicos autorizados.</p>}
                {physicalStructureQuery.data && physicalStructureQuery.data.length > 0 && <p className="subdivision-studio__physical-source-status"><CheckCircle2 size={16} />A matriz salva possui {physicalStructureQuery.data.reduce((total, block) => total + block.lots.length, 0)} Lote(s) físicos neste contexto.</p>}
              </section>}

              {selectedDevelopmentId && physicalLots.length > 0 && <section className="subdivision-lot-management" aria-labelledby="lot-management-title">
                <div className="subdivision-lot-management__head"><div><span>GESTÃO FÍSICA POR UNIDADE</span><h5 id="lot-management-title">Matriz detalhada por Quadra e Lote.</h5><p>Use os filtros para localizar um Lote e confira somente a sua estrutura física. Disponibilidade, preço aprovado, venda, contrato e financeiro ficam em setores próprios.</p></div><div className="subdivision-lot-management__head-mark"><Ruler size={20} /><span>Leitura física</span></div></div>
                <div className="subdivision-lot-management__metrics"><div><b>{physicalLots.length}</b><span>Lotes físicos</span></div><div><b>{lotsWithArea.length}</b><span>Área informada</span></div><div><b>{physicalLots.length - lotsWithArea.length}</b><span>Área sem fonte</span></div><div><b>{totalAreaSqm.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</b><span>m² na matriz</span></div></div>
                <section className="subdivision-lot-management__completeness" aria-labelledby="physical-completeness-title"><div className="subdivision-lot-management__completeness-head"><div><span>COMPLETUDE FÍSICA</span><h6 id="physical-completeness-title">O que a matriz já informa — e o que ainda precisa de fonte.</h6></div><b>{physicalCoverageComplete}/{physicalCoverage.length} atributo(s) completo(s)</b></div><div className="subdivision-lot-management__completeness-grid">{physicalCoverage.map((item) => { const pending = physicalLots.length - item.available; return <article key={item.key} data-complete={pending === 0}><span>{item.label}</span><b>{item.available}/{physicalLots.length}</b><small>{pending === 0 ? "Cobertura confirmada" : `${pending} pendência(s) de fonte`}</small></article>; })}</div><p>Campos pendentes continuam vazios até uma fonte física revisada ser aplicada. Esta leitura não preenche, estima nem modifica Lotes.</p></section>
                <div className="subdivision-lot-management__toolbar"><label className="subdivision-lot-management__search"><Search size={15} /><span className="sr-only">Buscar Lote por Quadra, número, tipologia ou posição</span><input value={lotSearch} onChange={(event) => setLotSearch(event.target.value)} placeholder="Buscar Q1, L15, esquina ou tipologia" /></label><label className="subdivision-lot-management__block-filter"><span>Filtrar Quadra</span><select value={lotBlockFilter} onChange={(event) => setLotBlockFilter(event.target.value)}><option value="all">Todas as Quadras</option>{activeSavedStructure.map((block) => <option key={block.blockId} value={String(block.blockNumber)}>Q{block.blockNumber}</option>)}</select></label><label className="subdivision-lot-management__block-filter"><span>Situação física</span><select value={lotPhysicalStatusFilter} onChange={(event) => setLotPhysicalStatusFilter(event.target.value as "all" | "pending" | "complete")}><option value="all">Todos os Lotes</option><option value="pending">Com pendência física</option><option value="complete">Completos na fonte</option></select></label></div>
                <p className="subdivision-lot-management__result-count" aria-live="polite"><b>{visibleLotCount}</b> {visibleLotCount === 1 ? "Lote encontrado" : "Lotes encontrados"} em <b>{visibleBlockCount}</b> {visibleBlockCount === 1 ? "Quadra" : "Quadras"}. A contagem reflete apenas os filtros locais de leitura.</p>
                <div className="subdivision-lot-management__list">{visibleLotBlocks.length === 0 ? <p className="subdivision-lot-management__empty">{emptyLotFilterMessage}</p> : visibleLotBlocks.map((block, index) => <details className="subdivision-lot-management__block" key={block.blockNumber} open={lotBlockFilter !== "all" || Boolean(lotSearch.trim()) || index === 0}><summary><div><span>QUADRA</span><h6>Q{block.blockNumber}</h6></div><dl><div><dt>Lotes exibidos</dt><dd>{block.lots.length}</dd></div><div><dt>Área física</dt><dd>{block.totalAreaSqm.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} m²</dd></div><div><dt>Lotes com pendência</dt><dd>{block.lotsWithPhysicalPending}</dd></div></dl><span className="subdivision-lot-management__toggle">Ver Lotes</span></summary><div className="subdivision-lot-management__lot-grid">{block.lots.map((lot) => <article className="subdivision-lot-management__lot" key={`${lot.blockNumber}-${lot.lotNumber}`}><div className="subdivision-lot-management__lot-head"><b>L{lot.lotNumber}</b><em>{lot.lotTypology === "standard" ? "Tipologia pendente" : lotTypologyLabels[lot.lotTypology] ?? "Não informada"}</em></div><dl><div><dt>Área</dt><dd>{typeof lot.areaSqm === "number" ? `${lot.areaSqm.toLocaleString("pt-BR")} m²` : "Pendente"}</dd></div><div><dt>Posição</dt><dd>{lotPositionLabels[lot.positionCode] ?? "Não informada"}</dd></div><div><dt>Frente</dt><dd>{typeof lot.frontageM === "number" ? `${lot.frontageM.toLocaleString("pt-BR")} m` : "Pendente"}</dd></div><div><dt>Profundidade</dt><dd>{typeof lot.depthM === "number" ? `${lot.depthM.toLocaleString("pt-BR")} m` : "Pendente"}</dd></div></dl></article>)}</div></details>)}</div>
              </section>}

              {selectedDevelopmentId && <section className="subdivision-lot-pricing" aria-labelledby="lot-pricing-title">
                <div className="subdivision-lot-pricing__head"><div><span>POLÍTICA DE PREÇO POR M² · PRÉVIA</span><h5 id="lot-pricing-title">Simule o valor-base sem misturar preço com a matriz física.</h5><p>Informe um preço por m² para leitura local. A prévia não grava, não aprova tabela, não altera Lotes e não cria proposta, reserva, contrato, cobrança ou financeiro.</p></div><Calculator size={22} /></div>
                <div className="subdivision-lot-pricing__governance" aria-label="Etapas da política de preço"><div><span>01</span><b>Preparar</b><small>Defina o preço/m² e o escopo.</small></div><div><span>02</span><b>Vigência</b><small>Registre período em regra formal.</small></div><div><span>03</span><b>Aprovar</b><small>Somente política aprovada orienta a operação.</small></div></div>
                <div className="subdivision-lot-pricing__form"><label>Preço por m² (BRL)<input type="number" min="0.0001" step="0.0001" value={pricePerSqmPreview} onChange={(event) => setPricePerSqmPreview(event.target.value)} placeholder="Ex.: 250,0000" inputMode="decimal" /></label><label>Aplicar a<select value={priceScopeBlock} onChange={(event) => setPriceScopeBlock(event.target.value)}><option value="all">Todas as Quadras físicas</option>{(physicalStructureQuery.data ?? []).map((block) => <option key={block.blockNumber} value={String(block.blockNumber)}>Somente Q{block.blockNumber}</option>)}</select></label><div className="subdivision-lot-pricing__result"><span>VALOR-BASE DA PRÉVIA</span><strong>{previewBaseTotal === null ? "Informe preço/m²" : previewPriceEligibleLots.length === 0 ? "Áreas pendentes" : previewBaseTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong><span>{previewPriceEligibleLots.length} Lote(s) com área física</span></div></div>
                <p className="subdivision-lot-pricing__note">Para registrar uma tabela real será necessária política formal com vigência, responsável e aprovação separada. Lotes sem área não recebem valor por estimativa.</p>
              </section>}

              {!selectedDevelopmentId && <div className="subdivision-studio__module-empty"><LandPlot size={19} /><p>Salve a identificação do loteamento para montar Quadras e Lotes. A estrutura sempre fica vinculada ao cadastro selecionado.</p></div>}

              {selectedDevelopmentId && <details className="subdivision-studio__matrix-editor" open={activeSavedStructure.length === 0}>
                <summary><div><span>REVISAR MATRIZ FÍSICA</span><b>{activeSavedStructure.length ? "Alterar Quadras e Lotes com confirmação" : "Montar a primeira matriz de Quadras e Lotes"}</b><small>{activeSavedStructure.length ? "A edição fica separada da leitura operacional e pode exigir confirmação de redução." : "Defina a composição física inicial por Quadra."}</small></div><span className="subdivision-studio__matrix-editor-toggle">Abrir edição</span></summary>
                <form className="subdivision-studio__structure-builder" onSubmit={applyStructure}>
                <div className="subdivision-studio__structure-builder-head"><div><span>QUADRAS E LOTES</span><h5>Monte a matriz do loteamento por Quadra.</h5><p>Inclua uma linha por Quadra e informe quantos Lotes ela possui. Exemplo: Q1 com 15 Lotes e Q2 com 25 Lotes.</p></div><div className="subdivision-studio__structure-totals"><b>{structureRows.length}</b><span>Quadras</span><b>{draftLotCount}</b><span>Lotes previstos</span></div></div>
                <div className="subdivision-studio__structure-actions"><button type="button" className="subdivision-studio__secondary" onClick={() => addStructureRows(1)} disabled={!isWorkspaceReady || isBusy || structureRows.length >= 50}><Plus size={15} />Adicionar Quadra</button><button type="button" className="subdivision-studio__secondary" onClick={() => addStructureRows(5)} disabled={!isWorkspaceReady || isBusy || structureRows.length >= 50}><Plus size={15} />Adicionar 5 Quadras</button>{structureRows.length === 0 && <button type="button" onClick={() => addStructureRows(1)} disabled={!isWorkspaceReady || isBusy}>Começar por Q1</button>}</div>
                {structureQuery.isLoading && <div className="subdivision-foundation-empty"><LoaderCircle className="subdivision-foundation-spinner" /><p>Carregando a estrutura autorizada do loteamento.</p></div>}
                {structureQuery.isError && <div className="subdivision-foundation-empty is-error"><ShieldAlert size={18} /><p>A estrutura não foi liberada neste contexto. Nenhuma Quadra ou Lote de outro loteamento é exibido.</p></div>}
                {!structureQuery.isLoading && !structureQuery.isError && structureRows.length > 0 && <div className="subdivision-studio__structure-grid" role="list" aria-label="Matriz de Quadras e Lotes"><div className="subdivision-studio__structure-grid-head"><span>Quadra</span><span>Quantidade de Lotes</span><span>Prévia gerada</span><span className="sr-only">Ação</span></div>{structureRows.map((row, index) => <div className="subdivision-studio__structure-row" role="listitem" key={`${row.blockNumber}-${index}`}><label><span className="sr-only">Número da Quadra {index + 1}</span><div className="subdivision-studio__number-input"><em>Q</em><input type="number" min={1} max={999} value={row.blockNumber} onChange={(event) => updateStructureRow(index, { blockNumber: Number(event.target.value) })} disabled={!isWorkspaceReady || isBusy} required /></div></label><label><span className="sr-only">Quantidade de Lotes da Quadra {row.blockNumber || index + 1}</span><div className="subdivision-studio__number-input"><em>L</em><input type="number" min={1} max={100} value={row.lotCount} onChange={(event) => updateStructureRow(index, { lotCount: Number(event.target.value) })} disabled={!isWorkspaceReady || isBusy} required /></div></label><p><b>Q{row.blockNumber || "?"}</b> · L1–L{row.lotCount || "?"}</p><button type="button" className="subdivision-studio__remove-row" onClick={() => removeStructureRow(index)} disabled={!isWorkspaceReady || isBusy}><Trash2 size={15} /><span className="sr-only">Remover Quadra {row.blockNumber}</span></button></div>)}</div>}
                {hasDuplicateBlockNumber && <p className="subdivision-studio__structure-error" role="alert">Cada Quadra precisa de numeração única. Corrija os números repetidos antes de aplicar.</p>}
                {structureWouldArchive && <label className="subdivision-studio__replacement-confirmation"><input type="checkbox" checked={replaceStructureConfirmed} onChange={(event) => setReplaceStructureConfirmed(event.target.checked)} disabled={!isWorkspaceReady || isBusy} /><span><b>Confirmo a revisão da redução estrutural.</b> Quadras removidas e Lotes acima da nova quantidade serão arquivados logicamente; não há exclusão física nem efeito em venda, contrato ou financeiro.</span></label>}
                <div className="subdivision-studio__structure-apply"><div><span>ESTRUTURA SALVA</span><b>{activeSavedStructure.length ? `${activeSavedStructure.length} Quadra(s) · ${savedLotCount} Lote(s)` : legacyEmptyBlocks.length ? "Inconsistência: Quadra sem Lotes ativos" : "Ainda não há Quadras salvas"}</b></div><button type="submit" disabled={!isWorkspaceReady || isBusy || structureRows.length === 0 || normalizedStructureRows.length !== structureRows.length || hasDuplicateBlockNumber || (structureWouldArchive && !replaceStructureConfirmed)}>{applyStructureMutation.isPending ? "Aplicando estrutura" : savedStructure.length ? "Aplicar revisão da estrutura" : "Criar Quadras e Lotes"}</button></div>
                {savedStructure.length > 0 && <div className="subdivision-studio__saved-structure"><div><span>QUADRAS REGISTRADAS</span><p>Quadras sem Lotes ativos exigem revisão. Use o arquivamento apenas para uma Quadra inteira; seus Lotes deste cadastro serão arquivados junto dela.</p></div><div>{savedStructure.map((block) => <article key={block.blockId} data-incomplete={block.lotCount < 1}><b>Q{block.blockNumber}</b><span>{block.lotCount > 0 ? `${block.lotCount} Lote(s)` : "Sem Lotes ativos · revisar"}</span><AlertDialog><AlertDialogTrigger asChild><button type="button" className="subdivision-studio__danger" disabled={isBusy}><Archive size={14} />Arquivar</button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Arquivar Q{block.blockNumber}?</AlertDialogTitle><AlertDialogDescription>Os Lotes vinculados a esta Quadra serão arquivados logicamente. O histórico é preservado; não há exclusão em cascata, venda, contrato ou efeito financeiro.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => archiveBlockMutation.mutate({ ...context, developmentId: selectedDevelopmentId, blockId: block.blockId, correlationId: crypto.randomUUID() })}>Arquivar Quadra</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></article>)}</div></div>}
                {archivedStructureQuery.data && archivedStructureQuery.data.length > 0 && <section className="subdivision-studio__saved-structure subdivision-studio__archived-structure" aria-labelledby="archived-blocks-title"><div><span>QUADRAS ARQUIVADAS</span><h5 id="archived-blocks-title">Clique por engano? Restaure sem refazer a matriz.</h5><p>A restauração reativa somente a Quadra e os Lotes arquivados junto dela neste cadastro. Ela não cria Lotes, preços, reservas, vendas ou contratos.</p></div><div>{archivedStructureQuery.data.map((block) => <article key={block.blockId}><b>Q{block.blockNumber}</b><span>{block.archivedLotCount} Lote(s) arquivado(s)</span><AlertDialog><AlertDialogTrigger asChild><button type="button" className="subdivision-studio__secondary" disabled={isBusy}><ArchiveRestore size={14} />Restaurar</button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Restaurar Q{block.blockNumber}?</AlertDialogTitle><AlertDialogDescription>A Quadra e os Lotes arquivados junto dela voltarão para este cadastro. A ação não cria Lotes e continua sujeita a MFA recente, contexto e alçada.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => restoreBlockMutation.mutate({ ...context, developmentId: selectedDevelopmentId, blockId: block.blockId, correlationId: crypto.randomUUID() })}>Restaurar Quadra</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></article>)}</div></section>}
                {selectedDevelopmentId && !archivedStructureQuery.isLoading && (archivedStructureQuery.data?.length ?? 0) === 0 && <section className="subdivision-studio__saved-structure subdivision-studio__archived-structure" aria-labelledby="archived-blocks-title"><div><span>QUADRAS ARQUIVADAS</span><h5 id="archived-blocks-title">Nenhuma Quadra arquivada neste cadastro.</h5><p>Se uma Quadra for arquivada por engano, ela aparecerá aqui com o botão Restaurar. O histórico é preservado e a restauração continua exigindo MFA recente.</p></div></section>}
                {activeSavedStructure.length > 0 && <a className="subdivision-studio__inventory-link" href="/estoque-lotes"><MapPinned size={16} /><span>Abrir Estoque/Mapa de Lotes</span><small>Revise a matriz Qn · Ln criada neste contexto.</small></a>}
                </form>
              </details>}
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
              <section className="subdivision-studio__requirements" aria-labelledby="requirements-title"><div><span>DOSSIÊ DE PENDÊNCIAS</span><h5 id="requirements-title">Etapas futuras não são presumidas como aprovadas.</h5><p>Registre somente o estado de trabalho. O dossiê não cria número de processo, órgão, matrícula, contrato ou aprovação automática.</p></div>{requirementsQuery.isLoading && <p className="subdivision-studio__physical-source-status"><LoaderCircle className="subdivision-foundation-spinner" />Carregando pendências autorizadas.</p>}<div className="subdivision-studio__requirements-grid">{requirementDefinitions.map(([code, label]) => { const selected = requirementsQuery.data?.find((requirement) => requirement.requirementCode === code)?.requirementState as RequirementState | undefined; const state = selected ?? "not_started"; return <label key={code}><span>{label}</span><select value={state} disabled={!isWorkspaceReady || isBusy || requirementsQuery.isLoading} onChange={(event) => upsertRequirementMutation.mutate({ ...context, developmentId: selectedDevelopmentId, requirementCode: code as RequirementCode, requirementState: event.target.value as RequirementState, correlationId: crypto.randomUUID() })}>{Object.entries(requirementStateLabels).map(([value, stateLabel]) => <option value={value} key={value}>{stateLabel}</option>)}</select></label>; })}</div></section>
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

            {activeModule === "lifecycle" && <div className="subdivision-studio__lifecycle-module"><div className="subdivision-studio__lifecycle-warning"><Archive size={20} /><div><p>ARQUIVAMENTO CONTROLADO</p><h5>Remova da lista ativa sem apagar a trilha de auditoria.</h5><span>O sistema bloqueia o arquivamento enquanto houver Quadras ativas e não exclui nenhuma estrutura em cascata.</span></div></div><AlertDialog><AlertDialogTrigger asChild><button type="button" className="subdivision-studio__archive-button" disabled={archiveMutation.isPending || isUploading}>Arquivar loteamento</button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Arquivar este cadastro em estruturação?</AlertDialogTitle><AlertDialogDescription>O cadastro sairá da lista ativa, as referências de anexos serão removidas logicamente e o histórico de auditoria será preservado. Esta ação exige MFA recente e falhará se existirem Quadras ativas.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => archiveMutation.mutate({ ...context, developmentId: selectedDevelopmentId, correlationId: crypto.randomUUID() })}>Arquivar cadastro</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div>}
          </section>
        </div>

        <aside className="subdivision-studio__overview" aria-label="Visão operacional do loteamento">
          <div className="subdivision-studio__overview-head"><span>VISÃO OPERACIONAL</span><CheckCircle2 size={18} /></div>
          <div className="subdivision-studio__overview-name"><strong>{mode === "create" ? form.displayName || "Novo loteamento" : selectedDevelopment?.displayName ?? selectedDevelopment?.internalReference}</strong><span>{form.internalReference || "Referência pendente"}</span></div>
          <div className="subdivision-studio__overview-grid">
            <div><span>IDENTIFICAÇÃO</span><b>{identificationDetailed ? "Dossiê-base preenchido" : identityReady ? "Base criada · completar" : "Em preenchimento"}</b></div>
            <div><span>ESTRUTURA</span><b>{activeSavedStructure.length ? `${activeSavedStructure.length} Q · ${savedLotCount} L` : legacyEmptyBlocks.length ? "Revisão de estrutura" : "Aguardando Quadras"}</b></div>
            <div><span>PREPARAÇÃO</span><b>{phaseLabels[form.workingPhase]}</b></div>
            <div><span>DOCUMENTOS</span><b>{selectedDevelopmentId ? `${activeAttachmentCount} privado(s)` : "Após criar"}</b></div>
          </div>
          <div className="subdivision-studio__overview-boundary"><ShieldAlert size={15} /><p>Este setor organiza somente estrutura física e pendências internas. Não contém preço, disponibilidade, venda, contrato, proposta, cobrança, pagamento ou repasse.</p></div>
        </aside>
      </div>
    </section>
  );
}
