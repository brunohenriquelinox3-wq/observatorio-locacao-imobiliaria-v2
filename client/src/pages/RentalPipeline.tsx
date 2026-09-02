import DashboardLayout, { type DashboardAccessGate, type DashboardNavigationItem } from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { isDomainContextReady } from "@/lib/domainFoundationUi";
import { retainAuthorizedSelection } from "@/lib/contextSelectionReset";
import { initialAuthorizedSubdivisionContextId, resolveAuthorizedSubdivisionContext } from "@/lib/subdivisionContextSelection";
import { rentalAgendaSelectionLabel, rentalAssetSelectionLabel, rentalIntakeSelectionLabel, rentalPartySelectionLabel } from "@/lib/rentalContextSelection";
import { validateRentalAgendaInternalCode } from "@/lib/rentalAgendaInternalCodeValidation";
import { validateRentalSourceCode } from "@/lib/rentalSourceCodeValidation";
import { rentalOperationalValue } from "@/lib/rentalOperationalOverview";
import { trpc } from "@/lib/trpc";
import { CalendarClock, CircleAlert, ClipboardCheck, Compass, FileCheck2, House, Layers3, Link2, Search, ShieldCheck, Tag, UsersRound, Workflow } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import "../rental-pipeline.css";

const navigationItems: DashboardNavigationItem[] = [
  { icon: Compass, label: "Central de plataforma", path: "/administracao" },
  { icon: ShieldCheck, label: "Painel ADM", path: "/adm" },
  { icon: Layers3, label: "Loteadora", path: "/loteadora" },
  { icon: Workflow, label: "Vendas Urbanas", path: "/vendas-urbanas" },
  { icon: CalendarClock, label: "Locação", path: "/locacao" },
  { icon: UsersRound, label: "Núcleo de cadastros", path: "/cadastro-base" },
  { icon: House, label: "Ativos urbanos", path: "/ativos-urbanos" },
];

const journeys = {
  management_interest: "Interesse de administração",
  tenant_interest: "Interesse de locação",
} as const;

const stages = {
  intake: "Entrada",
  qualification: "Qualificação",
  agenda_pending: "Agenda pendente",
  scheduled: "Agendado",
  closed_lost: "Encerrado sem ganho",
} as const;

const agendaStates = {
  scheduled: "Agendado",
  rescheduled: "Reagendado",
  cancelled: "Cancelado",
  occurred: "Realizado",
  not_held: "Não realizado",
} as const;

const assetKinds = {
  apartment: "Apartamento",
  house: "Casa",
  kitnet: "Kitnet",
  commercial_unit: "Unidade comercial",
  urban_lot: "Lote urbano",
  building: "Edificação",
  other_urban_asset: "Outro ativo urbano",
} as const;

const occupancyTimings = {
  immediate: "Imediata",
  up_to_30_days: "Até 30 dias",
  flexible: "Flexível",
} as const;

const managementScopes = {
  full_administration_interest: "Interesse em administração completa",
  tenant_search_interest: "Interesse em busca de locatário",
  undecided: "Escopo ainda não definido",
} as const;

const agendaClassifications = {
  intake_review: "Revisão da entrada",
  context_preparation: "Preparação de contexto",
  internal_follow_up: "Acompanhamento interno",
} as const;

const rentalAccessGate: DashboardAccessGate = {
  eyebrow: "LOCAÇÃO RESTRITA · CONTEXTO ANTES DE LEITURA",
  title: "Acesse a triagem de Locação somente dentro do seu contexto autorizado.",
  description: "A área trabalha com entradas de administração e de locatário em rascunho. A sessão é apenas o primeiro passo: membership, grant, vigência, finalidade e policy continuam sendo verificados pelo servidor antes de qualquer leitura ou mudança.",
  routeTitle: "Rota de acesso",
  routeDetail: "Autenticação → contexto → escopo vigente → policy",
  actionLabel: "Acessar área de Locação",
  footerLabel: "LEITURA PROTEGIDA",
  footerValue: "CONTEXTO · NÃO INFERÊNCIA",
  footerNote: "Nenhuma entrada ou dado de outro contexto é exposto antes da autorização.",
  railTop: "OPERAÇÃO",
  railBottom: "LOCAÇÃO",
};

function toIsoDate(value: string): string {
  return new Date(value).toISOString();
}

