import { CircleAlert, FileStack, PencilLine, Phone, ShieldCheck, UserRoundCheck } from "lucide-react";
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
  hasMore?: boolean;
  onLoadMore?: () => void;
  onOpenProfile?: (buyerClientId: string) => void;
};

export default function SubdivisionBuyerReadiness({
  contextReady,
  clients = [],
  attachmentIntents = [],
  isLoading,
  isError,
  hasMore = false,
  onLoadMore,
  onOpenProfile,
}: SubdivisionBuyerReadinessProps) {
  const items = useMemo(
    () => buildSubdivisionBuyerReadiness(clients, attachmentIntents),
    [clients, attachmentIntents],
  );

  return (
    <section className="subdivision-foundation-list" aria-labelledby="buyer-readiness-title">
      <div className="subdivision-foundation-heading">
        <div>
          <p className="subdivision-foundation-eyebrow">08 · ESTOQUE CADASTRAL</p>
          <h2 id="buyer-readiness-title">Acompanhe e edite os cadastros em um só lugar.</h2>
        </div>
          <p>Consulte nome, telefone, WhatsApp e situação do cadastro. Identificação, e-mail, documentos e demais detalhes permanecem somente na ficha protegida.</p>
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
        <>
          <div className="subdivision-foundation-list__rows subdivision-buyer-readiness__rows" aria-label="Estoque operacional de Clientes Loteadora" tabIndex={0}>
            {items.map((item) => (
              <article key={item.buyerClientId} className="subdivision-buyer-readiness__card">
                <div className="subdivision-buyer-readiness__identity">
                  <span>{item.registrationLabel}</span>
                  <h3>{item.displayName}</h3>
                </div>
                <div className="subdivision-buyer-readiness__contacts" aria-label="Contatos cadastrados">
                  <p><Phone size={15} aria-hidden="true" /><b>Telefone</b> · {item.primaryPhone ?? "Não informado"}</p>
                  <p><FileStack size={15} aria-hidden="true" /><b>WhatsApp</b> · {item.messagingPhone ?? "Não informado"}</p>
                </div>
                <div className="subdivision-buyer-readiness__actions">
                  <p><ShieldCheck size={15} aria-hidden="true" /> Dados completos, identificação e documentos ficam na ficha privada.</p>
                  <button type="button" onClick={() => onOpenProfile?.(item.buyerClientId)} disabled={!onOpenProfile}><PencilLine size={15} aria-hidden="true" /> Editar cadastro</button>
                </div>
              </article>
            ))}
          </div>
          {hasMore && <button type="button" className="subdivision-buyer-readiness__more" onClick={onLoadMore} disabled={!onLoadMore || isLoading}>Carregar próximos cadastros</button>}
        </>
      )}
    </section>
  );
}
