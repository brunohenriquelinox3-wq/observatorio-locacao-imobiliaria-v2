import { Calculator, CircleAlert, Landmark, Search, ShieldCheck, UserPlus, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Option = { id: string; label: string };
type PriceContext = { state: string; availabilityReason: string | null; policyReference: string | null; conditionReference: string | null; effectivePricePerSqmBrl: number | null; lotAreaSqm: number | null; effectiveLotTotalBrl: number | null } | null | undefined;
type SaleCase = { saleCaseId: string; state: string; termsVersion: number | null; negotiatedTotalCents: number | null; entryAmountCents: number | null; entryDueDate: string | null; installmentCount: number; installmentAmountCents: number | null; firstDueDate: string | null; dueDay: number | null };
type SaleCaseParty = { saleCaseId: string; buyerClientId: string; partyRole: "primary_proponent" | "joint_proponent" };
type InternalContract = { contractPreparationId: string; saleCaseId: string; state: "internal_review" | "approved" | "archived"; termsVersion: number; scheduledItemCount: number; scheduledTotalCents: number; bankIssuanceState: "awaiting_bank_issue" };
type InternalAttention = { contractPreparationId: string; dueWithinFourDaysCount: number; pastDueUnreconciledCount: number };
type InternalBatch = { batchId: string; saleCaseId: string; batchState: "released_internal_control" | "reversal_review"; itemCount: number; totalCents: number };

type Props = {
  isWorkspaceReady: boolean;
  developments: readonly Option[];
  blocks: readonly Option[];
  lots: readonly Option[];
  buyers: readonly Option[];
  selectedDevelopmentId: string;
  selectedBlockId: string;
  selectedLotId: string;
  selectedBuyerClientId: string;
  selectedSaleCaseId: string;
  fiscalReference: string;
  lookupState: "idle" | "loading" | "found" | "not_found" | "error";
  priceContext: PriceContext;
  saleCases: readonly SaleCase[];
  saleCaseParties: readonly SaleCaseParty[];
  openingCase: boolean;
  savingTerms: boolean;
  addingJointProponent: boolean;
  removingJointProponent: boolean;
  formalizingCase: boolean;
  approvingCase: boolean;
  requestingReversal: boolean;
  configuringAlerts: boolean;
  managingAlertSchedule: boolean;
  alertScheduleState: "unbound" | "active" | "paused";
  internalContracts: readonly InternalContract[];
  internalAttention: readonly InternalAttention[];
  internalBatches: readonly InternalBatch[];
  releasingInternalBatch: boolean;
  onDevelopmentChange: (value: string) => void;
  onBlockChange: (value: string) => void;
  onLotChange: (value: string) => void;
  onBuyerChange: (value: string) => void;
  onSaleCaseChange: (value: string) => void;
  onFiscalReferenceChange: (value: string) => void;
  onLookupBuyer: () => void;
  onOpenCase: () => void;
  onAddJointProponent: (buyerClientId: string) => void;
  onRemoveJointProponent: (buyerClientId: string) => void;
  onSaveTerms: (input: { negotiatedTotalCents: number | null; entryAmountCents: number | null; entryDueDate: string | null; installmentCount: number; installmentAmountCents: number | null; firstDueDate: string | null; dueDay: number | null }) => void;
  onFormalizeCase: () => void;
  onApproveCase: () => void;
  onRequestReversal: () => void;
  onConfigureAlerts: (leadDays: number) => void;
  onManageAlertSchedule: (action: "activate" | "pause" | "resume" | "remove") => void;
  onReleaseInternalBatch: () => void;
};

const formatBrl = (value: number | null) => value === null ? "Não informado" : value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const centsToInput = (value: number | null) => value === null ? "" : (value / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const centsFromBrl = (raw: string) => {
  const normalized = raw.trim().replace(/\s|R\$/gi, "").includes(",")
    ? raw.trim().replace(/\s|R\$/gi, "").replace(/\./g, "").replace(",", ".")
    : raw.trim().replace(/\s|R\$/gi, "");
  if (!normalized) return null;
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return undefined;
  const value = Math.round(Number(normalized) * 100);
  return Number.isSafeInteger(value) && value >= 0 ? value : undefined;
};

export function deriveEqualInstallmentCents(totalCents: number | null, entryCents: number | null, installmentCount: number): number | null {
  if (typeof totalCents !== "number" || !Number.isInteger(installmentCount) || installmentCount <= 0) return null;
  const normalizedEntry = entryCents ?? 0;
  const remainingCents = totalCents - normalizedEntry;
  if (normalizedEntry < 0 || remainingCents < 0 || remainingCents % installmentCount !== 0) return null;
  return remainingCents / installmentCount;
}

export function buildMonthlyDueDates(firstDueDate: string, dueDay: number | null, installmentCount: number): string[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(firstDueDate) || !Number.isInteger(dueDay) || !dueDay || installmentCount <= 0) return [];
  const [year, month] = firstDueDate.split("-").map(Number);
  return Array.from({ length: installmentCount }, (_, index) => {
    const monthDate = new Date(Date.UTC(year, month - 1 + index, 1));
    const currentYear = monthDate.getUTCFullYear();
    const currentMonth = monthDate.getUTCMonth();
    const lastDayOfMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0)).getUTCDate();
    const day = Math.min(dueDay, lastDayOfMonth);
    return `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  });
}

export function SubdivisionSaleCaseWorkspace(props: Props) {
  const [totalBrl, setTotalBrl] = useState("");
  const [entryBrl, setEntryBrl] = useState("");
  const [entryDueDate, setEntryDueDate] = useState("");
  const [installmentCount, setInstallmentCount] = useState("0");
  const [installmentBrl, setInstallmentBrl] = useState("");
  const [firstDueDate, setFirstDueDate] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [alertLeadDays, setAlertLeadDays] = useState("4");
  const [jointBuyerClientId, setJointBuyerClientId] = useState("");
  const [termsError, setTermsError] = useState("");
  const selectedCase = props.saleCases.find((item) => item.saleCaseId === props.selectedSaleCaseId);
  const selectedCaseParties = props.saleCaseParties.filter((party) => party.saleCaseId === props.selectedSaleCaseId);
  const jointProponents = selectedCaseParties.filter((party) => party.partyRole === "joint_proponent");
  const selectedContract = props.internalContracts.find((item) => item.saleCaseId === props.selectedSaleCaseId);
  const selectedAttention = props.internalAttention.find((item) => item.contractPreparationId === selectedContract?.contractPreparationId);
  const selectedBatch = props.internalBatches.find((item) => item.saleCaseId === props.selectedSaleCaseId);
  useEffect(() => {
    if (!selectedCase) return;
    setTotalBrl(centsToInput(selectedCase.negotiatedTotalCents));
    setEntryBrl(centsToInput(selectedCase.entryAmountCents));
    setEntryDueDate(selectedCase.entryDueDate ?? "");
    setInstallmentCount(String(selectedCase.installmentCount));
    setInstallmentBrl(centsToInput(selectedCase.installmentAmountCents));
    setFirstDueDate(selectedCase.firstDueDate ?? "");
    setDueDay(selectedCase.dueDay === null ? "" : String(selectedCase.dueDay));
    setTermsError("");
  }, [selectedCase?.saleCaseId, selectedCase?.negotiatedTotalCents, selectedCase?.entryAmountCents, selectedCase?.entryDueDate, selectedCase?.installmentCount, selectedCase?.installmentAmountCents, selectedCase?.firstDueDate, selectedCase?.dueDay]);
  const installmentQuantity = Number(installmentCount || 0);
  const totalCents = centsFromBrl(totalBrl);
  const entryCents = centsFromBrl(entryBrl);
  const automaticInstallmentCents = useMemo(() => deriveEqualInstallmentCents(totalCents === undefined ? null : totalCents, entryCents === undefined ? null : entryCents, installmentQuantity), [entryCents, installmentQuantity, totalCents]);
  const installmentPreview = useMemo(() => {
    const cents = centsFromBrl(installmentBrl);
    return typeof cents === "number" && installmentQuantity > 0 ? cents * installmentQuantity : null;
  }, [installmentBrl, installmentQuantity]);
  const reconciliation = useMemo(() => {
    const total = centsFromBrl(totalBrl);
    const entry = centsFromBrl(entryBrl);
    if (typeof total !== "number" || entry === undefined || installmentPreview === null) return null;
    return total - (entry ?? 0) - installmentPreview;
  }, [entryBrl, installmentPreview, totalBrl]);
  const installmentCalendar = useMemo(() => buildMonthlyDueDates(firstDueDate, dueDay ? Number(dueDay) : null, installmentQuantity), [dueDay, firstDueDate, installmentQuantity]);
  useEffect(() => {
    if (selectedCase?.state !== "preparation" || automaticInstallmentCents === null) return;
    setInstallmentBrl(centsToInput(automaticInstallmentCents));
  }, [automaticInstallmentCents, selectedCase?.state]);
  useEffect(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(firstDueDate)) return;
    setDueDay(String(Number(firstDueDate.slice(-2))));
  }, [firstDueDate]);
  const availableJointProponents = props.buyers.filter((buyer) => !selectedCaseParties.some((party) => party.buyerClientId === buyer.id));
  const isFiscalReferenceValid = /^\D*(?:\d\D*){11}$|^\D*(?:\d\D*){14}$/.test(props.fiscalReference);

  const submitTerms = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const total = centsFromBrl(totalBrl);
    const entryInput = centsFromBrl(entryBrl);
    const installment = centsFromBrl(installmentBrl);
    const parsedDueDay = dueDay ? Number(dueDay) : null;
    if (total === undefined || entryInput === undefined || installment === undefined || !Number.isInteger(installmentQuantity) || installmentQuantity < 0 || installmentQuantity > 480) {
      setTermsError("Revise os valores em reais e a quantidade de parcelas.");
      return;
    }
    const entry = entryInput ?? 0;
    if ((entry === 0 && entryDueDate) || (entry > 0 && !entryDueDate)) {
      setTermsError("Para entrada informada, defina a data de vencimento; sem entrada, deixe a data vazia.");
      return;
    }
    if ((installmentQuantity === 0 && (installment !== null || firstDueDate || parsedDueDay !== null)) || (installmentQuantity > 0 && (installment === null || !firstDueDate || !parsedDueDay || parsedDueDay < 1 || parsedDueDay > 31))) {
      setTermsError("Para parcelamento, informe valor, primeira data e dia de vencimento. Sem parcelas, deixe esses campos vazios.");
      return;
    }
    if (installmentQuantity > 0 && firstDueDate && new Date(`${firstDueDate}T12:00:00`).getDate() !== parsedDueDay) {
      setTermsError("O dia de vencimento deve corresponder à primeira data para manter o calendário mensal consistente.");
      return;
    }
    if (total === null || total <= 0 || installment === null || entry + installmentQuantity * installment !== total) {
      setTermsError("A entrada e todas as parcelas precisam compor exatamente o valor negociado.");
      return;
    }
    setTermsError("");
    props.onSaveTerms({ negotiatedTotalCents: total, entryAmountCents: entry, entryDueDate: entryDueDate || null, installmentCount: installmentQuantity, installmentAmountCents: installment, firstDueDate: firstDueDate || null, dueDay: parsedDueDay });
  };

  return (
    <section id="subdivision-sale-case" className="subdivision-foundation-workspace subdivision-sale-case-workspace" aria-labelledby="subdivision-sale-case-title">
      <div className="subdivision-foundation-heading">
        <div><p className="subdivision-foundation-eyebrow">08 · JORNADA DE VENDA</p><h2 id="subdivision-sale-case-title">Monte a negociação sobre o lote e o cliente já autorizados.</h2></div>
        <p>O caso conecta dados existentes para revisão humana. Abrir ou editar esta preparação não reserva, vende, contrata, emite boleto, cobra ou confirma pagamento.</p>
      </div>

      <div className="subdivision-sale-case-workspace__steps" aria-label="Etapas da preparação de venda">
        <span><b>01</b> Lote</span><span><b>02</b> Cliente</span><span><b>03</b> Negociação</span><span><b>04</b> Revisão</span>
      </div>

      <div className="subdivision-sale-case-workspace__grid">
        <form className="subdivision-foundation-card subdivision-sale-case-workspace__selector" onSubmit={(event) => { event.preventDefault(); props.onOpenCase(); }}>
          <div className="subdivision-foundation-card__title"><Landmark size={19} /><h3>Selecionar lote e proponente principal</h3></div>
          <p>O loteamento mantém a fonte física. A Central de Vendas apenas reúne a seleção autorizada para preparar o próximo trabalho.</p>
          <label htmlFor="sale-case-development">Loteamento<select id="sale-case-development" value={props.selectedDevelopmentId} onChange={(event) => props.onDevelopmentChange(event.target.value)} disabled={!props.isWorkspaceReady} required><option value="">Selecione um loteamento autorizado</option>{props.developments.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
          <label htmlFor="sale-case-block">Quadra<select id="sale-case-block" value={props.selectedBlockId} onChange={(event) => props.onBlockChange(event.target.value)} disabled={!props.isWorkspaceReady || !props.selectedDevelopmentId} required><option value="">Selecione uma quadra autorizada</option>{props.blocks.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
          <label htmlFor="sale-case-lot">Lote<select id="sale-case-lot" value={props.selectedLotId} onChange={(event) => props.onLotChange(event.target.value)} disabled={!props.isWorkspaceReady || !props.selectedBlockId} required><option value="">Selecione um lote autorizado</option>{props.lots.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
          <div className="subdivision-sale-case-workspace__client-lookup"><label htmlFor="sale-case-fiscal-reference">CPF/CNPJ declarado<small>Consulte um cadastro já autorizado; o valor não entra no histórico desta tela.</small><input id="sale-case-fiscal-reference" inputMode="numeric" autoComplete="off" value={props.fiscalReference} onChange={(event) => props.onFiscalReferenceChange(event.target.value)} placeholder="Digite CPF ou CNPJ" disabled={!props.isWorkspaceReady} /></label><button type="button" onClick={props.onLookupBuyer} disabled={!props.isWorkspaceReady || !isFiscalReferenceValid || props.lookupState === "loading"}><Search size={15} />{props.lookupState === "loading" ? "Consultando" : "Localizar cadastro"}</button></div>
          {props.lookupState === "found" && <p className="subdivision-sale-case-workspace__success"><ShieldCheck size={15} />Cadastro localizado e selecionado no contexto autorizado.</p>}
          {props.lookupState === "not_found" && <p className="subdivision-sale-case-workspace__notice"><CircleAlert size={15} />Nenhum cadastro ativo foi localizado. Cadastre o cliente antes de abrir o caso.</p>}
          {props.lookupState === "error" && <p className="subdivision-sale-case-workspace__notice"><CircleAlert size={15} />A consulta não foi liberada. Revise o contexto sem tentar inferir dados.</p>}
          <label htmlFor="sale-case-buyer">Cliente selecionado<select id="sale-case-buyer" value={props.selectedBuyerClientId} onChange={(event) => props.onBuyerChange(event.target.value)} disabled={!props.isWorkspaceReady} required><option value="">Selecione ou localize um cliente</option>{props.buyers.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
          <a className="subdivision-sale-case-workspace__new-client" href="/loteadora/clientes"><UserPlus size={16} />Cadastrar novo Cliente Loteadora</a>
          <button type="submit" disabled={!props.isWorkspaceReady || !props.selectedLotId || !props.selectedBuyerClientId || props.openingCase}>{props.openingCase ? "Abrindo preparação" : "Abrir caso em preparação"}</button>
        </form>

        <aside className="subdivision-sale-case-workspace__price" aria-live="polite">
          <div><Calculator size={19} /><span>REFERÊNCIA DO LOTE</span></div>
          {!props.selectedLotId ? <p>Selecione loteamento, quadra e lote para carregar a referência física e econômica já autorizada.</p> : props.priceContext?.state === "active" ? <><dl><div><dt>Área física</dt><dd>{props.priceContext.lotAreaSqm?.toLocaleString("pt-BR")} m²</dd></div><div><dt>Valor por m²</dt><dd>{formatBrl(props.priceContext.effectivePricePerSqmBrl)}</dd></div><div><dt>Total referencial</dt><dd>{formatBrl(props.priceContext.effectiveLotTotalBrl)}</dd></div></dl><p>Base de consulta: {props.priceContext.conditionReference ?? props.priceContext.policyReference ?? "referência vigente"}. O valor negociado é informado separadamente e continua em preparação.</p></> : <p>{props.priceContext?.availabilityReason ? "A referência econômica do lote ainda não está disponível para consulta neste contexto." : "Carregando referência autorizada do lote."}</p>}
        </aside>
      </div>

      <section className="subdivision-foundation-card subdivision-sale-case-workspace__joint-parties" aria-labelledby="sale-case-joint-parties-title">
        <div className="subdivision-foundation-card__title"><UserPlus size={19} /><h3 id="sale-case-joint-parties-title">Proponentes da venda conjunta</h3></div>
        {!selectedCase ? <p>Abra uma preparação para vincular outros proponentes ao mesmo lote. O vínculo não duplica clientes nem cria venda, contrato, cobrança ou pagamento.</p> : <>
          <p><b>{selectedCaseParties.length}</b> proponente(s) vinculados a esta preparação. A aprovação exigirá a revisão humana do dossiê depois da composição final.</p>
          <ul className="subdivision-sale-case-workspace__party-list">
            {selectedCaseParties.map((party) => {
              const label = props.buyers.find((buyer) => buyer.id === party.buyerClientId)?.label ?? "Cadastro autorizado";
              return <li key={`${party.saleCaseId}-${party.buyerClientId}`}><span>{party.partyRole === "primary_proponent" ? "Proponente principal" : "Proponente conjunto"} · {label}</span>{party.partyRole === "joint_proponent" && <button type="button" onClick={() => props.onRemoveJointProponent(party.buyerClientId)} disabled={props.removingJointProponent || selectedCase.state !== "preparation"}>Remover</button>}</li>;
            })}
          </ul>
          {selectedCase.state === "preparation" && <div className="subdivision-sale-case-workspace__party-actions"><label htmlFor="sale-case-joint-proponent">Adicionar proponente conjunto<select id="sale-case-joint-proponent" value={jointBuyerClientId} onChange={(event) => setJointBuyerClientId(event.target.value)} disabled={props.addingJointProponent}><option value="">Selecione um cliente autorizado</option>{availableJointProponents.map((buyer) => <option key={buyer.id} value={buyer.id}>{buyer.label}</option>)}</select></label><button type="button" onClick={() => { if (jointBuyerClientId) { props.onAddJointProponent(jointBuyerClientId); setJointBuyerClientId(""); } }} disabled={!jointBuyerClientId || props.addingJointProponent}>{props.addingJointProponent ? "Vinculando" : "Adicionar proponente"}</button></div>}
        </>}
      </section>

      <section className="subdivision-sale-case-workspace__terms" aria-labelledby="sale-case-terms-title">
        <div className="subdivision-foundation-heading"><div><p className="subdivision-foundation-eyebrow">TERMOS FLEXÍVEIS</p><h3 id="sale-case-terms-title">Defina a negociação sem gerar cobrança.</h3></div><p>Valores ficam em centavos no servidor e são revisáveis enquanto o caso estiver em preparação. A prévia não cria recebíveis, boletos ou calendário financeiro.</p></div>
        {!props.selectedSaleCaseId ? <div className="subdivision-foundation-empty"><WalletCards size={18} /><p>Abra um caso em preparação para registrar os termos negociados.</p></div> : <div className="subdivision-sale-case-workspace__formalization">
          <form className="subdivision-foundation-card" onSubmit={submitTerms}>
            <label htmlFor="sale-case-existing">Preparação de venda
              <select id="sale-case-existing" value={props.selectedSaleCaseId} onChange={(event) => props.onSaleCaseChange(event.target.value)} disabled={props.savingTerms}>
                {props.saleCases.map((saleCase, index) => <option key={saleCase.saleCaseId} value={saleCase.saleCaseId}>Preparação {index + 1} · {saleCase.state === "preparation" ? "em preparação" : saleCase.state === "terms_review" ? "em revisão" : "aprovada"}</option>)}
              </select>
            </label>
            <p className="subdivision-sale-case-workspace__case-state">Caso selecionado: <b>{selectedCase?.state === "preparation" ? "Em preparação" : selectedCase?.state === "terms_review" ? "Em revisão" : "Aprovado"}</b>{selectedCase?.termsVersion ? ` · termos versão ${selectedCase.termsVersion}` : " · sem termos registrados"}</p>
            <div className="subdivision-sale-case-workspace__terms-grid">
              <label htmlFor="sale-case-total">Valor negociado (R$)<input id="sale-case-total" inputMode="decimal" value={totalBrl} onChange={(event) => setTotalBrl(event.target.value)} placeholder="Ex.: 120.000,00" disabled={props.savingTerms || selectedCase?.state !== "preparation"} /></label>
              <label htmlFor="sale-case-entry">Entrada (R$)<input id="sale-case-entry" inputMode="decimal" value={entryBrl} onChange={(event) => setEntryBrl(event.target.value)} placeholder="Opcional" disabled={props.savingTerms || selectedCase?.state !== "preparation"} /></label>
              <label htmlFor="sale-case-entry-due">Vencimento da entrada<input id="sale-case-entry-due" type="date" value={entryDueDate} onChange={(event) => setEntryDueDate(event.target.value)} disabled={props.savingTerms || !entryBrl.trim() || selectedCase?.state !== "preparation"} /></label>
              <label htmlFor="sale-case-installments">Número de parcelas<input id="sale-case-installments" type="number" min="0" max="480" step="1" value={installmentCount} onChange={(event) => setInstallmentCount(event.target.value)} disabled={props.savingTerms || selectedCase?.state !== "preparation"} required /></label>
              <label htmlFor="sale-case-installment-value">Valor da parcela (R$)<input id="sale-case-installment-value" inputMode="decimal" value={installmentBrl} onChange={(event) => setInstallmentBrl(event.target.value)} placeholder={installmentQuantity > 0 ? "Calculado automaticamente" : "Sem parcelas"} disabled={props.savingTerms || installmentQuantity === 0 || selectedCase?.state !== "preparation"} /><small>{automaticInstallmentCents === null && installmentQuantity > 0 ? "O saldo não divide em parcelas iguais: ajuste entrada, total ou quantidade." : automaticInstallmentCents !== null ? "Calculado automaticamente a partir do saldo e da quantidade." : ""}</small></label>
              <label htmlFor="sale-case-first-due">Primeiro vencimento<input id="sale-case-first-due" type="date" value={firstDueDate} onChange={(event) => setFirstDueDate(event.target.value)} disabled={props.savingTerms || installmentQuantity === 0 || selectedCase?.state !== "preparation"} /></label>
              <label htmlFor="sale-case-due-day">Dia de vencimento<input id="sale-case-due-day" type="number" min="1" max="31" step="1" value={dueDay} onChange={(event) => setDueDay(event.target.value)} placeholder="Ex.: 20" disabled={props.savingTerms || installmentQuantity === 0 || selectedCase?.state !== "preparation"} /></label>
            </div>
            {termsError && <p className="subdivision-sale-case-workspace__notice" role="alert"><CircleAlert size={15} />{termsError}</p>}
            <div className="subdivision-sale-case-workspace__installment-preview"><span>Composição da negociação</span><b>{installmentPreview === null ? "Informe parcelas para calcular" : formatBrl(installmentPreview / 100)}</b><small>Entrada + parcelas: {reconciliation === null ? "preencha os valores" : reconciliation === 0 ? "total conciliado" : `${formatBrl(Math.abs(reconciliation) / 100)} ${reconciliation > 0 ? "a recompor" : "acima do total"}`}. O calendário usa a primeira data e o mesmo dia de vencimento, ajustando meses menores ao último dia.</small>{installmentCalendar.length > 0 && <p><b>Calendário previsto:</b> {installmentCalendar.length} parcela(s), de {installmentCalendar[0]} até {installmentCalendar.at(-1)}. Próximas datas: {installmentCalendar.slice(0, 3).join(" · ")}. Esta prévia não cria parcela, lote interno ou alerta.</p>}</div>
            <button type="submit" disabled={props.savingTerms || selectedCase?.state !== "preparation"}>{props.savingTerms ? "Salvando termos" : "Salvar termos em preparação"}</button>
          </form>
          <aside className="subdivision-foundation-card subdivision-sale-case-workspace__review">
            <div className="subdivision-foundation-card__title"><ShieldCheck size={19} /><h3>Formalização interna</h3></div>
              {selectedContract ? <>
                <p><b>Agenda interna pronta:</b> {selectedContract.scheduledItemCount} item(ns), no estado “aguardando emissão bancária”.</p>
                {selectedAttention && <p className="subdivision-sale-case-workspace__attention"><b>{selectedAttention.dueWithinFourDaysCount}</b> item(ns) vencem em até quatro dias e <b>{selectedAttention.pastDueUnreconciledCount}</b> estão anteriores à data atual sem conciliação bancária. Revise a agenda: isso não é confirmação de atraso ou pagamento.</p>}
                {selectedBatch ? <p className="subdivision-sale-case-workspace__batch"><b>Lote interno liberado:</b> {selectedBatch.itemCount} parcela(s) disponível(is) para controle do operador. Não há emissão bancária, mensagem, baixa ou pagamento.</p> : selectedCase?.state === "approved" ? <button type="button" onClick={props.onReleaseInternalBatch} disabled={props.releasingInternalBatch}>{props.releasingInternalBatch ? "Liberando lote interno" : "Liberar lote interno de parcelas"}</button> : null}
                {selectedContract.state === "internal_review" ? <button type="button" onClick={props.onApproveCase} disabled={props.approvingCase || selectedCase?.state !== "terms_review"}>{props.approvingCase ? "Confirmando aprovação" : "Confirmar venda e marcar lote vendido"}</button> : <button type="button" onClick={props.onRequestReversal} disabled={props.requestingReversal || selectedCase?.state !== "approved"}>{props.requestingReversal ? "Solicitando revisão" : "Solicitar revisão de reversão"}</button>}
              <form className="subdivision-sale-case-workspace__alert-config" onSubmit={(event) => { event.preventDefault(); props.onConfigureAlerts(Number(alertLeadDays)); }}>
                <label htmlFor="sale-case-alert-lead">Avisar com antecedência de dias<input id="sale-case-alert-lead" type="number" min="1" max="14" step="1" value={alertLeadDays} onChange={(event) => setAlertLeadDays(event.target.value)} disabled={props.configuringAlerts} required /></label>
                <button type="submit" disabled={props.configuringAlerts}>{props.configuringAlerts ? "Preparando lembretes" : "Preparar lembretes internos"}</button>
                <small>{props.alertScheduleState === "active" ? "Lembrete diário interno ativo: ele apenas sinaliza o operador para cobrar manualmente." : props.alertScheduleState === "paused" ? "Lembrete diário interno pausado; nenhum evento novo será criado até a retomada." : "Após preparar os lembretes, ative a rotina diária interna para sinalizar o operador."}</small>
              </form>
              <div className="subdivision-sale-case-workspace__alert-actions" aria-label="Controle do lembrete diário interno">
                {props.alertScheduleState === "unbound" ? <button type="button" onClick={() => props.onManageAlertSchedule("activate")} disabled={props.managingAlertSchedule}>{props.managingAlertSchedule ? "Ativando lembrete" : "Ativar lembrete diário interno"}</button> : <>{props.alertScheduleState === "active" ? <button type="button" onClick={() => props.onManageAlertSchedule("pause")} disabled={props.managingAlertSchedule}>Pausar lembrete interno</button> : <button type="button" onClick={() => props.onManageAlertSchedule("resume")} disabled={props.managingAlertSchedule}>Retomar lembrete interno</button>}<button type="button" onClick={() => props.onManageAlertSchedule("remove")} disabled={props.managingAlertSchedule}>Remover lembrete interno</button></>}
              </div>
              <p>Não há boleto, código de barras, remessa, pagamento, baixa ou comunicação externa.</p>
            </> : <>
              <p>Depois de salvar termos coerentes, gere a agenda interna para revisão. Isso não aprova contrato e não altera o estoque do lote.</p>
              <button type="button" onClick={props.onFormalizeCase} disabled={props.formalizingCase || selectedCase?.state !== "preparation" || !selectedCase?.termsVersion}>{props.formalizingCase ? "Gerando agenda interna" : "Formalizar para revisão interna"}</button>
            </>}
          </aside>
        </div>}
      </section>
    </section>
  );
}