export default function RentalPipeline() {
  const { isAuthenticated } = useAuth();
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [partyId, setPartyId] = useState("");
  const [journeyKind, setJourneyKind] = useState<keyof typeof journeys>("management_interest");
  const [sourceCode, setSourceCode] = useState("");
  const [stageIntakeId, setStageIntakeId] = useState("");
  const [nextStage, setNextStage] = useState<keyof typeof stages>("qualification");
  const [stageReasonCode, setStageReasonCode] = useState("");
  const [agendaIntakeId, setAgendaIntakeId] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [agendaState, setAgendaState] = useState<keyof typeof agendaStates>("scheduled");
  const [agendaReasonCode, setAgendaReasonCode] = useState("");
  const [managementIntakeId, setManagementIntakeId] = useState("");
  const [managementAssetId, setManagementAssetId] = useState("");
  const [tenantProfileIntakeId, setTenantProfileIntakeId] = useState("");
  const [acceptedAssetKinds, setAcceptedAssetKinds] = useState<(keyof typeof assetKinds)[]>(["apartment"]);
  const [occupancyTiming, setOccupancyTiming] = useState<keyof typeof occupancyTimings>("immediate");
  const [preferenceCode, setPreferenceCode] = useState("");
  const [managementScopeIntakeId, setManagementScopeIntakeId] = useState("");
  const [declaredScope, setDeclaredScope] = useState<keyof typeof managementScopes>("undecided");
  const [managementNoteCode, setManagementNoteCode] = useState("");
  const [classificationAgendaId, setClassificationAgendaId] = useState("");
  const [agendaClassification, setAgendaClassification] = useState<keyof typeof agendaClassifications>("intake_review");
  const [agendaInternalCode, setAgendaInternalCode] = useState("");

  const authorizedContextsQuery = trpc.organizationContext.listAuthorizedForModule.useQuery({ module: "locacao" }, { enabled: isAuthenticated, retry: false });
  const selectedOrganizationContext = resolveAuthorizedSubdivisionContext(selectedOrganizationId, authorizedContextsQuery.data);
  useEffect(() => {
    if (selectedOrganizationId && !selectedOrganizationContext) setSelectedOrganizationId("");
    if (!selectedOrganizationId) setSelectedOrganizationId(initialAuthorizedSubdivisionContextId(authorizedContextsQuery.data));
  }, [selectedOrganizationId, selectedOrganizationContext, authorizedContextsQuery.data]);
  const context = useMemo(() => ({ organizationId: selectedOrganizationContext?.organizationId ?? "", module: "locacao" as const, purposeCode: selectedOrganizationContext?.purposeCode ?? "" }), [selectedOrganizationContext]);
  const isContextReady = isDomainContextReady(context);
  const isWorkspaceReady = isAuthenticated && isContextReady;
  const intakesQuery = trpc.rentalPipeline.listDraftIntakes.useQuery(context, { enabled: isWorkspaceReady, retry: false });
  const managementAssetLinksQuery = trpc.rentalPipeline.listDraftManagementAssetLinks.useQuery(context, { enabled: isWorkspaceReady, retry: false });
  const tenantSearchProfilesQuery = trpc.rentalPipeline.listDraftTenantSearchProfiles.useQuery(context, { enabled: isWorkspaceReady, retry: false });
  const managementDeclaredScopesQuery = trpc.rentalPipeline.listDraftManagementDeclaredScopes.useQuery(context, { enabled: isWorkspaceReady, retry: false });
  const agendaClassificationsQuery = trpc.rentalPipeline.listDraftAgendaClassifications.useQuery(context, { enabled: isWorkspaceReady, retry: false });
  const partiesQuery = trpc.domainFoundation.listDraftParties.useQuery(context, { enabled: isWorkspaceReady, retry: false });
  const assetsQuery = trpc.assetFoundation.listDraftUrbanAssets.useQuery(context, { enabled: isWorkspaceReady, retry: false });
  const agendasQuery = trpc.rentalPipeline.listDraftAgendas.useQuery(context, { enabled: isWorkspaceReady, retry: false });
  useEffect(() => {
    setPartyId((value) => retainAuthorizedSelection(value, partiesQuery.data, (party) => party.partyId));
    setStageIntakeId((value) => retainAuthorizedSelection(value, intakesQuery.data, (intake) => intake.intakeId));
    setAgendaIntakeId((value) => retainAuthorizedSelection(value, intakesQuery.data, (intake) => intake.intakeId));
    setTenantProfileIntakeId((value) => retainAuthorizedSelection(value, intakesQuery.data?.filter((intake) => intake.journeyKind === "tenant_interest"), (intake) => intake.intakeId));
    setManagementIntakeId((value) => retainAuthorizedSelection(value, intakesQuery.data?.filter((intake) => intake.journeyKind === "management_interest"), (intake) => intake.intakeId));
    setManagementScopeIntakeId((value) => retainAuthorizedSelection(value, intakesQuery.data?.filter((intake) => intake.journeyKind === "management_interest"), (intake) => intake.intakeId));
    setManagementAssetId((value) => retainAuthorizedSelection(value, assetsQuery.data, (asset) => asset.assetId));
    setClassificationAgendaId((value) => retainAuthorizedSelection(value, agendasQuery.data?.filter((agenda) => ["scheduled", "rescheduled"].includes(agenda.state)), (agenda) => agenda.agendaId));
  }, [agendasQuery.data, assetsQuery.data, intakesQuery.data, partiesQuery.data]);
  const operationalSectors = [
    { code: "01", title: "Triagem Inicial", value: rentalOperationalValue({ contextReady: isWorkspaceReady, loading: intakesQuery.isLoading, count: intakesQuery.data?.length, pendingLabel: "Aguardando leitura" }), description: "Separe interesse de administração e de locação antes de qualquer contratação.", target: "#rental-triage" },
    { code: "02", title: "Agenda Interna", value: rentalOperationalValue({ contextReady: isWorkspaceReady, loading: agendaClassificationsQuery.isLoading, count: agendaClassificationsQuery.data?.length, pendingLabel: "Aguardando leitura" }), description: "Registros internos não disparam contato, convite ou confirmação externa.", target: "#rental-triage" },
    { code: "03", title: "Perfil de Busca", value: rentalOperationalValue({ contextReady: isWorkspaceReady, loading: tenantSearchProfilesQuery.isLoading, count: tenantSearchProfilesQuery.data?.length, pendingLabel: "Aguardando leitura" }), description: "Preferências de locatário em código não recomendam imóvel automaticamente.", target: "#rental-search" },
    { code: "04", title: "Ativos em Gestão", value: rentalOperationalValue({ contextReady: isWorkspaceReady, loading: managementAssetLinksQuery.isLoading, count: managementAssetLinksQuery.data?.length, pendingLabel: "Aguardando leitura" }), description: "O vínculo de gestão não prova mandato, exclusividade ou disponibilidade.", target: "#rental-assets" },
    { code: "05", title: "Escopo Declarado", value: rentalOperationalValue({ contextReady: isWorkspaceReady, loading: managementDeclaredScopesQuery.isLoading, count: managementDeclaredScopesQuery.data?.length, pendingLabel: "Aguardando leitura" }), description: "A intenção de serviço continua distinta de mandato, contrato ou cobrança.", target: "#rental-scope" },
  ];
  const utils = trpc.useUtils();

  const createMutation = trpc.rentalPipeline.createDraftIntake.useMutation({
    onSuccess() {
      setPartyId(""); setSourceCode("");
      toast.success("Entrada de Locação criada em rascunho", { description: "A jornada permanece separada e não cria contrato, garantia, cobrança, repasse, publicação ou comunicação." });
      void utils.rentalPipeline.listDraftIntakes.invalidate(context);
    },
    onError() { toast.error("Entrada não criada", { description: "O servidor exige identidade, grant ativo, contexto e campos válidos sem revelar registros externos." }); },
  });
  const stageMutation = trpc.rentalPipeline.transitionDraftIntake.useMutation({
    onSuccess() {
      setStageIntakeId(""); setStageReasonCode("");
      toast.success("Etapa atualizada", { description: "A mudança é interna ao rascunho e não aprova cadastro, proposta, contrato ou locação." });
      void utils.rentalPipeline.listDraftIntakes.invalidate(context);
    },
    onError() { toast.error("Etapa não atualizada", { description: "A transição foi bloqueada por contexto, identidade, grant, sequência, motivo ou policy." }); },
  });
  const agendaMutation = trpc.rentalPipeline.createDraftAgenda.useMutation({
    onSuccess() {
      setAgendaIntakeId(""); setScheduledFor(""); setAgendaReasonCode("");
      toast.success("Agenda interna registrada", { description: "O registro não cria convite, integração de calendário, comunicação ou efeito contratual." });
      void utils.rentalPipeline.listDraftIntakes.invalidate(context);
      void utils.rentalPipeline.listDraftAgendas.invalidate(context);
    },
    onError() { toast.error("Agenda não registrada", { description: "O servidor exige um rascunho autorizado, contexto válido e justificativa quando aplicável." }); },
  });
  const managementAssetLinkMutation = trpc.rentalPipeline.linkDraftManagementAsset.useMutation({
    onSuccess() {
      setManagementIntakeId(""); setManagementAssetId("");
      toast.success("Ativo vinculado ao interesse de administração", { description: "O vínculo é interno e não prova propriedade, mandato, disponibilidade, exclusividade, contrato ou autorização de anúncio." });
      void utils.rentalPipeline.listDraftManagementAssetLinks.invalidate(context);
    },
    onError() { toast.error("Ativo não vinculado", { description: "O servidor exige uma entrada de administração, ativo em rascunho no módulo Locação e contexto autorizado." }); },
  });
  const tenantSearchProfileMutation = trpc.rentalPipeline.upsertDraftTenantSearchProfile.useMutation({
    onSuccess() {
      setTenantProfileIntakeId(""); setAcceptedAssetKinds(["apartment"]); setOccupancyTiming("immediate"); setPreferenceCode("");
      toast.success("Perfil de busca registrado", { description: "O perfil é interno e não sugere imóvel, preço, proposta, visita, análise, garantia ou contrato." });
      void utils.rentalPipeline.listDraftTenantSearchProfiles.invalidate(context);
    },
    onError() { toast.error("Perfil não registrado", { description: "O servidor exige uma entrada de locatário, contexto autorizado e preferências codificadas dentro do limite permitido." }); },
  });
  const managementDeclaredScopeMutation = trpc.rentalPipeline.upsertDraftManagementDeclaredScope.useMutation({
    onSuccess() {
      setManagementScopeIntakeId(""); setDeclaredScope("undecided"); setManagementNoteCode("");
      toast.success("Escopo declarado registrado", { description: "A informação é uma intenção de triagem, sem comprovar mandato, contrato, disponibilidade, preço, cobrança ou repasse." });
      void utils.rentalPipeline.listDraftManagementDeclaredScopes.invalidate(context);
    },
    onError() { toast.error("Escopo não registrado", { description: "O servidor exige uma entrada de administração e contexto autorizado, sem revelar registros externos." }); },
  });
  const agendaClassificationMutation = trpc.rentalPipeline.upsertDraftAgendaClassification.useMutation({
    onSuccess() {
      setClassificationAgendaId(""); setAgendaClassification("intake_review"); setAgendaInternalCode("");
      toast.success("Classificação interna registrada", { description: "A classificação não dispara comunicação, não confirma visita e não integra calendário externo." });
      void utils.rentalPipeline.listDraftAgendaClassifications.invalidate(context);
    },
    onError() { toast.error("Classificação não registrada", { description: "O servidor exige agenda autorizada em rascunho, contexto válido e finalidade codificada." }); },
  });

  function createIntake(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateRentalSourceCode(sourceCode);
    if (!validation.valid) { toast.error("Origem em código inválida", { description: validation.message }); return; }
    createMutation.mutate({ ...context, correlationId: crypto.randomUUID(), partyId: partyId.trim(), journeyKind, sourceCode: validation.value });
  }
  function changeStage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    stageMutation.mutate({ ...context, correlationId: crypto.randomUUID(), intakeId: stageIntakeId.trim(), nextStage, reasonCode: nextStage === "closed_lost" ? stageReasonCode.trim().toUpperCase() : undefined });
  }
  function createAgenda(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!scheduledFor) return;
    agendaMutation.mutate({ ...context, correlationId: crypto.randomUUID(), intakeId: agendaIntakeId.trim(), scheduledFor: toIsoDate(scheduledFor), state: agendaState, reasonCode: ["cancelled", "not_held"].includes(agendaState) ? agendaReasonCode.trim().toUpperCase() : undefined });
  }
  function linkManagementAsset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    managementAssetLinkMutation.mutate({ ...context, correlationId: crypto.randomUUID(), intakeId: managementIntakeId.trim(), assetId: managementAssetId.trim() });
  }
  function toggleAssetKind(kind: keyof typeof assetKinds) {
    setAcceptedAssetKinds((current) => {
      if (current.includes(kind)) return current.length === 1 ? current : current.filter((entry) => entry !== kind);
      return current.length === 4 ? current : [...current, kind];
    });
  }
  function upsertTenantSearchProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    tenantSearchProfileMutation.mutate({ ...context, correlationId: crypto.randomUUID(), intakeId: tenantProfileIntakeId.trim(), acceptedAssetKinds, occupancyTiming, preferenceCode: preferenceCode.trim().toUpperCase() });
  }
  function upsertManagementDeclaredScope(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    managementDeclaredScopeMutation.mutate({ ...context, correlationId: crypto.randomUUID(), intakeId: managementScopeIntakeId.trim(), declaredScope, internalNoteCode: managementNoteCode.trim() || undefined });
  }
  function upsertAgendaClassification(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateRentalAgendaInternalCode(agendaInternalCode);
    if (!validation.valid) { toast.error("Código interno inválido", { description: validation.message }); return; }
    agendaClassificationMutation.mutate({ ...context, correlationId: crypto.randomUUID(), agendaId: classificationAgendaId.trim(), classification: agendaClassification, internalCode: validation.value });
  }

  return (
    <DashboardLayout navigationItems={navigationItems} navigationTitle="Núcleo CRM" accessGate={rentalAccessGate}>
      <main className="rental-pipeline-page">
        <header className="rental-pipeline-hero">
          <div>
            <p className="rental-pipeline-eyebrow">LOCAÇÃO · ENTRADA ANTES DE QUALQUER CONTRATAÇÃO</p>
            <h1>Separe o interesse de administrar do interesse de alugar.</h1>
            <p>Este primeiro corte registra uma Party existente, origem, jornada, preferências codificadas, vínculos internos e agenda classificada. A interface mantém contexto e qualificação explícitos para reduzir ambiguidade operacional.</p>
          </div>
          <div className="rental-pipeline-hero__rule"><ShieldCheck size={18} /><span>Rascunho contextual<br /><b>sem contrato, garantia ou financeiro</b></span></div>
        </header>

        <section className="rental-pipeline-overview" aria-labelledby="rental-overview-title"><div className="rental-pipeline-overview__heading"><div><p className="rental-pipeline-eyebrow">PAINEL LOCAÇÃO · VISÃO DE TRABALHO</p><h2 id="rental-overview-title">Duas jornadas, uma operação organizada e nenhum compromisso antecipado.</h2></div><p>Os indicadores usam somente leituras devolvidas pelo contexto autorizado. Estados vazios não representam imóveis, contratos ou pessoas e não revelam atividade externa.</p></div><nav className="rental-pipeline-overview__grid" aria-label="Setores operacionais de Locação">{operationalSectors.map((sector) => <a key={sector.code} href={sector.target}><span>{sector.code}</span><strong>{sector.title}</strong><b>{sector.value}</b><small>{sector.description}</small><em>Ver setor</em></a>)}</nav></section>

        <section className="rental-pipeline-context" aria-labelledby="rental-context-title">
          <div className="rental-pipeline-heading"><div><p className="rental-pipeline-eyebrow">01 · CONTEXTO</p><h2 id="rental-context-title">A Locação não herda permissões de outra área.</h2></div><p>Organização, módulo e finalidade são enviados ao servidor a cada operação. O módulo é fixo em Locação, mas a autorização continua dependente de identidade, membership, grant e vigência.</p></div>
          <div className="rental-pipeline-context__fields">
            <label htmlFor="rental-organization"><ShieldCheck size={14} /> Organização autorizada<select id="rental-organization" value={selectedOrganizationId} onChange={(event) => setSelectedOrganizationId(event.target.value)} disabled={!isAuthenticated || authorizedContextsQuery.isLoading}><option value="">{authorizedContextsQuery.isLoading ? "Carregando contextos autorizados" : "Selecione uma organização autorizada"}</option>{authorizedContextsQuery.data?.map((organization) => <option key={organization.organizationId} value={organization.organizationId}>{organization.organizationLabel}</option>)}</select></label>
            <label htmlFor="rental-module"><House size={14} /> Módulo<input id="rental-module" value="Locação" readOnly aria-readonly="true" /></label>
            <label htmlFor="rental-purpose"><ShieldCheck size={14} /> Finalidade<input id="rental-purpose" value={context.purposeCode || "—"} readOnly aria-readonly="true" /></label>
          </div>
          <div className={`rental-pipeline-context__status ${isContextReady ? "is-ready" : "is-blocked"}`}><CircleAlert size={16} /><span>{isContextReady ? "Contexto autorizado selecionado. O servidor ainda confirmará identidade, membership, grant, vigência, módulo e finalidade antes de qualquer leitura ou rascunho." : authorizedContextsQuery.isError ? "O contexto não foi liberado. A interface não revela organizações ou escopos externos." : "Selecione um contexto autorizado para liberar as ações de rascunho."}</span></div>
        </section>

        <section id="rental-triage" className="rental-pipeline-workspace" aria-labelledby="rental-workspace-title">
          <div className="rental-pipeline-heading"><div><p className="rental-pipeline-eyebrow">02 · TRIAGEM INTERNA</p><h2 id="rental-workspace-title">Entrada, etapa e agenda formam um registro de trabalho mínimo.</h2></div><p>Não há dados de contato, endereço detalhado, análise de crédito, garantia, documentos, contratos, boletos, cobranças, repasses, portais ou integrações de calendário.</p></div>
          <div className="rental-pipeline-grid">
            <form className="rental-pipeline-card" onSubmit={createIntake}>
              <div className="rental-pipeline-card__title"><ClipboardCheck size={19} /><h3>Nova entrada em rascunho</h3></div><p>Vincule uma Party canônica já criada à jornada correta e uma origem interna codificada.</p>
              <label htmlFor="rental-party-id">Party autorizada<select id="rental-party-id" value={partyId} onChange={(event) => setPartyId(event.target.value)} disabled={!isWorkspaceReady || partiesQuery.isLoading} required><option value="">{!isWorkspaceReady ? "Defina um contexto autorizado" : partiesQuery.isLoading ? "Carregando Parties autorizadas" : partiesQuery.isError ? "Leitura de Parties não liberada" : partiesQuery.data?.length ? "Selecione uma Party autorizada" : "Nenhuma Party em rascunho neste contexto"}</option>{partiesQuery.data?.map((party) => <option key={party.partyId} value={party.partyId}>{rentalPartySelectionLabel(party)}</option>)}</select></label>
              <label htmlFor="rental-journey">Jornada</label><select id="rental-journey" value={journeyKind} onChange={(event) => setJourneyKind(event.target.value as keyof typeof journeys)} disabled={!isWorkspaceReady}>{Object.entries(journeys).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              <label htmlFor="rental-source">Origem em código</label><input id="rental-source" value={sourceCode} onChange={(event) => setSourceCode(event.target.value.toUpperCase())} placeholder="EX.: OPERADOR" disabled={!isWorkspaceReady} required minLength={3} maxLength={80} />
              <button type="submit" disabled={!isWorkspaceReady || !partyId || createMutation.isPending}>{createMutation.isPending ? "Criando rascunho" : "Criar entrada"}</button>
            </form>
            <form className="rental-pipeline-card" onSubmit={changeStage}>
              <div className="rental-pipeline-card__title"><Workflow size={19} /><h3>Atualizar etapa</h3></div><p>Use a transição explícita para a triagem interna. Encerramento sem ganho exige motivo em código.</p>
              <label htmlFor="rental-stage-intake">Entrada autorizada<select id="rental-stage-intake" value={stageIntakeId} onChange={(event) => setStageIntakeId(event.target.value)} disabled={!isWorkspaceReady || intakesQuery.isLoading} required><option value="">{!isWorkspaceReady ? "Defina um contexto autorizado" : intakesQuery.isLoading ? "Carregando entradas autorizadas" : intakesQuery.isError ? "Leitura de entradas não liberada" : intakesQuery.data?.length ? "Selecione uma entrada autorizada" : "Nenhuma entrada em rascunho neste contexto"}</option>{intakesQuery.data?.map((intake) => <option key={intake.intakeId} value={intake.intakeId}>{rentalIntakeSelectionLabel(intake)}</option>)}</select></label>
              <label htmlFor="rental-next-stage">Próxima etapa</label><select id="rental-next-stage" value={nextStage} onChange={(event) => setNextStage(event.target.value as keyof typeof stages)} disabled={!isWorkspaceReady}>{Object.entries(stages).filter(([value]) => value !== "intake").map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              {nextStage === "closed_lost" && <><label htmlFor="rental-stage-reason">Motivo em código</label><input id="rental-stage-reason" value={stageReasonCode} onChange={(event) => setStageReasonCode(event.target.value.toUpperCase())} placeholder="EX.: DESISTENCIA" disabled={!isWorkspaceReady} required minLength={3} maxLength={80} /></>}
              <button type="submit" disabled={!isWorkspaceReady || !stageIntakeId || stageMutation.isPending}>{stageMutation.isPending ? "Atualizando etapa" : "Atualizar etapa"}</button>
            </form>
            <form className="rental-pipeline-card" onSubmit={createAgenda}>
              <div className="rental-pipeline-card__title"><CalendarClock size={19} /><h3>Agenda interna</h3></div><p>Registre apenas o próximo compromisso operacional. O dado não dispara contato nem sincroniza calendários.</p>
              <label htmlFor="rental-agenda-intake">Entrada autorizada<select id="rental-agenda-intake" value={agendaIntakeId} onChange={(event) => setAgendaIntakeId(event.target.value)} disabled={!isWorkspaceReady || intakesQuery.isLoading} required><option value="">{!isWorkspaceReady ? "Defina um contexto autorizado" : intakesQuery.isLoading ? "Carregando entradas autorizadas" : intakesQuery.isError ? "Leitura de entradas não liberada" : intakesQuery.data?.length ? "Selecione uma entrada autorizada" : "Nenhuma entrada em rascunho neste contexto"}</option>{intakesQuery.data?.map((intake) => <option key={intake.intakeId} value={intake.intakeId}>{rentalIntakeSelectionLabel(intake)}</option>)}</select></label>
              <label htmlFor="rental-scheduled-for">Data e hora</label><input id="rental-scheduled-for" type="datetime-local" value={scheduledFor} onChange={(event) => setScheduledFor(event.target.value)} disabled={!isWorkspaceReady} required />
              <label htmlFor="rental-agenda-state">Estado</label><select id="rental-agenda-state" value={agendaState} onChange={(event) => setAgendaState(event.target.value as keyof typeof agendaStates)} disabled={!isWorkspaceReady}>{Object.entries(agendaStates).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              {["cancelled", "not_held"].includes(agendaState) && <><label htmlFor="rental-agenda-reason">Motivo em código</label><input id="rental-agenda-reason" value={agendaReasonCode} onChange={(event) => setAgendaReasonCode(event.target.value.toUpperCase())} placeholder="EX.: REMARCACAO_SOLICITADA" disabled={!isWorkspaceReady} required minLength={3} maxLength={80} /></>}
              <button type="submit" disabled={!isWorkspaceReady || !agendaIntakeId || agendaMutation.isPending}>{agendaMutation.isPending ? "Registrando agenda" : "Registrar agenda"}</button>
            </form>
          </div>
        </section>

        <section id="rental-search" className="rental-pipeline-search" aria-labelledby="rental-tenant-search-title">
          <div className="rental-pipeline-heading"><div><p className="rental-pipeline-eyebrow">02B · PERFIL DE BUSCA</p><h2 id="rental-tenant-search-title">Estruture a busca somente para interesse de locatário.</h2></div><p>O perfil registra tipos de ativo, janela declarada de ocupação e código operacional. Ele não usa endereço, CEP, geolocalização, preço, renda, contato, documento, análise ou garantia.</p></div>
          <div className="rental-pipeline-search__grid">
            <form className="rental-pipeline-card rental-pipeline-search__card" onSubmit={upsertTenantSearchProfile}>
              <div className="rental-pipeline-card__title"><Search size={19} /><h3>Perfil interno de busca</h3></div><p>Use uma entrada de locatário já em rascunho. O servidor nega interesse de administração, listas vazias e mais de quatro tipos.</p>
              <label htmlFor="rental-tenant-profile-intake">Entrada de locatário autorizada<select id="rental-tenant-profile-intake" value={tenantProfileIntakeId} onChange={(event) => setTenantProfileIntakeId(event.target.value)} disabled={!isWorkspaceReady || intakesQuery.isLoading} required><option value="">{!isWorkspaceReady ? "Defina um contexto autorizado" : intakesQuery.isLoading ? "Carregando entradas autorizadas" : intakesQuery.isError ? "Leitura de entradas não liberada" : intakesQuery.data?.some((intake) => intake.journeyKind === "tenant_interest") ? "Selecione uma entrada autorizada" : "Nenhuma entrada de locatário neste contexto"}</option>{intakesQuery.data?.filter((intake) => intake.journeyKind === "tenant_interest").map((intake) => <option key={intake.intakeId} value={intake.intakeId}>{rentalIntakeSelectionLabel(intake)}</option>)}</select></label>
              <fieldset><legend>Tipos de ativo aceitos</legend><div className="rental-pipeline-search__choices">{Object.entries(assetKinds).map(([value, label]) => <label key={value} className="rental-pipeline-search__choice"><input type="checkbox" checked={acceptedAssetKinds.includes(value as keyof typeof assetKinds)} onChange={() => toggleAssetKind(value as keyof typeof assetKinds)} disabled={!isWorkspaceReady} />{label}</label>)}</div></fieldset>
              <label htmlFor="rental-occupancy-timing">Janela declarada</label><select id="rental-occupancy-timing" value={occupancyTiming} onChange={(event) => setOccupancyTiming(event.target.value as keyof typeof occupancyTimings)} disabled={!isWorkspaceReady}>{Object.entries(occupancyTimings).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              <label htmlFor="rental-preference-code">Preferência em código</label><input id="rental-preference-code" value={preferenceCode} onChange={(event) => setPreferenceCode(event.target.value.toUpperCase())} placeholder="EX.: MORADIA_URBANA" disabled={!isWorkspaceReady} required minLength={3} maxLength={80} />
              <button type="submit" disabled={!isWorkspaceReady || !tenantProfileIntakeId || tenantSearchProfileMutation.isPending}>{tenantSearchProfileMutation.isPending ? "Registrando perfil" : "Registrar perfil de busca"}</button>
            </form>
            <aside className="rental-pipeline-search__limits" aria-label="Limites do perfil de busca"><ShieldCheck size={19} /><div><h3>Não é recomendação</h3><p>O corte não procura imóveis, não ranqueia opções, não cria visita, não propõe valores nem produz decisão automática. Ele organiza uma intenção de busca declarada.</p></div></aside>
          </div>
          {!isContextReady && <div className="rental-pipeline-empty"><CircleAlert size={18} /><p>Sem contexto não há consulta nem indicação de perfil de busca.</p></div>}
          {isContextReady && !isAuthenticated && <div className="rental-pipeline-empty"><ShieldCheck size={18} /><p>O perfil e a leitura permanecem bloqueados até haver sessão autenticada.</p></div>}
          {isWorkspaceReady && tenantSearchProfilesQuery.isLoading && <div className="rental-pipeline-empty"><span className="rental-pipeline-spinner" aria-hidden="true" /><p>Confirmando o contexto antes de solicitar a leitura minimizada dos perfis.</p></div>}
          {isWorkspaceReady && tenantSearchProfilesQuery.isError && <div className="rental-pipeline-empty is-error"><CircleAlert size={18} /><p>A leitura dos perfis não foi liberada. Revise identidade, membership, grant, vigência e contexto sem tentar inferir buscas externas.</p></div>}
          {isWorkspaceReady && tenantSearchProfilesQuery.data?.length === 0 && <div className="rental-pipeline-empty"><Search size={18} /><p>Nenhum perfil foi devolvido para este contexto. A resposta não revela outros interesses ou preferências.</p></div>}
          {isWorkspaceReady && tenantSearchProfilesQuery.data && tenantSearchProfilesQuery.data.length > 0 && <div className="rental-pipeline-list__rows">{tenantSearchProfilesQuery.data.map((profile) => <article key={profile.profileId}><span>Perfil de locatário</span><h3>{profile.preferenceCode}</h3><p><b>{occupancyTimings[profile.occupancyTiming]}</b> · {profile.acceptedAssetKinds.map((kind) => assetKinds[kind]).join(", ")} · registro interno em {new Date(profile.createdAt).toLocaleString("pt-BR")}</p></article>)}</div>}
        </section>

        <section id="rental-assets" className="rental-pipeline-link" aria-labelledby="rental-management-asset-title">
          <div className="rental-pipeline-heading"><div><p className="rental-pipeline-eyebrow">02A · ATIVO DECLARADO</p><h2 id="rental-management-asset-title">Vincule um ativo somente ao interesse de administração.</h2></div><p>O servidor nega a jornada de locatário e exige que o ativo esteja em rascunho para Locação. O vínculo não torna o imóvel disponível nem confirma qualquer direito.</p></div>
          <div className="rental-pipeline-link__grid">
            <form className="rental-pipeline-card" onSubmit={linkManagementAsset}>
              <div className="rental-pipeline-card__title"><Link2 size={19} /><h3>Vínculo interno de ativo</h3></div><p>Selecione referências já autorizadas no mesmo contexto. A relação é uma referência de triagem, não uma autorização comercial.</p>
              <label htmlFor="rental-management-intake">Entrada de administração autorizada<select id="rental-management-intake" value={managementIntakeId} onChange={(event) => setManagementIntakeId(event.target.value)} disabled={!isWorkspaceReady || intakesQuery.isLoading} required><option value="">{!isWorkspaceReady ? "Defina um contexto autorizado" : intakesQuery.isLoading ? "Carregando entradas autorizadas" : intakesQuery.isError ? "Leitura de entradas não liberada" : intakesQuery.data?.some((intake) => intake.journeyKind === "management_interest") ? "Selecione uma entrada autorizada" : "Nenhuma entrada de administração neste contexto"}</option>{intakesQuery.data?.filter((intake) => intake.journeyKind === "management_interest").map((intake) => <option key={intake.intakeId} value={intake.intakeId}>{rentalIntakeSelectionLabel(intake)}</option>)}</select></label>
              <label htmlFor="rental-management-asset">Ativo urbano autorizado<select id="rental-management-asset" value={managementAssetId} onChange={(event) => setManagementAssetId(event.target.value)} disabled={!isWorkspaceReady || assetsQuery.isLoading} required><option value="">{!isWorkspaceReady ? "Defina um contexto autorizado" : assetsQuery.isLoading ? "Carregando ativos autorizados" : assetsQuery.isError ? "Leitura de ativos não liberada" : assetsQuery.data?.length ? "Selecione um ativo autorizado" : "Nenhum ativo em rascunho neste contexto"}</option>{assetsQuery.data?.map((asset) => <option key={asset.assetId} value={asset.assetId}>{rentalAssetSelectionLabel(asset)}</option>)}</select></label>
              <button type="submit" disabled={!isWorkspaceReady || !managementIntakeId || !managementAssetId || managementAssetLinkMutation.isPending}>{managementAssetLinkMutation.isPending ? "Vinculando ativo" : "Vincular ativo em rascunho"}</button>
            </form>
            <aside className="rental-pipeline-link__limits" aria-label="Limites do vínculo de ativo"><ShieldCheck size={19} /><div><h3>Limites preservados</h3><p>Sem disponibilidade, exclusividade, endereço detalhado, preço, mídia, matrícula, publicação, proposta, reserva, contrato, garantia, cobrança, repasse ou financeiro.</p></div></aside>
          </div>
          {!isContextReady && <div className="rental-pipeline-empty"><CircleAlert size={18} /><p>Sem contexto não há consulta nem indicação de vínculo de ativo.</p></div>}
          {isContextReady && !isAuthenticated && <div className="rental-pipeline-empty"><ShieldCheck size={18} /><p>O vínculo e a leitura permanecem bloqueados até haver sessão autenticada.</p></div>}
          {isWorkspaceReady && managementAssetLinksQuery.isLoading && <div className="rental-pipeline-empty"><span className="rental-pipeline-spinner" aria-hidden="true" /><p>Confirmando o contexto antes de solicitar a leitura minimizada dos vínculos.</p></div>}
          {isWorkspaceReady && managementAssetLinksQuery.isError && <div className="rental-pipeline-empty is-error"><CircleAlert size={18} /><p>A leitura dos vínculos não foi liberada. Revise identidade, membership, grant, vigência e contexto sem tentar inferir ativos externos.</p></div>}
          {isWorkspaceReady && managementAssetLinksQuery.data?.length === 0 && <div className="rental-pipeline-empty"><Link2 size={18} /><p>Nenhum vínculo de ativo foi devolvido para este contexto. A resposta não revela ativos de outros contextos.</p></div>}
          {isWorkspaceReady && managementAssetLinksQuery.data && managementAssetLinksQuery.data.length > 0 && <div className="rental-pipeline-list__rows">{managementAssetLinksQuery.data.map((link) => <article key={link.linkId}><span>Ativo em rascunho</span><h3>{link.assetReferenceLabel}</h3><p><b>{link.assetKind}</b> · código {link.assetInternalReference} · vínculo interno em {new Date(link.linkedAt).toLocaleString("pt-BR")}</p></article>)}</div>}
        </section>

        <section id="rental-scope" className="rental-pipeline-scope" aria-labelledby="rental-management-scope-title">
          <div className="rental-pipeline-heading"><div><p className="rental-pipeline-eyebrow">02C · ESCOPO DECLARADO</p><h2 id="rental-management-scope-title">Registre a intenção de serviço, não uma autorização.</h2></div><p>O escopo pertence apenas à entrada de administração e funciona como referência para revisão humana. Ele não estabelece mandato, exclusividade, gestão, anúncio, disponibilidade, preço ou cobrança.</p></div>
          <div className="rental-pipeline-scope__grid">
            <form className="rental-pipeline-card rental-pipeline-scope__card" onSubmit={upsertManagementDeclaredScope}>
              <div className="rental-pipeline-card__title"><FileCheck2 size={19} /><h3>Declaração interna de escopo</h3></div><p>Use uma entrada de administração em rascunho. As opções são controladas e o código opcional não aceita narrativa livre.</p>
              <label htmlFor="rental-management-scope-intake">Entrada de administração autorizada<select id="rental-management-scope-intake" value={managementScopeIntakeId} onChange={(event) => setManagementScopeIntakeId(event.target.value)} disabled={!isWorkspaceReady || intakesQuery.isLoading} required><option value="">{!isWorkspaceReady ? "Defina um contexto autorizado" : intakesQuery.isLoading ? "Carregando entradas autorizadas" : intakesQuery.isError ? "Leitura de entradas não liberada" : intakesQuery.data?.some((intake) => intake.journeyKind === "management_interest") ? "Selecione uma entrada autorizada" : "Nenhuma entrada de administração neste contexto"}</option>{intakesQuery.data?.filter((intake) => intake.journeyKind === "management_interest").map((intake) => <option key={intake.intakeId} value={intake.intakeId}>{rentalIntakeSelectionLabel(intake)}</option>)}</select></label>
              <label htmlFor="rental-declared-scope">Escopo declarado</label><select id="rental-declared-scope" value={declaredScope} onChange={(event) => setDeclaredScope(event.target.value as keyof typeof managementScopes)} disabled={!isWorkspaceReady}>{Object.entries(managementScopes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              <label htmlFor="rental-management-note-code">Código interno opcional</label><input id="rental-management-note-code" value={managementNoteCode} onChange={(event) => setManagementNoteCode(event.target.value.toUpperCase())} placeholder="EX.: EM_REVISAO" disabled={!isWorkspaceReady} minLength={3} maxLength={80} />
              <button type="submit" disabled={!isWorkspaceReady || !managementScopeIntakeId || managementDeclaredScopeMutation.isPending}>{managementDeclaredScopeMutation.isPending ? "Registrando escopo" : "Registrar escopo declarado"}</button>
            </form>
            <aside className="rental-pipeline-scope__limits" aria-label="Limites do escopo declarado"><ShieldCheck size={19} /><div><h3>Sem efeito operacional</h3><p>A declaração não aprova administração, não atribui poderes, não publica ativo, não cria valor, não gera contrato e não inicia nenhuma movimentação financeira.</p></div></aside>
          </div>
          {!isContextReady && <div className="rental-pipeline-empty"><CircleAlert size={18} /><p>Sem contexto não há consulta nem indicação de escopo declarado.</p></div>}
          {isContextReady && !isAuthenticated && <div className="rental-pipeline-empty"><ShieldCheck size={18} /><p>O escopo e a leitura permanecem bloqueados até haver sessão autenticada.</p></div>}
          {isWorkspaceReady && managementDeclaredScopesQuery.isLoading && <div className="rental-pipeline-empty"><span className="rental-pipeline-spinner" aria-hidden="true" /><p>Confirmando o contexto antes de solicitar a leitura minimizada dos escopos.</p></div>}
          {isWorkspaceReady && managementDeclaredScopesQuery.isError && <div className="rental-pipeline-empty is-error"><CircleAlert size={18} /><p>A leitura dos escopos não foi liberada. Revise identidade, membership, grant, vigência e contexto sem tentar inferir entradas externas.</p></div>}
          {isWorkspaceReady && managementDeclaredScopesQuery.data?.length === 0 && <div className="rental-pipeline-empty"><FileCheck2 size={18} /><p>Nenhum escopo declarado foi devolvido para este contexto. A resposta não revela outras entradas ou intenções.</p></div>}
          {isWorkspaceReady && managementDeclaredScopesQuery.data && managementDeclaredScopesQuery.data.length > 0 && <div className="rental-pipeline-list__rows">{managementDeclaredScopesQuery.data.map((scope) => <article key={scope.scopeId}><span>Escopo de administração</span><h3>{managementScopes[scope.declaredScope]}</h3><p><b>{scope.internalNotePresent ? "Código interno informado" : "Sem código interno"}</b> · atualizado em {new Date(scope.updatedAt).toLocaleString("pt-BR")}</p></article>)}</div>}
        </section>

        <section className="rental-pipeline-scope" aria-labelledby="rental-agenda-classification-title">
          <div className="rental-pipeline-heading"><div><p className="rental-pipeline-eyebrow">02D · AGENDA INTERNA</p><h2 id="rental-agenda-classification-title">Classifique a finalidade, não uma ação externa.</h2></div><p>A agenda só pode receber uma finalidade interna enquanto ela e sua entrada estiverem em rascunho. Não há convite, mensagem, confirmação de visita ou sincronização de calendário.</p></div>
          <div className="rental-pipeline-scope__grid">
            <form className="rental-pipeline-card rental-pipeline-scope__card" onSubmit={upsertAgendaClassification}>
              <div className="rental-pipeline-card__title"><Tag size={19} /><h3>Finalidade interna</h3></div><p>Use uma agenda agendada ou reagendada já criada no mesmo contexto. O código opcional é estruturado e não aceita narrativa livre.</p>
              <label htmlFor="rental-classification-agenda">Agenda interna autorizada<select id="rental-classification-agenda" value={classificationAgendaId} onChange={(event) => setClassificationAgendaId(event.target.value)} disabled={!isWorkspaceReady || agendasQuery.isLoading} required><option value="">{!isWorkspaceReady ? "Defina um contexto autorizado" : agendasQuery.isLoading ? "Carregando agendas autorizadas" : agendasQuery.isError ? "Leitura de agendas não liberada" : agendasQuery.data?.some((agenda) => ["scheduled", "rescheduled"].includes(agenda.state)) ? "Selecione uma agenda autorizada" : "Nenhuma agenda classificável neste contexto"}</option>{agendasQuery.data?.filter((agenda) => ["scheduled", "rescheduled"].includes(agenda.state)).map((agenda) => <option key={agenda.agendaId} value={agenda.agendaId}>{rentalAgendaSelectionLabel(agenda)}</option>)}</select></label>
              <label htmlFor="rental-agenda-classification">Finalidade</label><select id="rental-agenda-classification" value={agendaClassification} onChange={(event) => setAgendaClassification(event.target.value as keyof typeof agendaClassifications)} disabled={!isWorkspaceReady}>{Object.entries(agendaClassifications).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              <label htmlFor="rental-agenda-internal-code">Código interno opcional</label><input id="rental-agenda-internal-code" value={agendaInternalCode} onChange={(event) => setAgendaInternalCode(event.target.value.toUpperCase())} placeholder="EX.: EM_REVISAO" disabled={!isWorkspaceReady} minLength={3} maxLength={80} />
              <button type="submit" disabled={!isWorkspaceReady || !classificationAgendaId || agendaClassificationMutation.isPending}>{agendaClassificationMutation.isPending ? "Classificando agenda" : "Registrar finalidade interna"}</button>
            </form>
            <aside className="rental-pipeline-scope__limits" aria-label="Limites da classificação de agenda"><ShieldCheck size={19} /><div><h3>Sem confirmação externa</h3><p>A classificação não cria contato, não compromete participante, não altera data, não registra presença, não cria contrato e não gera qualquer efeito financeiro.</p></div></aside>
          </div>
          {!isContextReady && <div className="rental-pipeline-empty"><CircleAlert size={18} /><p>Sem contexto não há consulta nem indicação de classificação de agenda.</p></div>}
          {isContextReady && !isAuthenticated && <div className="rental-pipeline-empty"><ShieldCheck size={18} /><p>A classificação e a leitura permanecem bloqueadas até haver sessão autenticada.</p></div>}
          {isWorkspaceReady && agendaClassificationsQuery.isLoading && <div className="rental-pipeline-empty"><span className="rental-pipeline-spinner" aria-hidden="true" /><p>Confirmando o contexto antes de solicitar a leitura minimizada das classificações.</p></div>}
          {isWorkspaceReady && agendaClassificationsQuery.isError && <div className="rental-pipeline-empty is-error"><CircleAlert size={18} /><p>A leitura das classificações não foi liberada. Revise identidade, membership, grant, vigência e contexto sem tentar inferir agendas externas.</p></div>}
          {isWorkspaceReady && agendaClassificationsQuery.data?.length === 0 && <div className="rental-pipeline-empty"><Tag size={18} /><p>Nenhuma classificação foi devolvida para este contexto. A resposta não revela outras agendas ou finalidades.</p></div>}
          {isWorkspaceReady && agendaClassificationsQuery.data && agendaClassificationsQuery.data.length > 0 && <div className="rental-pipeline-list__rows">{agendaClassificationsQuery.data.map((item) => <article key={item.classificationId}><span>Agenda interna</span><h3>{agendaClassifications[item.classification]}</h3><p><b>{item.internalCodePresent ? "Código interno informado" : "Sem código interno"}</b> · atualizado em {new Date(item.updatedAt).toLocaleString("pt-BR")}</p></article>)}</div>}
        </section>

        <section className="rental-pipeline-list" aria-labelledby="rental-list-title">
          <div className="rental-pipeline-heading"><div><p className="rental-pipeline-eyebrow">03 · LEITURA AUTORIZADA</p><h2 id="rental-list-title">Entradas em rascunho no contexto atual.</h2></div><p>A resposta traz apenas Party, jornada, origem, etapa e próximo agendamento. Não expõe endereço, contato, documento, análise, garantia ou qualquer dado financeiro.</p></div>
          {!isContextReady && <div className="rental-pipeline-empty"><CircleAlert size={18} /><p>Sem contexto não há consulta e não há indicação de existência de entradas.</p></div>}
          {isContextReady && !isAuthenticated && <div className="rental-pipeline-empty"><ShieldCheck size={18} /><p>A leitura e as ações permanecem bloqueadas até haver uma sessão autenticada.</p></div>}
          {isWorkspaceReady && intakesQuery.isLoading && <div className="rental-pipeline-empty"><span className="rental-pipeline-spinner" aria-hidden="true" /><p>Confirmando o contexto antes de solicitar a leitura autorizada.</p></div>}
          {isWorkspaceReady && intakesQuery.isError && <div className="rental-pipeline-empty is-error"><CircleAlert size={18} /><p>A leitura não foi liberada. Revise identidade, membership, grant, vigência, módulo e finalidade sem tentar inferir entradas externas.</p></div>}
          {isWorkspaceReady && intakesQuery.data?.length === 0 && <div className="rental-pipeline-empty"><House size={18} /><p>Nenhuma entrada em rascunho foi devolvida para este contexto. A resposta não revela dados de outros contextos.</p></div>}
          {isWorkspaceReady && intakesQuery.data && intakesQuery.data.length > 0 && <div className="rental-pipeline-list__rows">{intakesQuery.data.map((intake) => <article key={intake.intakeId}><span>{journeys[intake.journeyKind]}</span><h3>{intake.partyLabel}</h3><p><b>{stages[intake.stage]}</b> · origem {intake.sourceCode} · {intake.nextAgendaFor ? `agenda ${new Date(intake.nextAgendaFor).toLocaleString("pt-BR")}` : "sem próxima agenda"}</p></article>)}</div>}
        </section>
      </main>
    </DashboardLayout>
  );
}
