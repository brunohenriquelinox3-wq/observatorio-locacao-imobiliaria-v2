import { Layers3, MapPinned, ShieldAlert, Tag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import "../subdivision-internal-inventory-a269.css";

type InventoryContext = { organizationId: string; module: "loteadora"; purposeCode: string };
type InventoryBlock = { blockId: string; blockNumber: number; lots: Array<{ lotNumber: number }> };
type Classification = "standard" | "attention" | "technical";
type ReviewState = "not_reviewed" | "reviewed" | "needs_review";
type MapLegend = "base" | "attention" | "technical";
type InventoryProfile = {
  blockId: string;
  blockNumber: number;
  lotNumber: number;
  profileRecorded: boolean;
  inventoryClassification: Classification;
  reviewState: ReviewState;
  mapLegend: MapLegend;
  internalNote: string | null;
  updatedAt: string | null;
};

const classificationLabels: Record<Classification, string> = { standard: "Base interna", attention: "Atenção operacional", technical: "Referência técnica" };
const reviewLabels: Record<ReviewState, string> = { not_reviewed: "Sem revisão", reviewed: "Revisado", needs_review: "Revisão necessária" };
const legendLabels: Record<MapLegend, string> = { base: "Camada-base", attention: "Camada de atenção", technical: "Camada técnica" };

function keyFor(blockId: string, lotNumber: number) {
  return `${blockId}:${lotNumber}`;
}

export function SubdivisionInternalInventoryPanel({ context, developmentId, blocks, isWorkspaceReady }: {
  context: InventoryContext;
  developmentId: string;
  blocks: InventoryBlock[];
  isWorkspaceReady: boolean;
}) {
  const utils = trpc.useUtils();
  const input = useMemo(() => ({ ...context, developmentId }), [context, developmentId]);
  const profilesQuery = trpc.subdivisionFoundation.listInternalLotInventoryProfiles.useQuery(input, { enabled: isWorkspaceReady, retry: false, staleTime: 30_000 });
  const [classificationFilter, setClassificationFilter] = useState<"all" | Classification>("all");
  const [blockId, setBlockId] = useState("");
  const [lotNumber, setLotNumber] = useState("");
  const [inventoryClassification, setInventoryClassification] = useState<Classification>("standard");
  const [reviewState, setReviewState] = useState<ReviewState>("not_reviewed");
  const [mapLegend, setMapLegend] = useState<MapLegend>("base");
  const [internalNote, setInternalNote] = useState("");
  const selectedBlock = useMemo(() => blocks.find((block) => block.blockId === blockId) ?? null, [blocks, blockId]);
  const profiles = (profilesQuery.data ?? []) as InventoryProfile[];
  const profileByKey = useMemo<Map<string, InventoryProfile>>(() => new Map(profiles.map((profile) => [keyFor(profile.blockId, profile.lotNumber), profile])), [profiles]);
  const allLots = useMemo(() => blocks.flatMap((block) => block.lots.map((lot) => ({ blockId: block.blockId, blockNumber: block.blockNumber, lotNumber: lot.lotNumber }))), [blocks]);
  const visibleLots = useMemo(() => allLots.filter((lot) => classificationFilter === "all" || profileByKey.get(keyFor(lot.blockId, lot.lotNumber))?.inventoryClassification === classificationFilter), [allLots, classificationFilter, profileByKey]);
  const recordedProfiles = profiles.filter((profile) => profile.profileRecorded);
  const selectedProfile = lotNumber ? profileByKey.get(keyFor(blockId, Number(lotNumber))) : null;
  const profileReadUnavailable = profilesQuery.isLoading || profilesQuery.isError;

  useEffect(() => {
    if (!blockId || !blocks.some((block) => block.blockId === blockId)) {
      setLotNumber("");
    }
  }, [blockId, blocks]);

  useEffect(() => {
    if (!selectedProfile) {
      setInventoryClassification("standard");
      setReviewState("not_reviewed");
      setMapLegend("base");
      setInternalNote("");
      return;
    }
    setInventoryClassification(selectedProfile.inventoryClassification);
    setReviewState(selectedProfile.reviewState);
    setMapLegend(selectedProfile.mapLegend);
    setInternalNote(selectedProfile.internalNote ?? "");
  }, [selectedProfile?.blockId, selectedProfile?.lotNumber, selectedProfile?.updatedAt]);

  const upsertProfileMutation = trpc.subdivisionFoundation.upsertInternalLotInventoryProfile.useMutation({
    onSuccess() {
      toast.success("Perfil interno de estoque registrado", { description: "A leitura interna foi atualizada sem criar disponibilidade, venda, contrato ou financeiro." });
      void utils.subdivisionFoundation.listInternalLotInventoryProfiles.invalidate(input);
    },
    onError() {
      toast.error("Perfil interno não atualizado", { description: "O comando exige sessão MFA autorizada, contexto, alçada e finalidade válidos." });
    },
  });
  const profileControlsDisabled = !isWorkspaceReady || profileReadUnavailable || upsertProfileMutation.isPending;

  function selectLot(nextBlockId: string, nextLotNumber: number) {
    setBlockId(nextBlockId);
    setLotNumber(String(nextLotNumber));
  }

  return <section className="subdivision-internal-inventory" id="subdivision-internal-inventory" aria-labelledby="internal-inventory-title">
    <header className="subdivision-internal-inventory__head">
      <div><span>ESTOQUE INTERNO · PERFIL OPERACIONAL</span><h5 id="internal-inventory-title">Leitura detalhada por Lote, sem transformar estrutura em disponibilidade.</h5><p>Classifique a leitura interna, a revisão e a camada do mapa. Estes campos não registram reserva comercial, preço comercial, venda, proposta, cliente, contrato ou financeiro.</p></div>
      <div className="subdivision-internal-inventory__guard"><ShieldAlert size={17} /><span>Leitura e gravação na sessão autorizada</span></div>
    </header>
    <div className="subdivision-internal-inventory__summary" aria-label="Resumo interno de estoque">
      <article><Layers3 size={18} /><b>{allLots.length}</b><span>Lotes físicos na leitura</span></article>
      <article><Tag size={18} /><b>{profileReadUnavailable ? "—" : recordedProfiles.length}</b><span>{profileReadUnavailable ? "Leitura protegida" : "Perfis internos registrados"}</span></article>
      <article><MapPinned size={18} /><b>{profileReadUnavailable ? "—" : recordedProfiles.filter((profile) => profile.reviewState === "needs_review").length}</b><span>{profileReadUnavailable ? "Leitura protegida" : "Revisões necessárias"}</span></article>
    </div>
    {profilesQuery.isError ? <p className="subdivision-internal-inventory__notice is-warning">A sessão autorizada não liberou a leitura de perfil interno. A matriz física permanece inalterada.</p> : <>
      <div className="subdivision-internal-inventory__filter"><label>Legenda interna<select value={classificationFilter} onChange={(event) => setClassificationFilter(event.target.value as "all" | Classification)}><option value="all">Todos os perfis</option>{(Object.keys(classificationLabels) as Classification[]).map((value) => <option key={value} value={value}>{classificationLabels[value]}</option>)}</select></label><p>{visibleLots.length} Lote(s) correspondem ao filtro. O mapa público não foi criado.</p></div>
      <div className="subdivision-internal-inventory__lot-list" aria-label="Mapa interno resumido por Lote">
        {visibleLots.map((lot) => { const profile = profileByKey.get(keyFor(lot.blockId, lot.lotNumber)); return <button type="button" key={keyFor(lot.blockId, lot.lotNumber)} data-classification={profile?.inventoryClassification ?? "standard"} onClick={() => selectLot(lot.blockId, lot.lotNumber)}><span>Q{lot.blockNumber} · L{lot.lotNumber}</span><b>{classificationLabels[profile?.inventoryClassification ?? "standard"]}</b><small>{reviewLabels[profile?.reviewState ?? "not_reviewed"]}</small></button>; })}
      </div>
    </>}
    <form className="subdivision-internal-inventory__form" onSubmit={(event) => { event.preventDefault(); if (!blockId || !lotNumber) return; upsertProfileMutation.mutate({ ...input, blockId, lotNumber: Number(lotNumber), inventoryClassification, reviewState, mapLegend, internalNote, correlationId: crypto.randomUUID() }); }}>
      <div className="subdivision-internal-inventory__form-head"><div><span>FICHA INTERNA DO ESTOQUE</span><b>{profileReadUnavailable ? "Leitura da sessão indisponível" : selectedBlock && lotNumber ? `Q${selectedBlock.blockNumber} · L${lotNumber}` : "Selecione uma unidade no mapa"}</b></div><small>Sem efeito comercial</small></div>
      <label>Quadra<select value={blockId} onChange={(event) => { setBlockId(event.target.value); setLotNumber(""); }} disabled={profileControlsDisabled}><option value="">Selecione a Quadra</option>{blocks.map((block) => <option key={block.blockId} value={block.blockId}>Q{block.blockNumber}</option>)}</select></label>
      <label>Lote<select value={lotNumber} onChange={(event) => setLotNumber(event.target.value)} disabled={profileControlsDisabled || !selectedBlock}><option value="">Selecione o Lote</option>{selectedBlock?.lots.map((lot) => <option key={lot.lotNumber} value={lot.lotNumber}>L{lot.lotNumber}</option>)}</select></label>
      <label>Classificação interna<select value={inventoryClassification} onChange={(event) => setInventoryClassification(event.target.value as Classification)} disabled={profileControlsDisabled}>{(Object.keys(classificationLabels) as Classification[]).map((value) => <option key={value} value={value}>{classificationLabels[value]}</option>)}</select></label>
      <label>Revisão operacional<select value={reviewState} onChange={(event) => setReviewState(event.target.value as ReviewState)} disabled={profileControlsDisabled}>{(Object.keys(reviewLabels) as ReviewState[]).map((value) => <option key={value} value={value}>{reviewLabels[value]}</option>)}</select></label>
      <label>Legenda de mapa<select value={mapLegend} onChange={(event) => setMapLegend(event.target.value as MapLegend)} disabled={profileControlsDisabled}>{(Object.keys(legendLabels) as MapLegend[]).map((value) => <option key={value} value={value}>{legendLabels[value]}</option>)}</select></label>
      <label className="subdivision-internal-inventory__note">Nota interna curta<textarea value={internalNote} onChange={(event) => setInternalNote(event.target.value)} maxLength={280} placeholder="Ex.: referência técnica ou ponto interno a revisar. Não inclua pessoa, preço, contrato ou financeiro." disabled={profileControlsDisabled} /></label>
      <button type="submit" disabled={profileControlsDisabled || !blockId || !lotNumber}>{upsertProfileMutation.isPending ? "Registrando perfil" : profileReadUnavailable ? "Leitura indisponível" : "Salvar perfil interno"}</button>
    </form>
  </section>;
}
