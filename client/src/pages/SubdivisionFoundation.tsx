import DashboardLayout, { type DashboardAccessGate, type DashboardNavigationItem } from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { retainAuthorizedSelection } from "@/lib/contextSelectionReset";
import { isDomainContextReady } from "@/lib/domainFoundationUi";
import { validateSubdivisionBlockNumber } from "@/lib/subdivisionBlockNumberValidation";
import { validateSubdivisionReference } from "@/lib/subdivisionReferenceValidation";
import { initialAuthorizedSubdivisionContextId, resolveAuthorizedSubdivisionContext } from "@/lib/subdivisionContextSelection";
import { summarizeOpaqueCoBuyerAttachmentCoverage } from "@/lib/subdivisionCoBuyerCoverage";
import SubdivisionBuyerReadiness from "@/components/SubdivisionBuyerReadiness";
import SubdivisionPartnerGovernance from "@/components/SubdivisionPartnerGovernance";
import SubdivisionSaleDraftReadiness from "@/components/SubdivisionSaleDraftReadiness";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { attachmentIntentSelectionLabel, buyerClientSelectionLabel, saleDraftSelectionLabel } from "@/lib/subdivisionDraftSelection";
import { subdivisionPartyRoleSelectionLabel } from "@/lib/subdivisionPartyRoleSelection";
import { trpc } from "@/lib/trpc";
import { SubdivisionPreparationProfile } from "@/components/SubdivisionPreparationProfile";
import { SubdivisionDevelopmentStudio } from "@/components/SubdivisionDevelopmentStudio";
import { ReportExportActions } from "@/components/ReportExportActions";
import { crmNavigationItems } from "@/lib/crmNavigation";
import { Building2, CalendarClock, CircleAlert, Compass, FileStack, House, LandPlot, Layers3, LockKeyhole, Map, ShieldCheck, UsersRound, Workflow } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import "../subdivision-foundation.css";

type LoteadoraSector = "developments" | "clients" | "partners" | "sales" | "finance";

const sectorByPath: Record<string, LoteadoraSector> = {
  "/loteadora": "developments",
  "/loteadora/clientes": "clients",
  "/loteadora/socios-parceiros": "partners",
  "/loteadora/vendas": "sales",
  "/loteadora/financeiro": "finance",
};

const sectorPresentation: Record<LoteadoraSector, { index: string; title: string; description: string }> = {
  developments: { index: "Setor 01", title: "Cadastro de Loteamentos", description: "Estruture loteamentos e Quadras matriz antes de abrir qualquer inventário." },
  clients: { index: "Setor 03", title: "Clientes Loteadora", description: "Organize o cadastro-base do comprador e as intenções privadas de anexo sem duplicar dados." },
  partners: { index: "Setor 04", title: "Sócios e Parceiros", description: "Vincule papéis internos temporais por loteamento, sem participação econômica ou repasse." },
  sales: { index: "Setor 05", title: "Vendas de Lotes", description: "Prepare os vínculos internos entre lote e comprador sem reserva, contrato ou financeiro." },
  finance: { index: "Setor 06", title: "Financeiro", description: "Este setor permanece bloqueado até autorização explícita e revisão jurídica-contábil." },
};

const workingPhases = {
  preliminary_reference: "Referência preliminar",
  structuring: "Em estruturação",
  review_required: "Revisão necessária",
} as const;

const attachmentStates = {
  awaiting_private_upload: "Aguardando envio privado",
  private_upload_recorded: "Arquivo privado registrado",
} as const;

const saleDraftAttachmentCoverageStates = {
  no_attachment_intent: "Sem intenção de anexo",
  attachment_awaiting_private_upload: "Anexo privado aguardando envio",
  attachment_private_upload_recorded: "Anexo privado registrado",
} as const;

const saleDraftWorkPhases = {
  link_review: "Revisão do vínculo",
  attachment_review: "Revisão de cobertura",
  human_review: "Revisão humana",
} as const;

const subdivisionAccessGate: DashboardAccessGate = {
  eyebrow: "LOTEADORA RESTRITA · CONTEXTO ANTES DE LEITURA",
  title: "Acesse o cadastro-base de Loteadora somente no seu contexto autorizado.",
  description: "Esta área abre a referência interna de loteamentos em rascunho. A sessão é apenas o primeiro passo: membership, grant, vigência, finalidade e policy continuam sendo verificados pelo servidor antes de qualquer leitura ou mudança.",
  routeTitle: "Rota de acesso",
  routeDetail: "Autenticação → contexto → escopo vigente → policy",
  actionLabel: "Acessar área de Loteadora",
  footerLabel: "LEITURA PROTEGIDA",
  footerValue: "CONTEXTO · NÃO INFERÊNCIA",
  footerNote: "Nenhum loteamento ou referência de outro contexto é exposto antes da autorização.",
  railTop: "OPERAÇÃO",
  railBottom: "LOTEADORA",
};

