import DashboardLayout, { type DashboardAccessGate, type DashboardNavigationItem } from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { isDomainContextReady } from "@/lib/domainFoundationUi";
import { lotInventoryOperationalValue } from "@/lib/lotInventoryOperationalOverview";
import { initialAuthorizedSubdivisionContextId, resolveAuthorizedSubdivisionContext } from "@/lib/subdivisionContextSelection";
import { trpc } from "@/lib/trpc";
import { ArrowUpRight, Boxes, CircleAlert, Compass, Grid2X2, House, LandPlot, Map, ShieldCheck, Workflow } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import "../lot-inventory.css";

const navigationItems: DashboardNavigationItem[] = [
  { icon: Compass, label: "Central de plataforma", path: "/administracao" },
  { icon: ShieldCheck, label: "Painel ADM", path: "/adm" },
  { icon: LandPlot, label: "Loteadora", path: "/loteadora" },
  { icon: Map, label: "Estoque/Mapa de Lotes", path: "/estoque-lotes" },
  { icon: Workflow, label: "Vendas Urbanas", path: "/vendas-urbanas" },
  { icon: House, label: "Locação", path: "/locacao" },
];

const accessGate: DashboardAccessGate = {
  eyebrow: "ESTOQUE E MAPA · CONTEXTO ANTES DE LEITURA",
  title: "Construa o inventário de lotes somente no contexto autorizado.",
  description: "Esta área separa a matriz de Quadras do inventário de Lotes. O servidor confirma identidade, membership, grant, vigência, finalidade e policy antes de qualquer leitura ou rascunho.",
  routeTitle: "Rota de acesso",
  routeDetail: "Autenticação → organização → Loteadora → policy",
  actionLabel: "Acessar Estoque e Mapa",
  footerLabel: "INVENTÁRIO",
  footerValue: "CONTEXTO · RASCUNHO",
  footerNote: "Nenhum lote, reserva, venda ou registro de outro contexto é exposto antes da autorização.",
  railTop: "LOTEADORA",
  railBottom: "INVENTÁRIO",
};

