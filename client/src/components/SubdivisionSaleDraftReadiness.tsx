import { CircleAlert, FileStack, ShieldCheck, UsersRound, Workflow } from "lucide-react";
import { useMemo } from "react";
import {
  buildSubdivisionSaleDraftReadiness,
  type SaleDraftReadinessCoBuyer,
  type SaleDraftReadinessCoverage,
  type SaleDraftReadinessDraft,
  type SaleDraftReadinessWorkState,
} from "@/lib/subdivisionSaleDraftReadiness";

type SubdivisionSaleDraftReadinessProps = {
  contextReady: boolean;
  drafts?: readonly SaleDraftReadinessDraft[];
  coverages?: readonly SaleDraftReadinessCoverage[];
  workStates?: readonly SaleDraftReadinessWorkState[];
  coBuyers?: readonly SaleDraftReadinessCoBuyer[];
  isLoading: boolean;
  isError: boolean;
};

export default function SubdivisionSaleDraftReadiness({
  contextReady,
  drafts = [],
  coverages = [],
  workStates = [],
  coBuyers = [],
  isLoading,
  isError,
}: SubdivisionSaleDraftReadinessProps) {
  const items = useMemo(
    () => buildSubdivisionSaleDraftReadiness(drafts, coverages, workStates, coBuyers),
    [drafts, coverages, workStates, coBuyers],
  );

  return (
    <section className="subdivision-foundation-list" aria-labelledby="sale-draft-readiness-title">
      <div className="subdivision-foundation-heading">
        <div>
          <p className="subdivision-foundation-eyebrow">09 · PREPARAÇÃO INTERNA</p>
          <h2 id="sale-draft-readiness-title">A preparação organiza a revisão, não a venda.</h2>
        </div>
        <p>Esta leitura reúne vínculo interno, cobertura privada opaca, participantes e classificação de trabalho. Ela não cria reserva, proposta, contrato ou obrigação financeira.</p>
      </div>

      {!contextReady ? (
        <div className="subdivision-foundation-empty"><ShieldCheck size={18} aria-hidden="true" /><p>Sem contexto, não há leitura de preparação nem indicação de existência de operações internas.</p></div>
      ) : isLoading ? (
        <div className="subdivision-foundation-empty"><span className="subdivision-foundation-spinner" aria-hidden="true" /><p>Confirmando o contexto antes de organizar a preparação interna.</p></div>
      ) : isError ? (
        <div className="subdivision-foundation-empty is-error"><CircleAlert size={18} aria-hidden="true" /><p>A leitura de preparação não foi liberada. Revise contexto e alçada sem inferir operações externas.</p></div>
      ) : items.length === 0 ? (
        <div className="subdivision-foundation-empty"><Workflow size={18} aria-hidden="true" /><p>Nenhuma preparação interna foi devolvida para este contexto.</p></div>
      ) : (
        <div className="subdivision-foundation-list__rows" aria-label="Preparações internas de venda">
          {items.map((item) => (
            <article key={item.saleDraftId}>
              <span>{item.ordinalLabel}</span>
              <h3>{item.linkLabel}</h3>
              <p><FileStack size={15} aria-hidden="true" /><b>{item.attachmentLabel}</b> · estado opaco, sem arquivo ou metadado.</p>
              <p><UsersRound size={15} aria-hidden="true" /><b>{item.participantLabel}</b> · sem titularidade, prioridade ou obrigação.</p>
              <p><ShieldCheck size={15} aria-hidden="true" /><b>{item.workLabel}</b> · não aprova pessoa nem inicia etapa comercial.</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
