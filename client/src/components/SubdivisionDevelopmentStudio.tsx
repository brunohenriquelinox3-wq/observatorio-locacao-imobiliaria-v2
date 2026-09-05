import type { SubdivisionContext } from "@shared/subdivisionContracts";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { trpc } from "@/lib/trpc";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Archive, CheckCircle2, ClipboardPenLine, FilePlus2, FileText, LandPlot, LoaderCircle, MapPinned, PencilLine, Plus, ShieldAlert, ShieldCheck, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type DevelopmentKind = "residential" | "mixed_use" | "commercial" | "industrial" | "rural" | "other";
type WorkingPhase = "preliminary_reference" | "structuring" | "review_required";
type AttachmentCategory = "planning" | "municipal" | "registry" | "implementation" | "environmental" | "other";

type DevelopmentStudioProps = {
  context: SubdivisionContext;
  isContextReady: boolean;
  isWorkspaceReady: boolean;
};

const kindLabels: Record<DevelopmentKind, string> = {
  residential: "Residencial",
  mixed_use: "Uso misto",
  commercial: "Comercial",
  industrial: "Industrial",
  rural: "Rural",
  other: "Outro enquadramento",
};

const phaseLabels: Record<WorkingPhase, string> = {
  preliminary_reference: "Referência preliminar",
  structuring: "Em estruturação",
  review_required: "Revisão necessária",
};

const attachmentCategoryLabels: Record<AttachmentCategory, string> = {
  planning: "Planejamento interno",
  municipal: "Preparação municipal",
  registry: "Preparação registral",
  implementation: "Preparação de implantação",
  environmental: "Preparação ambiental",
  other: "Outra evidência interna",
};

type StudioForm = {
  internalReference: string;
  displayName: string;
  developmentKind: DevelopmentKind;
  municipality: string;
  stateCode: string;
  plannedStageCount: number;
  workingPhase: WorkingPhase;
  internalNote: string;
};

const emptyForm: StudioForm = {
  internalReference: "",
  displayName: "",
  developmentKind: "residential",
  municipality: "",
  stateCode: "",
  plannedStageCount: 1,
  workingPhase: "preliminary_reference",
  internalNote: "",
};

function toForm(development: { internalReference: string; displayName: string | null; developmentKind: DevelopmentKind | null; municipality: string | null; stateCode: string | null; plannedStageCount: number | null; workingPhase: WorkingPhase; internalNote: string | null }): StudioForm {
  return {
    internalReference: development.internalReference,
    displayName: development.displayName ?? "",
    developmentKind: development.developmentKind ?? "residential",
    municipality: development.municipality ?? "",
    stateCode: development.stateCode ?? "",
    plannedStageCount: development.plannedStageCount ?? 1,
    workingPhase: development.workingPhase,
    internalNote: development.internalNote ?? "",
  };
}

function normalizeReference(value: string) {
  return value.toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, "").slice(0, 80);
}

