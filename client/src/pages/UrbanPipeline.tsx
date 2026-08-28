import DashboardLayout, { type DashboardAccessGate, type DashboardNavigationItem } from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { isDomainContextReady } from "@/lib/domainFoundationUi";
import { trpc } from "@/lib/trpc";
import { Building2, CalendarClock, CircleAlert, Compass, House, Link2, Search, ShieldCheck, UserRoundPlus, UsersRound, Workflow } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import "../urban-pipeline.css";

const navigationItems: DashboardNavigationItem[] = [
  { icon: Compass, label: "Central de plataforma", path: "/administracao" },
  { icon: UsersRound, label: "Núcleo de cadastros", path: "/cadastro-base" },
  { icon: House, label: "Ativos urbanos", path: "/ativos-urbanos" },
  { icon: Workflow, label: "Vendas Urbanas", path: "/vendas-urbanas" },
  { icon: CalendarClock, label: "Locação", path: "/locacao" },
];

const stageLabels = {
  intake: "Entrada", qualification: "Qualificação", agenda_pending: "Agenda pendente", scheduled: "Agendado", closed_lost: "Encerrado sem ganho",
} as const;
const agendaLabels = { scheduled: "Agendada", rescheduled: "Remarcada", cancelled: "Cancelada", occurred: "Realizada", not_held: "Não realizada" } as const;
const assetKindLabels = { apartment: "Apartamento", house: "Casa", kitnet: "Kitnet", commercial_unit: "Unidade comercial", urban_lot: "Lote urbano", building: "Edificação", other_urban_asset: "Outro ativo urbano" } as const;
const searchTimingLabels = { immediate: "Imediato", up_to_90_days: "Até 90 dias", flexible: "Flexível" } as const;

