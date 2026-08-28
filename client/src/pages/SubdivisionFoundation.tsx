import DashboardLayout, { type DashboardAccessGate, type DashboardNavigationItem } from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { isDomainContextReady } from "@/lib/domainFoundationUi";
import { trpc } from "@/lib/trpc";
import { Building2, CircleAlert, Compass, FileStack, House, LandPlot, Layers3, ShieldCheck, UsersRound, Workflow } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import "../subdivision-foundation.css";

const navigationItems: DashboardNavigationItem[] = [
  { icon: Compass, label: "Central de plataforma", path: "/administracao" },
  { icon: UsersRound, label: "Núcleo de cadastros", path: "/cadastro-base" },
  { icon: House, label: "Ativos urbanos", path: "/ativos-urbanos" },
  { icon: LandPlot, label: "Loteadora", path: "/loteadora" },
  { icon: Workflow, label: "Vendas Urbanas", path: "/vendas-urbanas" },
];

const workingPhases = {
  preliminary_reference: "Referência preliminar",
  structuring: "Em estruturação",
  review_required: "Revisão necessária",
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
  const [organizationId, setOrganizationId] = useState("");
  const [purposeCode, setPurposeCode] = useState("CADASTRO_INICIAL");
  const [internalReference, setInternalReference] = useState("");
  const [workingPhase, setWorkingPhase] = useState<keyof typeof workingPhases>("preliminary_reference");
  const [selectedDevelopmentId, setSelectedDevelopmentId] = useState("");
  const [blockNumber, setBlockNumber] = useState(1);

  const context = useMemo(() => ({ organizationId: organizationId.trim(), module: "loteadora" as const, purposeCode: purposeCode.trim().toUpperCase() }), [organizationId, purposeCode]);
  const isContextReady = isDomainContextReady(context);
  const isWorkspaceReady = isAuthenticated && isContextReady;
  const developmentsQuery = trpc.subdivisionFoundation.listDraftDevelopments.useQuery(context, { enabled: isWorkspaceReady, retry: false });
  const blocksQueryInput = useMemo(() => ({ ...context, developmentId: selectedDevelopmentId }), [context, selectedDevelopmentId]);
  const blocksQuery = trpc.subdivisionFoundation.listDraftBlocks.useQuery(blocksQueryInput, { enabled: isWorkspaceReady && Boolean(selectedDevelopmentId), retry: false });
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

  function createDevelopment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate({ ...context, correlationId: crypto.randomUUID(), internalReference: internalReference.trim().toUpperCase(), workingPhase });
  }

  function createBlock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedDevelopmentId) return;
    createBlockMutation.mutate({ ...context, correlationId: crypto.randomUUID(), developmentId: selectedDevelopmentId, blockNumber });
  }

  return (
    <DashboardLayout navigationItems={navigationItems} navigationTitle="Núcleo CRM" accessGate={subdivisionAccessGate}>
      <main className="subdivision-foundation-page">
        <header className="subdivision-foundation-hero">
          <div><p className="subdivision-foundation-eyebrow">LOTEADORA · MATRIZ ANTES DE MAPA OU ESTOQUE</p><h1>Comece pelo contexto do loteamento e pela sua Quadra matriz.</h1><p>O corte registra somente referência interna, situação de trabalho e a numeração explícita de Quadras em rascunho. Ele prepara a estrutura sem antecipar lotes, disponibilidade ou negociação.</p></div>
          <div className="subdivision-foundation-hero__rule"><ShieldCheck size={18} /><span>Cadastro em rascunho<br /><b>sem mapa, estoque ou financeiro</b></span></div>
        </header>

        <section className="subdivision-foundation-context" aria-labelledby="subdivision-context-title">
          <div className="subdivision-foundation-heading"><div><p className="subdivision-foundation-eyebrow">01 · CONTEXTO</p><h2 id="subdivision-context-title">Loteadora é um módulo explícito e sem alçada implícita.</h2></div><p>Organização, módulo e finalidade acompanham cada chamada. O módulo está fixado como Loteadora, mas ainda depende de identidade, membership, grant, vigência e policy no servidor.</p></div>
          <div className="subdivision-foundation-context__fields"><label htmlFor="subdivision-organization"><Building2 size={14} /> ID da organização<input id="subdivision-organization" value={organizationId} onChange={(event) => setOrganizationId(event.target.value)} placeholder="UUID da organização autorizada" /></label><label htmlFor="subdivision-module"><LandPlot size={14} /> Módulo<input id="subdivision-module" value="Loteadora" readOnly aria-readonly="true" /></label><label htmlFor="subdivision-purpose"><ShieldCheck size={14} /> Finalidade<input id="subdivision-purpose" value={purposeCode} onChange={(event) => setPurposeCode(event.target.value.toUpperCase())} placeholder="CADASTRO_INICIAL" /></label></div>
          <div className={`subdivision-foundation-context__status ${isContextReady ? "is-ready" : "is-blocked"}`}><CircleAlert size={16} /><span>{isContextReady ? "Contexto sintaticamente válido. O servidor ainda verificará identidade, membership, grant, vigência, módulo e finalidade antes de qualquer leitura ou rascunho." : "Informe organização e finalidade válidas para liberar ações de rascunho."}</span></div>
        </section>

        <section className="subdivision-foundation-workspace" aria-labelledby="subdivision-workspace-title">
          <div className="subdivision-foundation-heading"><div><p className="subdivision-foundation-eyebrow">02 · LOTEAMENTO EM RASCUNHO</p><h2 id="subdivision-workspace-title">A referência interna organiza o próximo trabalho humano.</h2></div><p>Não há nome comercial, endereço, matrícula, coordenada, lote, mapa, estoque, sócio, parceiro, cliente, contrato ou valor neste corte.</p></div>
          <div className="subdivision-foundation-workspace__grid">
            <form className="subdivision-foundation-card" onSubmit={createDevelopment}><div className="subdivision-foundation-card__title"><FileStack size={19} /><h3>Novo loteamento em rascunho</h3></div><p>Use apenas uma referência interna codificada e a situação atual de trabalho. A referência é única por organização.</p><label htmlFor="subdivision-reference">Referência interna</label><input id="subdivision-reference" value={internalReference} onChange={(event) => setInternalReference(event.target.value.toUpperCase())} placeholder="EX.: LT_NORTE_01" disabled={!isWorkspaceReady} required minLength={3} maxLength={80} pattern="[A-Z][A-Z0-9_]{2,79}" /><label htmlFor="subdivision-phase">Situação de trabalho</label><select id="subdivision-phase" value={workingPhase} onChange={(event) => setWorkingPhase(event.target.value as keyof typeof workingPhases)} disabled={!isWorkspaceReady}>{Object.entries(workingPhases).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button type="submit" disabled={!isWorkspaceReady || createMutation.isPending}>{createMutation.isPending ? "Registrando rascunho" : "Registrar loteamento em rascunho"}</button></form>
            <aside className="subdivision-foundation-limits" aria-label="Limites do cadastro-base de loteamento"><Layers3 size={20} /><div><h3>O que este corte não faz</h3><p>Ele não aprova empreendimento, não registra área, não cria lote, não reserva estoque, não identifica proprietário ou parceiro e não inicia qualquer venda, contrato, cobrança ou repasse.</p></div></aside>
          </div>
        </section>

        <section className="subdivision-foundation-list" aria-labelledby="subdivision-list-title">
          <div className="subdivision-foundation-heading"><div><p className="subdivision-foundation-eyebrow">03 · LEITURA AUTORIZADA</p><h2 id="subdivision-list-title">Loteamentos em rascunho no contexto atual.</h2></div><p>A leitura devolve somente referência interna, situação de trabalho e criação. Ela não revela localização, inventário, dados pessoais ou registros de outros contextos.</p></div>
          {!isContextReady && <div className="subdivision-foundation-empty"><CircleAlert size={18} /><p>Sem contexto não há consulta e não há indicação de existência de loteamentos.</p></div>}
          {isContextReady && !isAuthenticated && <div className="subdivision-foundation-empty"><ShieldCheck size={18} /><p>A leitura e as ações permanecem bloqueadas até haver uma sessão autenticada.</p></div>}
          {isWorkspaceReady && developmentsQuery.isLoading && <div className="subdivision-foundation-empty"><span className="subdivision-foundation-spinner" aria-hidden="true" /><p>Confirmando o contexto antes de solicitar a leitura minimizada dos loteamentos.</p></div>}
          {isWorkspaceReady && developmentsQuery.isError && <div className="subdivision-foundation-empty is-error"><CircleAlert size={18} /><p>A leitura não foi liberada. Revise identidade, membership, grant, vigência e contexto sem tentar inferir registros externos.</p></div>}
          {isWorkspaceReady && developmentsQuery.data?.length === 0 && <div className="subdivision-foundation-empty"><LandPlot size={18} /><p>Nenhum loteamento em rascunho foi devolvido para este contexto. A resposta não revela outros empreendimentos.</p></div>}
          {isWorkspaceReady && developmentsQuery.data && developmentsQuery.data.length > 0 && <div className="subdivision-foundation-list__rows">{developmentsQuery.data.map((development) => <article key={development.developmentId}><span>Loteamento em rascunho</span><h3>{development.internalReference}</h3><p><b>{workingPhases[development.workingPhase]}</b> · criado em {new Date(development.createdAt).toLocaleString("pt-BR")}</p><code>{development.developmentId}</code></article>)}</div>}
        </section>

        <section className="subdivision-foundation-workspace" aria-labelledby="subdivision-block-title">
          <div className="subdivision-foundation-heading"><div><p className="subdivision-foundation-eyebrow">04 · QUADRA MATRIZ</p><h2 id="subdivision-block-title">Quadra N é a matriz — os lotes continuam fora deste corte.</h2></div><p>Selecione um loteamento retornado pelo contexto e registre somente o número da Quadra. Nenhum lote, mapa, estoque, valor ou disponibilidade é criado.</p></div>
          <div className="subdivision-foundation-workspace__grid">
            <form className="subdivision-foundation-card" onSubmit={createBlock}><div className="subdivision-foundation-card__title"><Layers3 size={19} /><h3>Nova Quadra matriz</h3></div><p>A nomenclatura apresentada será “Quadra N”. A numeração é única no loteamento e não admite nome livre.</p><label htmlFor="subdivision-block-development">Loteamento em rascunho</label><select id="subdivision-block-development" value={selectedDevelopmentId} onChange={(event) => setSelectedDevelopmentId(event.target.value)} disabled={!isWorkspaceReady || !developmentsQuery.data?.length}><option value="">Selecione um loteamento autorizado</option>{developmentsQuery.data?.map((development) => <option value={development.developmentId} key={development.developmentId}>{development.internalReference}</option>)}</select><label htmlFor="subdivision-block-number">Número da Quadra</label><input id="subdivision-block-number" type="number" min={1} max={999} value={blockNumber} onChange={(event) => setBlockNumber(Number(event.target.value))} disabled={!isWorkspaceReady || !selectedDevelopmentId} required /><button type="submit" disabled={!isWorkspaceReady || !selectedDevelopmentId || createBlockMutation.isPending}>{createBlockMutation.isPending ? "Registrando Quadra" : "Registrar Quadra em rascunho"}</button></form>
            <aside className="subdivision-foundation-limits" aria-label="Limites do cadastro de Quadras"><Layers3 size={20} /><div><h3>Limite da matriz</h3><p>A Quadra organiza a futura relação com os lotes. O máximo de 100 lotes por Quadra será tratado somente no setor separado de Estoque/Mapa de Lotes, com regras próprias.</p></div></aside>
          </div>
          {!isContextReady && <div className="subdivision-foundation-empty"><CircleAlert size={18} /><p>Sem contexto não há seleção de loteamento nem consulta de Quadras.</p></div>}
          {isContextReady && !isAuthenticated && <div className="subdivision-foundation-empty"><ShieldCheck size={18} /><p>O cadastro e a leitura de Quadras permanecem bloqueados até haver sessão autenticada.</p></div>}
          {isWorkspaceReady && !selectedDevelopmentId && <div className="subdivision-foundation-empty"><Layers3 size={18} /><p>Selecione um loteamento retornado por este contexto antes de solicitar a leitura de Quadras.</p></div>}
          {isWorkspaceReady && selectedDevelopmentId && blocksQuery.isLoading && <div className="subdivision-foundation-empty"><span className="subdivision-foundation-spinner" aria-hidden="true" /><p>Confirmando o loteamento em rascunho antes de solicitar a leitura minimizada das Quadras.</p></div>}
          {isWorkspaceReady && selectedDevelopmentId && blocksQuery.isError && <div className="subdivision-foundation-empty is-error"><CircleAlert size={18} /><p>A leitura não foi liberada. Revise o contexto e o loteamento selecionado sem tentar inferir registros externos.</p></div>}
          {isWorkspaceReady && selectedDevelopmentId && blocksQuery.data?.length === 0 && <div className="subdivision-foundation-empty"><Layers3 size={18} /><p>Nenhuma Quadra em rascunho foi devolvida para este loteamento. A resposta não revela outros contextos.</p></div>}
          {isWorkspaceReady && selectedDevelopmentId && blocksQuery.data && blocksQuery.data.length > 0 && <div className="subdivision-foundation-list__rows">{blocksQuery.data.map((block) => <article key={block.blockId}><span>Quadra matriz em rascunho</span><h3>Quadra {block.blockNumber}</h3><p><b>Vinculada ao loteamento selecionado</b> · criada em {new Date(block.createdAt).toLocaleString("pt-BR")}</p><code>{block.blockId}</code></article>)}</div>}
        </section>
      </main>
    </DashboardLayout>
  );
}