export default function LotInventory() {
  const { isAuthenticated } = useAuth();
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [blockId, setBlockId] = useState("");
  const [lotNumber, setLotNumber] = useState(1);
  const [lotId, setLotId] = useState("");
  const [phase, setPhase] = useState<"reference_confirmed" | "structure_review" | "review_required">("reference_confirmed");
  const authorizedContextsQuery = trpc.organizationContext.listAuthorizedForModule.useQuery({ module: "loteadora" }, { enabled: isAuthenticated, retry: false });
  const selectedOrganizationContext = resolveAuthorizedSubdivisionContext(selectedOrganizationId, authorizedContextsQuery.data);
  useEffect(() => {
    if (selectedOrganizationId && !selectedOrganizationContext) setSelectedOrganizationId("");
    if (!selectedOrganizationId) setSelectedOrganizationId(initialAuthorizedSubdivisionContextId(authorizedContextsQuery.data));
  }, [selectedOrganizationId, selectedOrganizationContext, authorizedContextsQuery.data]);
  const context = useMemo(() => ({ organizationId: selectedOrganizationContext?.organizationId ?? "", module: "loteadora" as const, purposeCode: selectedOrganizationContext?.purposeCode ?? "" }), [selectedOrganizationContext]);
  const contextReady = isAuthenticated && isDomainContextReady(context);
  const lotsInput = useMemo(() => ({ ...context, blockId }), [context, blockId]);
  const lots = trpc.subdivisionFoundation.listDraftLots.useQuery(lotsInput, { enabled: contextReady && Boolean(blockId), retry: false });
  const events = trpc.subdivisionFoundation.listDraftLotInventoryEvents.useQuery(context, { enabled: contextReady, retry: false });
  const utils = trpc.useUtils();
  const create = trpc.subdivisionFoundation.createDraftLot.useMutation({ onSuccess() { setLotNumber(1); void utils.subdivisionFoundation.listDraftLots.invalidate(lotsInput); toast.success("Lote em rascunho registrado"); } });
  const inventory = trpc.subdivisionFoundation.upsertDraftLotInventoryState.useMutation({ onSuccess() { void events.refetch(); toast.success("Situação interna registrada"); } });
  const sectors = [
    { code: "01", title: "Quadras", value: lotInventoryOperationalValue({ contextReady, loading: false, pendingLabel: "Aguardando loteamento" }), description: "A matriz começa no Cadastro de Loteamentos e usa a convenção Quadra N.", target: "/loteadora#subdivision-inventory", icon: Grid2X2 },
    { code: "02", title: "Lotes", value: lotInventoryOperationalValue({ contextReady, loading: lots.isLoading, count: lots.data?.length, pendingLabel: "Aguardando Quadra" }), description: "Cada Quadra comporta de Lote 1 a Lote 100, sem disponibilidade comercial.", target: "#lot-draft", icon: LandPlot },
    { code: "03", title: "Mapa de Trabalho", value: contextReady ? "Aguardando Lotes" : "Aguardando contexto", description: "O mapa será visual e separado do cadastro; nesta etapa não existe geolocalização ou publicação.", target: "#lot-map", icon: Map },
    { code: "04", title: "Histórico Interno", value: lotInventoryOperationalValue({ contextReady, loading: events.isLoading, count: events.data?.length, pendingLabel: "Aguardando leitura" }), description: "Mudanças de referência não demonstram reserva, venda, contrato ou financeiro.", target: "#lot-history", icon: Boxes },
  ];

  return <DashboardLayout navigationItems={navigationItems} navigationTitle="Núcleo CRM" accessGate={accessGate}><main className="lot-inventory-page">
    <header className="lot-inventory-hero"><div><p className="lot-inventory-eyebrow">ESTOQUE E MAPA DE LOTES · SETOR SEPARADO</p><h1>Quadras organizam. Lotes ocupam. O mapa dá contexto.</h1><p>O inventário não é uma extensão do cadastro de loteamentos: ele é uma frente própria para estruturar lotes, revisar referências e preparar a visualização de estoque com controle.</p></div><aside><ShieldCheck size={20} /><span>Sem efeito comercial</span><b>Rascunhos internos</b><small>Sem preço, reserva, cliente, contrato ou financeiro</small></aside></header>

    <section className="lot-inventory-overview" aria-labelledby="lot-overview-title"><div className="lot-inventory-overview__heading"><div><p className="lot-inventory-eyebrow">VISÃO OPERACIONAL · ESTOQUE E MAPA</p><h2 id="lot-overview-title">Do loteamento à Quadra, da Quadra ao Lote.</h2></div><p>Os indicadores mostram somente leituras devolvidas pelo contexto autorizado. Estados vazios não significam estoque disponível e não expõem outro loteamento.</p></div><nav className="lot-inventory-overview__grid" aria-label="Setores de Estoque e Mapa de Lotes">{sectors.map(({ code, title, value, description, target, icon: Icon }) => <a key={code} href={target}><span>{code}</span><Icon size={18} aria-hidden="true" /><strong>{title}</strong><b>{value}</b><small>{description}</small><em>Ver setor <ArrowUpRight size={14} /></em></a>)}</nav></section>

    <section className="lot-inventory-context" aria-labelledby="lot-context-title"><div><p className="lot-inventory-eyebrow">CONTEXTO AUTORIZADO</p><h2 id="lot-context-title">Escolha a organização, não um identificador técnico.</h2></div><div className="lot-inventory-context__fields"><label htmlFor="lot-organization">Organização autorizada<select id="lot-organization" value={selectedOrganizationId} onChange={(event) => setSelectedOrganizationId(event.target.value)} disabled={!isAuthenticated || authorizedContextsQuery.isLoading}><option value="">{authorizedContextsQuery.isLoading ? "Carregando contextos autorizados" : "Selecione uma organização autorizada"}</option>{authorizedContextsQuery.data?.map((organization) => <option key={organization.organizationId} value={organization.organizationId}>{organization.organizationLabel}</option>)}</select></label><label htmlFor="lot-module">Módulo<input id="lot-module" value="Loteadora" readOnly aria-readonly="true" /></label><label htmlFor="lot-purpose">Finalidade<input id="lot-purpose" value={context.purposeCode || "—"} readOnly aria-readonly="true" /></label></div><p className={`lot-inventory-context__status ${contextReady ? "is-ready" : "is-blocked"}`}><CircleAlert size={16} />{contextReady ? "Contexto autorizado selecionado. O servidor ainda valida identidade, membership, grant, vigência, módulo e finalidade." : authorizedContextsQuery.isError ? "O contexto não foi liberado. A interface não revela organizações ou escopos externos." : "Selecione um contexto autorizado antes de abrir os rascunhos de inventário."}</p></section>

    <section id="lot-map" className="lot-inventory-map" aria-labelledby="lot-map-title"><Map size={24} aria-hidden="true" /><div><p className="lot-inventory-eyebrow">MAPA DE LOTES · PRÓXIMA CAMADA</p><h2 id="lot-map-title">O mapa visual será construído sobre Quadras e Lotes já estruturados.</h2><p>Como não há loteamento, Quadra ou Lote cadastrado neste ambiente, não há planta, disponibilidade, cores de estoque, localização ou dado comercial para mostrar. Essa ausência é intencional e preserva a separação entre cadastro e inventário.</p></div></section>

    <section className="lot-inventory-workspace" aria-labelledby="lot-workspace-title"><div><p className="lot-inventory-eyebrow">RASCUNHOS AVANÇADOS</p><h2 id="lot-workspace-title">Disponíveis quando a matriz estiver pronta.</h2><p>Os controles permanecem recolhidos até a existência de referências internas. Eles não inferem Quadra ou Lote por nome, tela ou URL.</p></div><div className="lot-inventory-workspace__cards"><details id="lot-draft"><summary>Estruturar Lotes da Quadra <ArrowUpRight size={16} /></summary><form onSubmit={(event) => { event.preventDefault(); create.mutate({ ...context, correlationId: crypto.randomUUID(), blockId, lotNumber }); }}><label htmlFor="lot-block-reference">Referência técnica da Quadra</label><input id="lot-block-reference" value={blockId} onChange={(event) => setBlockId(event.target.value)} placeholder="Disponível após cadastro da Quadra" disabled={!contextReady} required /><label htmlFor="lot-number">Número do Lote</label><input id="lot-number" type="number" min={1} max={100} value={lotNumber} onChange={(event) => setLotNumber(Number(event.target.value))} disabled={!contextReady} required /><p>O registro fica em rascunho e não indica disponibilidade, reserva, venda ou contrato.</p><button type="submit" disabled={!contextReady || !blockId || create.isPending}>{create.isPending ? "Registrando" : "Registrar Lote em rascunho"}</button></form>{contextReady && blockId && lots.data?.length === 0 && <p className="lot-inventory-inline-empty">Nenhum Lote foi devolvido para esta Quadra. Isso não representa estoque comercial.</p>}</details><details><summary>Registrar situação interna <ArrowUpRight size={16} /></summary><form onSubmit={(event) => { event.preventDefault(); inventory.mutate({ ...context, correlationId: crypto.randomUUID(), lotId, inventoryPhase: phase }); }}><label htmlFor="lot-reference">Referência técnica do Lote</label><input id="lot-reference" value={lotId} onChange={(event) => setLotId(event.target.value)} placeholder="Disponível após estruturação do Lote" disabled={!contextReady} required /><label htmlFor="lot-phase">Situação interna</label><select id="lot-phase" value={phase} onChange={(event) => setPhase(event.target.value as typeof phase)} disabled={!contextReady}><option value="reference_confirmed">Referência confirmada</option><option value="structure_review">Revisão de estrutura</option><option value="review_required">Revisão necessária</option></select><p>O histórico é interno e não confirma disponibilidade, reserva, venda, pagamento ou contrato.</p><button type="submit" disabled={!contextReady || !lotId || inventory.isPending}>{inventory.isPending ? "Registrando" : "Registrar situação interna"}</button></form></details></div></section>

    <section id="lot-history" className="lot-inventory-history" aria-labelledby="lot-history-title"><p className="lot-inventory-eyebrow">HISTÓRICO INTERNO</p><h2 id="lot-history-title">Estados de inventário aguardando a primeira referência.</h2><p>Não há transição interna devolvida para este contexto. O CRM não usa essa ausência para concluir disponibilidade, propriedade, reserva, venda ou recebimento.</p></section>
  </main></DashboardLayout>;
}
