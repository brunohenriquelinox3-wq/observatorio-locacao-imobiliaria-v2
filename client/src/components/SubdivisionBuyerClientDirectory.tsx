import type { SubdivisionContext } from "@shared/subdivisionContracts";
import { ArchiveRestore, ArchiveX, CircleAlert, ClipboardCheck, FileStack, ListFilter, RotateCcw, Search, ShieldCheck, UserRoundPlus, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { SubdivisionBuyerClientProfile } from "./SubdivisionBuyerClientProfile";
import "./subdivision-buyer-client-directory.css";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  buyerClientDirectoryAttachmentSummaries,
  buyerClientDirectoryPartyKinds,
  buyerClientDirectoryRegistrationStates,
  buyerClientDirectoryTimelineEvents,
  summarizeBuyerClientDirectory,
} from "@/lib/subdivisionBuyerClientDirectory";

type DirectoryEntry = {
  buyerClientId: string;
  displayName: string;
  partyKind: keyof typeof buyerClientDirectoryPartyKinds;
  registrationState: keyof typeof buyerClientDirectoryRegistrationStates;
  profilePresent: boolean;
  contactChannelsRecorded: number;
  requirementsPending: number;
  requirementsTotal: number;
  attachmentSummary: keyof typeof buyerClientDirectoryAttachmentSummaries;
  updatedAt: string;
};

type SubdivisionBuyerClientDirectoryProps = {
  context: SubdivisionContext;
  isContextReady: boolean;
  isWorkspaceReady: boolean;
  selectedBuyerClientId: string;
  onSelectBuyerClient: (buyerClientId: string) => void;
  onOpenProfilePage: () => void;
};

