import DashboardLayout, { type DashboardNavigationItem } from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { isDomainContextReady } from "@/lib/domainFoundationUi";
import { trpc } from "@/lib/trpc";
import { Building2, CalendarClock, CircleAlert, Compass, House, ShieldCheck, UserRoundPlus, UsersRound, Workflow } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import "../urban-pipeline.css";

const navigationItems: DashboardNavigationItem[] = [
  { icon: Compass, label: "Central de plataforma", path: "/administracao" },
  { icon: UsersRound, label: "Núcleo de cadastros", path: "/cadastro-base" },
  { icon: House, label: "Ativos urbanos", path: "/ativos-urbanos" },
  { icon: Workflow, label: "Vendas Urbanas", path: "/vendas-urbanas" },
];

const stageLabels = {
  intake: "Entrada", qualification: "Qualificação", agenda_pending: "Agenda pendente", scheduled: "Agendado", closed_lost: "Encerrado sem ganho",
} as const;
const agendaLabels = { scheduled: "Agendada", rescheduled: "Remarcada", cancelled: "Cancelada", occurred: "Realizada", not_held: "Não realizada" } as const;

export default function UrbanPipeline() {
  const { isAuthenticated } = useAuth();
  const [organizationId, setOrganizationId] = useState("");
  const [purposeCode, setPurposeCode] = useState("CADASTRO_INICIAL");
  const [partyId, setPartyId] = useState("");
  const [sourceCode, setSourceCode] = useState("OPERADOR");
  const [interestKind, setInterestKind] = useState<"urban_asset" | "search_profile" | "unspecified">("search_profile");
  const [stageLeadId, setStageLeadId] = useState("");
  const [nextStage, setNextStage] = useState<keyof typeof stageLabels>("qualification");
  const [stageReason, setStageReason] = useState("");
  const [agendaLeadId, setAgendaLeadId] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [agendaState, setAgendaState] = useState<keyof typeof agendaLabels>("scheduled");
  const [agendaReason, setAgendaReason] = useState("");

  const context = useMemo(() => ({ organizationId: organizationId.trim(), module: "vendas_urbanas" as const, purposeCode: purposeCode.trim().toUpperCase() }), [organizationId, purposeCode]);
  const contextReady = isDomainContextReady(context);
  const enabled = isAuthenticated && contextReady;
  const leadsQuery = trpc.urbanPipeline.listDraftLeads.useQuery(context, { enabled, retry: false });
  const createLeadMutation = trpc.urbanPipeline.createDraftLead.useMutation({
    onSuccess() { setPartyId(""); toast.success("Lead em rascunho criado", { description: "O lead não é proposta, reserva, comprador aprovado ou contrato." }); void leadsQuery.refetch(); },
    onError() { toast.error("Lead não criado", { description: "O servidor exige identidade, contexto, Party em rascunho e grant válido sem revelar escopo externo." }); },
  });
  const transitionMutation = trpc.urbanPipeline.transitionDraftLead.useMutation({
    onSuccess() { setStageLeadId(""); setStageReason(""); toast.success("Etapa atualizada", { description: "A transição foi registrada com correlação e não produz mensagem, proposta ou efeito em ativo." }); void leadsQuery.refetch(); },
    onError() { toast.error("Etapa não atualizada", { description: "A transição foi bloqueada por sequência, contexto, policy ou motivo obrigatório." }); },
  });
  const agendaMutation = trpc.urbanPipeline.createDraftAgenda.useMutation({
    onSuccess() { setAgendaLeadId(""); setScheduledFor(""); setAgendaReason(""); toast.success("Agenda criada", { description: "O compromisso é interno: não integrou calendário, não enviou convite e não confirmou visita." }); void leadsQuery.refetch(); },
    onError() { toast.error("Agenda não criada", { description: "O servidor bloqueou a operação por contexto, etapa, motivo, identity ou grant." }); },
  });

  function createLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createLeadMutation.mutate({ ...context, correlationId: crypto.randomUUID(), partyId: partyId.trim(), sourceCode: sourceCode.trim().toUpperCase(), interestKind });
  }
  function transitionLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    transitionMutation.mutate({ ...context, correlationId: crypto.randomUUID(), leadId: stageLeadId.trim(), nextStage, reasonCode: nextStage === "closed_lost" ? stageReason.trim().toUpperCase() : undefined });
  }
  function createAgenda(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!scheduledFor) { toast.message("Informe data e hora para registrar o compromisso interno."); return; }
    agendaMutation.mutate({ ...context, correlationId: crypto.randomUUID(), leadId: agendaLeadId.trim(), scheduledFor: new Date(scheduledFor).toISOString(), state: agendaState, reasonCode: ["cancelled", "not_held"].includes(agendaState) ? agendaReason.trim().toUpperCase() : undefined });
  }

  return (
    <DashboardLayout navigationItems={navigationItems} navigationTitle="Núcleo CRM">
      <div className="urban-pipeline-page">
        <header className="urban-pipeline-hero"><div><p className="urban-pipeline-eyebrow">VENDAS URBANAS · INTERESSE ANTES DA PROPOSTA</p><h1>Qualifique o próximo passo, não uma suposição.</h1><p>Este primeiro corte registra interesse, etapa e agenda. Ele não oferta preço, reserva ativo, envia comunicação, aprova comprador, gera contrato ou cria consequência financeira.</p></div><div className="urban-pipeline-hero__rule"><ShieldCheck size={18} /><span>Funil em rascunho<br /><b>sem automação ou efeito externo</b></span></div></header>

        <section className="urban-pipeline-context" aria-labelledby="urban-context-title"><div className="urban-pipeline-heading"><div><p className="urban-pipeline-eyebrow">01 · CONTEXTO</p><h2 id="urban-context-title">Vendas Urbanas é um módulo explícito.</h2></div><p>O contexto exige organização e finalidade; o módulo permanece fixo para impedir que esta jornada seja criada por Locação.</p></div><div className="urban-pipeline-context__fields"><label htmlFor="urban-organization"><Building2 size={14} /> ID da organização<input id="urban-organization" value={organizationId} onChange={(event) => setOrganizationId(event.target.value)} placeholder="UUID da organização autorizada" /></label><label htmlFor="urban-purpose"><ShieldCheck size={14} /> Finalidade<input id="urban-purpose" value={purposeCode} onChange={(event) => setPurposeCode(event.target.value.toUpperCase())} placeholder="CADASTRO_INICIAL" /></label></div><div className={`urban-pipeline-context__status ${contextReady ? "is-ready" : "is-blocked"}`}><CircleAlert size={16} /><span>{contextReady ? "Contexto sintaticamente válido. O servidor ainda verifica identidade, membership, grant, vigência, módulo e finalidade." : "Informe organização e finalidade válidas. Sem contexto não há consulta, lead, transição ou agenda."}</span></div></section>

        <section className="urban-pipeline-workspace" aria-labelledby="urban-workspace-title"><div className="urban-pipeline-heading"><div><p className="urban-pipeline-eyebrow">02 · ORIGEM, ETAPA E AGENDA</p><h2 id="urban-workspace-title">Cada ação produz um fato limitado.</h2></div><p>Party, lead, etapa e agenda são objetos separados. Nenhum formulário captura contatos, documentos, renda, score, ativo específico, preço ou nota livre.</p></div><div className="urban-pipeline-grid">
          <form className="urban-pipeline-card" onSubmit={createLead}><div className="urban-pipeline-card__title"><UserRoundPlus size={19} /><h3>Lead de entrada</h3></div><p>Conecte uma Party em rascunho a uma origem codificada e a um interesse declarado.</p><label htmlFor="urban-party">ID da Party</label><input id="urban-party" value={partyId} onChange={(event) => setPartyId(event.target.value)} placeholder="UUID da Party em rascunho" disabled={!contextReady} required /><label htmlFor="urban-source">Origem em código</label><input id="urban-source" value={sourceCode} onChange={(event) => setSourceCode(event.target.value.toUpperCase())} placeholder="EX.: OPERADOR" disabled={!contextReady} required /><label htmlFor="urban-interest">Interesse declarado</label><select id="urban-interest" value={interestKind} onChange={(event) => setInterestKind(event.target.value as typeof interestKind)} disabled={!contextReady}><option value="search_profile">Perfil de busca</option><option value="urban_asset">Ativo urbano</option><option value="unspecified">Não especificado</option></select><button type="submit" disabled={!contextReady || createLeadMutation.isPending}>{createLeadMutation.isPending ? "Criando lead" : "Criar lead em rascunho"}</button></form>
          <form className="urban-pipeline-card" onSubmit={transitionLead}><div className="urban-pipeline-card__title"><Workflow size={19} /><h3>Etapa de trabalho</h3></div><p>A transição é explícita, controlada por sequência e mantém encerramento sem ganho separado de qualquer venda.</p><label htmlFor="urban-stage-lead">ID do lead</label><input id="urban-stage-lead" value={stageLeadId} onChange={(event) => setStageLeadId(event.target.value)} placeholder="UUID do lead em rascunho" disabled={!contextReady} required /><label htmlFor="urban-next-stage">Próxima etapa</label><select id="urban-next-stage" value={nextStage} onChange={(event) => setNextStage(event.target.value as typeof nextStage)} disabled={!contextReady}>{Object.entries(stageLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{nextStage === "closed_lost" && <><label htmlFor="urban-stage-reason">Motivo em código</label><input id="urban-stage-reason" value={stageReason} onChange={(event) => setStageReason(event.target.value.toUpperCase())} placeholder="EX.: DESISTENCIA" disabled={!contextReady} required /></>}<button type="submit" disabled={!contextReady || transitionMutation.isPending}>{transitionMutation.isPending ? "Atualizando etapa" : "Atualizar etapa"}</button></form>
          <form className="urban-pipeline-card" onSubmit={createAgenda}><div className="urban-pipeline-card__title"><CalendarClock size={19} /><h3>Compromisso interno</h3></div><p>Registre a agenda interna sem integrar calendário de terceiro, convidar participante ou confirmar uma visita.</p><label htmlFor="urban-agenda-lead">ID do lead</label><input id="urban-agenda-lead" value={agendaLeadId} onChange={(event) => setAgendaLeadId(event.target.value)} placeholder="UUID do lead em rascunho" disabled={!contextReady} required /><label htmlFor="urban-agenda-date">Data e hora</label><input id="urban-agenda-date" type="datetime-local" value={scheduledFor} onChange={(event) => setScheduledFor(event.target.value)} disabled={!contextReady} required /><label htmlFor="urban-agenda-state">Situação</label><select id="urban-agenda-state" value={agendaState} onChange={(event) => setAgendaState(event.target.value as typeof agendaState)} disabled={!contextReady}>{Object.entries(agendaLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{["cancelled", "not_held"].includes(agendaState) && <><label htmlFor="urban-agenda-reason">Motivo em código</label><input id="urban-agenda-reason" value={agendaReason} onChange={(event) => setAgendaReason(event.target.value.toUpperCase())} placeholder="EX.: REMARCACAO_SOLICITADA" disabled={!contextReady} required /></>}<button type="submit" disabled={!contextReady || agendaMutation.isPending}>{agendaMutation.isPending ? "Registrando agenda" : "Registrar agenda"}</button></form>
        </div></section>

        <section className="urban-pipeline-list" aria-labelledby="urban-list-title"><div className="urban-pipeline-heading"><div><p className="urban-pipeline-eyebrow">03 · PRÓXIMOS PASSOS</p><h2 id="urban-list-title">Leads no contexto atual.</h2></div><p>A lista é autorizada pelo servidor e mostra somente o nome de exibição necessário, origem, interesse, etapa e próxima agenda.</p></div>{!contextReady && <div className="urban-pipeline-empty"><CircleAlert size={18} /><p>Defina contexto para solicitar a leitura. Sem isso, não há informação sobre existência de leads.</p></div>}{contextReady && leadsQuery.isLoading && <div className="urban-pipeline-empty"><span className="urban-pipeline-spinner" aria-hidden="true" /><p>Verificando contexto e preparando a leitura autorizada.</p></div>}{contextReady && leadsQuery.isError && <div className="urban-pipeline-empty is-error"><CircleAlert size={18} /><p>A leitura não foi liberada. Verifique identidade, membership, grant, vigência e finalidade sem tentar inferir outros registros.</p></div>}{contextReady && leadsQuery.data?.length === 0 && <div className="urban-pipeline-empty"><Workflow size={18} /><p>Nenhum lead em rascunho foi devolvido para este contexto. A resposta não revela qualquer outro funil.</p></div>}{contextReady && leadsQuery.data && leadsQuery.data.length > 0 && <div className="urban-pipeline-list__rows">{leadsQuery.data.map((lead) => <article key={lead.leadId}><span>{stageLabels[lead.stage]}</span><h3>{lead.partyLabel}</h3><p>Origem: {lead.sourceCode} · Interesse: {lead.interestKind} · {lead.nextAgendaFor ? `Próxima agenda: ${new Date(lead.nextAgendaFor).toLocaleString()}` : "Sem agenda aberta"}</p><code>{lead.leadId}</code></article>)}</div>}</section>
      </div>
    </DashboardLayout>
  );
}
