import DashboardLayout, { type DashboardAccessGate, type DashboardNavigationItem } from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { isDomainContextReady } from "@/lib/domainFoundationUi";
import { draftBlockSelectionLabel, draftDevelopmentSelectionLabel, draftLotSelectionLabel } from "@/lib/lotInventoryContextSelection";
import { validateLotNumber } from "@/lib/lotNumberValidation";
import { initialAuthorizedSubdivisionContextId, resolveAuthorizedSubdivisionContext } from "@/lib/subdivisionContextSelection";
import { trpc } from "@/lib/trpc";
import { ArrowUpRight, Boxes, CircleAlert, Compass, House, LandPlot, LockKeyhole, Map, ShieldCheck, UsersRound, Workflow } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import "../lot-inventory.css";

const navigationItems: DashboardNavigationItem[] = [
  { icon: Compass, label: "Central de plataforma", path: "/administracao" },
  { icon: ShieldCheck, label: "Painel ADM", path: "/adm" },
  { icon: LandPlot, label: "Cadastro de Loteamentos", path: "/loteadora", description: "Setor 1 de Loteadora" },
  { icon: Map, label: "Estoque/Mapa de Lotes", path: "/estoque-lotes", description: "Setor 2 de Loteadora" },
  { icon: UsersRound, label: "Clientes Loteadora", path: "/loteadora/clientes", description: "Setor 3 de Loteadora" },
  { icon: UsersRound, label: "Sócios e Parceiros", path: "/loteadora/socios-parceiros", description: "Setor 4 de Loteadora" },
  { icon: Workflow, label: "Vendas de Lotes", path: "/loteadora/vendas", description: "Setor interno sem contrato ou financeiro" },
  { icon: LockKeyhole, label: "Financeiro", path: "/loteadora/financeiro", disabled: true, description: "Bloqueado até autorização explícita e revisão jurídica-contábil" },
  { icon: Workflow, label: "Vendas Urbanas", path: "/vendas-urbanas" },
  { icon: House, label: "Locação", path: "/locacao" },
  { icon: UsersRound, label: "Núcleo de cadastros", path: "/cadastro-base" },
  { icon: House, label: "Ativos urbanos", path: "/ativos-urbanos" },
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
  const [developmentId, setDevelopmentId] = useState("");
  const [blockId, setBlockId] = useState("");
  const [lotNumber, setLotNumber] = useState(1);
  const [lotNumberError, setLotNumberError] = useState("");
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
  const developments = trpc.subdivisionFoundation.listDraftDevelopments.useQuery(context, { enabled: contextReady, retry: false });
  const blocksInput = useMemo(() => ({ ...context, developmentId }), [context, developmentId]);
  const blocks = trpc.subdivisionFoundation.listDraftBlocks.useQuery(blocksInput, { enabled: contextReady && Boolean(developmentId), retry: false });
  const lotsInput = useMemo(() => ({ ...context, blockId }), [context, blockId]);
  const lots = trpc.subdivisionFoundation.listDraftLots.useQuery(lotsInput, { enabled: contextReady && Boolean(blockId), retry: false });
  const events = trpc.subdivisionFoundation.listDraftLotInventoryEvents.useQuery(context, { enabled: contextReady, retry: false });
  useEffect(() => {
    if (developmentId && Array.isArray(developments.data) && !developments.data.some((development) => development.developmentId === developmentId)) {
      setDevelopmentId("");
      setBlockId("");
      setLotId("");
    }
  }, [developmentId, developments.data]);
  useEffect(() => {
    if (blockId && Array.isArray(blocks.data) && !blocks.data.some((block) => block.blockId === blockId)) {
      setBlockId("");
      setLotId("");
    }
  }, [blockId, blocks.data]);
  useEffect(() => {
    if (lotId && Array.isArray(lots.data) && !lots.data.some((lot) => lot.lotId === lotId)) setLotId("");
  }, [lotId, lots.data]);
  useEffect(() => {
    if (lotNumberError) setLotNumberError("");
  }, [lotNumber]);
  const utils = trpc.useUtils();
  const create = trpc.subdivisionFoundation.createDraftLot.useMutation({ onSuccess() { setLotNumber(1); void utils.subdivisionFoundation.listDraftLots.invalidate(lotsInput); toast.success("Lote em rascunho registrado"); } });
  const inventory = trpc.subdivisionFoundation.upsertDraftLotInventoryState.useMutation({ onSuccess() { void events.refetch(); toast.success("Situação interna registrada"); } });
  function handleLotSubmitCapture(event: React.FormEvent<HTMLElement>) {
    if (!(event.target instanceof HTMLFormElement) || !event.target.querySelector("#lot-number")) return;
    const validation = validateLotNumber(lotNumber);
    if (validation.valid) return;
    event.preventDefault();
    event.stopPropagation();
    setLotNumberError(validation.message);
  }
  return <DashboardLayout navigationItems={navigationItems} navigationTitle="Núcleo CRM" accessGate={accessGate}><main className="lot-inventory-page" onSubmitCapture={handleLotSubmitCapture}>
    <header className="lot-inventory-hero"><div><p className="lot-inventory-eyebrow">LOTEADORA · SETOR 02</p><h1>Estoque e Mapa de Lotes</h1><p>Uma frente independente para estruturar lotes, revisar referências e preparar o mapa de trabalho com controle.</p></div><aside><ShieldCheck size={20} /><span>Escopo atual</span><b>Rascunhos internos</b><small>Sem preço, reserva, cliente, contrato ou financeiro</small></aside></header>

    <section className="lot-inventory-context" aria-labelledby="lot-context-title"><div><p className="lot-inventory-eyebrow">CONTEXTO AUTORIZADO</p><h2 id="lot-context-title">Escolha a organização, não um identificador técnico.</h2></div><div className="lot-inventory-context__fields"><label htmlFor="lot-organization">Organização autorizada<select id="lot-organization" value={selectedOrganizationId} onChange={(event) => setSelectedOrganizationId(event.target.value)} disabled={!isAuthenticated || authorizedContextsQuery.isLoading}><option value="">{authorizedContextsQuery.isLoading ? "Carregando contextos autorizados" : "Selecione uma organização autorizada"}</option>{authorizedContextsQuery.data?.map((organization) => <option key={organization.organizationId} value={organization.organizationId}>{organization.organizationLabel}</option>)}</select></label><label htmlFor="lot-module">Módulo<input id="lot-module" value="Loteadora" readOnly aria-readonly="true" /></label><label htmlFor="lot-purpose">Finalidade<input id="lot-purpose" value={context.purposeCode || "—"} readOnly aria-readonly="true" /></label></div><p className={`lot-inventory-context__status ${contextReady ? "is-ready" : "is-blocked"}`}><CircleAlert size={16} />{contextReady ? "Contexto autorizado selecionado. O servidor ainda valida identidade, membership, grant, vigência, módulo e finalidade." : authorizedContextsQuery.isError ? "O contexto não foi liberado. A interface não revela organizações ou escopos externos." : "Selecione um contexto autorizado antes de abrir os rascunhos de inventário."}</p></section>

    <section id="lot-map" className="lot-inventory-map" aria-labelledby="lot-map-title"><Map size={24} aria-hidden="true" /><div><p className="lot-inventory-eyebrow">MAPA DE LOTES · PRÓXIMA CAMADA</p><h2 id="lot-map-title">O mapa visual será construído sobre Quadras e Lotes já estruturados.</h2><p>Como não há loteamento, Quadra ou Lote cadastrado neste ambiente, não há planta, disponibilidade, cores de estoque, localização ou dado comercial para mostrar. Essa ausência é intencional e preserva a separação entre cadastro e inventário.</p></div></section>

    {lotNumberError && <p id="lot-number-error" role="alert" className="lot-inventory-inline-error">{lotNumberError}</p>}
    <section className="lot-inventory-workspace" aria-labelledby="lot-workspace-title"><div><p className="lot-inventory-eyebrow">RASCUNHOS AVANÇADOS</p><h2 id="lot-workspace-title">Disponíveis quando a matriz estiver pronta.</h2><p>Os controles permanecem recolhidos até a existência de referências internas. Eles não inferem Quadra ou Lote por nome, tela ou URL.</p></div><div className="lot-inventory-workspace__matrix" aria-label="Matriz contextual de inventário"><label htmlFor="lot-development">Loteamento em rascunho<select id="lot-development" value={developmentId} onChange={(event) => { setDevelopmentId(event.target.value); setBlockId(""); setLotId(""); }} disabled={!contextReady || developments.isLoading}><option value="">{!contextReady ? "Defina um contexto autorizado" : developments.isLoading ? "Carregando loteamentos autorizados" : developments.isError ? "Leitura de loteamentos não liberada" : developments.data?.length ? "Selecione um loteamento em rascunho" : "Nenhum loteamento em rascunho neste contexto"}</option>{developments.data?.map((development) => <option key={development.developmentId} value={development.developmentId}>{draftDevelopmentSelectionLabel(development)}</option>)}</select></label><label htmlFor="lot-block-reference">Quadra matriz autorizada<select id="lot-block-reference" value={blockId} onChange={(event) => { setBlockId(event.target.value); setLotId(""); }} disabled={!contextReady || !developmentId || blocks.isLoading}><option value="">{!contextReady ? "Defina um contexto autorizado" : !developmentId ? "Selecione primeiro um loteamento" : blocks.isLoading ? "Carregando Quadras autorizadas" : blocks.isError ? "Leitura de Quadras não liberada" : blocks.data?.length ? "Selecione uma Quadra matriz" : "Nenhuma Quadra em rascunho neste loteamento"}</option>{blocks.data?.map((block) => <option key={block.blockId} value={block.blockId}>{draftBlockSelectionLabel(block)}</option>)}</select></label><p>A matriz revela somente referências devolvidas para este contexto. A seleção não substitui a validação do servidor em cada comando.</p></div><div className="lot-inventory-workspace__cards"><details id="lot-draft"><summary>Estruturar Lotes da Quadra <ArrowUpRight size={16} /></summary><form onSubmit={(event) => { event.preventDefault(); create.mutate({ ...context, correlationId: crypto.randomUUID(), blockId, lotNumber }); }}><label htmlFor="lot-number">Número do Lote</label><input id="lot-number" type="number" min={1} max={100} step={1} value={lotNumber} onChange={(event) => setLotNumber(Number(event.target.value))} disabled={!contextReady || !blockId} required aria-invalid={Boolean(lotNumberError)} aria-describedby={lotNumberError ? "lot-number-error" : undefined} /><p>O registro fica em rascunho e não indica disponibilidade, reserva, venda ou contrato.</p><button type="submit" disabled={!contextReady || !blockId || create.isPending}>{create.isPending ? "Registrando" : "Registrar Lote em rascunho"}</button></form>{contextReady && blockId && lots.data?.length === 0 && <p className="lot-inventory-inline-empty">Nenhum Lote foi devolvido para esta Quadra. Isso não representa estoque comercial.</p>}</details><details><summary>Registrar situação interna <ArrowUpRight size={16} /></summary><form onSubmit={(event) => { event.preventDefault(); inventory.mutate({ ...context, correlationId: crypto.randomUUID(), lotId, inventoryPhase: phase }); }}><label htmlFor="lot-reference">Lote autorizado<select id="lot-reference" value={lotId} onChange={(event) => setLotId(event.target.value)} disabled={!contextReady || !blockId || lots.isLoading} required><option value="">{!contextReady ? "Defina um contexto autorizado" : !blockId ? "Selecione primeiro uma Quadra" : lots.isLoading ? "Carregando Lotes autorizados" : lots.isError ? "Leitura de Lotes não liberada" : lots.data?.length ? "Selecione um Lote em rascunho" : "Nenhum Lote em rascunho nesta Quadra"}</option>{lots.data?.map((lot) => <option key={lot.lotId} value={lot.lotId}>{draftLotSelectionLabel(lot)}</option>)}</select></label><label htmlFor="lot-phase">Situação interna</label><select id="lot-phase" value={phase} onChange={(event) => setPhase(event.target.value as typeof phase)} disabled={!contextReady || !lotId}><option value="reference_confirmed">Referência confirmada</option><option value="structure_review">Revisão de estrutura</option><option value="review_required">Revisão necessária</option></select><p>O histórico é interno e não confirma disponibilidade, reserva, venda, pagamento ou contrato.</p><button type="submit" disabled={!contextReady || !lotId || inventory.isPending}>{inventory.isPending ? "Registrando" : "Registrar situação interna"}</button></form></details></div></section>

    <section id="lot-history" className="lot-inventory-history" aria-labelledby="lot-history-title"><p className="lot-inventory-eyebrow">HISTÓRICO INTERNO</p><h2 id="lot-history-title">Estados de inventário aguardando a primeira referência.</h2><p>Não há transição interna devolvida para este contexto. O CRM não usa essa ausência para concluir disponibilidade, propriedade, reserva, venda ou recebimento.</p></section>
  </main></DashboardLayout>;
}