const urbanAccessGate: DashboardAccessGate = {
  eyebrow: "VENDAS URBANAS RESTRITAS · CONTEXTO ANTES DE LEITURA",
  title: "Acesse a triagem de Vendas Urbanas somente dentro do seu contexto autorizado.",
  description: "A área trabalha com leads e vínculos internos em rascunho. A sessão é apenas o primeiro passo: membership, grant, vigência, finalidade e policy continuam sendo verificados pelo servidor antes de qualquer leitura ou mudança.",
  routeTitle: "Rota de acesso",
  routeDetail: "Autenticação → contexto → escopo vigente → policy",
  actionLabel: "Acessar Vendas Urbanas",
  footerLabel: "LEITURA PROTEGIDA",
  footerValue: "CONTEXTO · NÃO INFERÊNCIA",
  footerNote: "Nenhum lead ou ativo de outro contexto é exposto antes da autorização.",
  railTop: "OPERAÇÃO",
  railBottom: "VENDAS URBANAS",
};

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
  const [assetLinkLeadId, setAssetLinkLeadId] = useState("");
  const [assetLinkAssetId, setAssetLinkAssetId] = useState("");
  const [searchProfileLeadId, setSearchProfileLeadId] = useState("");
  const [acceptedAssetKinds, setAcceptedAssetKinds] = useState<(keyof typeof assetKindLabels)[]>(["apartment"]);
  const [searchTiming, setSearchTiming] = useState<keyof typeof searchTimingLabels>("immediate");
  const [preferenceCode, setPreferenceCode] = useState("");

  const context = useMemo(() => ({ organizationId: organizationId.trim(), module: "vendas_urbanas" as const, purposeCode: purposeCode.trim().toUpperCase() }), [organizationId, purposeCode]);
  const contextReady = isDomainContextReady(context);
  const enabled = isAuthenticated && contextReady;
  const leadsQuery = trpc.urbanPipeline.listDraftLeads.useQuery(context, { enabled, retry: false });
  const leadAssetLinksQuery = trpc.urbanPipeline.listDraftLeadAssetLinks.useQuery(context, { enabled, retry: false });
  const leadSearchProfilesQuery = trpc.urbanPipeline.listDraftLeadSearchProfiles.useQuery(context, { enabled, retry: false });
  const utils = trpc.useUtils();
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
  const assetLinkMutation = trpc.urbanPipeline.linkDraftLeadAsset.useMutation({
    onSuccess() {
      setAssetLinkLeadId(""); setAssetLinkAssetId("");
      toast.success("Ativo vinculado ao lead urbano", { description: "O vínculo é interno e não confirma preço, disponibilidade, proposta, reserva, contrato, publicação ou direito comercial." });
      void utils.urbanPipeline.listDraftLeadAssetLinks.invalidate(context);
    },
    onError() { toast.error("Ativo não vinculado", { description: "O servidor exige um lead de interesse em ativo, ativo em rascunho de Vendas Urbanas e contexto autorizado." }); },
  });
  const searchProfileMutation = trpc.urbanPipeline.upsertDraftLeadSearchProfile.useMutation({
    onSuccess() {
      setSearchProfileLeadId(""); setAcceptedAssetKinds(["apartment"]); setSearchTiming("immediate"); setPreferenceCode("");
      toast.success("Perfil de busca registrado", { description: "O perfil é referência interna em rascunho e não seleciona ativo, preço, crédito, financiamento, proposta, reserva ou contrato." });
      void utils.urbanPipeline.listDraftLeadSearchProfiles.invalidate(context);
    },
    onError() { toast.error("Perfil não registrado", { description: "O servidor exige um lead de perfil de busca, contexto autorizado e opções codificadas dentro do limite permitido." }); },
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
  function linkLeadAsset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    assetLinkMutation.mutate({ ...context, correlationId: crypto.randomUUID(), leadId: assetLinkLeadId.trim(), assetId: assetLinkAssetId.trim() });
  }
  function toggleAssetKind(kind: keyof typeof assetKindLabels) {
    setAcceptedAssetKinds((current) => current.includes(kind) ? current.filter((item) => item !== kind) : [...current, kind]);
  }
  function upsertLeadSearchProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (acceptedAssetKinds.length === 0) { toast.message("Selecione ao menos um tipo canônico de ativo para registrar a preferência."); return; }
    searchProfileMutation.mutate({ ...context, correlationId: crypto.randomUUID(), leadId: searchProfileLeadId.trim(), acceptedAssetKinds, searchTiming, preferenceCode: preferenceCode.trim() || undefined });
  }

  return (
    <DashboardLayout navigationItems={navigationItems} navigationTitle="Núcleo CRM" accessGate={urbanAccessGate}>
      <div className="urban-pipeline-page">
        <header className="urban-pipeline-hero"><div><p className="urban-pipeline-eyebrow">VENDAS URBANAS · INTERESSE ANTES DA PROPOSTA</p><h1>Qualifique o próximo passo, não uma suposição.</h1><p>Este corte registra interesse, etapa, agenda, vínculo interno e perfil de busca. Ele não oferta preço, reserva ativo, envia comunicação, aprova comprador, gera contrato ou cria consequência financeira.</p></div><div className="urban-pipeline-hero__rule"><ShieldCheck size={18} /><span>Funil em rascunho<br /><b>sem automação ou efeito externo</b></span></div></header>

        <section className="urban-pipeline-context" aria-labelledby="urban-context-title"><div className="urban-pipeline-heading"><div><p className="urban-pipeline-eyebrow">01 · CONTEXTO</p><h2 id="urban-context-title">Vendas Urbanas é um módulo explícito.</h2></div><p>O contexto exige organização e finalidade; o módulo permanece fixo para impedir que esta jornada seja criada por Locação.</p></div><div className="urban-pipeline-context__fields"><label htmlFor="urban-organization"><Building2 size={14} /> ID da organização<input id="urban-organization" value={organizationId} onChange={(event) => setOrganizationId(event.target.value)} placeholder="UUID da organização autorizada" /></label><label htmlFor="urban-purpose"><ShieldCheck size={14} /> Finalidade<input id="urban-purpose" value={purposeCode} onChange={(event) => setPurposeCode(event.target.value.toUpperCase())} placeholder="CADASTRO_INICIAL" /></label></div><div className={`urban-pipeline-context__status ${contextReady ? "is-ready" : "is-blocked"}`}><CircleAlert size={16} /><span>{contextReady ? "Contexto sintaticamente válido. O servidor ainda verifica identidade, membership, grant, vigência, módulo e finalidade." : "Informe organização e finalidade válidas. Sem contexto não há consulta, lead, transição ou agenda."}</span></div></section>

        <section className="urban-pipeline-workspace" aria-labelledby="urban-workspace-title"><div className="urban-pipeline-heading"><div><p className="urban-pipeline-eyebrow">02 · ORIGEM, ETAPA E AGENDA</p><h2 id="urban-workspace-title">Cada ação produz um fato limitado.</h2></div><p>Party, lead, etapa e agenda são objetos separados. Nenhum formulário captura contatos, documentos, renda, score, ativo específico, preço ou nota livre.</p></div><div className="urban-pipeline-grid">
          <form className="urban-pipeline-card" onSubmit={createLead}><div className="urban-pipeline-card__title"><UserRoundPlus size={19} /><h3>Lead de entrada</h3></div><p>Conecte uma Party em rascunho a uma origem codificada e a um interesse declarado.</p><label htmlFor="urban-party">ID da Party</label><input id="urban-party" value={partyId} onChange={(event) => setPartyId(event.target.value)} placeholder="UUID da Party em rascunho" disabled={!enabled} required /><label htmlFor="urban-source">Origem em código</label><input id="urban-source" value={sourceCode} onChange={(event) => setSourceCode(event.target.value.toUpperCase())} placeholder="EX.: OPERADOR" disabled={!enabled} required /><label htmlFor="urban-interest">Interesse declarado</label><select id="urban-interest" value={interestKind} onChange={(event) => setInterestKind(event.target.value as typeof interestKind)} disabled={!enabled}><option value="search_profile">Perfil de busca</option><option value="urban_asset">Ativo urbano</option><option value="unspecified">Não especificado</option></select><button type="submit" disabled={!enabled || createLeadMutation.isPending}>{createLeadMutation.isPending ? "Criando lead" : "Criar lead em rascunho"}</button></form>
          <form className="urban-pipeline-card" onSubmit={transitionLead}><div className="urban-pipeline-card__title"><Workflow size={19} /><h3>Etapa de trabalho</h3></div><p>A transição é explícita, controlada por sequência e mantém encerramento sem ganho separado de qualquer venda.</p><label htmlFor="urban-stage-lead">ID do lead</label><input id="urban-stage-lead" value={stageLeadId} onChange={(event) => setStageLeadId(event.target.value)} placeholder="UUID do lead em rascunho" disabled={!enabled} required /><label htmlFor="urban-next-stage">Próxima etapa</label><select id="urban-next-stage" value={nextStage} onChange={(event) => setNextStage(event.target.value as typeof nextStage)} disabled={!enabled}>{Object.entries(stageLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{nextStage === "closed_lost" && <><label htmlFor="urban-stage-reason">Motivo em código</label><input id="urban-stage-reason" value={stageReason} onChange={(event) => setStageReason(event.target.value.toUpperCase())} placeholder="EX.: DESISTENCIA" disabled={!enabled} required /></>}<button type="submit" disabled={!enabled || transitionMutation.isPending}>{transitionMutation.isPending ? "Atualizando etapa" : "Atualizar etapa"}</button></form>
          <form className="urban-pipeline-card" onSubmit={createAgenda}><div className="urban-pipeline-card__title"><CalendarClock size={19} /><h3>Compromisso interno</h3></div><p>Registre a agenda interna sem integrar calendário de terceiro, convidar participante ou confirmar uma visita.</p><label htmlFor="urban-agenda-lead">ID do lead</label><input id="urban-agenda-lead" value={agendaLeadId} onChange={(event) => setAgendaLeadId(event.target.value)} placeholder="UUID do lead em rascunho" disabled={!enabled} required /><label htmlFor="urban-agenda-date">Data e hora</label><input id="urban-agenda-date" type="datetime-local" value={scheduledFor} onChange={(event) => setScheduledFor(event.target.value)} disabled={!enabled} required /><label htmlFor="urban-agenda-state">Situação</label><select id="urban-agenda-state" value={agendaState} onChange={(event) => setAgendaState(event.target.value as typeof agendaState)} disabled={!enabled}>{Object.entries(agendaLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{["cancelled", "not_held"].includes(agendaState) && <><label htmlFor="urban-agenda-reason">Motivo em código</label><input id="urban-agenda-reason" value={agendaReason} onChange={(event) => setAgendaReason(event.target.value.toUpperCase())} placeholder="EX.: REMARCACAO_SOLICITADA" disabled={!enabled} required /></>}<button type="submit" disabled={!enabled || agendaMutation.isPending}>{agendaMutation.isPending ? "Registrando agenda" : "Registrar agenda"}</button></form>
        </div></section>

        <section className="urban-pipeline-link" aria-labelledby="urban-asset-link-title"><div className="urban-pipeline-heading"><div><p className="urban-pipeline-eyebrow">02A · ATIVO DECLARADO</p><h2 id="urban-asset-link-title">Vincule um ativo somente ao lead interessado em ativo urbano.</h2></div><p>O servidor nega leads de busca ou não especificados e exige ativo em rascunho no módulo Vendas Urbanas. O vínculo não torna o ativo disponível nem cria proposta, reserva ou contrato.</p></div><div className="urban-pipeline-link__grid"><form className="urban-pipeline-card" onSubmit={linkLeadAsset}><div className="urban-pipeline-card__title"><Link2 size={19} /><h3>Vínculo interno de ativo</h3></div><p>Use IDs já existentes no mesmo contexto. A relação é uma referência de qualificação, não uma oferta ou autorização comercial.</p><label htmlFor="urban-asset-link-lead">ID do lead interessado em ativo</label><input id="urban-asset-link-lead" value={assetLinkLeadId} onChange={(event) => setAssetLinkLeadId(event.target.value)} placeholder="UUID do lead em rascunho" disabled={!enabled} required /><label htmlFor="urban-asset-link-asset">ID do ativo urbano</label><input id="urban-asset-link-asset" value={assetLinkAssetId} onChange={(event) => setAssetLinkAssetId(event.target.value)} placeholder="UUID do ativo em rascunho" disabled={!enabled} required /><button type="submit" disabled={!enabled || assetLinkMutation.isPending}>{assetLinkMutation.isPending ? "Vinculando ativo" : "Vincular ativo em rascunho"}</button></form><aside className="urban-pipeline-link__limits" aria-label="Limites do vínculo de ativo"><ShieldCheck size={19} /><div><h3>Limites preservados</h3><p>Sem preço, endereço detalhado, mídia, matrícula, titularidade, disponibilidade, publicação, proposta, reserva, contrato, comissão, cobrança, repasse ou financeiro.</p></div></aside></div>{!contextReady && <div className="urban-pipeline-empty"><CircleAlert size={18} /><p>Sem contexto não há consulta nem indicação de vínculo de ativo.</p></div>}{contextReady && !isAuthenticated && <div className="urban-pipeline-empty"><ShieldCheck size={18} /><p>O vínculo e a leitura permanecem bloqueados até haver sessão autenticada.</p></div>}{enabled && leadAssetLinksQuery.isLoading && <div className="urban-pipeline-empty"><span className="urban-pipeline-spinner" aria-hidden="true" /><p>Confirmando o contexto antes de solicitar a leitura minimizada dos vínculos.</p></div>}{enabled && leadAssetLinksQuery.isError && <div className="urban-pipeline-empty is-error"><CircleAlert size={18} /><p>A leitura dos vínculos não foi liberada. Revise identidade, membership, grant, vigência e contexto sem tentar inferir ativos externos.</p></div>}{enabled && leadAssetLinksQuery.data?.length === 0 && <div className="urban-pipeline-empty"><Link2 size={18} /><p>Nenhum vínculo de ativo foi devolvido para este contexto. A resposta não revela ativos de outros contextos.</p></div>}{enabled && leadAssetLinksQuery.data && leadAssetLinksQuery.data.length > 0 && <div className="urban-pipeline-list__rows">{leadAssetLinksQuery.data.map((link) => <article key={link.linkId}><span>Ativo em rascunho</span><h3>{link.assetReferenceLabel}</h3><p><b>{assetKindLabels[link.assetKind]}</b> · código {link.assetInternalReference} · vínculo interno em {new Date(link.linkedAt).toLocaleString("pt-BR")}</p><code>{link.leadId} · {link.assetId}</code></article>)}</div>}</section>

        <section className="urban-pipeline-link urban-pipeline-search" aria-labelledby="urban-search-profile-title"><div className="urban-pipeline-heading"><div><p className="urban-pipeline-eyebrow">02B · PERFIL DE BUSCA</p><h2 id="urban-search-profile-title">Registre preferências de busca, não condições de compra.</h2></div><p>O perfil exige um lead com interesse em busca e aceita somente tipos canônicos, horizonte e um código interno. Não aceita endereço, preço, crédito, financiamento ou qualquer dado pessoal.</p></div><div className="urban-pipeline-link__grid"><form className="urban-pipeline-card urban-pipeline-search__card" onSubmit={upsertLeadSearchProfile}><div className="urban-pipeline-card__title"><Search size={19} /><h3>Preferências em código</h3></div><p>Selecione tipos urbanos já definidos, indique a janela de busca e, se preciso, informe apenas um código interno de classificação.</p><label htmlFor="urban-search-lead">ID do lead de perfil de busca</label><input id="urban-search-lead" value={searchProfileLeadId} onChange={(event) => setSearchProfileLeadId(event.target.value)} placeholder="UUID do lead em rascunho" disabled={!enabled} required /><fieldset disabled={!enabled}><legend>Tipos de ativo aceitos</legend><div className="urban-pipeline-search__options">{Object.entries(assetKindLabels).map(([kind, label]) => <label key={kind}><input type="checkbox" checked={acceptedAssetKinds.includes(kind as keyof typeof assetKindLabels)} onChange={() => toggleAssetKind(kind as keyof typeof assetKindLabels)} />{label}</label>)}</div></fieldset><label htmlFor="urban-search-timing">Horizonte declarado</label><select id="urban-search-timing" value={searchTiming} onChange={(event) => setSearchTiming(event.target.value as keyof typeof searchTimingLabels)} disabled={!enabled}>{Object.entries(searchTimingLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><label htmlFor="urban-preference-code">Código interno opcional</label><input id="urban-preference-code" value={preferenceCode} onChange={(event) => setPreferenceCode(event.target.value.toUpperCase())} placeholder="EX.: MORADIA_URBANA" disabled={!enabled} minLength={3} maxLength={80} /><button type="submit" disabled={!enabled || searchProfileMutation.isPending}>{searchProfileMutation.isPending ? "Registrando perfil" : "Registrar perfil de busca"}</button></form><aside className="urban-pipeline-link__limits" aria-label="Limites do perfil de busca"><ShieldCheck size={19} /><div><h3>Sem decisão automática</h3><p>O perfil não recomenda imóvel, não calcula aderência, não pontua interessado e não substitui análise humana ou critérios de alçada.</p></div></aside></div>{!contextReady && <div className="urban-pipeline-empty"><CircleAlert size={18} /><p>Sem contexto não há consulta nem indicação de perfil de busca.</p></div>}{contextReady && !isAuthenticated && <div className="urban-pipeline-empty"><ShieldCheck size={18} /><p>O perfil e a leitura permanecem bloqueados até haver sessão autenticada.</p></div>}{enabled && leadSearchProfilesQuery.isLoading && <div className="urban-pipeline-empty"><span className="urban-pipeline-spinner" aria-hidden="true" /><p>Confirmando o contexto antes de solicitar a leitura minimizada dos perfis.</p></div>}{enabled && leadSearchProfilesQuery.isError && <div className="urban-pipeline-empty is-error"><CircleAlert size={18} /><p>A leitura dos perfis não foi liberada. Revise identidade, membership, grant, vigência e contexto sem tentar inferir leads externos.</p></div>}{enabled && leadSearchProfilesQuery.data?.length === 0 && <div className="urban-pipeline-empty"><Search size={18} /><p>Nenhum perfil de busca foi devolvido para este contexto. A resposta não revela outros leads ou preferências.</p></div>}{enabled && leadSearchProfilesQuery.data && leadSearchProfilesQuery.data.length > 0 && <div className="urban-pipeline-list__rows">{leadSearchProfilesQuery.data.map((profile) => <article key={profile.profileId}><span>Busca em rascunho</span><h3>{profile.acceptedAssetKinds.map((kind) => assetKindLabels[kind]).join(" · ")}</h3><p><b>{searchTimingLabels[profile.searchTiming]}</b> · {profile.preferencePresent ? "código interno informado" : "sem código interno"} · atualizado em {new Date(profile.updatedAt).toLocaleString("pt-BR")}</p><code>{profile.leadId} · {profile.profileId}</code></article>)}</div>}</section>

        <section className="urban-pipeline-list" aria-labelledby="urban-list-title"><div className="urban-pipeline-heading"><div><p className="urban-pipeline-eyebrow">03 · PRÓXIMOS PASSOS</p><h2 id="urban-list-title">Leads no contexto atual.</h2></div><p>A lista é autorizada pelo servidor e mostra somente o nome de exibição necessário, origem, interesse, etapa e próxima agenda.</p></div>{!contextReady && <div className="urban-pipeline-empty"><CircleAlert size={18} /><p>Defina contexto para solicitar a leitura. Sem isso, não há informação sobre existência de leads.</p></div>}{contextReady && leadsQuery.isLoading && <div className="urban-pipeline-empty"><span className="urban-pipeline-spinner" aria-hidden="true" /><p>Verificando contexto e preparando a leitura autorizada.</p></div>}{contextReady && leadsQuery.isError && <div className="urban-pipeline-empty is-error"><CircleAlert size={18} /><p>A leitura não foi liberada. Verifique identidade, membership, grant, vigência e finalidade sem tentar inferir outros registros.</p></div>}{contextReady && leadsQuery.data?.length === 0 && <div className="urban-pipeline-empty"><Workflow size={18} /><p>Nenhum lead em rascunho foi devolvido para este contexto. A resposta não revela qualquer outro funil.</p></div>}{contextReady && leadsQuery.data && leadsQuery.data.length > 0 && <div className="urban-pipeline-list__rows">{leadsQuery.data.map((lead) => <article key={lead.leadId}><span>{stageLabels[lead.stage]}</span><h3>{lead.partyLabel}</h3><p>Origem: {lead.sourceCode} · Interesse: {lead.interestKind} · {lead.nextAgendaFor ? `Próxima agenda: ${new Date(lead.nextAgendaFor).toLocaleString()}` : "Sem agenda aberta"}</p><code>{lead.leadId}</code></article>)}</div>}</section>
      </div>
    </DashboardLayout>
  );
}
