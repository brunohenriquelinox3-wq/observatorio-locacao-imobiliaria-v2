import { CircleAlert, FileStack, Landmark } from "lucide-react";
import { useEffect, useState } from "react";

type Batch = { batchId: string; saleCaseId: string; contractPreparationId: string; batchState: "released_internal_control" | "reversal_review"; itemCount: number; totalCents: number; participationSnapshotState: "projected" | "no_active_policy" | "reversal_review"; participationRuleCount: number; participationProjectedItemCount: number; participationProjectedTotalCents: number; participationUnallocatedCents: number; releasedAt: string; updatedAt: string };

type Props = {
  isReady: boolean;
  batches: readonly Batch[] | undefined;
  isLoading: boolean;
  isError: boolean;
  alertScheduleState: "unbound" | "active" | "paused";
  managingAlertSchedule: boolean;
  onManageAlertSchedule: (action: "activate" | "pause" | "resume" | "remove") => void;
  alertConfiguration: { configurationExists: boolean; leadDays: number | null; enabled: boolean; scheduleBound: boolean } | undefined;
  alertConfigurationLoading: boolean;
  alertConfigurationError: boolean;
  configuringAlerts: boolean;
  onConfigureAlerts: (leadDays: number) => void;
};

export function SubdivisionInternalReceivableBatchPanel({ isReady, batches, isLoading, isError, alertScheduleState, managingAlertSchedule, onManageAlertSchedule, alertConfiguration, alertConfigurationLoading, alertConfigurationError, configuringAlerts, onConfigureAlerts }: Props) {
  const formatCurrency = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const stateLabel = (state: Batch["batchState"]) => state === "released_internal_control" ? "Liberado para controle interno" : "Em revisão de reversão";
  const participationLabel = (batch: Batch) => batch.participationSnapshotState === "projected" ? `${batch.participationRuleCount} regra(s) interna(s) projetada(s)` : batch.participationSnapshotState === "reversal_review" ? "Projeções mantidas em revisão de reversão" : "Sem política ativa na aprovação";
  const [leadDays, setLeadDays] = useState(4);
  useEffect(() => { if (alertConfiguration?.leadDays) setLeadDays(alertConfiguration.leadDays); }, [alertConfiguration?.leadDays]);
  const scheduleCanActivate = Boolean(alertConfiguration?.configurationExists) && !alertConfigurationLoading && !alertConfigurationError;
  return <section className="subdivision-finance-internal" aria-labelledby="subdivision-finance-title">
    <header className="subdivision-finance-internal__head"><div><p className="subdivision-foundation-eyebrow">04 · FINANCEIRO DA LOTEADORA</p><h2 id="subdivision-finance-title">Lotes internos de parcelas liberados.</h2><p>Após uma venda aprovada, a agenda negociada é agrupada para controle do operador. Esta área não emite boleto bancário, não gera linha digitável, não envia cobrança, não acessa banco, não dá baixa e não registra pagamento.</p></div><div className="subdivision-finance-internal__mark"><Landmark size={19} aria-hidden="true" /><span>Controle interno<br /><b>por venda aprovada</b></span></div></header>
    {!isReady ? <div className="subdivision-foundation-empty"><CircleAlert size={18} /><p>Defina um contexto autorizado antes de consultar os lotes internos de parcelas.</p></div> : isLoading ? <div className="subdivision-foundation-empty"><span className="subdivision-foundation-spinner" aria-hidden="true" /><p>Carregando lotes internos autorizados.</p></div> : isError ? <div className="subdivision-foundation-empty is-error"><CircleAlert size={18} /><p>A leitura dos lotes internos não foi liberada para este contexto.</p></div> : !batches?.length ? <div className="subdivision-finance-internal__empty"><FileStack size={21} /><div><b>Nenhum lote interno liberado.</b><span>O lote é criado automaticamente quando uma venda com contrato, agenda e dossiê revisado é aprovada.</span></div></div> : <div className="subdivision-finance-internal__list">{batches.map((batch) => <article key={batch.batchId} data-state={batch.batchState}><div><span>LOTE INTERNO DE PARCELAS</span><b>{stateLabel(batch.batchState)}</b><small>Liberado em {new Date(batch.releasedAt).toLocaleDateString("pt-BR")}</small></div><dl><div><dt>Parcelas</dt><dd>{batch.itemCount}</dd></div><div><dt>Total negociado</dt><dd>{formatCurrency(batch.totalCents)}</dd></div><div><dt>Projeção interna</dt><dd>{formatCurrency(batch.participationProjectedTotalCents)}</dd></div><div><dt>Saldo sem participação</dt><dd>{formatCurrency(batch.participationUnallocatedCents)}</dd></div></dl><p><b>{participationLabel(batch)}</b> · {batch.participationProjectedItemCount} item(ns) de agenda com previsão. Trata-se de referência interna; não há pagamento, ordem de repasse, split bancário, baixa ou confirmação de recebimento.</p><p>{batch.batchState === "released_internal_control" ? "Disponível para conferência e cobrança manual pelo operador, conforme os prazos da negociação." : "A venda e o lote estão em revisão humana; nenhum lote é apagado, reemitido ou liberado automaticamente."}</p></article>)}</div>}
    <section className="subdivision-finance-internal__reminders" aria-labelledby="subdivision-finance-reminders-title">
      <div><span>LEMBRETE INTERNO</span><h3 id="subdivision-finance-reminders-title">Cobrança manual orientada ao operador</h3><p>{alertScheduleState === "active" ? "Ativo diariamente para sinalizar vencimentos à equipe interna." : alertScheduleState === "paused" ? "Pausado. Nenhum novo lembrete será criado até a retomada." : "Ative após publicação para sinalizar vencimentos à equipe interna."}</p></div>
      {alertConfigurationLoading ? <p>Carregando a configuração interna de antecedência.</p> : alertConfigurationError ? <p>Não foi possível ler a configuração interna. Nenhum lembrete será ativado até a leitura ser autorizada.</p> : <form className="subdivision-finance-internal__reminder-config" onSubmit={(event) => { event.preventDefault(); onConfigureAlerts(leadDays); }}><label htmlFor="subdivision-finance-alert-lead-days">Antecedência para lembrar o operador<select id="subdivision-finance-alert-lead-days" value={leadDays} onChange={(event) => setLeadDays(Number(event.target.value))} disabled={!isReady || configuringAlerts || alertScheduleState === "active"}>{Array.from({ length: 14 }, (_, index) => index + 1).map((days) => <option key={days} value={days}>{days} dia{days === 1 ? "" : "s"}</option>)}</select></label><button type="submit" disabled={!isReady || configuringAlerts || alertScheduleState === "active"}>{configuringAlerts ? "Salvando antecedência" : alertConfiguration?.configurationExists ? "Atualizar antecedência" : "Preparar lembrete interno"}</button>{alertScheduleState === "active" && <small>Pause o lembrete antes de alterar a antecedência.</small>}</form>}
      <div className="subdivision-finance-internal__reminder-actions" aria-label="Controle do lembrete diário interno">
        {alertScheduleState === "unbound" ? <button type="button" onClick={() => onManageAlertSchedule("activate")} disabled={!isReady || managingAlertSchedule || !scheduleCanActivate}>{managingAlertSchedule ? "Ativando lembrete" : "Ativar lembrete diário interno"}</button> : <>{alertScheduleState === "active" ? <button type="button" onClick={() => onManageAlertSchedule("pause")} disabled={managingAlertSchedule}>Pausar lembrete interno</button> : <button type="button" onClick={() => onManageAlertSchedule("resume")} disabled={managingAlertSchedule || !scheduleCanActivate}>Retomar lembrete interno</button>}<button type="button" onClick={() => onManageAlertSchedule("remove")} disabled={managingAlertSchedule}>Remover lembrete interno</button></>}
      </div>
      <small>O lembrete apenas orienta a cobrança manual. Ele não emite boleto, não envia mensagem, não acessa banco, não dá baixa e não registra pagamento.</small>
    </section>
    <footer className="subdivision-finance-internal__notice"><CircleAlert size={16} aria-hidden="true" /><span>Vencimento é um dado operacional. Ele não confirma atraso, quitação, baixa, pagamento ou cobrança realizada.</span></footer>
  </section>;
}
