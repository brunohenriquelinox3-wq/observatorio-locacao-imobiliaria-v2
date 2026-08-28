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

  const context = useMemo(() => ({ organizationId: organizationId.trim(), module: "loteadora" as const, purposeCode: purposeCode.trim().toUpperCase() }), [organizationId, purposeCode]);
  const isContextReady = isDomainContextReady(context);
  const isWorkspaceReady = isAuthenticated && isContextReady;
  const developmentsQuery = trpc.subdivisionFoundation.listDraftDevelopments.useQuery(context, { enabled: isWorkspaceReady, retry: false });
  const utils = trpc.useUtils();
  const createMutation = trpc.subdivisionFoundation.createDraftDevelopment.useMutation({
    onSuccess() {
      setInternalReference(""); setWorkingPhase("preliminary_reference");
      toast.success("Loteamento em rascunho registrado", { description: "A referência é interna e não cria quadra, lote, estoque, parceiro, cliente, contrato, boleto ou financeiro." });
      void utils.subdivisionFoundation.listDraftDevelopments.invalidate(context);
    },
    onError() { toast.error("Loteamento não registrado", { description: "O servidor exige identidade, membership, grant, vigência e contexto autorizado, sem revelar registros externos." }); },
  });

  function createDevelopment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate({ ...context, correlationId: crypto.randomUUID(), internalReference: internalReference.trim().toUpperCase(), workingPhase });
  }

  return (
    <DashboardLayout navigationItems={navigationItems} navigationTitle="Núcleo CRM" accessGate={subdivisionAccessGate}>
      <main className="subdivision-foundation-page">
        <header className="subdivision-foundation-hero">
          <div><p className="subdivision-foundation-eyebrow">LOTEADORA · REFERÊNCIA ANTES DE MAPA OU ESTOQUE</p><h1>Comece pelo contexto do loteamento, não pela promessa comercial.</h1><p>O corte registra somente uma referência interna codificada e sua situação de trabalho. Ele prepara a estrutura para evoluções governadas, sem antecipar quadras, lotes, disponibilidade ou negociação.</p></div>
          <div className="subdivision-foundation-hero__rule"><ShieldCheck size={18} /><span>Cadastro em rascunho<br /><b>sem localização, estoque ou financeiro</b></span></div>
        </header>

        <section className="subdivision-foundation-context" aria-labelledby="subdivision-context-title">
          <div className="subdivision-foundation-heading"><div><p className="subdivision-foundation-eyebrow">01 · CONTEXTO</p><h2 id="subdivision-context-title">Loteadora é um módulo explícito e sem alçada implícita.</h2></div><p>Organização, módulo e finalidade acompanham cada chamada. O módulo está fixado como Loteadora, mas ainda depende de identidade, membership, grant, vigência e policy no servidor.</p></div>
          <div className="subdivision-foundation-context__fields"><label htmlFor="subdivision-organization"><Building2 size={14} /> ID da organização<input id="subdivision-organization" value={organizationId} onChange={(event) => setOrganizationId(event.target.value)} placeholder="UUID da organização autorizada" /></label><label htmlFor="subdivision-module"><LandPlot size={14} /> Módulo<input id="subdivision-module" value="Loteadora" readOnly aria-readonly="true" /></label><label htmlFor="subdivision-purpose"><ShieldCheck size={14} /> Finalidade<input id="subdivision-purpose" value={purposeCode} onChange={(event) => setPurposeCode(event.target.value.toUpperCase())} placeholder="CADASTRO_INICIAL" /></label></div>
          <div className={`subdivision-foundation-context__status ${isContextReady ? "is-ready" : "is-blocked"}`}><CircleAlert size={16} /><span>{isContextReady ? "Contexto sintaticamente válido. O servidor ainda verificará identidade, membership, grant, vigência, módulo e finalidade antes de qualquer leitura ou rascunho." : "Informe organização e finalidade válidas para liberar ações de rascunho."}</span></div>
        </section>

        <section className="subdivision-foundation-workspace" aria-labelledby="subdivision-workspace-title">
          <div className="subdivision-foundation-heading"><div><p className="subdivision-foundation-eyebrow">02 · LOTEAMENTO EM RASCUNHO</p><h2 id="subdivision-workspace-title">A referência interna organiza o próximo trabalho humano.</h2></div><p>Não há nome comercial, endereço, matrícula, coordenada, quadra, lote, mapa, estoque, sócio, parceiro, cliente, contrato ou valor neste corte.</p></div>
          <div className="subdivision-foundation-workspace__grid">
            <form className="subdivision-foundation-card" onSubmit={createDevelopment}><div className="subdivision-foundation-card__title"><FileStack size={19} /><h3>Novo loteamento em rascunho</h3></div><p>Use apenas uma referência interna codificada e a situação atual de trabalho. A referência é única por organização.</p><label htmlFor="subdivision-reference">Referência interna</label><input id="subdivision-reference" value={internalReference} onChange={(event) => setInternalReference(event.target.value.toUpperCase())} placeholder="EX.: LT_NORTE_01" disabled={!isWorkspaceReady} required minLength={3} maxLength={80} pattern="[A-Z][A-Z0-9_]{2,79}" /><label htmlFor="subdivision-phase">Situação de trabalho</label><select id="subdivision-phase" value={workingPhase} onChange={(event) => setWorkingPhase(event.target.value as keyof typeof workingPhases)} disabled={!isWorkspaceReady}>{Object.entries(workingPhases).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button type="submit" disabled={!isWorkspaceReady || createMutation.isPending}>{createMutation.isPending ? "Registrando rascunho" : "Registrar loteamento em rascunho"}</button></form>
            <aside className="subdivision-foundation-limits" aria-label="Limites do cadastro-base de loteamento"><Layers3 size={20} /><div><h3>O que este corte não faz</h3><p>Ele não aprova empreendimento, não registra área, não cria quadra ou lote, não reserva estoque, não identifica proprietário ou parceiro e não inicia qualquer venda, contrato, cobrança ou repasse.</p></div></aside>
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
      </main>
    </DashboardLayout>
  );
}