// Mantém a primeira leitura no limite permitido pelo servidor, reduzindo a
// aparência de ausência falsa sem retirar a paginação para bases maiores.
const pageSize = 25;

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function SubdivisionBuyerClientDirectory({ context, isContextReady, isWorkspaceReady, selectedBuyerClientId, onSelectBuyerClient, onOpenProfilePage }: SubdivisionBuyerClientDirectoryProps) {
  const [searchDraft, setSearchDraft] = useState("");
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const [pageOffset, setPageOffset] = useState(0);
  const [newClientName, setNewClientName] = useState("");
  const [newClientKind, setNewClientKind] = useState<"individual" | "legal_entity">("individual");
  const [localActiveEntry, setLocalActiveEntry] = useState<DirectoryEntry | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const effectiveSelectedBuyerClientId = localActiveEntry?.buyerClientId || selectedBuyerClientId;

  useEffect(() => {
    setSearchDraft("");
    setSearchTerm(null);
    setPageOffset(0);
    setLocalActiveEntry(null);
    setIsEditorOpen(false);
    onSelectBuyerClient("");
  }, [context.organizationId, context.purposeCode, onSelectBuyerClient]);

  useEffect(() => {
    const normalized = searchDraft.trim();
    const timeout = window.setTimeout(() => {
      setSearchTerm(normalized.length >= 2 ? normalized : null);
      setPageOffset(0);
    }, 240);
    return () => window.clearTimeout(timeout);
  }, [searchDraft]);

  const directoryInput = useMemo(() => ({ ...context, searchTerm, pageSize, pageOffset }), [context, pageOffset, searchTerm]);
  const timelineInput = useMemo(() => ({ ...context, buyerClientId: effectiveSelectedBuyerClientId, limit: 20 }), [context, effectiveSelectedBuyerClientId]);
  const profileInput = useMemo(() => ({ ...context, buyerClientId: effectiveSelectedBuyerClientId }), [context, effectiveSelectedBuyerClientId]);
  const directoryQuery = trpc.subdivisionFoundation.listDraftBuyerClientDirectory.useQuery(directoryInput, { enabled: isWorkspaceReady, retry: false });
  const timelineQuery = trpc.subdivisionFoundation.listDraftBuyerClientTimeline.useQuery(timelineInput, { enabled: isWorkspaceReady && Boolean(effectiveSelectedBuyerClientId), retry: false });
  const profileQuery = trpc.subdivisionFoundation.getDraftBuyerClientProfile.useQuery(profileInput, { enabled: isWorkspaceReady && Boolean(effectiveSelectedBuyerClientId), retry: false });
  const archivedClientsQuery = trpc.subdivisionFoundation.listArchivedClients.useQuery(context, { enabled: isWorkspaceReady, retry: false });
  const utils = trpc.useUtils();
  const initialDirectoryInput = useMemo(() => ({ ...context, searchTerm: null, pageSize, pageOffset: 0 }), [context]);
  useEffect(() => {
    if (!archivedClientsQuery.data?.length || window.location.hash !== "#buyer-directory-archived") return;
    window.requestAnimationFrame(() => {
      document.getElementById("buyer-directory-archived")?.scrollIntoView({ behavior: "auto", block: "start" });
    });
  }, [archivedClientsQuery.data?.length]);
  const registerDirectMutation = trpc.subdivisionFoundation.registerClientDirect.useMutation({
    onSuccess(result) {
      setNewClientName("");
      setSearchDraft("");
      setSearchTerm(null);
      setPageOffset(0);
      setLocalActiveEntry(null);
      setIsEditorOpen(true);
      onSelectBuyerClient(result.buyerClientId);
      void utils.subdivisionFoundation.listDraftBuyerClientDirectory.invalidate(initialDirectoryInput);
      void utils.subdivisionFoundation.listDraftBuyerClients.invalidate(context);
      void utils.domainFoundation.listDraftPartyRoles.invalidate(context);
      void utils.subdivisionFoundation.listDraftBuyerClientProfileSummaries.invalidate(context);
      void utils.subdivisionFoundation.listBuyerAttachmentIntents.invalidate(context);
      void utils.subdivisionFoundation.listArchivedClients.invalidate(context);
    },
  });
  const archiveClientMutation = trpc.subdivisionFoundation.archiveClient.useMutation({
    onSuccess() {
      setPageOffset(0);
      setLocalActiveEntry(null);
      setIsEditorOpen(false);
      onSelectBuyerClient("");
      void utils.subdivisionFoundation.listDraftBuyerClientDirectory.invalidate(initialDirectoryInput);
      void utils.subdivisionFoundation.listDraftBuyerClients.invalidate(context);
      void utils.subdivisionFoundation.listDraftBuyerClientProfileSummaries.invalidate(context);
      void utils.subdivisionFoundation.listBuyerAttachmentIntents.invalidate(context);
      void utils.subdivisionFoundation.listArchivedClients.invalidate(context);
    },
  });
  const restoreClientMutation = trpc.subdivisionFoundation.restoreClient.useMutation({
    onSuccess(result) {
      setPageOffset(0);
      setLocalActiveEntry(null);
      setIsEditorOpen(true);
      onSelectBuyerClient(result.buyerClientId);
      void utils.subdivisionFoundation.listDraftBuyerClientDirectory.invalidate(initialDirectoryInput);
      void utils.subdivisionFoundation.listDraftBuyerClients.invalidate(context);
      void utils.subdivisionFoundation.listDraftBuyerClientProfileSummaries.invalidate(context);
      void utils.subdivisionFoundation.listBuyerAttachmentIntents.invalidate(context);
      void utils.subdivisionFoundation.listArchivedClients.invalidate(context);
    },
  });
  const entries = directoryQuery.data as DirectoryEntry[] | undefined;
  const metrics = summarizeBuyerClientDirectory(entries ?? []);
  const activeEntry = localActiveEntry && entries?.some((entry) => entry.buyerClientId === localActiveEntry.buyerClientId)
    ? localActiveEntry
    : entries?.find((entry) => entry.buyerClientId === effectiveSelectedBuyerClientId) ?? null;
  const belowSearchMinimum = searchDraft.trim().length === 1;

  function openDocuments() {
    document.getElementById("buyer-documents-title")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openArchivedClients() {
    const archive = document.getElementById("buyer-directory-archived") as HTMLDetailsElement | null;
    if (!archive) return;
    archive.open = true;
    archive.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function archiveActiveClient() {
    if (!activeEntry) return;
    archiveClientMutation.mutate({ ...context, correlationId: crypto.randomUUID(), buyerClientId: activeEntry.buyerClientId });
  }

  function registerDirectClient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const displayName = newClientName.trim();
    if (displayName.length < 2) return;
    registerDirectMutation.mutate({ ...context, correlationId: crypto.randomUUID(), partyKind: newClientKind, displayName });
  }

  return <section className="subdivision-buyer-directory" aria-labelledby="buyer-directory-title">
    <header className="subdivision-buyer-directory__header">
      <div>
        <p className="subdivision-foundation-eyebrow">06 · CENTRAL DE CLIENTES</p>
        <h2 id="buyer-directory-title">Localize, confira e organize o cadastro sem sair do contexto.</h2>
        <p>A lista reúne somente Clientes Loteadora devolvidos pelo servidor. Ela não abre venda, lote, proposta, crédito, contrato, registro ou pagamento.</p>
      </div>
      <div className="subdivision-buyer-directory__header-actions">
        <div className="subdivision-buyer-directory__guard"><ShieldCheck size={19} aria-hidden="true" /><span>Leitura delimitada<br /><b>por contexto e alçada</b></span></div>
        {archivedClientsQuery.data && archivedClientsQuery.data.length > 0 && <button type="button" className="subdivision-buyer-directory__archive-link" aria-controls="buyer-directory-archived" onClick={openArchivedClients}><ArchiveRestore size={16} aria-hidden="true" /> Ver cadastros arquivados ({archivedClientsQuery.data.length})</button>}
      </div>
    </header>

    {!isContextReady && <div className="subdivision-foundation-empty"><CircleAlert size={18} /><p>Selecione um contexto autorizado antes de consultar a central de clientes.</p></div>}
    {isWorkspaceReady && <>
      <div className="subdivision-buyer-directory__controls">
        <label htmlFor="buyer-directory-search"><Search size={16} aria-hidden="true" /><span>Buscar cadastro no contexto</span><input id="buyer-directory-search" value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Informe ao menos 2 caracteres" autoComplete="off" /></label>
        <p><ListFilter size={16} aria-hidden="true" /> A busca usa o nome declarado no cadastro-base, limita o retorno e não consulta documento, contato, lote, valor ou contrato.</p>
      </div>
      <form className="subdivision-buyer-directory__enrollment" onSubmit={registerDirectClient}>
        <div><UserRoundPlus size={19} aria-hidden="true" /><span><b>Novo Cliente Loteadora</b><small>Registre o nome declarado e a natureza da pessoa. Em seguida, abra a ficha para editar telefone, WhatsApp, e-mail, identificação, pendências e documentos privados.</small></span></div>
        <label htmlFor="buyer-directory-direct-name">Nome declarado<input id="buyer-directory-direct-name" value={newClientName} onChange={(event) => setNewClientName(event.target.value)} minLength={2} maxLength={160} autoComplete="off" placeholder="Informe o nome para o cadastro" required disabled={registerDirectMutation.isPending} /></label>
        <label htmlFor="buyer-directory-direct-kind">Natureza<select id="buyer-directory-direct-kind" value={newClientKind} onChange={(event) => setNewClientKind(event.target.value as "individual" | "legal_entity")} disabled={registerDirectMutation.isPending}><option value="individual">Pessoa física</option><option value="legal_entity">Pessoa jurídica</option></select></label>
        <button type="submit" disabled={registerDirectMutation.isPending || newClientName.trim().length < 2}>{registerDirectMutation.isPending ? "Registrando cliente" : "Cadastrar cliente"}</button>
        {registerDirectMutation.isError && <p className="subdivision-buyer-directory__enrollment-error"><CircleAlert size={14} aria-hidden="true" /> O cadastro não foi concluído. Revise contexto, alçada e nome declarado; a criação é bloqueada quando a validação do servidor não for atendida.</p>}
      </form>
      {belowSearchMinimum && <div className="subdivision-buyer-directory__hint"><CircleAlert size={15} aria-hidden="true" /> Continue digitando para pesquisar. Com apenas um caractere, a lista permanece sem filtro.</div>}

      <div className="subdivision-buyer-directory__metrics" aria-label="Resumo agregado de cadastros visíveis">
        <article><UsersRound size={17} aria-hidden="true" /><span><b>{metrics.total}</b> cadastro(s) visível(is)</span></article>
        <article><ClipboardCheck size={17} aria-hidden="true" /><span><b>{metrics.profilesPresent}</b> perfil(is) organizado(s)</span></article>
        <article><CircleAlert size={17} aria-hidden="true" /><span><b>{metrics.requirementsPending}</b> pendência(s) em revisão</span></article>
        <article><FileStack size={17} aria-hidden="true" /><span><b>{metrics.attachmentsRecorded}</b> arquivo(s) privado(s) registrado(s)</span></article>
      </div>

      {directoryQuery.isLoading && <div className="subdivision-foundation-empty"><span className="subdivision-foundation-spinner" aria-hidden="true" /><p>Confirmando o contexto antes de carregar a central de clientes.</p></div>}
      {directoryQuery.isError && <div className="subdivision-foundation-empty is-error"><CircleAlert size={18} /><p>A lista não foi liberada. Revise sessão, contexto, membership, grant, vigência e finalidade sem inferir outros cadastros.</p></div>}
      {!directoryQuery.isLoading && !directoryQuery.isError && entries?.length === 0 && <div className="subdivision-foundation-empty"><UsersRound size={18} /><p>Nenhum Cliente Loteadora corresponde à leitura autorizada. A ausência não cria nem altera cadastros.</p></div>}

      {!directoryQuery.isLoading && !directoryQuery.isError && entries && entries.length > 0 && <div className="subdivision-buyer-directory__workspace">
        <div className="subdivision-buyer-directory__list" aria-label="Lista de Clientes Loteadora">
          {entries.map((entry) => <button type="button" key={entry.buyerClientId} className={entry.buyerClientId === effectiveSelectedBuyerClientId ? "is-selected" : ""} aria-pressed={entry.buyerClientId === effectiveSelectedBuyerClientId} onClick={() => { setLocalActiveEntry(entry); setIsEditorOpen(true); onSelectBuyerClient(entry.buyerClientId); }}>
            <span className="subdivision-buyer-directory__entry-top"><small>{buyerClientDirectoryPartyKinds[entry.partyKind]}</small><b>{buyerClientDirectoryRegistrationStates[entry.registrationState]}</b></span>
            <strong>{entry.displayName}</strong>
            <span className="subdivision-buyer-directory__entry-foot"><i>{entry.profilePresent ? "Perfil organizado" : "Perfil a organizar"}</i><i>{entry.requirementsPending > 0 ? `${entry.requirementsPending} pendência(s)` : "Sem pendência registrada"}</i></span>
          </button>)}
          {entries.length === pageSize && <button id="buyer-directory-more" type="button" className="subdivision-buyer-directory__more" aria-label="Carregar a próxima página de cadastros autorizados" onClick={() => setPageOffset((offset) => offset + pageSize)}><ArchiveRestore size={15} aria-hidden="true" /> Ver mais cadastros autorizados</button>}
        </div>

        <aside className="subdivision-buyer-directory__preview" aria-live="polite">
          {!activeEntry && <div className="subdivision-buyer-directory__preview-empty"><UsersRound size={22} aria-hidden="true" /><h3>Selecione um cadastro</h3><p>O painel mostra a ficha do Cliente Loteadora, sua prontidão e o histórico redigido do cliente escolhido.</p></div>}
          {activeEntry && <>
            <div className="subdivision-buyer-directory__preview-head"><span>FICHA CADASTRAL</span><b>{activeEntry.displayName}</b><small>Atualizado em {formatTimestamp(activeEntry.updatedAt)}</small></div>
            <dl>
              <div><dt>Natureza</dt><dd>{buyerClientDirectoryPartyKinds[activeEntry.partyKind]}</dd></div>
              <div><dt>Situação</dt><dd>{buyerClientDirectoryRegistrationStates[activeEntry.registrationState]}</dd></div>
              <div><dt>Telefone</dt><dd>{profileQuery.data?.primaryPhone ?? "Não informado"}</dd></div>
              <div><dt>WhatsApp</dt><dd>{profileQuery.data?.messagingPhone ?? "Não informado"}</dd></div>
              <div><dt>E-mail</dt><dd>{profileQuery.data?.primaryEmail ?? "Não informado"}</dd></div>
              <div><dt>CPF/CNPJ</dt><dd>{profileQuery.data?.documentReference ?? "Não informado"}</dd></div>
              <div><dt>RG/documento</dt><dd>{profileQuery.data?.identityDocumentReference ?? "Não informado"}</dd></div>
              <div><dt>Pendências</dt><dd>{activeEntry.requirementsPending} de {activeEntry.requirementsTotal} em revisão</dd></div>
              <div><dt>Anexo privado</dt><dd>{buyerClientDirectoryAttachmentSummaries[activeEntry.attachmentSummary]}</dd></div>
            </dl>
            <div className="subdivision-buyer-directory__preview-actions">
              <button type="button" onClick={() => setIsEditorOpen((isOpen) => !isOpen)}>{isEditorOpen ? "Fechar edição" : "Editar dados cadastrais"}</button>
              <button type="button" className="is-secondary" onClick={onOpenProfilePage}>Abrir ficha em página</button>
              <button type="button" className="is-secondary" onClick={openDocuments}>Documentos privados</button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button type="button" className="is-danger" disabled={archiveClientMutation.isPending}><ArchiveX size={15} aria-hidden="true" />{archiveClientMutation.isPending ? "Excluindo da lista" : "Excluir da lista"}</button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir este Cliente Loteadora da lista ativa?</AlertDialogTitle>
                    <AlertDialogDescription>O cadastro será arquivado, manterá a auditoria redigida e poderá ser restaurado nesta mesma central. Esta ação não cria venda, contrato, cobrança ou efeito financeiro.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={archiveActiveClient}>Confirmar arquivamento</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            {profileQuery.isLoading && <p className="subdivision-buyer-directory__profile-loading">Carregando ficha autorizada.</p>}
            {profileQuery.isError && <p className="subdivision-buyer-directory__profile-loading is-error">A ficha não foi liberada neste contexto.</p>}
            {archiveClientMutation.isError && <p className="subdivision-buyer-directory__profile-loading is-error">A exclusão não foi concluída; nenhum cadastro foi removido.</p>}
            {isEditorOpen && <div className="subdivision-buyer-directory__embedded-editor">
              <SubdivisionBuyerClientProfile
                context={context}
                isContextReady={isContextReady}
                isWorkspaceReady={isWorkspaceReady}
                buyerClients={entries?.map((entry) => ({ buyerClientId: entry.buyerClientId, displayName: entry.displayName }))}
                selectedBuyerClientId={effectiveSelectedBuyerClientId}
                onSelectBuyerClient={onSelectBuyerClient}
                presentation="embedded"
              />
            </div>}
            <section className="subdivision-buyer-directory__timeline" aria-labelledby="buyer-directory-timeline-title">
              <div><p className="subdivision-foundation-eyebrow">HISTÓRICO REDIGIDO</p><h3 id="buyer-directory-timeline-title">Eventos de cadastro</h3></div>
              {timelineQuery.isLoading && <p className="subdivision-buyer-directory__timeline-empty">Carregando eventos autorizados.</p>}
              {timelineQuery.isError && <p className="subdivision-buyer-directory__timeline-empty">Histórico indisponível neste contexto.</p>}
              {timelineQuery.data?.length === 0 && <p className="subdivision-buyer-directory__timeline-empty">Nenhum evento cadastral disponível para leitura.</p>}
              {timelineQuery.data?.map((event) => <div className="subdivision-buyer-directory__timeline-event" key={`${event.eventKind}-${event.occurredAt}`}><span aria-hidden="true" /><p><b>{buyerClientDirectoryTimelineEvents[event.eventKind]}</b><small>{formatTimestamp(event.occurredAt)} · evento autorizado, sem conteúdo pessoal</small></p></div>)}
            </section>
          </>}
        </aside>
      </div>}
      {archivedClientsQuery.data && archivedClientsQuery.data.length > 0 && <details id="buyer-directory-archived" className="subdivision-buyer-directory__archive">
        <summary><ArchiveRestore size={16} aria-hidden="true" /> Cadastros arquivados ({archivedClientsQuery.data.length})</summary>
        <p>Os itens abaixo foram excluídos somente da lista ativa. A auditoria foi preservada e a restauração exige o mesmo contexto autorizado.</p>
        <div>{archivedClientsQuery.data.map((client) => <article key={client.buyerClientId}><span>{client.displayName}</span><button type="button" onClick={() => restoreClientMutation.mutate({ ...context, correlationId: crypto.randomUUID(), buyerClientId: client.buyerClientId })} disabled={restoreClientMutation.isPending}><RotateCcw size={14} aria-hidden="true" /> Restaurar</button></article>)}</div>
        {restoreClientMutation.isError && <p className="subdivision-buyer-directory__profile-loading is-error">A restauração não foi concluída; o cadastro permanece arquivado.</p>}
      </details>}
    </>}
  </section>;
}
