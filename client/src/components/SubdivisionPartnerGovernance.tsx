import { CircleAlert, Landmark, ShieldCheck, UsersRound } from "lucide-react";
import { useMemo } from "react";
import {
  buildSubdivisionPartnerGovernance,
  type SubdivisionInternalPartnerLink,
} from "@/lib/subdivisionPartnerGovernance";

type SubdivisionPartnerGovernanceProps = {
  contextReady: boolean;
  developmentId: string;
  links?: readonly SubdivisionInternalPartnerLink[];
  isLoading: boolean;
  isError: boolean;
};

export default function SubdivisionPartnerGovernance({
  contextReady,
  developmentId,
  links = [],
  isLoading,
  isError,
}: SubdivisionPartnerGovernanceProps) {
  const items = useMemo(
    () => buildSubdivisionPartnerGovernance(developmentId, links),
    [developmentId, links],
  );

  return (
    <section className="subdivision-foundation-list" aria-labelledby="partner-governance-title">
      <div className="subdivision-foundation-heading">
        <div>
          <p className="subdivision-foundation-eyebrow">06 · GOVERNANÇA INTERNA</p>
          <h2 id="partner-governance-title">O vínculo organiza responsabilidades, não recebimentos.</h2>
        </div>
        <p>A leitura mostra somente tipo de papel, vigência declarada e necessidade de revisão humana. Ela não define participação, decisão, contrato ou efeito financeiro.</p>
      </div>

      {!contextReady ? (
        <div className="subdivision-foundation-empty"><ShieldCheck size={18} aria-hidden="true" /><p>Sem contexto, não há leitura de vínculos internos nem indicação de existência de partes relacionadas.</p></div>
      ) : !developmentId ? (
        <div className="subdivision-foundation-empty"><Landmark size={18} aria-hidden="true" /><p>Selecione um loteamento autorizado para organizar os vínculos internos devolvidos neste contexto.</p></div>
      ) : isLoading ? (
        <div className="subdivision-foundation-empty"><span className="subdivision-foundation-spinner" aria-hidden="true" /><p>Confirmando o contexto antes de organizar a governança interna.</p></div>
      ) : isError ? (
        <div className="subdivision-foundation-empty is-error"><CircleAlert size={18} aria-hidden="true" /><p>A leitura de governança não foi liberada. Revise contexto e alçada sem inferir vínculos externos.</p></div>
      ) : items.length === 0 ? (
        <div className="subdivision-foundation-empty"><UsersRound size={18} aria-hidden="true" /><p>Nenhum vínculo interno foi devolvido para o loteamento selecionado.</p></div>
      ) : (
        <div className="subdivision-foundation-list__rows" aria-label="Governança interna por loteamento">
          {items.map((item) => (
            <article key={item.ordinalLabel}>
              <span>{item.ordinalLabel}</span>
              <h3>{item.roleLabel}</h3>
              <p><ShieldCheck size={15} aria-hidden="true" /><b>{item.lifecycleLabel}</b> · sem data exposta ou efeito sobre alçada.</p>
              <p><Landmark size={15} aria-hidden="true" /><b>{item.reviewLabel}</b> · não representa participação, contrato ou recebimento.</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
