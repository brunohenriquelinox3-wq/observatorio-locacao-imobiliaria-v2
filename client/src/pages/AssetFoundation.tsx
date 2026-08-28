import DashboardLayout, { type DashboardNavigationItem } from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { isDomainContextReady } from "@/lib/domainFoundationUi";
import { trpc } from "@/lib/trpc";
import { Building2, CircleAlert, Compass, House, Layers3, Link2, ShieldCheck, SlidersHorizontal, UsersRound, Workflow } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import "../asset-foundation.css";

const navigationItems: DashboardNavigationItem[] = [
  { icon: Compass, label: "Central de plataforma", path: "/administracao" },
  { icon: UsersRound, label: "Núcleo de cadastros", path: "/cadastro-base" },
  { icon: House, label: "Ativos urbanos", path: "/ativos-urbanos" },
  { icon: Workflow, label: "Vendas Urbanas", path: "/vendas-urbanas" },
];

const assetKinds = {
  apartment: "Apartamento", house: "Casa", kitnet: "Kitnet", commercial_unit: "Unidade comercial",
  urban_lot: "Lote urbano", building: "Edificação", other_urban_asset: "Outro ativo urbano",
} as const;

export default function AssetFoundation() {
  const { isAuthenticated } = useAuth();
  const [organizationId, setOrganizationId] = useState("");
  const [module, setModule] = useState<"vendas_urbanas" | "locacao">("vendas_urbanas");
  const [purposeCode, setPurposeCode] = useState("CADASTRO_INICIAL");
  const [assetKind, setAssetKind] = useState<keyof typeof assetKinds>("apartment");
  const [referenceLabel, setReferenceLabel] = useState("");
  const [internalReference, setInternalReference] = useState("");
  const [relationAssetId, setRelationAssetId] = useState("");
  const [relationPartyId, setRelationPartyId] = useState("");
  const [relationKind, setRelationKind] = useState<"ownership_claim" | "management_authority">("ownership_claim");
  const [stateAssetId, setStateAssetId] = useState("");
  const [moduleState, setModuleState] = useState<"draft" | "preparing" | "eligible" | "blocked" | "withdrawn">("draft");
  const [reasonCode, setReasonCode] = useState("");

  const context = useMemo(() => ({ organizationId: organizationId.trim(), module, purposeCode: purposeCode.trim().toUpperCase() }), [organizationId, module, purposeCode]);
  const isContextReady = isDomainContextReady(context);
  const queryEnabled = isAuthenticated && isContextReady;
  const assetsQuery = trpc.assetFoundation.listDraftUrbanAssets.useQuery(context, { enabled: queryEnabled, retry: false });
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
    relationMutation.mutate({ ...context, correlationId: crypto.randomUUID(), assetId: relationAssetId.trim(), partyId: relationPartyId.trim(), relation: relationKind });
  }
  function changeState(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    stateMutation.mutate({ ...context, correlationId: crypto.randomUUID(), assetId: stateAssetId.trim(), state: moduleState, reasonCode: moduleState === "blocked" ? reasonCode.trim().toUpperCase() : undefined });
  }

  return (
    <DashboardLayout navigationItems={navigationItems} navigationTitle="Núcleo CRM">
      <div className="asset-foundation-page">
        <header className="asset-foundation-hero">
          <div><p className="asset-foundation-eyebrow">ATIVO URBANO · SITUAÇÃO NÃO É NEGOCIAÇÃO</p><h1>O imóvel começa como ativo verificável de trabalho.</h1><p>O núcleo separa referência do ativo, relações de Party e estado por módulo. Isso evita que uma alegação de titularidade ou um card de disponibilidade seja confundido com autorização, contrato ou publicação.</p></div>
          <div className="asset-foundation-hero__rule"><ShieldCheck size={18} /><span>Estado contextual<br /><b>sem endereço, anúncio ou efeito financeiro</b></span></div>
        </header>

        <section className="asset-foundation-context" aria-labelledby="asset-context-title">
          <div className="asset-foundation-heading"><div><p className="asset-foundation-eyebrow">01 · CONTEXTO</p><h2 id="asset-context-title">O mesmo ativo pode ter trabalho distinto em cada módulo.</h2></div><p>Organização, módulo e finalidade são parâmetros obrigatórios. A consulta não usa a tela, o nome ou o identificador do ativo para inferir autorização.</p></div>
          <div className="asset-foundation-context__fields">
            <label htmlFor="asset-organization"><Building2 size={14} /> ID da organização<input id="asset-organization" value={organizationId} onChange={(event) => setOrganizationId(event.target.value)} placeholder="UUID da organização autorizada" /></label>
            <label htmlFor="asset-module"><Layers3 size={14} /> Módulo<select id="asset-module" value={module} onChange={(event) => setModule(event.target.value as typeof module)}><option value="vendas_urbanas">Vendas Urbanas</option><option value="locacao">Locação</option></select></label>
            <label htmlFor="asset-purpose"><ShieldCheck size={14} /> Finalidade<input id="asset-purpose" value={purposeCode} onChange={(event) => setPurposeCode(event.target.value.toUpperCase())} placeholder="CADASTRO_INICIAL" /></label>
          </div>
          <div className={`asset-foundation-context__status ${isContextReady ? "is-ready" : "is-blocked"}`}><CircleAlert size={16} /><span>{isContextReady ? "Contexto sintaticamente válido. O servidor confirmará identidade, membership, grant, vigência, módulo e finalidade antes de qualquer leitura ou rascunho." : "Informe organização, módulo e finalidade válidos para liberar as ações de rascunho."}</span></div>
        </section>

        <section className="asset-foundation-workspace" aria-labelledby="asset-workspace-title">
          <div className="asset-foundation-heading"><div><p className="asset-foundation-eyebrow">02 · ATIVO E RELAÇÕES</p><h2 id="asset-workspace-title">Cadastre a menor unidade útil e mantenha as relações separadas.</h2></div><p>A interface não coleta endereço, geolocalização, matrícula, mídia, preço, comissão, anúncio, reserva, contrato ou pagamento.</p></div>
          <div className="asset-foundation-grid">
            <form className="asset-foundation-card" onSubmit={createAsset}>
              <div className="asset-foundation-card__title"><House size={19} /><h3>Ativo em rascunho</h3></div><p>Use uma referência de trabalho e um código interno. Nenhum desses dados é tratado como prova registral ou comercial.</p>
              <label htmlFor="asset-kind">Tipo de ativo</label><select id="asset-kind" value={assetKind} onChange={(event) => setAssetKind(event.target.value as keyof typeof assetKinds)} disabled={!isContextReady}>{Object.entries(assetKinds).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              <label htmlFor="asset-reference-label">Referência de trabalho</label><input id="asset-reference-label" value={referenceLabel} onChange={(event) => setReferenceLabel(event.target.value)} placeholder="Ex.: Unidade em rascunho" disabled={!isContextReady} required minLength={2} maxLength={160} />
              <label htmlFor="asset-internal-reference">Código interno</label><input id="asset-internal-reference" value={internalReference} onChange={(event) => setInternalReference(event.target.value.toUpperCase())} placeholder="EX.: VU-001" disabled={!isContextReady} required minLength={2} maxLength={64} />
              <button type="submit" disabled={!isContextReady || createMutation.isPending}>{createMutation.isPending ? "Criando rascunho" : "Criar ativo em rascunho"}</button>
            </form>
            <form className="asset-foundation-card" onSubmit={attachParty}>
              <div className="asset-foundation-card__title"><Link2 size={19} /><h3>Relacionar Party</h3></div><p>Declare titularidade alegada ou autoridade de gestão sem concluir propriedade, representação ou contrato.</p>
              <label htmlFor="relation-asset-id">ID do ativo</label><input id="relation-asset-id" value={relationAssetId} onChange={(event) => setRelationAssetId(event.target.value)} placeholder="UUID do ativo em rascunho" disabled={!isContextReady} required />
              <label htmlFor="relation-party-id">ID da Party</label><input id="relation-party-id" value={relationPartyId} onChange={(event) => setRelationPartyId(event.target.value)} placeholder="UUID da Party em rascunho" disabled={!isContextReady} required />
              <label htmlFor="relation-kind">Relação</label><select id="relation-kind" value={relationKind} onChange={(event) => setRelationKind(event.target.value as typeof relationKind)} disabled={!isContextReady}><option value="ownership_claim">Titularidade alegada</option><option value="management_authority">Autoridade de gestão</option></select>
              <button type="submit" disabled={!isContextReady || relationMutation.isPending}>{relationMutation.isPending ? "Relacionando" : "Adicionar relação"}</button>
            </form>
            <form className="asset-foundation-card" onSubmit={changeState}>
              <div className="asset-foundation-card__title"><SlidersHorizontal size={19} /><h3>Estado no módulo</h3></div><p>O estado de trabalho vale apenas para o módulo atual. Ele não altera outro módulo nem libera uma ação externa.</p>
              <label htmlFor="state-asset-id">ID do ativo</label><input id="state-asset-id" value={stateAssetId} onChange={(event) => setStateAssetId(event.target.value)} placeholder="UUID do ativo em rascunho" disabled={!isContextReady} required />
              <label htmlFor="module-state">Estado</label><select id="module-state" value={moduleState} onChange={(event) => setModuleState(event.target.value as typeof moduleState)} disabled={!isContextReady}><option value="draft">Rascunho</option><option value="preparing">Em preparação</option><option value="eligible">Elegível para próxima análise</option><option value="blocked">Bloqueado</option><option value="withdrawn">Retirado</option></select>
              {moduleState === "blocked" && <><label htmlFor="state-reason">Motivo em código</label><input id="state-reason" value={reasonCode} onChange={(event) => setReasonCode(event.target.value.toUpperCase())} placeholder="EX.: PENDENCIA_DOCUMENTAL" disabled={!isContextReady} required /></>}
              <button type="submit" disabled={!isContextReady || stateMutation.isPending}>{stateMutation.isPending ? "Atualizando estado" : "Atualizar estado"}</button>
            </form>
          </div>
        </section>

        <section className="asset-foundation-list" aria-labelledby="asset-list-title">
          <div className="asset-foundation-heading"><div><p className="asset-foundation-eyebrow">03 · LEITURA AUTORIZADA</p><h2 id="asset-list-title">Ativos em rascunho no contexto atual.</h2></div><p>A resposta é minimizada: referência, tipo, código interno, estado no módulo e contagem de relações; sem Party, documento ou atributo sensível.</p></div>
          {!isContextReady && <div className="asset-foundation-empty"><CircleAlert size={18} /><p>Sem contexto não há consulta e não há indicação de existência de ativos.</p></div>}
          {isContextReady && assetsQuery.isLoading && <div className="asset-foundation-empty"><span className="asset-foundation-spinner" aria-hidden="true" /><p>Confirmando o contexto antes de solicitar a leitura autorizada.</p></div>}
          {isContextReady && assetsQuery.isError && <div className="asset-foundation-empty is-error"><CircleAlert size={18} /><p>A leitura não foi liberada. Revise identidade, membership, grant, vigência, módulo e finalidade sem tentar inferir outros ativos.</p></div>}
          {isContextReady && assetsQuery.data?.length === 0 && <div className="asset-foundation-empty"><House size={18} /><p>Nenhum ativo em rascunho foi devolvido para este contexto. A resposta não revela dados de outros contextos.</p></div>}
          {isContextReady && assetsQuery.data && assetsQuery.data.length > 0 && <div className="asset-foundation-list__rows">{assetsQuery.data.map((asset) => <article key={asset.assetId}><span>{assetKinds[asset.kind as keyof typeof assetKinds] ?? "Ativo urbano"}</span><h3>{asset.referenceLabel}</h3><p><b>{asset.moduleState}</b> · {asset.partyRelationCount} relação(ões) contextual(is) · {asset.stateReasonPresent ? "motivo de bloqueio registrado" : "sem motivo de bloqueio exposto"}</p><code>{asset.internalReference} · {asset.assetId}</code></article>)}</div>}
        </section>
      </div>
    </DashboardLayout>
  );
}
