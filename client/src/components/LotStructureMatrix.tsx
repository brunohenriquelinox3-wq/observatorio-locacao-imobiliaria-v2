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
  isLoading: boolean;
  isError: boolean;
};

export default function LotStructureMatrix({
  contextReady,
  blockSelected,
  blockLabel,
  lots = [],
  inventoryStates = [],
  isLoading,
  isError,
}: LotStructureMatrixProps) {
  const cells = useMemo(() => buildLotStructureMatrix(lots, inventoryStates), [lots, inventoryStates]);

  return (
    <section className="lot-structure-map" aria-labelledby="lot-structure-map-title">
      <header className="lot-structure-map__header">
        <div>
          <p className="lot-inventory-eyebrow">MAPA ESTRUTURAL · SOMENTE LEITURA</p>
          <h2 id="lot-structure-map-title">A Quadra matriz organiza a leitura dos Lotes.</h2>
          <p>Esta matriz usa somente referências internas já devolvidas para a Quadra selecionada. Ela não representa planta, área, disponibilidade, reserva, venda ou contrato.</p>
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
            <article key={cell.lotId} className={`lot-structure-map__cell is-${cell.phase}`}>
              <span>Lote</span>
              <strong>{cell.lotNumber}</strong>
              <small>{cell.phaseLabel}</small>
            </article>
          ))}
        </div>
      )}

      <p className="lot-structure-map__footnote">Uma situação interna ausente ou não reconhecida aparece como revisão necessária. A conferência humana continua obrigatória.</p>
    </section>
  );
}
