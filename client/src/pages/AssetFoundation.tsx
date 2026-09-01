import DashboardLayout, { type DashboardNavigationItem } from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { assetContextSelectionLabel } from "@/lib/assetContextSelection";
import { domainPartySelectionLabel } from "@/lib/domainPartySelection";
import { isDomainContextReady } from "@/lib/domainFoundationUi";
import { assetOperationalValue } from "@/lib/assetOperationalOverview";
import { initialAuthorizedSubdivisionContextId, resolveAuthorizedSubdivisionContext } from "@/lib/subdivisionContextSelection";
import { trpc } from "@/lib/trpc";
import { Building2, CircleAlert, Compass, House, Layers3, Link2, ShieldCheck, SlidersHorizontal, UsersRound, Workflow } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import "../asset-foundation.css";

const navigationItems: DashboardNavigationItem[] = [
  { icon: Compass, label: "Central de plataforma", path: "/administracao" },
  { icon: ShieldCheck, label: "Painel ADM", path: "/adm" },
  { icon: Layers3, label: "Loteadora", path: "/loteadora" },
  { icon: Workflow, label: "Vendas Urbanas", path: "/vendas-urbanas" },
  { icon: House, label: "Locação", path: "/locacao" },
  { icon: UsersRound, label: "Núcleo de cadastros", path: "/cadastro-base" },
  { icon: House, label: "Ativos urbanos", path: "/ativos-urbanos" },
];

const assetKinds = {
  apartment: "Apartamento", house: "Casa", kitnet: "Kitnet", commercial_unit: "Unidade comercial",
  urban_lot: "Lote urbano", building: "Edificação", other_urban_asset: "Outro ativo urbano",
} as const;

