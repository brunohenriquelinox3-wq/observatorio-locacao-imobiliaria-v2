import DashboardLayout, { type DashboardNavigationItem } from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { domainPartySelectionLabel } from "@/lib/domainPartySelection";
import { validateDraftPartyRolePeriod } from "@/lib/domainPartyRolePeriodValidation";
import { validateDraftPartyDisplayName } from "@/lib/domainPartyValidation";
import { isDomainContextReady } from "@/lib/domainFoundationUi";
import { domainOperationalValue } from "@/lib/domainOperationalOverview";
import { initialAuthorizedSubdivisionContextId, resolveAuthorizedSubdivisionContext } from "@/lib/subdivisionContextSelection";
import { trpc } from "@/lib/trpc";
import { Building2, CircleAlert, Compass, House, Layers3, ShieldCheck, UserRoundPlus, UsersRound, Workflow } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import "../domain-foundation.css";

const navigationItems: DashboardNavigationItem[] = [
  { icon: Compass, label: "Central de plataforma", path: "/administracao" },
  { icon: ShieldCheck, label: "Painel ADM", path: "/adm" },
  { icon: Layers3, label: "Loteadora", path: "/loteadora" },
  { icon: Workflow, label: "Vendas Urbanas", path: "/vendas-urbanas" },
  { icon: House, label: "Locação", path: "/locacao" },
  { icon: UsersRound, label: "Núcleo de cadastros", path: "/cadastro-base" },
  { icon: House, label: "Ativos urbanos", path: "/ativos-urbanos" },
];

const moduleLabels = { vendas_urbanas: "Vendas Urbanas", locacao: "Locação", loteadora: "Loteadora" } as const;
type ActiveSector = "parties" | "roles" | "protected";

