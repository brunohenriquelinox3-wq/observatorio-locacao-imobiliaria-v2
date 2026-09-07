import { CircleAlert, FileStack, ShieldCheck, UserRoundCheck } from "lucide-react";
import { useMemo } from "react";
import {
  buildSubdivisionBuyerReadiness,
  type BuyerReadinessAttachmentIntent,
  type BuyerReadinessClient,
} from "@/lib/subdivisionBuyerReadiness";

type SubdivisionBuyerReadinessProps = {
  contextReady: boolean;
  clients?: readonly BuyerReadinessClient[];
  attachmentIntents?: readonly BuyerReadinessAttachmentIntent[];
  isLoading: boolean;
  isError: boolean;
};

export default function SubdivisionBuyerReadiness({
  contextReady,
  clients = [],
  attachmentIntents = [],
  isLoading,
  isError,
}: SubdivisionBuyerReadinessProps) {
  const items = useMemo(
    () => buildSubdivisionBuyerReadiness(clients, attachmentIntents),
    [clients, attachmentIntents],
  );

  return (
    <section className="subdivision-foundation-list" aria-labelledby="buyer-readiness-title">
      <div className="subdivision-foundation-heading">
        <div>
          <p className="subdivision-foundation-eyebrow">08 · PRONTIDÃO PRIVADA</p>
          <h2 id="buyer-readiness-title">A preparação não identifica o cliente.</h2>
        </div>
          <p>Esta leitura organiza somente o cadastro, a cobertura privada opaca e a necessidade de conferência humana. Ela não aprova cadastro nem produz efeito comercial.</p>
      </div>

      {!contextReady ? (
        <div className="subdivision-foundation-empty"><ShieldCheck size={18} aria-hidden="true" /><p>Sem contexto, não há leitura de prontidão nem indicação de existência de clientes.</p></div>
      ) : isLoading ? (
        <div className="subdivision-foundation-empty"><span className="subdivision-foundation-spinner" aria-hidden="true" /><p>Confirmando o contexto antes de organizar a prontidão privada.</p></div>
      ) : isError ? (
        <div className="subdivision-foundation-empty is-error"><CircleAlert size={18} aria-hidden="true" /><p>A leitura de prontidão não foi liberada. Revise contexto e alçada sem inferir dados externos.</p></div>
      ) : items.length === 0 ? (
        <div className="subdivision-foundation-empty"><UserRoundCheck size={18} aria-hidden="true" /><p>Nenhum Cliente Loteadora foi devolvido para este contexto.</p></div>
      ) : (
        <div className="subdivision-foundation-list__rows" aria-label="Prontidão privada de Clientes Loteadora">
          {items.map((item) => (
            <article key={item.buyerClientId}>
              <span>{item.ordinalLabel}</span>
              <h3>Cadastro-base em organização</h3>
              <p><FileStack size={15} aria-hidden="true" /><b>{item.attachmentLabel}</b> · estado opaco, sem arquivo ou metadado.</p>
              <p><ShieldCheck size={15} aria-hidden="true" /><b>{item.reviewLabel}</b> · o quadro não decide, classifica risco ou inicia venda.</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