export default function AssetFoundation() {
  const { isAuthenticated } = useAuth();
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [module, setModule] = useState<"vendas_urbanas" | "locacao">("vendas_urbanas");
  const [assetKind, setAssetKind] = useState<keyof typeof assetKinds>("apartment");
  const [referenceLabel, setReferenceLabel] = useState("");
  const [internalReference, setInternalReference] = useState("");
  const [relationAssetId, setRelationAssetId] = useState("");
  const [relationPartyId, setRelationPartyId] = useState("");
  const [relationKind, setRelationKind] = useState<"ownership_claim" | "management_authority">("ownership_claim");
  const [stateAssetId, setStateAssetId] = useState("");
  const [moduleState, setModuleState] = useState<"draft" | "preparing" | "eligible" | "blocked" | "withdrawn">("draft");
  const [reasonCode, setReasonCode] = useState("");

  const authorizedContextsQuery = trpc.organizationContext.listAuthorizedForModule.useQuery({ module }, { enabled: isAuthenticated, retry: false });
  const selectedOrganizationContext = resolveAuthorizedSubdivisionContext(selectedOrganizationId, authorizedContextsQuery.data);
  useEffect(() => {
    if (selectedOrganizationId && !selectedOrganizationContext) setSelectedOrganizationId("");
    if (!selectedOrganizationId) setSelectedOrganizationId(initialAuthorizedSubdivisionContextId(authorizedContextsQuery.data));
  }, [selectedOrganizationId, selectedOrganizationContext, authorizedContextsQuery.data]);
  const context = useMemo(() => ({ organizationId: selectedOrganizationContext?.organizationId ?? "", module, purposeCode: selectedOrganizationContext?.purposeCode ?? "" }), [module, selectedOrganizationContext]);
  const isContextReady = isDomainContextReady(context);
  const queryEnabled = isAuthenticated && isContextReady;
  const assetsQuery = trpc.assetFoundation.listDraftUrbanAssets.useQuery(context, { enabled: queryEnabled, retry: false });
  const partiesQuery = trpc.domainFoundation.listDraftParties.useQuery(context, { enabled: queryEnabled, retry: false });
  useEffect(() => {
    if (Array.isArray(assetsQuery.data)) {
      if (relationAssetId && !assetsQuery.data.some((asset) => asset.assetId === relationAssetId)) setRelationAssetId("");
      if (stateAssetId && !assetsQuery.data.some((asset) => asset.assetId === stateAssetId)) setStateAssetId("");
    }
  }, [assetsQuery.data, relationAssetId, stateAssetId]);
  useEffect(() => {
    if (relationPartyId && Array.isArray(partiesQuery.data) && !partiesQuery.data.some((party) => party.partyId === relationPartyId)) {
      setRelationPartyId("");
    }
  }, [partiesQuery.data, relationPartyId]);
  const partyRelationCount = assetsQuery.data?.reduce((total, asset) => total + asset.partyRelationCount, 0);
  const eligibleCount = assetsQuery.data?.filter((asset) => asset.moduleState === "eligible").length;
  const operationalSectors = [
    { code: "01", title: "Inventário de Ativos", value: assetOperationalValue({ contextReady: queryEnabled, loading: assetsQuery.isLoading, count: assetsQuery.data?.length, pendingLabel: "Aguardando leitura" }), description: "Referências de trabalho não são anúncio, endereço ou prova registral.", target: "#asset-inventory" },
    { code: "02", title: "Vínculos de Party", value: assetOperationalValue({ contextReady: queryEnabled, loading: assetsQuery.isLoading, count: partyRelationCount, pendingLabel: "Aguardando leitura" }), description: "Alegação de titularidade e gestão continuam distintas de mandato ou contrato.", target: "#asset-relations" },
    { code: "03", title: "Prontidão", value: assetOperationalValue({ contextReady: queryEnabled, loading: assetsQuery.isLoading, count: eligibleCount, pendingLabel: "Aguardando leitura" }), description: "Elegibilidade é uma etapa interna e não publica, reserva, vende ou loca o ativo.", target: "#asset-readiness" },
  ];
  const createMutation = trpc.assetFoundation.createDraftUrbanAsset.useMutation({
    onSuccess() { setReferenceLabel(""); setInternalReference(""); toast.success("Ativo em rascunho criado", { description: "Nenhum endereço, preço, contrato, anúncio ou dado financeiro foi incluído." }); void assetsQuery.refetch(); },
    onError() { toast.error("Ativo não criado", { description: "O servidor exige identidade, grant ativo, contexto e campos válidos sem revelar registros externos." }); },
  });
  const relationMutation = trpc.assetFoundation.attachDraftAssetParty.useMutation({
    onSuccess() { setRelationAssetId(""); setRelationPartyId(""); toast.success("Relação contextual adicionada", { description: "Titularidade alegada e autoridade de gestão não comprovam domínio, representação ou contrato." }); void assetsQuery.refetch(); },
    onError() { toast.error("Relação não adicionada", { description: "O ativo e a Party devem estar no mesmo contexto autorizado e em estado de rascunho." }); },
  });
  const stateMutation = trpc.assetFoundation.setDraftAssetModuleState.useMutation({
    onSuccess() { setStateAssetId(""); setReasonCode(""); toast.success("Estado de trabalho atualizado", { description: "O estado não publica, reserva, loca, vende, contrata ou gera efeito financeiro." }); void assetsQuery.refetch(); },
    onError() { toast.error("Estado não atualizado", { description: "A mudança foi bloqueada por contexto, identidade, grant, motivo ou policy." }); },
  });

  function createAsset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate({ ...context, correlationId: crypto.randomUUID(), kind: assetKind, referenceLabel, internalReference: internalReference.trim().toUpperCase() });
  }
  function attachParty(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    relationMutation.mutate({ ...context, correlationId: crypto.randomUUID(), assetId: relationAssetId, partyId: relationPartyId, relation: relationKind });
  }
  function changeState(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    stateMutation.mutate({ ...context, correlationId: crypto.randomUUID(), assetId: stateAssetId, state: moduleState, reasonCode: moduleState === "blocked" ? reasonCode.trim().toUpperCase() : undefined });
  }

  return (
    <DashboardLayout navigationItems={navigationItems} navigationTitle="Núcleo CRM">
      <div className="asset-foundation-page">
        <header className="asset-foundation-hero">
          <div><p className="asset-foundation-eyebrow">ATIVO URBANO · SITUAÇÃO NÃO É NEGOCIAÇÃO</p><h1>O imóvel começa como ativo verificável de trabalho.</h1><p>O núcleo separa referência do ativo, relações de Party e estado por módulo. Isso evita que uma alegação de titularidade ou um card de disponibilidade seja confundido com autorização, contrato ou publicação.</p></div>
          <div className="asset-foundation-hero__rule"><ShieldCheck size={18} /><span>Estado contextual<br /><b>sem endereço, anúncio ou efeito financeiro</b></span></div>
        </header>

        <section className="asset-foundation-overview" aria-labelledby="asset-overview-title"><div className="asset-foundation-overview__heading"><div><p className="asset-foundation-eyebrow">ATIVOS URBANOS · VISÃO DE INVENTÁRIO</p><h2 id="asset-overview-title">Trate cada ativo como uma referência de trabalho, não como uma promessa comercial.</h2></div><p>Os indicadores usam somente a leitura autorizada do módulo escolhido. Estados vazios não revelam imóveis, proprietários ou atividade de outros contextos.</p></div><nav className="asset-foundation-overview__grid" aria-label="Setores operacionais de Ativos Urbanos">{operationalSectors.map((sector) => <a key={sector.code} href={sector.target}><span>{sector.code}</span><strong>{sector.title}</strong><b>{sector.value}</b><small>{sector.description}</small><em>Ver setor</em></a>)}</nav></section>

        <section className="asset-foundation-context" aria-labelledby="asset-context-title">
          <div className="asset-foundation-heading"><div><p className="asset-foundation-eyebrow">01 · CONTEXTO</p><h2 id="asset-context-title">O mesmo ativo pode ter trabalho distinto em cada módulo.</h2></div><p>O contexto é devolvido por policy para a identidade atual. A seleção visual não substitui a verificação de membership, grant, vigência e finalidade no servidor.</p></div>
          <div className="asset-foundation-context__fields">
            <label htmlFor="asset-organization"><Building2 size={14} /> Organização autorizada<select id="asset-organization" value={selectedOrganizationId} onChange={(event) => setSelectedOrganizationId(event.target.value)} disabled={!isAuthenticated || authorizedContextsQuery.isLoading}><option value="">{authorizedContextsQuery.isLoading ? "Carregando contextos autorizados" : "Selecione uma organização autorizada"}</option>{authorizedContextsQuery.data?.map((organization) => <option key={organization.organizationId} value={organization.organizationId}>{organization.organizationLabel}</option>)}</select></label>
            <label htmlFor="asset-module"><Layers3 size={14} /> Módulo<select id="asset-module" value={module} onChange={(event) => setModule(event.target.value as typeof module)}><option value="vendas_urbanas">Vendas Urbanas</option><option value="locacao">Locação</option></select></label>
            <label htmlFor="asset-purpose"><ShieldCheck size={14} /> Finalidade<input id="asset-purpose" value={context.purposeCode || "—"} readOnly aria-readonly="true" /></label>
          </div>
          <div className={`asset-foundation-context__status ${isContextReady ? "is-ready" : "is-blocked"}`}><CircleAlert size={16} /><span>{isContextReady ? "Contexto autorizado selecionado. O servidor confirmará identidade, membership, grant, vigência, módulo e finalidade antes de qualquer leitura ou rascunho." : authorizedContextsQuery.isError ? "O contexto não foi liberado. A interface não revela organizações ou escopos externos." : "Selecione uma organização autorizada para o módulo antes de liberar as ações de rascunho."}</span></div>
        </section>

        <section id="asset-inventory" className="asset-foundation-workspace" aria-labelledby="asset-workspace-title">
          <div className="asset-foundation-heading"><div><p className="asset-foundation-eyebrow">02 · ATIVO E RELAÇÕES</p><h2 id="asset-workspace-title">Cadastre a menor unidade útil e mantenha as relações separadas.</h2></div><p>A interface não coleta endereço, geolocalização, matrícula, mídia, preço, comissão, anúncio, reserva, contrato ou pagamento.</p></div>
          <div className="asset-foundation-grid">
            <form className="asset-foundation-card" onSubmit={createAsset}>
              <div className="asset-foundation-card__title"><House size={19} /><h3>Ativo em rascunho</h3></div><p>Use uma referência de trabalho e um código interno. Nenhum desses dados é tratado como prova registral ou comercial.</p>
              <label htmlFor="asset-kind">Tipo de ativo</label><select id="asset-kind" value={assetKind} onChange={(event) => setAssetKind(event.target.value as keyof typeof assetKinds)} disabled={!queryEnabled}>{Object.entries(assetKinds).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              <label htmlFor="asset-reference-label">Referência de trabalho</label><input id="asset-reference-label" value={referenceLabel} onChange={(event) => setReferenceLabel(event.target.value)} placeholder="Ex.: Unidade em rascunho" disabled={!queryEnabled} required minLength={2} maxLength={160} />
              <label htmlFor="asset-internal-reference">Código interno</label><input id="asset-internal-reference" value={internalReference} onChange={(event) => setInternalReference(event.target.value.toUpperCase())} placeholder="EX.: VU-001" disabled={!queryEnabled} required minLength={2} maxLength={64} />
              <button type="submit" disabled={!queryEnabled || createMutation.isPending}>{createMutation.isPending ? "Criando rascunho" : "Criar ativo em rascunho"}</button>
            </form>
            <form id="asset-relations" className="asset-foundation-card" onSubmit={attachParty}>
              <div className="asset-foundation-card__title"><Link2 size={19} /><h3>Relacionar Party</h3></div><p>Declare titularidade alegada ou autoridade de gestão sem concluir propriedade, representação ou contrato.</p>
              <label htmlFor="relation-asset-id">Ativo autorizado</label><select id="relation-asset-id" value={relationAssetId} onChange={(event) => setRelationAssetId(event.target.value)} disabled={!queryEnabled || assetsQuery.isLoading} required aria-describedby="asset-relation-selection-note"><option value="">{!queryEnabled ? "Defina um contexto autorizado" : assetsQuery.isLoading ? "Carregando ativos autorizados" : assetsQuery.isError ? "Leitura de ativos não liberada" : assetsQuery.data?.length ? "Selecione um ativo autorizado" : "Nenhum ativo em rascunho neste contexto"}</option>{assetsQuery.data?.map((asset) => <option key={asset.assetId} value={asset.assetId}>{assetContextSelectionLabel(asset)}</option>)}</select>
              <label htmlFor="relation-party-id">Party autorizada</label><select id="relation-party-id" value={relationPartyId} onChange={(event) => setRelationPartyId(event.target.value)} disabled={!queryEnabled || partiesQuery.isLoading} required aria-describedby="asset-relation-selection-note"><option value="">{!queryEnabled ? "Defina um contexto autorizado" : partiesQuery.isLoading ? "Carregando Parties autorizadas" : partiesQuery.isError ? "Leitura de Parties não liberada" : partiesQuery.data?.length ? "Selecione uma Party autorizada" : "Nenhuma Party em rascunho neste contexto"}</option>{partiesQuery.data?.map((party) => <option key={party.partyId} value={party.partyId}>{domainPartySelectionLabel(party)}</option>)}</select>
              <p id="asset-relation-selection-note" className="asset-foundation-card__note">As opções são devolvidas apenas para o contexto atual. A seleção não autoriza o vínculo: o servidor confere ambos os registros novamente.</p>
              <label htmlFor="relation-kind">Relação</label><select id="relation-kind" value={relationKind} onChange={(event) => setRelationKind(event.target.value as typeof relationKind)} disabled={!queryEnabled}><option value="ownership_claim">Titularidade alegada</option><option value="management_authority">Autoridade de gestão</option></select>
              <button type="submit" disabled={!queryEnabled || relationMutation.isPending}>{relationMutation.isPending ? "Relacionando" : "Adicionar relação"}</button>
            </form>
            <form id="asset-readiness" className="asset-foundation-card" onSubmit={changeState}>
              <div className="asset-foundation-card__title"><SlidersHorizontal size={19} /><h3>Estado no módulo</h3></div><p>O estado de trabalho vale apenas para o módulo atual. Ele não altera outro módulo nem libera uma ação externa.</p>
              <label htmlFor="state-asset-id">Ativo autorizado</label><select id="state-asset-id" value={stateAssetId} onChange={(event) => setStateAssetId(event.target.value)} disabled={!queryEnabled || assetsQuery.isLoading} required aria-describedby="asset-state-selection-note"><option value="">{!queryEnabled ? "Defina um contexto autorizado" : assetsQuery.isLoading ? "Carregando ativos autorizados" : assetsQuery.isError ? "Leitura de ativos não liberada" : assetsQuery.data?.length ? "Selecione um ativo autorizado" : "Nenhum ativo em rascunho neste contexto"}</option>{assetsQuery.data?.map((asset) => <option key={asset.assetId} value={asset.assetId}>{assetContextSelectionLabel(asset)}</option>)}</select>
              <p id="asset-state-selection-note" className="asset-foundation-card__note">O estado pertence somente ao módulo e ao contexto atuais. Ele não publica, reserva, vende, loca ou contrata o ativo.</p>
              <label htmlFor="module-state">Estado</label><select id="module-state" value={moduleState} onChange={(event) => setModuleState(event.target.value as typeof moduleState)} disabled={!queryEnabled}><option value="draft">Rascunho</option><option value="preparing">Em preparação</option><option value="eligible">Elegível para próxima análise</option><option value="blocked">Bloqueado</option><option value="withdrawn">Retirado</option></select>
              {moduleState === "blocked" && <><label htmlFor="state-reason">Motivo em código</label><input id="state-reason" value={reasonCode} onChange={(event) => setReasonCode(event.target.value.toUpperCase())} placeholder="EX.: PENDENCIA_DOCUMENTAL" disabled={!queryEnabled} required /></>}
              <button type="submit" disabled={!queryEnabled || stateMutation.isPending}>{stateMutation.isPending ? "Atualizando estado" : "Atualizar estado"}</button>
            </form>
          </div>
        </section>

        <section className="asset-foundation-list" aria-labelledby="asset-list-title">
          <div className="asset-foundation-heading"><div><p className="asset-foundation-eyebrow">03 · LEITURA AUTORIZADA</p><h2 id="asset-list-title">Ativos em rascunho no contexto atual.</h2></div><p>A resposta é minimizada: referência, tipo, código interno, estado no módulo e contagem de relações; sem Party, documento ou atributo sensível.</p></div>
          {!isContextReady && <div className="asset-foundation-empty"><CircleAlert size={18} /><p>Sem contexto não há consulta e não há indicação de existência de ativos.</p></div>}
          {isContextReady && assetsQuery.isLoading && <div className="asset-foundation-empty"><span className="asset-foundation-spinner" aria-hidden="true" /><p>Confirmando o contexto antes de solicitar a leitura autorizada.</p></div>}
          {isContextReady && assetsQuery.isError && <div className="asset-foundation-empty is-error"><CircleAlert size={18} /><p>A leitura não foi liberada. Revise identidade, membership, grant, vigência, módulo e finalidade sem tentar inferir outros ativos.</p></div>}
          {isContextReady && assetsQuery.data?.length === 0 && <div className="asset-foundation-empty"><House size={18} /><p>Nenhum ativo em rascunho foi devolvido para este contexto. A resposta não revela dados de outros contextos.</p></div>}
          {isContextReady && assetsQuery.data && assetsQuery.data.length > 0 && <div className="asset-foundation-list__rows">{assetsQuery.data.map((asset) => <article key={asset.assetId}><span>{assetKinds[asset.kind as keyof typeof assetKinds] ?? "Ativo urbano"}</span><h3>{asset.referenceLabel}</h3><p><b>{asset.moduleState}</b> · {asset.partyRelationCount} relação(ões) contextual(is) · {asset.stateReasonPresent ? "motivo de bloqueio registrado" : "sem motivo de bloqueio exposto"}</p><code>{asset.internalReference}</code></article>)}</div>}
        </section>
      </div>
    </DashboardLayout>
  );
}