export default function DomainFoundation() {
  const { isAuthenticated } = useAuth();
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [module, setModule] = useState<keyof typeof moduleLabels>("vendas_urbanas");
  const [activeSector, setActiveSector] = useState<ActiveSector>("parties");
  const [partyKind, setPartyKind] = useState<"individual" | "legal_entity">("individual");
  const [displayName, setDisplayName] = useState("");
  const [displayNameValidationMessage, setDisplayNameValidationMessage] = useState("");
  const [rolePartyId, setRolePartyId] = useState("");
  const [role, setRole] = useState("lead");
  const [roleBeginsAt, setRoleBeginsAt] = useState("");
  const [roleEndsAt, setRoleEndsAt] = useState("");
  const [rolePeriodValidationMessage, setRolePeriodValidationMessage] = useState("");

  const authorizedContextsQuery = trpc.organizationContext.listAuthorizedForModule.useQuery({ module }, { enabled: isAuthenticated, retry: false });
  const selectedOrganizationContext = resolveAuthorizedSubdivisionContext(selectedOrganizationId, authorizedContextsQuery.data);
  useEffect(() => {
    if (selectedOrganizationId && !selectedOrganizationContext) setSelectedOrganizationId("");
    if (!selectedOrganizationId) setSelectedOrganizationId(initialAuthorizedSubdivisionContextId(authorizedContextsQuery.data));
  }, [selectedOrganizationId, selectedOrganizationContext, authorizedContextsQuery.data]);

  const context = useMemo(() => ({ organizationId: selectedOrganizationContext?.organizationId ?? "", module, purposeCode: selectedOrganizationContext?.purposeCode ?? "" }), [module, selectedOrganizationContext]);
  const isContextReady = isDomainContextReady(context);
  const contextEnabled = isAuthenticated && isContextReady;
  const partiesQuery = trpc.domainFoundation.listDraftParties.useQuery(context, { enabled: contextEnabled, retry: false });
  useEffect(() => {
    if (rolePartyId && Array.isArray(partiesQuery.data) && !partiesQuery.data.some((party) => party.partyId === rolePartyId)) setRolePartyId("");
  }, [partiesQuery.data, rolePartyId]);

  const roleCount = partiesQuery.data?.reduce((total, party) => total + party.roleCount, 0);
  const operationalSectors: Array<{ code: string; key: ActiveSector; title: string; value: string; description: string }> = [
    { code: "01", key: "parties", title: "Parties", value: domainOperationalValue({ contextReady: contextEnabled, loading: partiesQuery.isLoading, count: partiesQuery.data?.length, pendingLabel: "Aguardando leitura" }), description: "Pessoa ou empresa em rascunho, sem identidade de acesso." },
    { code: "02", key: "roles", title: "Papéis temporais", value: domainOperationalValue({ contextReady: contextEnabled, loading: partiesQuery.isLoading, count: roleCount, pendingLabel: "Aguardando leitura" }), description: "Jornada vinculada sem conceder login, grant ou alçada." },
    { code: "03", key: "protected", title: "Atributos protegidos", value: contextEnabled ? "Bloqueado" : "Aguardando contexto", description: "Documentos, contatos e dados fiscais fora deste corte." },
  ];

  const createPartyMutation = trpc.domainFoundation.createDraftParty.useMutation({
    onSuccess() { setDisplayName(""); setDisplayNameValidationMessage(""); toast.success("Rascunho de Party criado", { description: "Nenhum documento, contato, dado fiscal, contrato ou alçada foi incluído." }); void partiesQuery.refetch(); },
    onError() { toast.error("Rascunho não criado", { description: "Verifique contexto, identidade e grant ativo. O servidor não revela escopo ou registros existentes." }); },
  });
  const assignRoleMutation = trpc.domainFoundation.assignDraftPartyRole.useMutation({
    onSuccess() { setRolePartyId(""); setRoleBeginsAt(""); setRoleEndsAt(""); setRolePeriodValidationMessage(""); toast.success("Papel temporal adicionado", { description: "O papel não concede login, portal, representação ou autoridade financeira." }); void partiesQuery.refetch(); },
    onError() { toast.error("Papel não atribuído", { description: "O servidor bloqueou a operação por contexto, vigência, policy ou identidade." }); },
  });

  function createParty(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isContextReady) { toast.message("Contexto incompleto", { description: "Informe organização, módulo e finalidade antes de iniciar qualquer rascunho." }); return; }
    const validation = validateDraftPartyDisplayName(displayName);
    if (!validation.valid) { setDisplayNameValidationMessage(validation.message); return; }
    setDisplayNameValidationMessage("");
    createPartyMutation.mutate({ ...context, correlationId: crypto.randomUUID(), kind: partyKind, displayName: validation.normalizedValue, sourceKind: "operator_declaration" });
  }

  function assignRole(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isContextReady) { toast.message("Contexto incompleto", { description: "Nenhum papel pode ser atribuído sem organização, módulo e finalidade explícitos." }); return; }
    const validation = validateDraftPartyRolePeriod(roleBeginsAt, roleEndsAt);
    if (!validation.valid) { setRolePeriodValidationMessage(validation.message); return; }
    setRolePeriodValidationMessage("");
    assignRoleMutation.mutate({ ...context, correlationId: crypto.randomUUID(), partyId: rolePartyId.trim(), role: role as "lead" | "client" | "buyer" | "seller" | "owner" | "tenant" | "guarantor" | "representative" | "broker" | "provider" | "shareholder" | "partner" | "land_contributor", beginsAt: roleBeginsAt ? new Date(roleBeginsAt).toISOString() : undefined, endsAt: roleEndsAt ? new Date(roleEndsAt).toISOString() : undefined });
  }

  return <DashboardLayout navigationItems={navigationItems} navigationTitle="Núcleo CRM">
    <main className="domain-foundation-page">
      <header className="domain-foundation-commandbar">
        <div><p className="domain-foundation-eyebrow">FUNDAÇÃO · NÚCLEO DE CADASTROS</p><h1>Cadastros</h1><p>Base única para pessoas e empresas, organizada por setores e sempre limitada ao contexto autorizado.</p></div>
        <div className="domain-foundation-commandbar__rule"><ShieldCheck size={17} /><span>Contexto primeiro<br /><b>sem contexto, sem leitura ou comando</b></span></div>
      </header>

      <section className="domain-foundation-context" aria-labelledby="context-title">
        <div className="domain-foundation-section-heading"><div><p className="domain-foundation-eyebrow">01 · CONTEXTO OPERACIONAL</p><h2 id="context-title">Escolha o escopo autorizado.</h2></div><p>A seleção orienta a interface; o servidor continua responsável por confirmar identidade, membership, grant, vigência e finalidade.</p></div>
        <div className="domain-foundation-context__fields">
          <label htmlFor="domain-organization"><Building2 size={14} /> Organização autorizada<select id="domain-organization" value={selectedOrganizationId} onChange={(event) => setSelectedOrganizationId(event.target.value)} disabled={!isAuthenticated || authorizedContextsQuery.isLoading}><option value="">{authorizedContextsQuery.isLoading ? "Carregando contextos autorizados" : "Selecione uma organização autorizada"}</option>{authorizedContextsQuery.data?.map((organization) => <option key={organization.organizationId} value={organization.organizationId}>{organization.organizationLabel}</option>)}</select></label>
          <label htmlFor="domain-module"><Layers3 size={14} /> Módulo<select id="domain-module" value={module} onChange={(event) => setModule(event.target.value as keyof typeof moduleLabels)}><option value="vendas_urbanas">Vendas Urbanas</option><option value="locacao">Locação</option><option value="loteadora">Loteadora</option></select></label>
          <label htmlFor="domain-purpose"><ShieldCheck size={14} /> Finalidade<input id="domain-purpose" value={context.purposeCode || "—"} readOnly aria-readonly="true" /></label>
        </div>
        <div className={`domain-foundation-context__status ${isContextReady ? "is-ready" : "is-blocked"}`}><CircleAlert size={16} /><span>{isContextReady ? `Contexto autorizado selecionado para ${moduleLabels[module]}. O servidor ainda confirma os requisitos por consulta ou comando.` : authorizedContextsQuery.isError ? "O contexto não foi liberado. A interface não revela organizações ou escopos externos." : "Selecione uma organização autorizada para liberar leitura e rascunhos deste módulo."}</span></div>
      </section>

      <nav className="domain-foundation-sector-nav" aria-label="Setores do Núcleo de Cadastros">
        {operationalSectors.map((sector) => <button key={sector.key} type="button" className={activeSector === sector.key ? "is-active" : ""} onClick={() => setActiveSector(sector.key)} aria-pressed={activeSector === sector.key}><span>{sector.code}</span><strong>{sector.title}</strong><small>{sector.description}</small><b>{sector.value}</b></button>)}
      </nav>

      {activeSector === "parties" && <section id="domain-parties" className="domain-foundation-workspace" aria-labelledby="party-title">
        <div className="domain-foundation-section-heading"><div><p className="domain-foundation-eyebrow">02 · PARTIES</p><h2 id="party-title">Pessoa ou empresa, sem duplicidade.</h2></div><p>O rascunho inicial usa somente um nome de exibição. Documento, contato, renda, endereço, arquivo, representação, contrato e financeiro permanecem fora do setor.</p></div>
        <div className="domain-foundation-workspace__grid domain-foundation-workspace__grid--single"><form className="domain-foundation-card" onSubmit={createParty}><div className="domain-foundation-card__title"><UserRoundPlus size={19} /><h3>Nova Party em rascunho</h3></div><p>Identifique a pessoa ou empresa somente pelo nome necessário à jornada inicial.</p><label htmlFor="party-kind">Tipo</label><select id="party-kind" value={partyKind} onChange={(event) => setPartyKind(event.target.value as typeof partyKind)} disabled={!contextEnabled}><option value="individual">Pessoa física</option><option value="legal_entity">Pessoa jurídica</option></select><label htmlFor="party-display-name">Nome de exibição</label><input id="party-display-name" value={displayName} onChange={(event) => { setDisplayName(event.target.value); if (displayNameValidationMessage) setDisplayNameValidationMessage(""); }} placeholder="Nome necessário ao rascunho" disabled={!contextEnabled} required minLength={2} maxLength={160} aria-invalid={displayNameValidationMessage ? "true" : undefined} aria-describedby={displayNameValidationMessage ? "party-display-name-validation" : undefined} />{displayNameValidationMessage && <p id="party-display-name-validation" className="domain-foundation-card__note is-error" role="alert">{displayNameValidationMessage}</p>}<button type="submit" disabled={!contextEnabled || createPartyMutation.isPending}>{createPartyMutation.isPending ? "Criando rascunho" : "Criar Party em rascunho"}</button></form></div>
        <section className="domain-foundation-list" aria-labelledby="draft-list-title"><div className="domain-foundation-section-heading"><div><p className="domain-foundation-eyebrow">LEITURA AUTORIZADA</p><h2 id="draft-list-title">Rascunhos no contexto atual.</h2></div><p>A consulta é feita pelo servidor e não retorna documentos, contatos, identificadores fiscais ou dados de outras organizações.</p></div>{!isContextReady && <div className="domain-foundation-empty"><CircleAlert size={18} /><p>Defina o contexto para solicitar a leitura. Sem contexto não há lista, nem indicação de existência de dados.</p></div>}{isContextReady && partiesQuery.isLoading && <div className="domain-foundation-empty"><span className="domain-foundation-spinner" aria-hidden="true" /><p>Verificando contexto e preparando a leitura autorizada.</p></div>}{isContextReady && partiesQuery.isError && <div className="domain-foundation-empty is-error"><CircleAlert size={18} /><p>A leitura não foi liberada. Confirme identidade, membership, grant, módulo, finalidade e vigência sem tentar inferir registros.</p></div>}{isContextReady && partiesQuery.data?.length === 0 && <div className="domain-foundation-empty"><UsersRound size={18} /><p>Nenhuma Party em rascunho foi devolvida para este contexto. Isso não informa sobre outros contextos, organizações ou dados.</p></div>}{isContextReady && partiesQuery.data && partiesQuery.data.length > 0 && <div className="domain-foundation-list__rows">{partiesQuery.data.map((party) => <article key={party.partyId}><span>{party.kind === "individual" ? "PESSOA FÍSICA" : "PESSOA JURÍDICA"}</span><h3>{party.displayName}</h3><p>Origem: {party.sourceKind === "operator_declaration" ? "declaração do operador" : "prévia de importação"} · Papéis no módulo: {party.roleCount}</p></article>)}</div>}</section>
      </section>}

      {activeSector === "roles" && <section id="domain-roles" className="domain-foundation-workspace" aria-labelledby="role-title"><div className="domain-foundation-section-heading"><div><p className="domain-foundation-eyebrow">03 · PAPÉIS TEMPORAIS</p><h2 id="role-title">Jornada com vigência clara.</h2></div><p>Um papel descreve a relação operacional e nunca concede login, portal, grant, representação ou direito financeiro.</p></div><div className="domain-foundation-workspace__grid domain-foundation-workspace__grid--single"><form className="domain-foundation-card" onSubmit={assignRole}><div className="domain-foundation-card__title"><UsersRound size={19} /><h3>Adicionar papel temporal</h3></div><p>Relacione uma Party já devolvida pelo contexto atual sem duplicar cadastro.</p><label htmlFor="party-role-id">Party autorizada</label><select id="party-role-id" value={rolePartyId} onChange={(event) => setRolePartyId(event.target.value)} disabled={!contextEnabled || partiesQuery.isLoading} required aria-describedby="party-role-selection-note"><option value="">{!contextEnabled ? "Defina um contexto autorizado" : partiesQuery.isLoading ? "Carregando Parties autorizadas" : partiesQuery.isError ? "Leitura de Parties não liberada" : partiesQuery.data?.length ? "Selecione uma Party autorizada" : "Nenhuma Party em rascunho neste contexto"}</option>{partiesQuery.data?.map((party) => <option key={party.partyId} value={party.partyId}>{domainPartySelectionLabel(party)}</option>)}</select><p id="party-role-selection-note" className="domain-foundation-card__note">A seleção usa somente Parties devolvidas pelo contexto atual. O identificador técnico não é exibido e o servidor valida o vínculo novamente.</p><label htmlFor="party-role">Papel</label><select id="party-role" value={role} onChange={(event) => setRole(event.target.value)} disabled={!contextEnabled}><option value="lead">Lead</option><option value="client">Cliente</option><option value="buyer">Comprador</option><option value="seller">Vendedor</option><option value="owner">Proprietário</option><option value="tenant">Locatário</option><option value="guarantor">Garantidor</option><option value="representative">Representante</option><option value="broker">Corretor</option><option value="provider">Prestador</option><option value="shareholder">Sócio</option><option value="partner">Parceiro</option><option value="land_contributor">Cedente de terra</option></select><div className="domain-foundation-card__dates"><label htmlFor="party-role-start">Início <span>opcional</span><input id="party-role-start" type="datetime-local" value={roleBeginsAt} onChange={(event) => { setRoleBeginsAt(event.target.value); if (rolePeriodValidationMessage) setRolePeriodValidationMessage(""); }} disabled={!contextEnabled} aria-invalid={rolePeriodValidationMessage ? "true" : undefined} aria-describedby={rolePeriodValidationMessage ? "party-role-period-validation" : undefined} /></label><label htmlFor="party-role-end">Fim <span>opcional</span><input id="party-role-end" type="datetime-local" value={roleEndsAt} onChange={(event) => { setRoleEndsAt(event.target.value); if (rolePeriodValidationMessage) setRolePeriodValidationMessage(""); }} disabled={!contextEnabled} aria-invalid={rolePeriodValidationMessage ? "true" : undefined} aria-describedby={rolePeriodValidationMessage ? "party-role-period-validation" : undefined} /></label></div>{rolePeriodValidationMessage && <p id="party-role-period-validation" className="domain-foundation-card__note is-error" role="alert">{rolePeriodValidationMessage}</p>}<button type="submit" disabled={!contextEnabled || assignRoleMutation.isPending}>{assignRoleMutation.isPending ? "Atribuindo papel" : "Adicionar papel em rascunho"}</button></form></div></section>}

      {activeSector === "protected" && <section id="domain-limits" className="domain-foundation-workspace" aria-labelledby="protected-title"><div className="domain-foundation-section-heading"><div><p className="domain-foundation-eyebrow">04 · ATRIBUTOS PROTEGIDOS</p><h2 id="protected-title">Dados sensíveis permanecem bloqueados.</h2></div><p>Esta área não oferece cadastro, consulta, arquivo ou importação de dados pessoais, fiscais ou financeiros.</p></div><aside className="domain-foundation-guardrail"><p className="domain-foundation-eyebrow">BLOQUEIO EXPLÍCITO</p><h3>Não há atalho de cadastro.</h3><ul><li>Party não é usuário.</li><li>Papel não é grant.</li><li>Rascunho não é contrato.</li><li>Nome não prova identidade.</li><li>Evento não é efeito financeiro.</li></ul></aside></section>}
    </main>
  </DashboardLayout>;
}