export default function SubdivisionFoundation() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();
  const activeSector = sectorByPath[location] ?? "developments";
  const activeSectorPresentation = sectorPresentation[activeSector];
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [internalReference, setInternalReference] = useState("");
  const [internalReferenceError, setInternalReferenceError] = useState("");
  const [workingPhase, setWorkingPhase] = useState<keyof typeof workingPhases>("preliminary_reference");
  const [selectedDevelopmentId, setSelectedDevelopmentId] = useState("");
  const [blockNumber, setBlockNumber] = useState(1);
  const [blockNumberError, setBlockNumberError] = useState("");
  const [internalRoleDevelopmentId, setInternalRoleDevelopmentId] = useState("");
  const [internalRoleId, setInternalRoleId] = useState("");
  const [buyerClientRoleId, setBuyerClientRoleId] = useState("");
  const [buyerClientIdForAttachment, setBuyerClientIdForAttachment] = useState("");
  const [attachmentIntentIdForUpload, setAttachmentIntentIdForUpload] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [isAttachmentUploading, setIsAttachmentUploading] = useState(false);
  const [saleDevelopmentId, setSaleDevelopmentId] = useState("");
  const [saleBlockId, setSaleBlockId] = useState("");
  const [saleLotId, setSaleLotId] = useState("");
  const [saleBuyerClientId, setSaleBuyerClientId] = useState("");
  const [saleDraftIdForWorkState, setSaleDraftIdForWorkState] = useState("");
  const [saleDraftWorkPhase, setSaleDraftWorkPhase] = useState<keyof typeof saleDraftWorkPhases>("link_review");
  const [saleDraftIdForCoBuyer, setSaleDraftIdForCoBuyer] = useState("");
  const [coBuyerClientId, setCoBuyerClientId] = useState("");
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const authorizedContextsQuery = trpc.organizationContext.listAuthorizedForModule.useQuery({ module: "loteadora" }, { enabled: isAuthenticated, retry: false });
  const selectedOrganizationContext = resolveAuthorizedSubdivisionContext(selectedOrganizationId, authorizedContextsQuery.data);
  useEffect(() => {
    if (!selectedOrganizationId) setSelectedOrganizationId(initialAuthorizedSubdivisionContextId(authorizedContextsQuery.data));
  }, [selectedOrganizationId, authorizedContextsQuery.data]);
  useEffect(() => {
    if (blockNumberError) setBlockNumberError("");
  }, [blockNumber]);
  const context = useMemo(() => ({ organizationId: selectedOrganizationContext?.organizationId ?? "", module: "loteadora" as const, purposeCode: selectedOrganizationContext?.purposeCode ?? "" }), [selectedOrganizationContext]);
  const isContextReady = isDomainContextReady(context);
  const isWorkspaceReady = isAuthenticated && isContextReady;
  const developmentsQuery = trpc.subdivisionFoundation.listDraftDevelopments.useQuery(context, { enabled: isWorkspaceReady, retry: false });
  const blocksQueryInput = useMemo(() => ({ ...context, developmentId: selectedDevelopmentId }), [context, selectedDevelopmentId]);
  const blocksQuery = trpc.subdivisionFoundation.listDraftBlocks.useQuery(blocksQueryInput, { enabled: isWorkspaceReady && Boolean(selectedDevelopmentId), retry: false });
  const partyRolesQuery = trpc.domainFoundation.listDraftPartyRoles.useQuery(context, { enabled: isWorkspaceReady, retry: false });
  const internalPartyRolesQuery = trpc.subdivisionFoundation.listDraftInternalPartyRoles.useQuery(context, { enabled: isWorkspaceReady, retry: false });
  const buyerClientsQuery = trpc.subdivisionFoundation.listDraftBuyerClients.useQuery(context, { enabled: isWorkspaceReady, retry: false });
  const attachmentIntentsQuery = trpc.subdivisionFoundation.listBuyerAttachmentIntents.useQuery(context, { enabled: isWorkspaceReady, retry: false });
  const saleBlocksQueryInput = useMemo(() => ({ ...context, developmentId: saleDevelopmentId }), [context, saleDevelopmentId]);
  const saleBlocksQuery = trpc.subdivisionFoundation.listDraftBlocks.useQuery(saleBlocksQueryInput, { enabled: isWorkspaceReady && Boolean(saleDevelopmentId), retry: false });
  const saleLotsQueryInput = useMemo(() => ({ ...context, blockId: saleBlockId }), [context, saleBlockId]);
  const saleLotsQuery = trpc.subdivisionFoundation.listDraftLots.useQuery(saleLotsQueryInput, { enabled: isWorkspaceReady && Boolean(saleBlockId), retry: false });
  const saleDraftsQuery = trpc.subdivisionFoundation.listSaleDrafts.useQuery(context, { enabled: isWorkspaceReady, retry: false });
  const saleDraftAttachmentCoverageQuery = trpc.subdivisionFoundation.listSaleDraftAttachmentCoverage.useQuery(context, { enabled: isWorkspaceReady, retry: false });
  const saleDraftWorkStatesQuery = trpc.subdivisionFoundation.listSaleDraftWorkStates.useQuery(context, { enabled: isWorkspaceReady, retry: false });
  const saleDraftCoBuyersQuery = trpc.subdivisionFoundation.listSaleDraftCoBuyers.useQuery(context, { enabled: isWorkspaceReady, retry: false });
  const uploadableAttachmentIntents = attachmentIntentsQuery.data?.filter((intent) => intent.attachmentState === "awaiting_private_upload") ?? [];
  const eligibleInternalPartyRoles = partyRolesQuery.data?.filter((assignment) => ["shareholder", "partner", "land_contributor"].includes(assignment.role)) ?? [];
  const eligibleBuyerPartyRoles = partyRolesQuery.data?.filter((assignment) => ["client", "buyer"].includes(assignment.role)) ?? [];
  useEffect(() => {
    setSelectedDevelopmentId((value) => retainAuthorizedSelection(value, developmentsQuery.data, (development) => development.developmentId));
    setInternalRoleDevelopmentId((value) => retainAuthorizedSelection(value, developmentsQuery.data, (development) => development.developmentId));
    setSaleDevelopmentId((value) => retainAuthorizedSelection(value, developmentsQuery.data, (development) => development.developmentId));
  }, [developmentsQuery.data]);
  useEffect(() => {
    setInternalRoleId((value) => retainAuthorizedSelection(value, partyRolesQuery.data === undefined ? undefined : eligibleInternalPartyRoles, (assignment) => assignment.partyRoleAssignmentId));
    setBuyerClientRoleId((value) => retainAuthorizedSelection(value, partyRolesQuery.data === undefined ? undefined : eligibleBuyerPartyRoles, (assignment) => assignment.partyRoleAssignmentId));
  }, [eligibleBuyerPartyRoles, eligibleInternalPartyRoles, partyRolesQuery.data]);
  useEffect(() => {
    setBuyerClientIdForAttachment((value) => retainAuthorizedSelection(value, buyerClientsQuery.data, (client) => client.buyerClientId));
    setSaleBuyerClientId((value) => retainAuthorizedSelection(value, buyerClientsQuery.data, (client) => client.buyerClientId));
    setCoBuyerClientId((value) => retainAuthorizedSelection(value, buyerClientsQuery.data, (client) => client.buyerClientId));
  }, [buyerClientsQuery.data]);
  useEffect(() => {
    setAttachmentIntentIdForUpload((value) => retainAuthorizedSelection(value, attachmentIntentsQuery.data === undefined ? undefined : uploadableAttachmentIntents, (intent) => intent.attachmentIntentId));
  }, [attachmentIntentsQuery.data, uploadableAttachmentIntents]);
  useEffect(() => {
    setSaleBlockId((value) => saleDevelopmentId ? retainAuthorizedSelection(value, saleBlocksQuery.data, (block) => block.blockId) : "");
  }, [saleBlocksQuery.data, saleDevelopmentId]);
  useEffect(() => {
    setSaleLotId((value) => saleBlockId ? retainAuthorizedSelection(value, saleLotsQuery.data, (lot) => lot.lotId) : "");
  }, [saleBlockId, saleLotsQuery.data]);
  useEffect(() => {
    setSaleDraftIdForWorkState((value) => retainAuthorizedSelection(value, saleDraftsQuery.data, (draft) => draft.saleDraftId));
    setSaleDraftIdForCoBuyer((value) => retainAuthorizedSelection(value, saleDraftsQuery.data, (draft) => draft.saleDraftId));
  }, [saleDraftsQuery.data]);
  const utils = trpc.useUtils();
  const createMutation = trpc.subdivisionFoundation.createDraftDevelopment.useMutation({
    onSuccess() {
      setInternalReference(""); setWorkingPhase("preliminary_reference");
      toast.success("Loteamento em rascunho registrado", { description: "A referência é interna e não cria quadra, lote, estoque, parceiro, cliente, contrato, boleto ou financeiro." });
      void utils.subdivisionFoundation.listDraftDevelopments.invalidate(context);
    },
    onError() { toast.error("Loteamento não registrado", { description: "O servidor exige identidade, membership, grant, vigência e contexto autorizado, sem revelar registros externos." }); },
  });
  const createBlockMutation = trpc.subdivisionFoundation.createDraftBlock.useMutation({
    onSuccess() {
      setBlockNumber(1);
      toast.success("Quadra em rascunho registrada", { description: "A Quadra é apenas a matriz do loteamento: não cria lotes, mapa, estoque, cliente, parceiro, contrato ou financeiro." });
      void utils.subdivisionFoundation.listDraftBlocks.invalidate(blocksQueryInput);
    },
    onError() { toast.error("Quadra não registrada", { description: "O servidor exige o loteamento em rascunho no mesmo contexto autorizado, sem revelar registros externos." }); },
  });
  const linkInternalRoleMutation = trpc.subdivisionFoundation.linkDraftInternalPartyRole.useMutation({ onSuccess() { setInternalRoleId(""); toast.success("Papel interno vinculado", { description: "O vínculo é temporal e interno; não define percentual, valor, contrato, portal, cobrança ou repasse." }); }, onError() { toast.error("Papel não vinculado", { description: "O servidor exige Party, papel e loteamento em rascunho no mesmo contexto autorizado." }); } });
  const createBuyerClientMutation = trpc.subdivisionFoundation.createDraftBuyerClient.useMutation({ onSuccess() { setBuyerClientRoleId(""); toast.success("Cliente comprador em rascunho registrado", { description: "O vínculo não contém documentos, identificadores fiscais, lote vendido, contrato, boleto ou financeiro." }); void utils.subdivisionFoundation.listDraftBuyerClients.invalidate(context); }, onError() { toast.error("Cliente não registrado", { description: "O servidor exige papel temporal de cliente ou comprador no mesmo contexto autorizado." }); } });
  const createAttachmentIntentMutation = trpc.subdivisionFoundation.createBuyerAttachmentIntent.useMutation({ onSuccess() { setBuyerClientIdForAttachment(""); toast.success("Intenção privada registrada", { description: "Nenhum arquivo, URL, nome, tipo, conteúdo, download ou visualização foi aceito." }); void utils.subdivisionFoundation.listBuyerAttachmentIntents.invalidate(context); }, onError() { toast.error("Intenção não registrada", { description: "O servidor exige cliente comprador em rascunho no mesmo contexto autorizado." }); } });
  const createSaleDraftMutation = trpc.subdivisionFoundation.createSaleDraft.useMutation({ onSuccess() { setSaleLotId(""); setSaleBuyerClientId(""); toast.success("Rascunho interno de venda vinculado", { description: "O vínculo não reserva lote, não cria proposta, contrato, preço, cobrança ou efeito financeiro." }); void utils.subdivisionFoundation.listSaleDrafts.invalidate(context); }, onError() { toast.error("Rascunho não registrado", { description: "O servidor exige lote e cliente comprador do mesmo contexto autorizado, sem revelar registros externos." }); } });
  const updateSaleDraftWorkStateMutation = trpc.subdivisionFoundation.upsertSaleDraftWorkState.useMutation({ onSuccess() { setSaleDraftIdForWorkState(""); toast.success("Classificação interna atualizada", { description: "O estado organiza trabalho humano e não altera estoque, reserva, proposta, contrato, cobrança ou financeiro." }); void utils.subdivisionFoundation.listSaleDraftWorkStates.invalidate(context); }, onError() { toast.error("Classificação não registrada", { description: "O servidor exige o rascunho no mesmo contexto autorizado e não revela registros externos." }); } });
  const addSaleDraftCoBuyerMutation = trpc.subdivisionFoundation.addSaleDraftCoBuyer.useMutation({ onSuccess() { setSaleDraftIdForCoBuyer(""); setCoBuyerClientId(""); toast.success("Co-comprador interno vinculado", { description: "O vínculo não define titularidade, percentual, preço, reserva, contrato, cobrança ou financeiro." }); void utils.subdivisionFoundation.listSaleDraftCoBuyers.invalidate(context); }, onError() { toast.error("Co-comprador não vinculado", { description: "O servidor exige rascunho e cliente comprador distintos no mesmo contexto autorizado." }); } });

  function createDevelopment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateSubdivisionReference(internalReference);
    if (!validation.valid) { setInternalReferenceError(validation.message); return; }
    setInternalReferenceError("");
    createMutation.mutate({ ...context, correlationId: crypto.randomUUID(), internalReference: validation.value, workingPhase });
  }

  function createBlock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedDevelopmentId) return;
    const validation = validateSubdivisionBlockNumber(blockNumber);
    if (!validation.valid) {
      setBlockNumberError(validation.message);
      return;
    }
    setBlockNumberError("");
    createBlockMutation.mutate({ ...context, correlationId: crypto.randomUUID(), developmentId: selectedDevelopmentId, blockNumber: validation.value });
  }

  async function uploadPrivateAttachment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!attachmentFile || !attachmentIntentIdForUpload || isAttachmentUploading) return;
    if (attachmentFile.size < 1 || attachmentFile.size > 2 * 1024 * 1024 || !["application/pdf", "image/jpeg", "image/png"].includes(attachmentFile.type)) {
      toast.error("Arquivo não aceito", { description: "Escolha PDF, JPEG ou PNG de até 2 MB. A validação definitiva ocorre no servidor." });
      return;
    }

    setIsAttachmentUploading(true);
    try {
      const { data } = await getSupabaseBrowserClient()?.auth.getSession() ?? { data: { session: null } };
      if (!data.session?.access_token) throw new Error("SUPABASE_SESSION_REQUIRED");

      const form = new FormData();
      form.set("attachment", attachmentFile);
      form.set("organizationId", context.organizationId);
      form.set("purposeCode", context.purposeCode);
      form.set("correlationId", crypto.randomUUID());
      const response = await fetch(`/api/private/subdivision-buyer-attachments/${attachmentIntentIdForUpload}`, {
        method: "POST",
        credentials: "include",
        headers: { "X-Supabase-Access-Token": data.session.access_token },
        body: form,
      });
      if (!response.ok) throw new Error("PRIVATE_ATTACHMENT_REQUEST_REJECTED");

      setAttachmentFile(null);
      setAttachmentIntentIdForUpload("");
      if (attachmentInputRef.current) attachmentInputRef.current.value = "";
      toast.success("Anexo privado registrado", { description: "O sistema não retorna nome, URL, chave, conteúdo, download ou visualização do arquivo." });
      void utils.subdivisionFoundation.listBuyerAttachmentIntents.invalidate(context);
    } catch {
      toast.error("Anexo não registrado", { description: "O servidor exige sessão, MFA recente, identidade, contexto, intenção autorizada, tipo e tamanho válidos, sem revelar detalhes internos." });
    } finally {
      setIsAttachmentUploading(false);
    }
  }

  return (
    <DashboardLayout navigationItems={crmNavigationItems} navigationTitle="Núcleo CRM" accessGate={subdivisionAccessGate}>
      <main className="subdivision-foundation-page">
        <header className="subdivision-workspace-header">
          <div>
            <p className="subdivision-foundation-eyebrow">LOTEADORA · {activeSectorPresentation.index.toUpperCase()}</p>
            <h1>{activeSectorPresentation.title}</h1>
            <p>{activeSectorPresentation.description}</p>
          </div>
          <div className="subdivision-workspace-header__status"><ShieldCheck size={18} aria-hidden="true" /><span>Contexto e alçada<br /><b>confirmados pelo servidor</b></span></div>
        </header>

        <section className="subdivision-foundation-context" aria-labelledby="subdivision-context-title">
          <div className="subdivision-foundation-heading"><div><p className="subdivision-foundation-eyebrow">CONTEXTO DE TRABALHO</p><h2 id="subdivision-context-title">Acesso delimitado antes da leitura.</h2></div><p>Organização, módulo e finalidade acompanham cada chamada. A seleção não concede alçada: identidade, membership, grant, vigência e policy seguem verificados pelo servidor.</p></div>
          <div className="subdivision-foundation-context__fields"><label htmlFor="subdivision-organization"><Building2 size={14} /> Organização autorizada<select id="subdivision-organization" value={selectedOrganizationId} onChange={(event) => setSelectedOrganizationId(event.target.value)} disabled={!isAuthenticated || authorizedContextsQuery.isLoading}><option value="">{authorizedContextsQuery.isLoading ? "Carregando contextos autorizados" : "Selecione uma organização autorizada"}</option>{authorizedContextsQuery.data?.map((organization) => <option key={organization.organizationId} value={organization.organizationId}>{organization.organizationLabel}</option>)}</select></label><label htmlFor="subdivision-module"><LandPlot size={14} /> Módulo<input id="subdivision-module" value="Loteadora" readOnly aria-readonly="true" /></label><label htmlFor="subdivision-purpose"><ShieldCheck size={14} /> Finalidade<input id="subdivision-purpose" value={context.purposeCode || "—"} readOnly aria-readonly="true" /></label></div>
          <div className={`subdivision-foundation-context__status ${isContextReady ? "is-ready" : "is-blocked"}`}><CircleAlert size={16} /><span>{isContextReady ? "Contexto autorizado selecionado. O servidor ainda verificará identidade, membership, grant, vigência, módulo e finalidade antes de qualquer leitura ou rascunho." : authorizedContextsQuery.isError ? "O contexto não foi liberado. O sistema não revela organizações ou escopos externos." : "Selecione um contexto Loteadora devolvido pela política para liberar ações de rascunho."}</span></div>
        </section>

        <nav className="subdivision-sector-switcher" aria-label="Setores da coluna Loteadora">
          {crmNavigationItems.slice(2, 8).map((item, index) => item.disabled ? <span key={item.path} aria-disabled="true"><item.icon size={16} aria-hidden="true" /><b>{String(index + 1).padStart(2, "0")}</b>{item.label}<small>Bloqueado</small></span> : <a key={item.path} href={item.path} aria-current={item.path === location ? "page" : undefined}><item.icon size={16} aria-hidden="true" /><b>{String(index + 1).padStart(2, "0")}</b>{item.label}</a>)}
        </nav>

        {activeSector === "developments" && <>
          <SubdivisionDevelopmentStudio context={context} isContextReady={isContextReady} isWorkspaceReady={isWorkspaceReady} />
          <details className="subdivision-preparation-disclosure">
            <summary><span>Preparação operacional avançada</span><small>Planejamento, frentes de preparo e responsável interno</small></summary>
            <SubdivisionPreparationProfile
              context={context}
              isContextReady={isContextReady}
              isWorkspaceReady={isWorkspaceReady}
              developments={developmentsQuery.data}
              internalPartyRoles={internalPartyRolesQuery.data}
            />
          </details>
        </>}
        {activeSector === "partners" && <section id="subdivision-parties" className="subdivision-foundation-workspace" aria-labelledby="subdivision-role-title">
          <div className="subdivision-foundation-heading"><div><p className="subdivision-foundation-eyebrow">05 · PAPEL INTERNO TEMPORAL</p><h2 id="subdivision-role-title">Sócios, parceiros e cedentes começam sem participação econômica.</h2></div><p>Selecione um papel temporal retornado para este contexto Loteadora. Nenhum percentual, valor, recebível, login, portal, contrato, cobrança ou repasse é definido aqui.</p></div>
          <form className="subdivision-foundation-card" onSubmit={(event) => { event.preventDefault(); linkInternalRoleMutation.mutate({ ...context, correlationId: crypto.randomUUID(), developmentId: internalRoleDevelopmentId, partyRoleId: internalRoleId }); }}><label>Loteamento em rascunho<select value={internalRoleDevelopmentId} onChange={(event) => setInternalRoleDevelopmentId(event.target.value)} disabled={!isWorkspaceReady || developmentsQuery.isLoading}><option value="">{!isWorkspaceReady ? "Defina um contexto autorizado" : developmentsQuery.isLoading ? "Carregando loteamentos autorizados" : developmentsQuery.isError ? "Leitura de loteamentos não liberada" : developmentsQuery.data?.length ? "Selecione um loteamento autorizado" : "Nenhum loteamento em rascunho neste contexto"}</option>{developmentsQuery.data?.map((development) => <option key={development.developmentId} value={development.developmentId}>{development.internalReference}</option>)}</select></label><label htmlFor="subdivision-internal-role">Papel interno autorizado<select id="subdivision-internal-role" value={internalRoleId} onChange={(event) => setInternalRoleId(event.target.value)} disabled={!isWorkspaceReady || partyRolesQuery.isLoading} required><option value="">{!isWorkspaceReady ? "Defina um contexto autorizado" : partyRolesQuery.isLoading ? "Carregando papéis autorizados" : partyRolesQuery.isError ? "Leitura de papéis não liberada" : eligibleInternalPartyRoles.length ? "Selecione um sócio, parceiro ou cedente" : "Nenhum papel interno elegível neste contexto"}</option>{eligibleInternalPartyRoles.map((assignment) => <option key={assignment.partyRoleAssignmentId} value={assignment.partyRoleAssignmentId}>{subdivisionPartyRoleSelectionLabel(assignment)}</option>)}</select></label><p className="subdivision-foundation-card__note">O seletor não concede participação, valor, recebível ou acesso. O servidor confirma o contexto e a elegibilidade do papel no vínculo.</p><button type="submit" disabled={!isWorkspaceReady || !internalRoleDevelopmentId || !internalRoleId || linkInternalRoleMutation.isPending}>{linkInternalRoleMutation.isPending ? "Vinculando papel" : "Vincular papel interno"}</button></form>
          <SubdivisionPartnerGovernance contextReady={isContextReady} developmentId={internalRoleDevelopmentId} links={internalPartyRolesQuery.data} isLoading={internalPartyRolesQuery.isLoading || developmentsQuery.isLoading} isError={internalPartyRolesQuery.isError || developmentsQuery.isError} />
        </section>}
        {activeSector === "clients" && <>
        <ReportExportActions report={{ title: "Resumo de Clientes Loteadora", scopeLabel: "Clientes em rascunho do contexto selecionado", rows: [{ section: "Cadastro", indicator: "Clientes em rascunho", status: buyerClientsQuery.data ? `${buyerClientsQuery.data.length} registro(s) autorizado(s)` : "Leitura pendente ou bloqueada" }, { section: "Anexos", indicator: "Cobertura", status: "Estado privado e redigido" }, { section: "Segurança", indicator: "Contexto", status: isWorkspaceReady ? "Confirmado pelo servidor" : "Não selecionado" }] }} isAuthorized={isWorkspaceReady} description="Exporte um resumo redigido da prontidão de clientes; nomes, documentos e identificadores não são incluídos." />
        <section id="subdivision-buyers" className="subdivision-foundation-workspace" aria-labelledby="subdivision-buyer-title">
          <div className="subdivision-foundation-heading"><div><p className="subdivision-foundation-eyebrow">06 · CLIENTE COMPRADOR</p><h2 id="subdivision-buyer-title">O cadastro-base reutiliza Party e papel temporal.</h2></div><p>Selecione um papel temporal de cliente ou comprador retornado para o contexto Loteadora. Não há CPF/CNPJ, contato, documento, anexo, lote vendido, contrato, boleto ou valor.</p></div>
          <form className="subdivision-foundation-card" onSubmit={(event) => { event.preventDefault(); createBuyerClientMutation.mutate({ ...context, correlationId: crypto.randomUUID(), partyRoleAssignmentId: buyerClientRoleId }); }}><label htmlFor="subdivision-buyer-role">Cliente ou comprador autorizado<select id="subdivision-buyer-role" value={buyerClientRoleId} onChange={(event) => setBuyerClientRoleId(event.target.value)} disabled={!isWorkspaceReady || partyRolesQuery.isLoading} required><option value="">{!isWorkspaceReady ? "Defina um contexto autorizado" : partyRolesQuery.isLoading ? "Carregando clientes autorizados" : partyRolesQuery.isError ? "Leitura de papéis não liberada" : eligibleBuyerPartyRoles.length ? "Selecione um cliente ou comprador" : "Nenhum cliente ou comprador elegível neste contexto"}</option>{eligibleBuyerPartyRoles.map((assignment) => <option key={assignment.partyRoleAssignmentId} value={assignment.partyRoleAssignmentId}>{subdivisionPartyRoleSelectionLabel(assignment)}</option>)}</select></label><p className="subdivision-foundation-card__note">A seleção cria somente um cliente comprador em rascunho quando o servidor confirmar o papel e o contexto. Ela não cria venda, documento, contrato ou cobrança.</p><button type="submit" disabled={!isWorkspaceReady || !buyerClientRoleId || createBuyerClientMutation.isPending}>{createBuyerClientMutation.isPending ? "Registrando cliente" : "Registrar cliente em rascunho"}</button></form>
          {isWorkspaceReady && buyerClientsQuery.data?.length === 0 && <div className="subdivision-foundation-empty"><UsersRound size={18} /><p>Nenhum cliente comprador em rascunho foi devolvido para este contexto.</p></div>}
          {isWorkspaceReady && buyerClientsQuery.data && buyerClientsQuery.data.length > 0 && <div className="subdivision-foundation-list__rows">{buyerClientsQuery.data.map((client) => <article key={client.buyerClientId}><span>Cliente comprador em rascunho</span><h3>{buyerClientSelectionLabel(client, partyRolesQuery.data ?? [])}</h3><p>Criado em {new Date(client.createdAt).toLocaleString("pt-BR")}. Nenhum identificador técnico é exibido.</p></article>)}</div>}
        </section>
        <section className="subdivision-foundation-workspace" aria-labelledby="subdivision-attachment-title">
          <div className="subdivision-foundation-heading"><div><p className="subdivision-foundation-eyebrow">07 · ANEXO PRIVADO</p><h2 id="subdivision-attachment-title">A intenção privada condiciona o envio de um único anexo.</h2></div><p>O envio só avança com sessão, MFA recente, subject Supabase, contexto e intenção autorizada. Não há nome persistido, URL, chave, conteúdo, download ou visualização nesta tela.</p></div>
          <form className="subdivision-foundation-card" onSubmit={(event) => { event.preventDefault(); createAttachmentIntentMutation.mutate({ ...context, correlationId: crypto.randomUUID(), buyerClientId: buyerClientIdForAttachment }); }}><label htmlFor="subdivision-attachment-client">Cliente comprador em rascunho<select id="subdivision-attachment-client" value={buyerClientIdForAttachment} onChange={(event) => setBuyerClientIdForAttachment(event.target.value)} disabled={!isWorkspaceReady || buyerClientsQuery.isLoading} required><option value="">{!isWorkspaceReady ? "Defina um contexto autorizado" : buyerClientsQuery.isLoading ? "Carregando clientes autorizados" : buyerClientsQuery.isError ? "Leitura de clientes não liberada" : buyerClientsQuery.data?.length ? "Selecione um cliente autorizado" : "Nenhum cliente comprador neste contexto"}</option>{buyerClientsQuery.data?.map((client) => <option key={client.buyerClientId} value={client.buyerClientId}>{buyerClientSelectionLabel(client, partyRolesQuery.data ?? [])}</option>)}</select></label><button type="submit" disabled={!isWorkspaceReady || !buyerClientIdForAttachment || createAttachmentIntentMutation.isPending}>{createAttachmentIntentMutation.isPending ? "Registrando intenção" : "Registrar intenção privada"}</button></form>
          {isWorkspaceReady && attachmentIntentsQuery.data?.length === 0 && <div className="subdivision-foundation-empty"><FileStack size={18} /><p>Nenhuma intenção privada de anexo foi devolvida para este contexto.</p></div>}
          {isWorkspaceReady && attachmentIntentsQuery.data && attachmentIntentsQuery.data.length > 0 && <div className="subdivision-foundation-list__rows">{attachmentIntentsQuery.data.map((intent) => <article key={intent.attachmentIntentId}><span>Anexo privado</span><h3>{attachmentIntentSelectionLabel(intent, buyerClientsQuery.data ?? [], partyRolesQuery.data ?? [])}</h3><p><b>{attachmentStates[intent.attachmentState]}</b> · estado privado do ciclo, sem nome, chave, URL, tipo, tamanho, conteúdo, download ou visualização.</p></article>)}</div>}
          {isWorkspaceReady && uploadableAttachmentIntents.length > 0 && <form className="subdivision-foundation-card" onSubmit={uploadPrivateAttachment}><div className="subdivision-foundation-card__title"><FileStack size={19} /><h3>Enviar um anexo privado</h3></div><p>Selecione uma intenção autorizada e um único PDF, JPEG ou PNG de até 2 MB. Use somente informações permitidas pela política da sua organização.</p><label htmlFor="subdivision-attachment-intent">Intenção privada autorizada<select id="subdivision-attachment-intent" value={attachmentIntentIdForUpload} onChange={(event) => setAttachmentIntentIdForUpload(event.target.value)} disabled={isAttachmentUploading || attachmentIntentsQuery.isLoading} required><option value="">{attachmentIntentsQuery.isLoading ? "Carregando intenções autorizadas" : attachmentIntentsQuery.isError ? "Leitura de intenções não liberada" : "Selecione uma intenção"}</option>{uploadableAttachmentIntents.map((intent) => <option key={intent.attachmentIntentId} value={intent.attachmentIntentId}>{attachmentIntentSelectionLabel(intent, buyerClientsQuery.data ?? [], partyRolesQuery.data ?? [])}</option>)}</select></label><label htmlFor="subdivision-private-file">Arquivo local<input ref={attachmentInputRef} id="subdivision-private-file" type="file" accept="application/pdf,image/jpeg,image/png" onChange={(event) => setAttachmentFile(event.target.files?.[0] ?? null)} disabled={isAttachmentUploading} required /></label><p aria-live="polite">{attachmentFile ? "Arquivo selecionado localmente. O nome não é exibido nem persistido nesta tela." : "Nenhum arquivo selecionado."}</p><button type="submit" disabled={!attachmentIntentIdForUpload || !attachmentFile || isAttachmentUploading}>{isAttachmentUploading ? "Validando e enviando" : "Enviar anexo privado"}</button></form>}
        </section>
        <SubdivisionBuyerReadiness contextReady={isContextReady} clients={buyerClientsQuery.data} attachmentIntents={attachmentIntentsQuery.data} isLoading={buyerClientsQuery.isLoading || attachmentIntentsQuery.isLoading} isError={buyerClientsQuery.isError || attachmentIntentsQuery.isError} />
        </>}
        {activeSector === "sales" && <section id="subdivision-sales" className="subdivision-foundation-workspace" aria-labelledby="subdivision-sale-draft-title">
          <div className="subdivision-foundation-heading"><div><p className="subdivision-foundation-eyebrow">08 · RASCUNHO INTERNO DE VENDA</p><h2 id="subdivision-sale-draft-title">Lote e cliente comprador podem ser conectados sem mudar o inventário.</h2></div><p>Este registro organiza somente o próximo trabalho interno. Não é reserva, proposta, contrato, preço, cobrança, boleto, comissão, repasse ou financeiro.</p></div>
          <form className="subdivision-foundation-card" onSubmit={(event) => { event.preventDefault(); createSaleDraftMutation.mutate({ ...context, correlationId: crypto.randomUUID(), lotId: saleLotId, buyerClientId: saleBuyerClientId }); }}><label htmlFor="subdivision-sale-development">Loteamento em rascunho<select id="subdivision-sale-development" value={saleDevelopmentId} onChange={(event) => { setSaleDevelopmentId(event.target.value); setSaleBlockId(""); setSaleLotId(""); }} disabled={!isWorkspaceReady} required><option value="">Selecione um loteamento autorizado</option>{developmentsQuery.data?.map((development) => <option key={development.developmentId} value={development.developmentId}>{development.internalReference}</option>)}</select></label><label htmlFor="subdivision-sale-block">Quadra matriz<select id="subdivision-sale-block" value={saleBlockId} onChange={(event) => { setSaleBlockId(event.target.value); setSaleLotId(""); }} disabled={!isWorkspaceReady || !saleDevelopmentId} required><option value="">Selecione uma Quadra autorizada</option>{saleBlocksQuery.data?.map((block) => <option key={block.blockId} value={block.blockId}>Quadra {block.blockNumber}</option>)}</select></label><label htmlFor="subdivision-sale-lot">Lote em rascunho<select id="subdivision-sale-lot" value={saleLotId} onChange={(event) => setSaleLotId(event.target.value)} disabled={!isWorkspaceReady || !saleBlockId} required><option value="">Selecione um Lote autorizado</option>{saleLotsQuery.data?.map((lot) => <option key={lot.lotId} value={lot.lotId}>Lote {lot.lotNumber}</option>)}</select></label><label htmlFor="subdivision-sale-buyer">Cliente comprador em rascunho<select id="subdivision-sale-buyer" value={saleBuyerClientId} onChange={(event) => setSaleBuyerClientId(event.target.value)} disabled={!isWorkspaceReady || buyerClientsQuery.isLoading} required><option value="">{!isWorkspaceReady ? "Defina um contexto autorizado" : buyerClientsQuery.isLoading ? "Carregando clientes autorizados" : buyerClientsQuery.isError ? "Leitura de clientes não liberada" : buyerClientsQuery.data?.length ? "Selecione um cliente autorizado" : "Nenhum cliente comprador neste contexto"}</option>{buyerClientsQuery.data?.map((client) => <option key={client.buyerClientId} value={client.buyerClientId}>{buyerClientSelectionLabel(client, partyRolesQuery.data ?? [])}</option>)}</select></label><button type="submit" disabled={!isWorkspaceReady || !saleLotId || !saleBuyerClientId || createSaleDraftMutation.isPending}>{createSaleDraftMutation.isPending ? "Vinculando rascunho" : "Vincular rascunho interno"}</button></form>
          {isWorkspaceReady && saleDraftsQuery.data?.length === 0 && <div className="subdivision-foundation-empty"><Workflow size={18} /><p>Nenhum rascunho interno de venda foi devolvido para este contexto.</p></div>}
          {isWorkspaceReady && saleDraftsQuery.data && saleDraftsQuery.data.length > 0 && <div className="subdivision-foundation-list__rows">{saleDraftsQuery.data.map((draft) => { const coverage = saleDraftAttachmentCoverageQuery.data?.find((item) => item.saleDraftId === draft.saleDraftId); const workState = saleDraftWorkStatesQuery.data?.find((item) => item.saleDraftId === draft.saleDraftId); const coBuyerCount = saleDraftCoBuyersQuery.data?.filter((item) => item.saleDraftId === draft.saleDraftId).length ?? 0; const coBuyerCoverage = summarizeOpaqueCoBuyerAttachmentCoverage(draft.saleDraftId, saleDraftCoBuyersQuery.data ?? [], attachmentIntentsQuery.data ?? []); return <article key={draft.saleDraftId}><span>Rascunho interno de venda</span><h3>{saleDraftSelectionLabel(draft, buyerClientsQuery.data ?? [], partyRolesQuery.data ?? [])}</h3><p><b>{coverage ? saleDraftAttachmentCoverageStates[coverage.attachmentCoverageState] : "Cobertura de anexo não disponível"}</b> · estado opaco, sem documento, nome, URL, download ou visualização.</p><p><b>{workState ? saleDraftWorkPhases[workState.workPhase] : "Sem classificação interna"}</b> · organização de trabalho, sem efeito comercial.</p><p><b>{coBuyerCount} co-comprador(es) interno(s)</b> · sem titularidade, percentual, preço ou obrigação financeira.</p>{coBuyerCoverage.total > 0 && <p><b>Cobertura opaca dos co-compradores:</b> {coBuyerCoverage.recorded} com arquivo privado registrado, {coBuyerCoverage.awaitingUpload} aguardando envio e {coBuyerCoverage.withoutIntent} sem intenção de anexo. Nenhum documento ou metadado é exibido.</p>}<p>Criado em {new Date(draft.createdAt).toLocaleString("pt-BR")}. Sem reserva, proposta, contrato, cobrança ou financeiro.</p></article>; })}</div>}
          {isWorkspaceReady && saleDraftsQuery.data && saleDraftsQuery.data.length > 0 && <form className="subdivision-foundation-card" onSubmit={(event) => { event.preventDefault(); updateSaleDraftWorkStateMutation.mutate({ ...context, correlationId: crypto.randomUUID(), saleDraftId: saleDraftIdForWorkState, workPhase: saleDraftWorkPhase }); }}><div className="subdivision-foundation-card__title"><Workflow size={19} /><h3>Classificar trabalho interno</h3></div><p>Esta classificação é apenas organizacional e não cria reserva, proposta, contrato, preço, cobrança, boleto, comissão ou repasse.</p><label htmlFor="subdivision-sale-draft-work-item">Rascunho interno de venda<select id="subdivision-sale-draft-work-item" value={saleDraftIdForWorkState} onChange={(event) => setSaleDraftIdForWorkState(event.target.value)} disabled={updateSaleDraftWorkStateMutation.isPending} required><option value="">Selecione um rascunho autorizado</option>{saleDraftsQuery.data.map((draft) => <option key={draft.saleDraftId} value={draft.saleDraftId}>{saleDraftSelectionLabel(draft, buyerClientsQuery.data ?? [], partyRolesQuery.data ?? [])}</option>)}</select></label><label htmlFor="subdivision-sale-draft-work-phase">Classificação interna<select id="subdivision-sale-draft-work-phase" value={saleDraftWorkPhase} onChange={(event) => setSaleDraftWorkPhase(event.target.value as keyof typeof saleDraftWorkPhases)} disabled={updateSaleDraftWorkStateMutation.isPending}>{Object.entries(saleDraftWorkPhases).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button type="submit" disabled={!saleDraftIdForWorkState || updateSaleDraftWorkStateMutation.isPending}>{updateSaleDraftWorkStateMutation.isPending ? "Atualizando classificação" : "Registrar classificação interna"}</button></form>}
          {isWorkspaceReady && saleDraftsQuery.data && saleDraftsQuery.data.length > 0 && <form className="subdivision-foundation-card" onSubmit={(event) => { event.preventDefault(); addSaleDraftCoBuyerMutation.mutate({ ...context, correlationId: crypto.randomUUID(), saleDraftId: saleDraftIdForCoBuyer, buyerClientId: coBuyerClientId }); }}><div className="subdivision-foundation-card__title"><UsersRound size={19} /><h3>Vincular co-comprador interno</h3></div><p>Use somente para organizar participantes internos do rascunho. Não define proponente contratual, titularidade, percentual, preço, reserva ou obrigação financeira.</p><label htmlFor="subdivision-sale-draft-co-buyer-item">Rascunho interno de venda<select id="subdivision-sale-draft-co-buyer-item" value={saleDraftIdForCoBuyer} onChange={(event) => setSaleDraftIdForCoBuyer(event.target.value)} disabled={addSaleDraftCoBuyerMutation.isPending} required><option value="">Selecione um rascunho autorizado</option>{saleDraftsQuery.data.map((draft) => <option key={draft.saleDraftId} value={draft.saleDraftId}>{saleDraftSelectionLabel(draft, buyerClientsQuery.data ?? [], partyRolesQuery.data ?? [])}</option>)}</select></label><label htmlFor="subdivision-sale-draft-co-buyer-client">Cliente comprador em rascunho<select id="subdivision-sale-draft-co-buyer-client" value={coBuyerClientId} onChange={(event) => setCoBuyerClientId(event.target.value)} disabled={addSaleDraftCoBuyerMutation.isPending} required><option value="">Selecione um cliente autorizado</option>{buyerClientsQuery.data?.map((client) => <option key={client.buyerClientId} value={client.buyerClientId}>{buyerClientSelectionLabel(client, partyRolesQuery.data ?? [],)}</option>)}</select></label><button type="submit" disabled={!saleDraftIdForCoBuyer || !coBuyerClientId || addSaleDraftCoBuyerMutation.isPending}>{addSaleDraftCoBuyerMutation.isPending ? "Vinculando co-comprador" : "Vincular co-comprador interno"}</button></form>}
          <SubdivisionSaleDraftReadiness contextReady={isContextReady} drafts={saleDraftsQuery.data} coverages={saleDraftAttachmentCoverageQuery.data} workStates={saleDraftWorkStatesQuery.data} coBuyers={saleDraftCoBuyersQuery.data} isLoading={saleDraftsQuery.isLoading || saleDraftAttachmentCoverageQuery.isLoading || saleDraftWorkStatesQuery.isLoading || saleDraftCoBuyersQuery.isLoading} isError={saleDraftsQuery.isError || saleDraftAttachmentCoverageQuery.isError || saleDraftWorkStatesQuery.isError || saleDraftCoBuyersQuery.isError} />
        </section>}
        {activeSector === "finance" && <section className="subdivision-finance-locked" aria-labelledby="subdivision-finance-title">
          <LockKeyhole size={26} aria-hidden="true" />
          <div><p className="subdivision-foundation-eyebrow">SETOR BLOQUEADO</p><h2 id="subdivision-finance-title">Financeiro ainda não está liberado para desenvolvimento.</h2><p>Não há valores, percentuais, cálculos, parcelas, cobrança, pagamento, repasse, contrato ou integração externa nesta área. A próxima etapa só poderá começar com autorização explícita posterior e revisão jurídica-contábil.</p></div>
        </section>}
      </main>
    </DashboardLayout>
  );
}
