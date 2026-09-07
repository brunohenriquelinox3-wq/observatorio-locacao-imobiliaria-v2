import type { SubdivisionContext } from "@shared/subdivisionContracts";
import { ArchiveRestore, CircleAlert, ClipboardCheck, FileStack, ListFilter, Search, ShieldCheck, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
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
};

const pageSize = 18;

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function SubdivisionBuyerClientDirectory({ context, isContextReady, isWorkspaceReady, selectedBuyerClientId, onSelectBuyerClient }: SubdivisionBuyerClientDirectoryProps) {
  const [searchDraft, setSearchDraft] = useState("");
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const [pageOffset, setPageOffset] = useState(0);

  useEffect(() => {
    const normalized = searchDraft.trim();
    const timeout = window.setTimeout(() => {
      setSearchTerm(normalized.length >= 2 ? normalized : null);
      setPageOffset(0);
    }, 240);
    return () => window.clearTimeout(timeout);
  }, [searchDraft]);

  const directoryInput = useMemo(() => ({ ...context, searchTerm, pageSize, pageOffset }), [context, pageOffset, searchTerm]);
  const timelineInput = useMemo(() => ({ ...context, buyerClientId: selectedBuyerClientId, limit: 20 }), [context, selectedBuyerClientId]);
  const directoryQuery = trpc.subdivisionFoundation.listDraftBuyerClientDirectory.useQuery(directoryInput, { enabled: isWorkspaceReady, retry: false });
  const timelineQuery = trpc.subdivisionFoundation.listDraftBuyerClientTimeline.useQuery(timelineInput, { enabled: isWorkspaceReady && Boolean(selectedBuyerClientId), retry: false });
  const entries = directoryQuery.data as DirectoryEntry[] | undefined;
  const metrics = summarizeBuyerClientDirectory(entries ?? []);
  const activeEntry = entries?.find((entry) => entry.buyerClientId === selectedBuyerClientId) ?? null;
  const belowSearchMinimum = searchDraft.trim().length === 1;

  function openFullProfile() {
    document.getElementById("buyer-profile-title")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return <section className="subdivision-buyer-directory" aria-labelledby="buyer-directory-title">
    <header className="subdivision-buyer-directory__header">
      <div>
        <p className="subdivision-foundation-eyebrow">06 · CENTRAL DE CLIENTES</p>
        <h2 id="buyer-directory-title">Localize, confira e organize o cadastro sem sair do contexto.</h2>
        <p>A lista reúne somente clientes compradores devolvidos pelo servidor. Ela não abre venda, lote, proposta, crédito, contrato, registro ou pagamento.</p>
      </div>
      <div className="subdivision-buyer-directory__guard"><ShieldCheck size={19} aria-hidden="true" /><span>Leitura delimitada<br /><b>por contexto e alçada</b></span></div>
    </header>

    {!isContextReady && <div className="subdivision-foundation-empty"><CircleAlert size={18} /><p>Selecione um contexto autorizado antes de consultar a central de clientes.</p></div>}
    {isWorkspaceReady && <>
      <div className="subdivision-buyer-directory__controls">
        <label htmlFor="buyer-directory-search"><Search size={16} aria-hidden="true" /><span>Buscar cadastro no contexto</span><input id="buyer-directory-search" value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Informe ao menos 2 caracteres" autoComplete="off" /></label>
        <p><ListFilter size={16} aria-hidden="true" /> A busca usa o nome declarado no cadastro-base, limita o retorno e não consulta documento, contato, lote, valor ou contrato.</p>
      </div>
      {belowSearchMinimum && <div className="subdivision-buyer-directory__hint"><CircleAlert size={15} aria-hidden="true" /> Continue digitando para pesquisar. Com apenas um caractere, a lista permanece sem filtro.</div>}

      <div className="subdivision-buyer-directory__metrics" aria-label="Resumo agregado de cadastros visíveis">
        <article><UsersRound size={17} aria-hidden="true" /><span><b>{metrics.total}</b> cadastro(s) visível(is)</span></article>
        <article><ClipboardCheck size={17} aria-hidden="true" /><span><b>{metrics.profilesPresent}</b> perfil(is) organizado(s)</span></article>
        <article><CircleAlert size={17} aria-hidden="true" /><span><b>{metrics.requirementsPending}</b> pendência(s) em revisão</span></article>
        <article><FileStack size={17} aria-hidden="true" /><span><b>{metrics.attachmentsRecorded}</b> arquivo(s) privado(s) registrado(s)</span></article>
      </div>

      {directoryQuery.isLoading && <div className="subdivision-foundation-empty"><span className="subdivision-foundation-spinner" aria-hidden="true" /><p>Confirmando o contexto antes de carregar a central de clientes.</p></div>}
      {directoryQuery.isError && <div className="subdivision-foundation-empty is-error"><CircleAlert size={18} /><p>A lista não foi liberada. Revise sessão, contexto, membership, grant, vigência e finalidade sem inferir outros cadastros.</p></div>}
      {!directoryQuery.isLoading && !directoryQuery.isError && entries?.length === 0 && <div className="subdivision-foundation-empty"><UsersRound size={18} /><p>Nenhum cliente comprador corresponde à leitura autorizada. A ausência não cria nem altera cadastros.</p></div>}

      {!directoryQuery.isLoading && !directoryQuery.isError && entries && entries.length > 0 && <div className="subdivision-buyer-directory__workspace">
        <div className="subdivision-buyer-directory__list" aria-label="Lista de clientes compradores">
          {entries.map((entry) => <button type="button" key={entry.buyerClientId} className={entry.buyerClientId === selectedBuyerClientId ? "is-selected" : ""} aria-pressed={entry.buyerClientId === selectedBuyerClientId} onClick={() => onSelectBuyerClient(entry.buyerClientId)}>
            <span className="subdivision-buyer-directory__entry-top"><small>{buyerClientDirectoryPartyKinds[entry.partyKind]}</small><b>{buyerClientDirectoryRegistrationStates[entry.registrationState]}</b></span>
            <strong>{entry.displayName}</strong>
            <span className="subdivision-buyer-directory__entry-foot"><i>{entry.profilePresent ? "Perfil organizado" : "Perfil a organizar"}</i><i>{entry.requirementsPending > 0 ? `${entry.requirementsPending} pendência(s)` : "Sem pendência registrada"}</i></span>
          </button>)}
          {entries.length === pageSize && <button type="button" className="subdivision-buyer-directory__more" onClick={() => setPageOffset((offset) => offset + pageSize)}><ArchiveRestore size={15} aria-hidden="true" /> Ver mais cadastros autorizados</button>}
        </div>

        <aside className="subdivision-buyer-directory__preview" aria-live="polite">
          {!activeEntry && <div className="subdivision-buyer-directory__preview-empty"><UsersRound size={22} aria-hidden="true" /><h3>Selecione um cadastro</h3><p>O painel mostra somente a situação cadastral, a prontidão e o histórico redigido do cliente escolhido.</p></div>}
          {activeEntry && <>
            <div className="subdivision-buyer-directory__preview-head"><span>FICHA CADASTRAL</span><b>{activeEntry.displayName}</b><small>Atualizado em {formatTimestamp(activeEntry.updatedAt)}</small></div>
            <dl>
              <div><dt>Natureza</dt><dd>{buyerClientDirectoryPartyKinds[activeEntry.partyKind]}</dd></div>
              <div><dt>Situação</dt><dd>{buyerClientDirectoryRegistrationStates[activeEntry.registrationState]}</dd></div>
              <div><dt>Contatos declarados</dt><dd>{activeEntry.contactChannelsRecorded} canal(is)</dd></div>
              <div><dt>Pendências</dt><dd>{activeEntry.requirementsPending} de {activeEntry.requirementsTotal} em revisão</dd></div>
              <div><dt>Anexo privado</dt><dd>{buyerClientDirectoryAttachmentSummaries[activeEntry.attachmentSummary]}</dd></div>
            </dl>
            <button type="button" onClick={openFullProfile}>Abrir ficha e organização cadastral</button>
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
    </>}
  </section>;
}
