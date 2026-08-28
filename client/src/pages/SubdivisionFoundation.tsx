import DashboardLayout, { type DashboardAccessGate, type DashboardNavigationItem } from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { isDomainContextReady } from "@/lib/domainFoundationUi";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { trpc } from "@/lib/trpc";
import { Building2, CircleAlert, Compass, FileStack, House, LandPlot, Layers3, ShieldCheck, UsersRound, Workflow } from "lucide-react";
import { useMemo, useRef, useState } from "react";
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

const attachmentStates = {
  awaiting_private_upload: "Aguardando envio privado",
  private_upload_recorded: "Arquivo privado registrado",
} as const;

const saleDraftAttachmentCoverageStates = {
  no_attachment_intent: "Sem intenção de anexo",
  attachment_awaiting_private_upload: "Anexo privado aguardando envio",
  attachment_private_upload_recorded: "Anexo privado registrado",
} as const;

const saleDraftWorkPhases = {
  link_review: "Revisão do vínculo",
  attachment_review: "Revisão de cobertura",
  human_review: "Revisão humana",
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
  const [internalRoleDevelopmentId, setInternalRoleDevelopmentId] = useState("");
  const [internalRoleId, setInternalRoleId] = useState("");
  const [buyerClientRoleId, setBuyerClientRoleId] = useState("");
  const [buyerClientIdForAttachment, setBuyerClientIdForAttachment] = useState("");
  const [attachmentIntentIdForUpload, setAttachmentIntentIdForUpload] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [isAttachmentUploading, setIsAttachmentUploading] = useState(false);
  const [saleDevelopmentId, setSaleDevelopmentId] = useState("");
  const [saleBlockId, setSaleBlockId] = useState("");
  const [saleLotId, setSaleLotId] = useState("");
  const [saleBuyerClientId, setSaleBuyerClientId] = useState("");
  const [saleDraftIdForWorkState, setSaleDraftIdForWorkState] = useState("");
  const [saleDraftWorkPhase, setSaleDraftWorkPhase] = useState<keyof typeof saleDraftWorkPhases>("link_review");
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const context = useMemo(() => ({ organizationId: organizationId.trim(), module: "loteadora" as const, purposeCode: purposeCode.trim().toUpperCase() }), [organizationId, purposeCode]);
  const isContextReady = isDomainContextReady(context);
  const isWorkspaceReady = isAuthenticated && isContextReady;
  const developmentsQuery = trpc.subdivisionFoundation.listDraftDevelopments.useQuery(context, { enabled: isWorkspaceReady, retry: false });
  const blocksQueryInput = useMemo(() => ({ ...context, developmentId: selectedDevelopmentId }), [context, selectedDevelopmentId]);
  const blocksQuery = trpc.subdivisionFoundation.listDraftBlocks.useQuery(blocksQueryInput, { enabled: isWorkspaceReady && Boolean(selectedDevelopmentId), retry: false });
  const buyerClientsQuery = trpc.subdivisionFoundation.listDraftBuyerClients.useQuery(context, { enabled: isWorkspaceReady, retry: false });
  const attachmentIntentsQuery = trpc.subdivisionFoundation.listBuyerAttachmentIntents.useQuery(context, { enabled: isWorkspaceReady, retry: false });
  const saleBlocksQueryInput = useMemo(() => ({ ...context, developmentId: saleDevelopmentId }), [context, saleDevelopmentId]);
  const saleBlocksQuery = trpc.subdivisionFoundation.listDraftBlocks.useQuery(saleBlocksQueryInput, { enabled: isWorkspaceReady && Boolean(saleDevelopmentId), retry: false });
  const saleLotsQueryInput = useMemo(() => ({ ...context, blockId: saleBlockId }), [context, saleBlockId]);
  const saleLotsQuery = trpc.subdivisionFoundation.listDraftLots.useQuery(saleLotsQueryInput, { enabled: isWorkspaceReady && Boolean(saleBlockId), retry: false });
  const saleDraftsQuery = trpc.subdivisionFoundation.listSaleDrafts.useQuery(context, { enabled: isWorkspaceReady, retry: false });
  const saleDraftAttachmentCoverageQuery = trpc.subdivisionFoundation.listSaleDraftAttachmentCoverage.useQuery(context, { enabled: isWorkspaceReady, retry: false });
  const saleDraftWorkStatesQuery = trpc.subdivisionFoundation.listSaleDraftWorkStates.useQuery(context, { enabled: isWorkspaceReady, retry: false });
  const uploadableAttachmentIntents = attachmentIntentsQuery.data?.filter((intent) => intent.attachmentState === "awaiting_private_upload") ?? [];
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
  const linkInternalRoleMutation = trpc.subdivisionFoundation.linkDraftInternalPartyRole.useMutation({ onSuccess() { setInternalRoleId(""); toast.success("Papel interno vinculado", { description: "O vínculo é temporal e interno; não define percentual, valor, contrato, portal, cobrança ou repasse." }); }, onError() { toast.error("Papel não vinculado", { description: "O servidor exige Party, papel e loteamento em rascunho no mesmo contexto autorizado." }); } });
  const createBuyerClientMutation = trpc.subdivisionFoundation.createDraftBuyerClient.useMutation({ onSuccess() { setBuyerClientRoleId(""); toast.success("Cliente comprador em rascunho registrado", { description: "O vínculo não contém documentos, identificadores fiscais, lote vendido, contrato, boleto ou financeiro." }); void utils.subdivisionFoundation.listDraftBuyerClients.invalidate(context); }, onError() { toast.error("Cliente não registrado", { description: "O servidor exige papel temporal de cliente ou comprador no mesmo contexto autorizado." }); } });
  const createAttachmentIntentMutation = trpc.subdivisionFoundation.createBuyerAttachmentIntent.useMutation({ onSuccess() { setBuyerClientIdForAttachment(""); toast.success("Intenção privada registrada", { description: "Nenhum arquivo, URL, nome, tipo, conteúdo, download ou visualização foi aceito." }); void utils.subdivisionFoundation.listBuyerAttachmentIntents.invalidate(context); }, onError() { toast.error("Intenção não registrada", { description: "O servidor exige cliente comprador em rascunho no mesmo contexto autorizado." }); } });
  const createSaleDraftMutation = trpc.subdivisionFoundation.createSaleDraft.useMutation({ onSuccess() { setSaleLotId(""); setSaleBuyerClientId(""); toast.success("Rascunho interno de venda vinculado", { description: "O vínculo não reserva lote, não cria proposta, contrato, preço, cobrança ou efeito financeiro." }); void utils.subdivisionFoundation.listSaleDrafts.invalidate(context); }, onError() { toast.error("Rascunho não registrado", { description: "O servidor exige lote e cliente comprador do mesmo contexto autorizado, sem revelar registros externos." }); } });
  const updateSaleDraftWorkStateMutation = trpc.subdivisionFoundation.upsertSaleDraftWorkState.useMutation({ onSuccess() { setSaleDraftIdForWorkState(""); toast.success("Classificação interna atualizada", { description: "O estado organiza trabalho humano e não altera estoque, reserva, proposta, contrato, cobrança ou financeiro." }); void utils.subdivisionFoundation.listSaleDraftWorkStates.invalidate(context); }, onError() { toast.error("Classificação não registrada", { description: "O servidor exige o rascunho no mesmo contexto autorizado e não revela registros externos." }); } });

  function createDevelopment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate({ ...context, correlationId: crypto.randomUUID(), internalReference: internalReference.trim().toUpperCase(), workingPhase });
  }

  function createBlock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedDevelopmentId) return;
    createBlockMutation.mutate({ ...context, correlationId: crypto.randomUUID(), developmentId: selectedDevelopmentId, blockNumber });
  }

  async function uploadPrivateAttachment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!attachmentFile || !attachmentIntentIdForUpload || isAttachmentUploading) return;
    if (attachmentFile.size < 1 || attachmentFile.size > 2 * 1024 * 1024 || !["application/pdf", "image/jpeg", "image/png"].includes(attachmentFile.type)) {
      toast.error("Arquivo não aceito", { description: "Escolha PDF, JPEG ou PNG de até 2 MB. A validação definitiva ocorre no servidor." });
      return;
    }

    setIsAttachmentUploading(true);
    try {
      const { data } = await getSupabaseBrowserClient()?.auth.getSession() ?? { data: { session: null } };
      if (!data.session?.access_token) throw new Error("SUPABASE_SESSION_REQUIRED");

      const form = new FormData();
      form.set("attachment", attachmentFile);
      form.set("organizationId", context.organizationId);
      form.set("purposeCode", context.purposeCode);
      form.set("correlationId", crypto.randomUUID());
      const response = await fetch(`/api/private/subdivision-buyer-attachments/${attachmentIntentIdForUpload}`, {
        method: "POST",
        credentials: "include",
        headers: { "X-Supabase-Access-Token": data.session.access_token },
        body: form,
      });
      if (!response.ok) throw new Error("PRIVATE_ATTACHMENT_REQUEST_REJECTED");

      setAttachmentFile(null);
      setAttachmentIntentIdForUpload("");
      if (attachmentInputRef.current) attachmentInputRef.current.value = "";
      toast.success("Anexo privado registrado", { description: "O sistema não retorna nome, URL, chave, conteúdo, download ou visualização do arquivo." });
      void utils.subdivisionFoundation.listBuyerAttachmentIntents.invalidate(context);
    } catch {
      toast.error("Anexo não registrado", { description: "O servidor exige sessão, MFA recente, identidade, contexto, intenção autorizada, tipo e tamanho válidos, sem revelar detalhes internos." });
    } finally {
      setIsAttachmentUploading(false);
    }
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
        <section className="subdivision-foundation-workspace" aria-labelledby="subdivision-role-title">
          <div className="subdivision-foundation-heading"><div><p className="subdivision-foundation-eyebrow">05 · PAPEL INTERNO TEMPORAL</p><h2 id="subdivision-role-title">Sócios, parceiros e cedentes começam sem participação econômica.</h2></div><p>Use um ID de papel temporal criado no Núcleo de cadastros dentro do módulo Loteadora. Nenhum percentual, valor, recebível, login, portal, contrato, cobrança ou repasse é definido aqui.</p></div>
          <form className="subdivision-foundation-card" onSubmit={(event) => { event.preventDefault(); linkInternalRoleMutation.mutate({ ...context, correlationId: crypto.randomUUID(), developmentId: internalRoleDevelopmentId, partyRoleId: internalRoleId }); }}><label>Loteamento em rascunho<select value={internalRoleDevelopmentId} onChange={(event) => setInternalRoleDevelopmentId(event.target.value)} disabled={!isWorkspaceReady}><option value="">Selecione um loteamento autorizado</option>{developmentsQuery.data?.map((development) => <option key={development.developmentId} value={development.developmentId}>{development.internalReference}</option>)}</select></label><label>ID do papel temporal<input value={internalRoleId} onChange={(event) => setInternalRoleId(event.target.value)} placeholder="UUID do papel interno" disabled={!isWorkspaceReady} required /></label><button type="submit" disabled={!isWorkspaceReady || !internalRoleDevelopmentId || !internalRoleId || linkInternalRoleMutation.isPending}>{linkInternalRoleMutation.isPending ? "Vinculando papel" : "Vincular papel interno"}</button></form>
        </section>
        <section className="subdivision-foundation-workspace" aria-labelledby="subdivision-buyer-title">
          <div className="subdivision-foundation-heading"><div><p className="subdivision-foundation-eyebrow">06 · CLIENTE COMPRADOR</p><h2 id="subdivision-buyer-title">O cadastro-base reutiliza Party e papel temporal.</h2></div><p>Registre somente o ID técnico de um papel interno `client` ou `buyer` do módulo Loteadora. Não há CPF/CNPJ, contato, documento, anexo, lote vendido, contrato, boleto ou valor.</p></div>
          <form className="subdivision-foundation-card" onSubmit={(event) => { event.preventDefault(); createBuyerClientMutation.mutate({ ...context, correlationId: crypto.randomUUID(), partyRoleAssignmentId: buyerClientRoleId }); }}><label htmlFor="subdivision-buyer-role">ID do papel temporal de cliente/comprador<input id="subdivision-buyer-role" value={buyerClientRoleId} onChange={(event) => setBuyerClientRoleId(event.target.value)} placeholder="UUID do papel interno" disabled={!isWorkspaceReady} required /></label><button type="submit" disabled={!isWorkspaceReady || !buyerClientRoleId || createBuyerClientMutation.isPending}>{createBuyerClientMutation.isPending ? "Registrando cliente" : "Registrar cliente em rascunho"}</button></form>
          {isWorkspaceReady && buyerClientsQuery.data?.length === 0 && <div className="subdivision-foundation-empty"><UsersRound size={18} /><p>Nenhum cliente comprador em rascunho foi devolvido para este contexto.</p></div>}
          {isWorkspaceReady && buyerClientsQuery.data && buyerClientsQuery.data.length > 0 && <div className="subdivision-foundation-list__rows">{buyerClientsQuery.data.map((client) => <article key={client.buyerClientId}><span>Cliente comprador em rascunho</span><h3>Vínculo interno de Party</h3><p>Criado em {new Date(client.createdAt).toLocaleString("pt-BR")}</p><code>{client.buyerClientId}</code></article>)}</div>}
        </section>
        <section className="subdivision-foundation-workspace" aria-labelledby="subdivision-attachment-title">
          <div className="subdivision-foundation-heading"><div><p className="subdivision-foundation-eyebrow">07 · ANEXO PRIVADO</p><h2 id="subdivision-attachment-title">A intenção técnica condiciona o envio de um único anexo.</h2></div><p>O envio só avança com sessão, MFA recente, subject Supabase, contexto e intenção autorizada. Não há nome persistido, URL, chave, conteúdo, download ou visualização nesta tela.</p></div>
          <form className="subdivision-foundation-card" onSubmit={(event) => { event.preventDefault(); createAttachmentIntentMutation.mutate({ ...context, correlationId: crypto.randomUUID(), buyerClientId: buyerClientIdForAttachment }); }}><label htmlFor="subdivision-attachment-client">Cliente comprador em rascunho<select id="subdivision-attachment-client" value={buyerClientIdForAttachment} onChange={(event) => setBuyerClientIdForAttachment(event.target.value)} disabled={!isWorkspaceReady} required><option value="">Selecione um cliente autorizado</option>{buyerClientsQuery.data?.map((client) => <option key={client.buyerClientId} value={client.buyerClientId}>Vínculo de cliente · {client.buyerClientId.slice(0, 8)}</option>)}</select></label><button type="submit" disabled={!isWorkspaceReady || !buyerClientIdForAttachment || createAttachmentIntentMutation.isPending}>{createAttachmentIntentMutation.isPending ? "Registrando intenção" : "Registrar intenção privada"}</button></form>
          {isWorkspaceReady && attachmentIntentsQuery.data?.length === 0 && <div className="subdivision-foundation-empty"><FileStack size={18} /><p>Nenhuma intenção privada de anexo foi devolvida para este contexto.</p></div>}
          {isWorkspaceReady && attachmentIntentsQuery.data && attachmentIntentsQuery.data.length > 0 && <div className="subdivision-foundation-list__rows">{attachmentIntentsQuery.data.map((intent) => <article key={intent.attachmentIntentId}><span>Anexo privado</span><h3>{attachmentStates[intent.attachmentState]}</h3><p>Estado técnico do ciclo privado. Não há nome, chave, URL, tipo, tamanho, conteúdo, download ou visualização.</p><code>{intent.attachmentIntentId}</code></article>)}</div>}
          {isWorkspaceReady && uploadableAttachmentIntents.length > 0 && <form className="subdivision-foundation-card" onSubmit={uploadPrivateAttachment}><div className="subdivision-foundation-card__title"><FileStack size={19} /><h3>Enviar um anexo privado</h3></div><p>Selecione uma intenção autorizada e um único PDF, JPEG ou PNG de até 2 MB. Use somente informações permitidas pela política da sua organização.</p><label htmlFor="subdivision-attachment-intent">Intenção privada autorizada<select id="subdivision-attachment-intent" value={attachmentIntentIdForUpload} onChange={(event) => setAttachmentIntentIdForUpload(event.target.value)} disabled={isAttachmentUploading} required><option value="">Selecione uma intenção</option>{uploadableAttachmentIntents.map((intent) => <option key={intent.attachmentIntentId} value={intent.attachmentIntentId}>Intenção privada · {intent.attachmentIntentId.slice(0, 8)}</option>)}</select></label><label htmlFor="subdivision-private-file">Arquivo local<input ref={attachmentInputRef} id="subdivision-private-file" type="file" accept="application/pdf,image/jpeg,image/png" onChange={(event) => setAttachmentFile(event.target.files?.[0] ?? null)} disabled={isAttachmentUploading} required /></label><p aria-live="polite">{attachmentFile ? "Arquivo selecionado localmente. O nome não é exibido nem persistido nesta tela." : "Nenhum arquivo selecionado."}</p><button type="submit" disabled={!attachmentIntentIdForUpload || !attachmentFile || isAttachmentUploading}>{isAttachmentUploading ? "Validando e enviando" : "Enviar anexo privado"}</button></form>}
        </section>
        <section className="subdivision-foundation-workspace" aria-labelledby="subdivision-sale-draft-title">
          <div className="subdivision-foundation-heading"><div><p className="subdivision-foundation-eyebrow">08 · RASCUNHO INTERNO DE VENDA</p><h2 id="subdivision-sale-draft-title">Lote e cliente comprador podem ser conectados sem mudar o inventário.</h2></div><p>Este registro organiza somente o próximo trabalho interno. Não é reserva, proposta, contrato, preço, cobrança, boleto, comissão, repasse ou financeiro.</p></div>
          <form className="subdivision-foundation-card" onSubmit={(event) => { event.preventDefault(); createSaleDraftMutation.mutate({ ...context, correlationId: crypto.randomUUID(), lotId: saleLotId, buyerClientId: saleBuyerClientId }); }}><label htmlFor="subdivision-sale-development">Loteamento em rascunho<select id="subdivision-sale-development" value={saleDevelopmentId} onChange={(event) => { setSaleDevelopmentId(event.target.value); setSaleBlockId(""); setSaleLotId(""); }} disabled={!isWorkspaceReady} required><option value="">Selecione um loteamento autorizado</option>{developmentsQuery.data?.map((development) => <option key={development.developmentId} value={development.developmentId}>{development.internalReference}</option>)}</select></label><label htmlFor="subdivision-sale-block">Quadra matriz<select id="subdivision-sale-block" value={saleBlockId} onChange={(event) => { setSaleBlockId(event.target.value); setSaleLotId(""); }} disabled={!isWorkspaceReady || !saleDevelopmentId} required><option value="">Selecione uma Quadra autorizada</option>{saleBlocksQuery.data?.map((block) => <option key={block.blockId} value={block.blockId}>Quadra {block.blockNumber}</option>)}</select></label><label htmlFor="subdivision-sale-lot">Lote em rascunho<select id="subdivision-sale-lot" value={saleLotId} onChange={(event) => setSaleLotId(event.target.value)} disabled={!isWorkspaceReady || !saleBlockId} required><option value="">Selecione um Lote autorizado</option>{saleLotsQuery.data?.map((lot) => <option key={lot.lotId} value={lot.lotId}>Lote {lot.lotNumber}</option>)}</select></label><label htmlFor="subdivision-sale-buyer">Cliente comprador em rascunho<select id="subdivision-sale-buyer" value={saleBuyerClientId} onChange={(event) => setSaleBuyerClientId(event.target.value)} disabled={!isWorkspaceReady} required><option value="">Selecione um cliente autorizado</option>{buyerClientsQuery.data?.map((client) => <option key={client.buyerClientId} value={client.buyerClientId}>Vínculo de cliente · {client.buyerClientId.slice(0, 8)}</option>)}</select></label><button type="submit" disabled={!isWorkspaceReady || !saleLotId || !saleBuyerClientId || createSaleDraftMutation.isPending}>{createSaleDraftMutation.isPending ? "Vinculando rascunho" : "Vincular rascunho interno"}</button></form>
          {isWorkspaceReady && saleDraftsQuery.data?.length === 0 && <div className="subdivision-foundation-empty"><Workflow size={18} /><p>Nenhum rascunho interno de venda foi devolvido para este contexto.</p></div>}
          {isWorkspaceReady && saleDraftsQuery.data && saleDraftsQuery.data.length > 0 && <div className="subdivision-foundation-list__rows">{saleDraftsQuery.data.map((draft) => { const coverage = saleDraftAttachmentCoverageQuery.data?.find((item) => item.saleDraftId === draft.saleDraftId); const workState = saleDraftWorkStatesQuery.data?.find((item) => item.saleDraftId === draft.saleDraftId); return <article key={draft.saleDraftId}><span>Rascunho interno de venda</span><h3>Vínculo de lote e cliente comprador</h3><p><b>{coverage ? saleDraftAttachmentCoverageStates[coverage.attachmentCoverageState] : "Cobertura de anexo não disponível"}</b> · estado opaco, sem documento, nome, URL, download ou visualização.</p><p><b>{workState ? saleDraftWorkPhases[workState.workPhase] : "Sem classificação interna"}</b> · organização de trabalho, sem efeito comercial.</p><p>Criado em {new Date(draft.createdAt).toLocaleString("pt-BR")}. Sem reserva, proposta, contrato, cobrança ou financeiro.</p><code>{draft.saleDraftId}</code></article>; })}</div>}
          {isWorkspaceReady && saleDraftsQuery.data && saleDraftsQuery.data.length > 0 && <form className="subdivision-foundation-card" onSubmit={(event) => { event.preventDefault(); updateSaleDraftWorkStateMutation.mutate({ ...context, correlationId: crypto.randomUUID(), saleDraftId: saleDraftIdForWorkState, workPhase: saleDraftWorkPhase }); }}><div className="subdivision-foundation-card__title"><Workflow size={19} /><h3>Classificar trabalho interno</h3></div><p>Esta classificação é apenas organizacional e não cria reserva, proposta, contrato, preço, cobrança, boleto, comissão ou repasse.</p><label htmlFor="subdivision-sale-draft-work-item">Rascunho interno de venda<select id="subdivision-sale-draft-work-item" value={saleDraftIdForWorkState} onChange={(event) => setSaleDraftIdForWorkState(event.target.value)} disabled={updateSaleDraftWorkStateMutation.isPending} required><option value="">Selecione um rascunho autorizado</option>{saleDraftsQuery.data.map((draft) => <option key={draft.saleDraftId} value={draft.saleDraftId}>Rascunho · {draft.saleDraftId.slice(0, 8)}</option>)}</select></label><label htmlFor="subdivision-sale-draft-work-phase">Classificação interna<select id="subdivision-sale-draft-work-phase" value={saleDraftWorkPhase} onChange={(event) => setSaleDraftWorkPhase(event.target.value as keyof typeof saleDraftWorkPhases)} disabled={updateSaleDraftWorkStateMutation.isPending}>{Object.entries(saleDraftWorkPhases).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button type="submit" disabled={!saleDraftIdForWorkState || updateSaleDraftWorkStateMutation.isPending}>{updateSaleDraftWorkStateMutation.isPending ? "Atualizando classificação" : "Registrar classificação interna"}</button></form>}
        </section>
      </main>
    </DashboardLayout>
  );
}
