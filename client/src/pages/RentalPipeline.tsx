import DashboardLayout, { type DashboardAccessGate, type DashboardNavigationItem } from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { isDomainContextReady } from "@/lib/domainFoundationUi";
import { trpc } from "@/lib/trpc";
import { Building2, CalendarClock, CircleAlert, ClipboardCheck, Compass, House, Link2, ShieldCheck, UsersRound, Workflow } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import "../rental-pipeline.css";

const navigationItems: DashboardNavigationItem[] = [
  { icon: Compass, label: "Central de plataforma", path: "/administracao" },
  { icon: UsersRound, label: "Núcleo de cadastros", path: "/cadastro-base" },
  { icon: House, label: "Ativos urbanos", path: "/ativos-urbanos" },
  { icon: Workflow, label: "Vendas Urbanas", path: "/vendas-urbanas" },
  { icon: CalendarClock, label: "Locação", path: "/locacao" },
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
  const [organizationId, setOrganizationId] = useState("");
  const [purposeCode, setPurposeCode] = useState("CADASTRO_INICIAL");
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

  const context = useMemo(() => ({ organizationId: organizationId.trim(), module: "locacao" as const, purposeCode: purposeCode.trim().toUpperCase() }), [organizationId, purposeCode]);
  const isContextReady = isDomainContextReady(context);
  const isWorkspaceReady = isAuthenticated && isContextReady;
  const intakesQuery = trpc.rentalPipeline.listDraftIntakes.useQuery(context, { enabled: isWorkspaceReady, retry: false });
  const managementAssetLinksQuery = trpc.rentalPipeline.listDraftManagementAssetLinks.useQuery(context, { enabled: isWorkspaceReady, retry: false });
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

  function createIntake(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate({ ...context, correlationId: crypto.randomUUID(), partyId: partyId.trim(), journeyKind, sourceCode: sourceCode.trim().toUpperCase() });
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

  return (
    <DashboardLayout navigationItems={navigationItems} navigationTitle="Núcleo CRM" accessGate={rentalAccessGate}>
      <main className="rental-pipeline-page">
        <header className="rental-pipeline-hero">
          <div>
            <p className="rental-pipeline-eyebrow">LOCAÇÃO · ENTRADA ANTES DE QUALQUER CONTRATAÇÃO</p>
            <h1>Separe o interesse de administrar do interesse de alugar.</h1>
            <p>Este primeiro corte registra apenas uma Party existente, a origem e a jornada declarada. A interface mantém contexto, qualificação e agenda interna explícitos para reduzir ambiguidade operacional.</p>
          </div>
          <div className="rental-pipeline-hero__rule"><ShieldCheck size={18} /><span>Rascunho contextual<br /><b>sem contrato, garantia ou financeiro</b></span></div>
        </header>

        <section className="rental-pipeline-context" aria-labelledby="rental-context-title">
          <div className="rental-pipeline-heading"><div><p className="rental-pipeline-eyebrow">01 · CONTEXTO</p><h2 id="rental-context-title">A Locação não herda permissões de outra área.</h2></div><p>Organização, módulo e finalidade são enviados ao servidor a cada operação. O módulo é fixo em Locação, mas a autorização continua dependente de identidade, membership, grant e vigência.</p></div>
          <div className="rental-pipeline-context__fields">
            <label htmlFor="rental-organization"><Building2 size={14} /> ID da organização<input id="rental-organization" value={organizationId} onChange={(event) => setOrganizationId(event.target.value)} placeholder="UUID da organização autorizada" /></label>
            <label htmlFor="rental-module"><House size={14} /> Módulo<input id="rental-module" value="Locação" readOnly aria-readonly="true" /></label>
            <label htmlFor="rental-purpose"><ShieldCheck size={14} /> Finalidade<input id="rental-purpose" value={purposeCode} onChange={(event) => setPurposeCode(event.target.value.toUpperCase())} placeholder="CADASTRO_INICIAL" /></label>
          </div>
          <div className={`rental-pipeline-context__status ${isContextReady ? "is-ready" : "is-blocked"}`}><CircleAlert size={16} /><span>{isContextReady ? "Contexto sintaticamente válido. O servidor confirmará identidade, membership, grant, vigência, módulo e finalidade antes de qualquer leitura ou rascunho." : "Informe organização e finalidade válidas para liberar as ações de rascunho."}</span></div>
        </section>

        <section className="rental-pipeline-workspace" aria-labelledby="rental-workspace-title">
          <div className="rental-pipeline-heading"><div><p className="rental-pipeline-eyebrow">02 · TRIAGEM INTERNA</p><h2 id="rental-workspace-title">Entrada, etapa e agenda formam um registro de trabalho mínimo.</h2></div><p>Não há dados de contato, endereço detalhado, análise de crédito, garantia, documentos, contratos, boletos, cobranças, repasses, portais ou integrações de calendário.</p></div>
          <div className="rental-pipeline-grid">
            <form className="rental-pipeline-card" onSubmit={createIntake}>
              <div className="rental-pipeline-card__title"><ClipboardCheck size={19} /><h3>Nova entrada em rascunho</h3></div><p>Vincule uma Party canônica já criada à jornada correta e uma origem interna codificada.</p>
              <label htmlFor="rental-party-id">ID da Party existente</label><input id="rental-party-id" value={partyId} onChange={(event) => setPartyId(event.target.value)} placeholder="UUID da Party em rascunho" disabled={!isWorkspaceReady} required />
              <label htmlFor="rental-journey">Jornada</label><select id="rental-journey" value={journeyKind} onChange={(event) => setJourneyKind(event.target.value as keyof typeof journeys)} disabled={!isWorkspaceReady}>{Object.entries(journeys).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              <label htmlFor="rental-source">Origem em código</label><input id="rental-source" value={sourceCode} onChange={(event) => setSourceCode(event.target.value.toUpperCase())} placeholder="EX.: OPERADOR" disabled={!isWorkspaceReady} required minLength={3} maxLength={80} />
              <button type="submit" disabled={!isWorkspaceReady || createMutation.isPending}>{createMutation.isPending ? "Criando rascunho" : "Criar entrada"}</button>
            </form>
            <form className="rental-pipeline-card" onSubmit={changeStage}>
              <div className="rental-pipeline-card__title"><Workflow size={19} /><h3>Atualizar etapa</h3></div><p>Use a transição explícita para a triagem interna. Encerramento sem ganho exige motivo em código.</p>
              <label htmlFor="rental-stage-intake">ID da entrada</label><input id="rental-stage-intake" value={stageIntakeId} onChange={(event) => setStageIntakeId(event.target.value)} placeholder="UUID da entrada em rascunho" disabled={!isWorkspaceReady} required />
              <label htmlFor="rental-next-stage">Próxima etapa</label><select id="rental-next-stage" value={nextStage} onChange={(event) => setNextStage(event.target.value as keyof typeof stages)} disabled={!isWorkspaceReady}>{Object.entries(stages).filter(([value]) => value !== "intake").map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              {nextStage === "closed_lost" && <><label htmlFor="rental-stage-reason">Motivo em código</label><input id="rental-stage-reason" value={stageReasonCode} onChange={(event) => setStageReasonCode(event.target.value.toUpperCase())} placeholder="EX.: DESISTENCIA" disabled={!isWorkspaceReady} required minLength={3} maxLength={80} /></>}
              <button type="submit" disabled={!isWorkspaceReady || stageMutation.isPending}>{stageMutation.isPending ? "Atualizando etapa" : "Atualizar etapa"}</button>
            </form>
            <form className="rental-pipeline-card" onSubmit={createAgenda}>
              <div className="rental-pipeline-card__title"><CalendarClock size={19} /><h3>Agenda interna</h3></div><p>Registre apenas o próximo compromisso operacional. O dado não dispara contato nem sincroniza calendários.</p>
              <label htmlFor="rental-agenda-intake">ID da entrada</label><input id="rental-agenda-intake" value={agendaIntakeId} onChange={(event) => setAgendaIntakeId(event.target.value)} placeholder="UUID da entrada em rascunho" disabled={!isWorkspaceReady} required />
              <label htmlFor="rental-scheduled-for">Data e hora</label><input id="rental-scheduled-for" type="datetime-local" value={scheduledFor} onChange={(event) => setScheduledFor(event.target.value)} disabled={!isWorkspaceReady} required />
              <label htmlFor="rental-agenda-state">Estado</label><select id="rental-agenda-state" value={agendaState} onChange={(event) => setAgendaState(event.target.value as keyof typeof agendaStates)} disabled={!isWorkspaceReady}>{Object.entries(agendaStates).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              {["cancelled", "not_held"].includes(agendaState) && <><label htmlFor="rental-agenda-reason">Motivo em código</label><input id="rental-agenda-reason" value={agendaReasonCode} onChange={(event) => setAgendaReasonCode(event.target.value.toUpperCase())} placeholder="EX.: REMARCACAO_SOLICITADA" disabled={!isWorkspaceReady} required minLength={3} maxLength={80} /></>}
              <button type="submit" disabled={!isWorkspaceReady || agendaMutation.isPending}>{agendaMutation.isPending ? "Registrando agenda" : "Registrar agenda"}</button>
            </form>
          </div>
        </section>

        <section className="rental-pipeline-link" aria-labelledby="rental-management-asset-title">
          <div className="rental-pipeline-heading"><div><p className="rental-pipeline-eyebrow">02A · ATIVO DECLARADO</p><h2 id="rental-management-asset-title">Vincule um ativo somente ao interesse de administração.</h2></div><p>O servidor nega a jornada de locatário e exige que o ativo esteja em rascunho para Locação. O vínculo não torna o imóvel disponível nem confirma qualquer direito.</p></div>
          <div className="rental-pipeline-link__grid">
            <form className="rental-pipeline-card" onSubmit={linkManagementAsset}>
              <div className="rental-pipeline-card__title"><Link2 size={19} /><h3>Vínculo interno de ativo</h3></div><p>Use IDs já existentes no mesmo contexto. A relação é uma referência de triagem, não uma autorização comercial.</p>
              <label htmlFor="rental-management-intake">ID da entrada de administração</label><input id="rental-management-intake" value={managementIntakeId} onChange={(event) => setManagementIntakeId(event.target.value)} placeholder="UUID da entrada em rascunho" disabled={!isWorkspaceReady} required />
              <label htmlFor="rental-management-asset">ID do ativo urbano</label><input id="rental-management-asset" value={managementAssetId} onChange={(event) => setManagementAssetId(event.target.value)} placeholder="UUID do ativo em rascunho" disabled={!isWorkspaceReady} required />
              <button type="submit" disabled={!isWorkspaceReady || managementAssetLinkMutation.isPending}>{managementAssetLinkMutation.isPending ? "Vinculando ativo" : "Vincular ativo em rascunho"}</button>
            </form>
            <aside className="rental-pipeline-link__limits" aria-label="Limites do vínculo de ativo"><ShieldCheck size={19} /><div><h3>Limites preservados</h3><p>Sem disponibilidade, exclusividade, endereço detalhado, preço, mídia, matrícula, publicação, proposta, reserva, contrato, garantia, cobrança, repasse ou financeiro.</p></div></aside>
          </div>
          {!isContextReady && <div className="rental-pipeline-empty"><CircleAlert size={18} /><p>Sem contexto não há consulta nem indicação de vínculo de ativo.</p></div>}
          {isContextReady && !isAuthenticated && <div className="rental-pipeline-empty"><ShieldCheck size={18} /><p>O vínculo e a leitura permanecem bloqueados até haver sessão autenticada.</p></div>}
          {isWorkspaceReady && managementAssetLinksQuery.isLoading && <div className="rental-pipeline-empty"><span className="rental-pipeline-spinner" aria-hidden="true" /><p>Confirmando o contexto antes de solicitar a leitura minimizada dos vínculos.</p></div>}
          {isWorkspaceReady && managementAssetLinksQuery.isError && <div className="rental-pipeline-empty is-error"><CircleAlert size={18} /><p>A leitura dos vínculos não foi liberada. Revise identidade, membership, grant, vigência e contexto sem tentar inferir ativos externos.</p></div>}
          {isWorkspaceReady && managementAssetLinksQuery.data?.length === 0 && <div className="rental-pipeline-empty"><Link2 size={18} /><p>Nenhum vínculo de ativo foi devolvido para este contexto. A resposta não revela ativos de outros contextos.</p></div>}
          {isWorkspaceReady && managementAssetLinksQuery.data && managementAssetLinksQuery.data.length > 0 && <div className="rental-pipeline-list__rows">{managementAssetLinksQuery.data.map((link) => <article key={link.linkId}><span>Ativo em rascunho</span><h3>{link.assetReferenceLabel}</h3><p><b>{link.assetKind}</b> · código {link.assetInternalReference} · vínculo interno em {new Date(link.linkedAt).toLocaleString("pt-BR")}</p><code>{link.intakeId} · {link.assetId}</code></article>)}</div>}
        </section>

        <section className="rental-pipeline-list" aria-labelledby="rental-list-title">
          <div className="rental-pipeline-heading"><div><p className="rental-pipeline-eyebrow">03 · LEITURA AUTORIZADA</p><h2 id="rental-list-title">Entradas em rascunho no contexto atual.</h2></div><p>A resposta traz apenas Party, jornada, origem, etapa e próximo agendamento. Não expõe endereço, contato, documento, análise, garantia ou qualquer dado financeiro.</p></div>
          {!isContextReady && <div className="rental-pipeline-empty"><CircleAlert size={18} /><p>Sem contexto não há consulta e não há indicação de existência de entradas.</p></div>}
          {isContextReady && !isAuthenticated && <div className="rental-pipeline-empty"><ShieldCheck size={18} /><p>A leitura e as ações permanecem bloqueadas até haver uma sessão autenticada.</p></div>}
          {isWorkspaceReady && intakesQuery.isLoading && <div className="rental-pipeline-empty"><span className="rental-pipeline-spinner" aria-hidden="true" /><p>Confirmando o contexto antes de solicitar a leitura autorizada.</p></div>}
          {isWorkspaceReady && intakesQuery.isError && <div className="rental-pipeline-empty is-error"><CircleAlert size={18} /><p>A leitura não foi liberada. Revise identidade, membership, grant, vigência, módulo e finalidade sem tentar inferir entradas externas.</p></div>}
          {isWorkspaceReady && intakesQuery.data?.length === 0 && <div className="rental-pipeline-empty"><House size={18} /><p>Nenhuma entrada em rascunho foi devolvida para este contexto. A resposta não revela dados de outros contextos.</p></div>}
          {isWorkspaceReady && intakesQuery.data && intakesQuery.data.length > 0 && <div className="rental-pipeline-list__rows">{intakesQuery.data.map((intake) => <article key={intake.intakeId}><span>{journeys[intake.journeyKind]}</span><h3>{intake.partyLabel}</h3><p><b>{stages[intake.stage]}</b> · origem {intake.sourceCode} · {intake.nextAgendaFor ? `agenda ${new Date(intake.nextAgendaFor).toLocaleString("pt-BR")}` : "sem próxima agenda"}</p><code>{intake.intakeId}</code></article>)}</div>}
        </section>
      </main>
    </DashboardLayout>
  );
}
