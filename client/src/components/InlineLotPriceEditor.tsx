import type { FormEvent, RefObject } from "react";
import { createPortal } from "react-dom";
import { ShieldCheck } from "lucide-react";
import { formatLotPriceAdjustmentLabel } from "@/lib/subdivisionOperationalReference";

type PriceConditionDraft = {
  amount: string;
  effectiveFrom: string;
  reasonCode: string;
  conditionReference: string;
};

type InlineLotPriceEditorProps = {
  host: HTMLElement | null;
  blockNumber: number;
  lotNumber: number;
  state: "available" | "loading" | "mfa_required" | "unavailable";
  draft: PriceConditionDraft;
  onDraftChange: (patch: Partial<PriceConditionDraft>) => void;
  amountInputRef: RefObject<HTMLInputElement | null>;
  previewTotal: number | null;
  workspaceReady: boolean;
  busy: boolean;
  canPrepare: boolean;
  preparing: boolean;
  onPrepare: (event: FormEvent<HTMLFormElement>) => void;
};

const reasonOptions = [
  ["internal_review", "Revisão interna"],
  ["work_progress", "Evolução de obras"],
  ["market_response", "Resposta de mercado"],
  ["campaign", "Campanha interna"],
  ["specific_condition", "Condição específica"],
  ["other", "Outro motivo interno"],
] as const;

export function InlineLotPriceEditor({
  host,
  blockNumber,
  lotNumber,
  state,
  draft,
  onDraftChange,
  amountInputRef,
  previewTotal,
  workspaceReady,
  busy,
  canPrepare,
  preparing,
  onPrepare,
}: InlineLotPriceEditorProps) {
  if (!host) return null;

  const editorId = "inline-lot-price-editor-contextual";
  const editorTitleId = "inline-lot-price-editor-contextual-title";

  const editor = state === "available" ? (
    <section id={editorId} className="subdivision-lot-management__inline-price-editor" aria-labelledby={editorTitleId}>
      <div className="subdivision-lot-management__inline-price-editor-head">
        <div>
          <span>REFERÊNCIA INTERNA POR M²</span>
          <h6 id={editorTitleId}>Atualize o valor do Lote selecionado.</h6>
          <p>O valor interno atual é carregado nesta ficha para edição. O total é recalculado apenas para conferência e não pode ser digitado separadamente; o cartão é renovado quando o servidor confirma a referência vigente.</p>
        </div>
        <span className="subdivision-lot-management__inline-price-editor-lot">{formatLotPriceAdjustmentLabel(blockNumber, lotNumber)}</span>
      </div>
      <form id="inline-lot-price-form" className="subdivision-lot-management__inline-price-editor-form" onSubmit={onPrepare}>
        <label>Valor por m² (BRL)<small>Referência interna atual, pronta para ajuste governado</small><input ref={amountInputRef} type="number" min="0.0001" step="0.0001" inputMode="decimal" value={draft.amount} onChange={(event) => onDraftChange({ amount: event.target.value })} placeholder="Informe o novo valor por m²" disabled={!workspaceReady || busy} required /></label>
        <label>Início da vigência<small>Obrigatório para preparar a atualização interna</small><input type="date" value={draft.effectiveFrom} onChange={(event) => onDraftChange({ effectiveFrom: event.target.value })} disabled={!workspaceReady || busy} required /></label>
        <label>Motivo interno<small>Justificativa operacional da atualização</small><select value={draft.reasonCode} onChange={(event) => onDraftChange({ reasonCode: event.target.value })} disabled={!workspaceReady || busy}>{reasonOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <div className="subdivision-lot-management__inline-price-reference"><span>Identificação do ajuste</span><b>{formatLotPriceAdjustmentLabel(blockNumber, lotNumber)}</b><small>Gerada automaticamente para esta atualização. O código técnico permanece nos controles internos.</small></div>
        <div className="subdivision-lot-management__inline-price-preview"><span>TOTAL REFERENCIAL PARA CONFERÊNCIA</span><b>{previewTotal === null ? "Informe o valor por m²" : previewTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</b><small>Derivado exclusivamente da área física confirmada. Não é valor contratual, disponibilidade ou lançamento financeiro.</small></div>
      </form>
      <div className="subdivision-lot-management__inline-price-editor-actions"><p>Ao preparar, a atualização permanece interna e exige sessão autenticada, política, contexto, alçada, vigência, respaldo, correlação, idempotência e aprovação segregada antes de qualquer referência vigente.</p><button type="submit" form="inline-lot-price-form" disabled={!workspaceReady || busy || !canPrepare}>{preparing ? "Preparando atualização interna" : "Preparar atualização interna"}</button></div>
    </section>
  ) : state === "mfa_required" ? (
    <section id={editorId} className="subdivision-lot-management__inline-price-editor" aria-labelledby={editorTitleId}>
      <div className="subdivision-lot-management__inline-price-editor-head"><div><span>REFERÊNCIA INTERNA POR M²</span><h6 id={editorTitleId}>Confirme MFA para editar o valor por m².</h6><p>A ficha física permanece disponível; a referência interna só é carregada com sessão reforçada.</p></div></div>
      <a className="subdivision-lot-management__renew-mfa" href="/seguranca-mfa"><ShieldCheck size={15} /><span>Confirmar MFA</span></a>
    </section>
  ) : (
    <section id={editorId} className="subdivision-lot-management__inline-price-editor" aria-labelledby={editorTitleId}>
      <div className="subdivision-lot-management__inline-price-editor-head"><div><span>REFERÊNCIA INTERNA POR M²</span><h6 id={editorTitleId}>Referência interna ainda não disponível.</h6><p>Este Lote não recebe valor estimado. Atualize a leitura ou conclua a definição humana respaldada antes de preparar uma atualização.</p></div></div>
    </section>
  );

  return createPortal(editor, host);
}
