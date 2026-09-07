import { Grid3X3, LockKeyhole, ScanSearch } from "lucide-react";
import { useMemo } from "react";
import {
  buildLotStructureMatrix,
  type StructuralInventoryState,
  type StructuralLot,
} from "@/lib/lotStructureMatrix";

type LotStructureMatrixProps = {
  contextReady: boolean;
  blockSelected: boolean;
  blockLabel?: string;
  lots?: readonly StructuralLot[];
  inventoryStates?: readonly StructuralInventoryState[];
  commercialStates?: readonly { lotId: string; commercialState: "preparation" | "contract_review" | "sold" | "reversal_review" }[];
  isLoading: boolean;
  isError: boolean;
};

export default function LotStructureMatrix({
  contextReady,
  blockSelected,
  blockLabel,
  lots = [],
  inventoryStates = [],
  commercialStates = [],
  isLoading,
  isError,
}: LotStructureMatrixProps) {
  const cells = useMemo(() => buildLotStructureMatrix(lots, inventoryStates), [lots, inventoryStates]);
  const commercialStateByLotId = useMemo(() => new Map(commercialStates.map((item) => [item.lotId, item.commercialState])), [commercialStates]);

  return (
    <section className="lot-structure-map" aria-labelledby="lot-structure-map-title">
      <header className="lot-structure-map__header">
        <div>
          <p className="lot-inventory-eyebrow">MAPA ESTRUTURAL · SOMENTE LEITURA</p>
          <h2 id="lot-structure-map-title">A Quadra matriz organiza a leitura dos Lotes.</h2>
          <p>Esta matriz usa referências internas devolvidas para a Quadra selecionada. A estrutura física continua separada do estado comercial; somente uma confirmação aprovada pode marcar um lote como vendido.</p>
        </div>
        <aside aria-label="Limite do mapa estrutural">
          <Grid3X3 size={20} aria-hidden="true" />
          <span>Modo estrutural</span>
          <b>Sem comando por célula</b>
        </aside>
      </header>

      {!contextReady ? (
        <p className="lot-structure-map__notice is-blocked"><LockKeyhole size={17} aria-hidden="true" />Defina um contexto autorizado antes de consultar a matriz de inventário.</p>
      ) : !blockSelected ? (
        <p className="lot-structure-map__notice"><ScanSearch size={17} aria-hidden="true" />Selecione uma Quadra matriz para abrir somente os Lotes autorizados naquele recorte.</p>
      ) : isLoading ? (
        <p className="lot-structure-map__notice">Carregando a estrutura autorizada da {blockLabel ?? "Quadra"}.</p>
      ) : isError ? (
        <p className="lot-structure-map__notice is-blocked">A leitura estrutural não foi liberada. Nenhum Lote de outro contexto é exibido.</p>
      ) : cells.length === 0 ? (
        <p className="lot-structure-map__notice">Nenhum Lote em preparação foi devolvido para esta Quadra. Isso não indica estoque comercial.</p>
      ) : (
        <div className="lot-structure-map__canvas" aria-label={`Matriz estrutural da ${blockLabel ?? "Quadra selecionada"}`}>
          {cells.map((cell) => (
            <article key={cell.lotId} className={`lot-structure-map__cell is-${cell.phase} ${commercialStateByLotId.get(cell.lotId) === "sold" ? "is-commercial-sold" : commercialStateByLotId.get(cell.lotId) === "reversal_review" ? "is-commercial-review" : ""}`}>
              <span>Lote</span>
              <strong>{cell.lotNumber}</strong>
              <small>{cell.phaseLabel}</small>
              {commercialStateByLotId.get(cell.lotId) === "sold" && <em>Vendido</em>}
              {commercialStateByLotId.get(cell.lotId) === "reversal_review" && <em>Reversão em revisão</em>}
            </article>
          ))}
        </div>
      )}

      <p className="lot-structure-map__footnote">Uma situação interna ausente ou não reconhecida aparece como revisão necessária. O estado “Vendido” é uma confirmação comercial auditada; uma reversão permanece em revisão humana e nunca libera o lote automaticamente.</p>
    </section>
  );
}