export function SubdivisionDevelopmentStudio({ context, isContextReady, isWorkspaceReady }: DevelopmentStudioProps) {
  const [selectedDevelopmentId, setSelectedDevelopmentId] = useState("");
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState<StudioForm>(emptyForm);
  const [attachmentCategory, setAttachmentCategory] = useState<AttachmentCategory>("planning");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const attachmentInput = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const developmentsQuery = trpc.subdivisionFoundation.listDevelopmentStudio.useQuery(context, { enabled: isWorkspaceReady, retry: false });
  const selectedDevelopment = useMemo(() => developmentsQuery.data?.find((development) => development.developmentId === selectedDevelopmentId) ?? null, [developmentsQuery.data, selectedDevelopmentId]);
  const attachmentInputContext = useMemo(() => ({ ...context, developmentId: selectedDevelopmentId }), [context, selectedDevelopmentId]);
  const attachmentsQuery = trpc.subdivisionFoundation.listDevelopmentAttachments.useQuery(attachmentInputContext, { enabled: isWorkspaceReady && Boolean(selectedDevelopmentId), retry: false });

  useEffect(() => {
    if (selectedDevelopmentId && !developmentsQuery.data?.some((development) => development.developmentId === selectedDevelopmentId)) {
      setSelectedDevelopmentId("");
      setMode("create");
      setForm(emptyForm);
    }
  }, [developmentsQuery.data, selectedDevelopmentId]);

  useEffect(() => {
    if (mode === "edit" && selectedDevelopment) setForm(toForm(selectedDevelopment));
  }, [mode, selectedDevelopment]);

  const createMutation = trpc.subdivisionFoundation.createDevelopmentStudio.useMutation({
    onSuccess(result) {
      toast.success("Loteamento em rascunho criado", { description: "O cadastro foi salvo como referência interna e não aprova empreendimento, estoque, contrato ou financeiro." });
      setSelectedDevelopmentId(result.developmentId);
      setMode("edit");
      void utils.subdivisionFoundation.listDevelopmentStudio.invalidate(context);
      void utils.subdivisionFoundation.listDraftDevelopments.invalidate(context);
    },
    onError() {
      toast.error("Cadastro não criado", { description: "O servidor exige MFA TOTP recente, organização ativa, identidade, alçada, finalidade e contexto autorizado." });
    },
  });

  const updateMutation = trpc.subdivisionFoundation.updateDevelopmentStudio.useMutation({
    onSuccess() {
      toast.success("Cadastro de loteamento atualizado", { description: "A atualização preserva o rascunho e registra somente metadados redigidos em auditoria." });
      void utils.subdivisionFoundation.listDevelopmentStudio.invalidate(context);
      void utils.subdivisionFoundation.listDraftDevelopments.invalidate(context);
    },
    onError() {
      toast.error("Cadastro não atualizado", { description: "O servidor não liberou a alteração para o contexto ou para a MFA atual." });
    },
  });

  const archiveMutation = trpc.subdivisionFoundation.archiveDevelopmentStudio.useMutation({
    onSuccess() {
      toast.success("Loteamento arquivado", { description: "A remoção é lógica e não apaga histórico de auditoria. Registros com Quadras ativas não podem ser arquivados." });
      setSelectedDevelopmentId("");
      setMode("create");
      setForm(emptyForm);
      void utils.subdivisionFoundation.listDevelopmentStudio.invalidate(context);
      void utils.subdivisionFoundation.listDraftDevelopments.invalidate(context);
    },
    onError() {
      toast.error("Arquivamento bloqueado", { description: "Remova ou trate primeiro as Quadras ativas vinculadas; o sistema não exclui estruturas em cascata." });
    },
  });

  const createAttachmentIntentMutation = trpc.subdivisionFoundation.createDevelopmentAttachmentIntent.useMutation();
  const archiveAttachmentMutation = trpc.subdivisionFoundation.archiveDevelopmentAttachment.useMutation({
    onSuccess() {
      toast.success("Anexo removido", { description: "A referência de armazenamento foi desvinculada. Nenhuma URL, chave ou conteúdo é exibido." });
      void utils.subdivisionFoundation.listDevelopmentAttachments.invalidate(attachmentInputContext);
    },
    onError() {
      toast.error("Remoção bloqueada", { description: "O servidor exige MFA, contexto e vínculo do anexo com o loteamento selecionado." });
    },
  });

  const preparationCount = [form.displayName.trim().length >= 3, form.internalReference.length >= 3, Boolean(form.municipality) === Boolean(form.stateCode), form.plannedStageCount >= 1].filter(Boolean).length;
  const isBusy = createMutation.isPending || updateMutation.isPending || archiveMutation.isPending || isUploading;

  function startNew() {
    setSelectedDevelopmentId("");
    setMode("create");
    setForm(emptyForm);
    setAttachmentFile(null);
    if (attachmentInput.current) attachmentInput.current.value = "";
  }

  function selectDevelopment(id: string) {
    setSelectedDevelopmentId(id);
    setMode("edit");
  }

  function saveDevelopment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = {
      ...form,
      internalReference: normalizeReference(form.internalReference),
      displayName: form.displayName.trim(),
      municipality: form.municipality.trim() || null,
      stateCode: form.stateCode.trim().toUpperCase() || null,
      internalNote: form.internalNote.trim() || null,
    };
    if (mode === "create") {
      createMutation.mutate({ ...context, ...normalized, correlationId: crypto.randomUUID() });
    } else if (selectedDevelopmentId) {
      updateMutation.mutate({ ...context, developmentId: selectedDevelopmentId, ...normalized, correlationId: crypto.randomUUID() });
    }
  }

  async function uploadAttachment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedDevelopmentId || !attachmentFile || isUploading) return;
    if (attachmentFile.size < 1 || attachmentFile.size > 5 * 1024 * 1024 || !["application/pdf", "image/jpeg", "image/png"].includes(attachmentFile.type)) {
      toast.error("Arquivo não aceito", { description: "Escolha PDF, JPEG ou PNG de até 5 MB. A assinatura do arquivo será conferida novamente no servidor." });
      return;
    }
    setIsUploading(true);
    try {
      const intent = await createAttachmentIntentMutation.mutateAsync({ ...context, developmentId: selectedDevelopmentId, category: attachmentCategory, correlationId: crypto.randomUUID() });
      const { data } = await getSupabaseBrowserClient()?.auth.getSession() ?? { data: { session: null } };
      if (!data.session?.access_token) throw new Error("SUPABASE_SESSION_REQUIRED");
      const body = new FormData();
      body.set("attachment", attachmentFile);
      body.set("organizationId", context.organizationId);
      body.set("purposeCode", context.purposeCode);
      body.set("correlationId", crypto.randomUUID());
      const response = await fetch(`/api/private/subdivision-development-attachments/${intent.attachmentId}`, {
        method: "POST",
        credentials: "include",
        headers: { "X-Supabase-Access-Token": data.session.access_token },
        body,
      });
      if (!response.ok) throw new Error("SUBDIVISION_DEVELOPMENT_ATTACHMENT_REJECTED");
      toast.success("Anexo privado registrado", { description: "O cadastro mostra somente categoria, estado e tipo. Nome, URL, chave e conteúdo continuam protegidos." });
      setAttachmentFile(null);
      if (attachmentInput.current) attachmentInput.current.value = "";
      await utils.subdivisionFoundation.listDevelopmentAttachments.invalidate(attachmentInputContext);
    } catch {
      toast.error("Anexo não registrado", { description: "Nenhum arquivo foi associado ao loteamento. Revise MFA, contexto, tipo, tamanho e permissão." });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="subdivision-studio" aria-labelledby="subdivision-studio-title">
      <header className="subdivision-studio__header">
        <div>
          <p className="subdivision-foundation-eyebrow">02 · ESTÚDIO DE CADASTRO</p>
          <h2 id="subdivision-studio-title">Cadastro de Loteamentos com roteiro, revisão e controle de ciclo.</h2>
          <p>Em vez de uma sequência fixa de formulários, escolha um loteamento, complete as etapas necessárias, revise o resumo e avance somente quando o contexto autorizado estiver ativo.</p>
        </div>
        <div className={`subdivision-studio__trust ${isWorkspaceReady ? "is-ready" : ""}`}><ShieldCheck size={18} /><span>{isWorkspaceReady ? "Leitura e comandos serão revalidados pelo servidor." : "Defina o contexto autorizado para iniciar o cadastro."}</span></div>
      </header>

      <div className="subdivision-studio__navigator" aria-label="Navegador de loteamentos">
        <div className="subdivision-studio__navigator-title"><LandPlot size={18} /><div><b>Loteamentos em rascunho</b><span>{developmentsQuery.data ? `${developmentsQuery.data.length} devolvido(s) para o contexto` : "A leitura depende do contexto"}</span></div></div>
        <div className="subdivision-studio__development-rail">
          <button type="button" onClick={startNew} data-active={mode === "create"}><Plus size={15} />Novo loteamento</button>
          {developmentsQuery.data?.map((development) => <button type="button" key={development.developmentId} onClick={() => selectDevelopment(development.developmentId)} data-active={development.developmentId === selectedDevelopmentId}><span>{development.displayName ?? development.internalReference}</span><small>{phaseLabels[development.workingPhase]}</small></button>)}
        </div>
      </div>

      {!isContextReady && <div className="subdivision-foundation-empty"><ShieldAlert size={18} /><p>Sem contexto autorizado não há lista, cadastro, edição, anexo ou arquivamento.</p></div>}
      {isWorkspaceReady && developmentsQuery.isError && <div className="subdivision-foundation-empty is-error"><ShieldAlert size={18} /><p>A leitura foi negada. O sistema não revela loteamentos de outro contexto.</p></div>}
      {isWorkspaceReady && developmentsQuery.isLoading && <div className="subdivision-foundation-empty"><LoaderCircle className="subdivision-foundation-spinner" /><p>Confirmando o contexto antes de organizar o cadastro.</p></div>}

      <div className="subdivision-studio__layout">
        <form className="subdivision-studio__form" onSubmit={saveDevelopment}>
          <div className="subdivision-studio__form-heading"><div><p>ETAPA 1 · IDENTIFICAÇÃO OPERACIONAL</p><h3>{mode === "create" ? "Inicie um loteamento em rascunho" : "Edite o loteamento selecionado"}</h3></div><span>{mode === "create" ? "Novo" : "Edição protegida"}</span></div>
          <div className="subdivision-studio__form-grid">
            <label>Referência interna<input value={form.internalReference} onChange={(event) => setForm((current) => ({ ...current, internalReference: normalizeReference(event.target.value) }))} placeholder="EX.: JARDINS_DO_SUL" disabled={!isWorkspaceReady || isBusy} required minLength={3} maxLength={80} /></label>
            <label>Nome de trabalho<input value={form.displayName} onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))} placeholder="Nome interno do loteamento" disabled={!isWorkspaceReady || isBusy} required minLength={3} maxLength={120} /></label>
            <label>Enquadramento<select value={form.developmentKind} onChange={(event) => setForm((current) => ({ ...current, developmentKind: event.target.value as DevelopmentKind }))} disabled={!isWorkspaceReady || isBusy}>{Object.entries(kindLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
            <label>Etapas planejadas<input type="number" min={1} max={20} value={form.plannedStageCount} onChange={(event) => setForm((current) => ({ ...current, plannedStageCount: Number(event.target.value) || 1 }))} disabled={!isWorkspaceReady || isBusy} required /></label>
          </div>
          <div className="subdivision-studio__form-grid subdivision-studio__form-grid--location">
            <label>Município de referência <small>Opcional, junto da UF</small><input value={form.municipality} onChange={(event) => setForm((current) => ({ ...current, municipality: event.target.value }))} placeholder="Município" disabled={!isWorkspaceReady || isBusy} maxLength={80} /></label>
            <label>UF <small>Opcional, junto do município</small><input value={form.stateCode} onChange={(event) => setForm((current) => ({ ...current, stateCode: event.target.value.toUpperCase().slice(0, 2) }))} placeholder="UF" disabled={!isWorkspaceReady || isBusy} minLength={2} maxLength={2} /></label>
            <label>Situação de trabalho<select value={form.workingPhase} onChange={(event) => setForm((current) => ({ ...current, workingPhase: event.target.value as WorkingPhase }))} disabled={!isWorkspaceReady || isBusy}>{Object.entries(phaseLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          </div>
          <label className="subdivision-studio__note">Nota interna de preparação <small>Opcional · sem dados pessoais, matrícula, contrato, valor ou financeiro</small><textarea value={form.internalNote} onChange={(event) => setForm((current) => ({ ...current, internalNote: event.target.value }))} placeholder="Próximo passo interno ou dependência de revisão" disabled={!isWorkspaceReady || isBusy} maxLength={600} /></label>
          <div className="subdivision-studio__form-actions"><button type="submit" disabled={!isWorkspaceReady || isBusy}>{isBusy ? "Validando requisitos" : mode === "create" ? "Criar loteamento em rascunho" : "Salvar alterações"}</button>{mode === "edit" && <button type="button" className="subdivision-studio__secondary" onClick={startNew} disabled={isBusy}><Plus size={15} />Abrir novo cadastro</button>}</div>
        </form>

        <aside className="subdivision-studio__review" aria-label="Resumo de preparação do loteamento">
          <div className="subdivision-studio__review-title"><ClipboardPenLine size={19} /><div><p>ETAPA 2 · REVISÃO DINÂMICA</p><h3>Leia o cadastro antes de confirmar.</h3></div></div>
          <div className="subdivision-studio__progress"><span style={{ "--progress": `${preparationCount * 25}%` } as React.CSSProperties} /><p>{preparationCount} de 4 verificações estruturais concluídas</p></div>
          <dl>
            <div><dt>Referência</dt><dd>{form.internalReference || "Aguardando preenchimento"}</dd></div>
            <div><dt>Localidade</dt><dd>{form.municipality && form.stateCode ? `${form.municipality} · ${form.stateCode}` : "Não declarada"}</dd></div>
            <div><dt>Roteiro</dt><dd>{form.plannedStageCount} etapa(s) · {phaseLabels[form.workingPhase]}</dd></div>
            <div><dt>Anexos</dt><dd>{selectedDevelopmentId ? `${attachmentsQuery.data?.filter((attachment) => attachment.state === "recorded").length ?? 0} referência(s) privada(s)` : "Disponíveis após criar"}</dd></div>
          </dl>
          <p className="subdivision-studio__review-note"><MapPinned size={15} />Não há matrícula, coordenada, área, preço, lote, estoque, contrato, proposta, cobrança, pagamento ou repasse neste cadastro.</p>
        </aside>
      </div>

      <section className="subdivision-studio__attachments" aria-labelledby="subdivision-attachments-title">
        <div className="subdivision-studio__attachments-heading"><div><p>ETAPA 3 · DOCUMENTOS INTERNOS</p><h3 id="subdivision-attachments-title">Anexe, acompanhe o estado e remova referências sem expor o arquivo.</h3></div><span>PDF, JPEG ou PNG · até 5 MB</span></div>
        {!selectedDevelopmentId ? <div className="subdivision-foundation-empty"><FilePlus2 size={18} /><p>Crie e salve o loteamento primeiro. Só então o servidor permite preparar um anexo privado para esse rascunho.</p></div> : <>
          <form className="subdivision-studio__attachment-form" onSubmit={uploadAttachment}>
            <label>Categoria documental<select value={attachmentCategory} onChange={(event) => setAttachmentCategory(event.target.value as AttachmentCategory)} disabled={!isWorkspaceReady || isUploading}>{Object.entries(attachmentCategoryLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
            <label>Arquivo privado<input ref={attachmentInput} type="file" accept="application/pdf,image/jpeg,image/png" onChange={(event) => setAttachmentFile(event.target.files?.[0] ?? null)} disabled={!isWorkspaceReady || isUploading} /></label>
            <button type="submit" disabled={!isWorkspaceReady || !attachmentFile || isUploading}>{isUploading ? "Registrando anexo" : <><Upload size={15} />Anexar documento</>}</button>
          </form>
          <p className="subdivision-studio__attachment-note">O upload passa por MFA TOTP antes do processamento. A lista não mostra nome original, URL, chave, conteúdo ou download; a remoção é lógica e desvincula a referência do armazenamento.</p>
          {attachmentsQuery.isLoading && <div className="subdivision-foundation-empty"><LoaderCircle className="subdivision-foundation-spinner" /><p>Carregando estados autorizados de anexos.</p></div>}
          {attachmentsQuery.isError && <div className="subdivision-foundation-empty is-error"><ShieldAlert size={18} /><p>Os anexos não foram liberados para leitura neste contexto.</p></div>}
          {attachmentsQuery.data?.length === 0 && <div className="subdivision-foundation-empty"><FileText size={18} /><p>Nenhum anexo foi registrado para este loteamento.</p></div>}
          {attachmentsQuery.data && attachmentsQuery.data.length > 0 && <div className="subdivision-studio__attachment-list">{attachmentsQuery.data.map((attachment, index) => <article key={attachment.attachmentId}><div><span>Documento {String(index + 1).padStart(2, "0")}</span><h4>{attachmentCategoryLabels[attachment.category]}</h4><p>{attachment.state === "recorded" ? "Arquivo privado registrado" : "Aguardando envio privado"} · {attachment.contentType ? attachment.contentType.replace("application/", "") : "tipo ainda não registrado"}</p></div><AlertDialog><AlertDialogTrigger asChild><button type="button" className="subdivision-studio__danger" disabled={archiveAttachmentMutation.isPending}><Trash2 size={15} />Remover</button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remover referência de anexo?</AlertDialogTitle><AlertDialogDescription>A referência será arquivada logicamente e a chave de armazenamento deixará de ficar associada ao loteamento. O arquivo não será exibido nem baixado durante esta ação.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => archiveAttachmentMutation.mutate({ ...context, developmentId: selectedDevelopmentId, attachmentId: attachment.attachmentId, correlationId: crypto.randomUUID() })}>Remover referência</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></article>)}</div>}
        </>}
      </section>

      {selectedDevelopmentId && <section className="subdivision-studio__archive" aria-label="Arquivamento controlado de loteamento"><div><Archive size={19} /><div><p>ETAPA 4 · CICLO DO CADASTRO</p><h3>Arquivamento é seguro, reversão não é automática.</h3><span>O sistema bloqueia o arquivamento enquanto houver Quadras ativas e não exclui nenhuma estrutura em cascata.</span></div></div><AlertDialog><AlertDialogTrigger asChild><button type="button" disabled={archiveMutation.isPending || isUploading}>Arquivar loteamento</button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Arquivar este loteamento em rascunho?</AlertDialogTitle><AlertDialogDescription>O cadastro sairá da lista ativa, as referências de anexos serão removidas logicamente e o histórico de auditoria será preservado. Esta ação exige MFA recente e falhará se existirem Quadras ativas.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => archiveMutation.mutate({ ...context, developmentId: selectedDevelopmentId, correlationId: crypto.randomUUID() })}>Arquivar rascunho</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></section>}
    </section>
  );
}
