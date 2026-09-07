import { Calculator, CircleAlert, Landmark, Search, ShieldCheck, UserPlus, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Option = { id: string; label: string };
type PriceContext = { state: string; availabilityReason: string | null; policyReference: string | null; conditionReference: string | null; effectivePricePerSqmBrl: number | null; lotAreaSqm: number | null; effectiveLotTotalBrl: number | null } | null | undefined;
type SaleCase = { saleCaseId: string; state: string; termsVersion: number | null; negotiatedTotalCents: number | null; entryAmountCents: number | null; entryDueDate: string | null; entryInstallmentCount: number; entryInstallmentAmountCents: number | null; entryFirstDueDate: string | null; entryDueDay: number | null; installmentCount: number; installmentAmountCents: number | null; firstDueDate: string | null; dueDay: number | null; settlementMode: "cash" | "structured"; cashSettlementAmountCents: number | null; cashSettlementDueDate: string | null; supplementalAmountCents: number | null; supplementalDueDate: string | null; tradeInCreditCents: number | null; tradeInDueDate: string | null; tradeInCategory: string | null; tradeInDescription: string | null };
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
  onSaveTerms: (input: { negotiatedTotalCents: number | null; entryAmountCents: number | null; entryDueDate: string | null; entryInstallmentCount: number; entryInstallmentAmountCents: number | null; entryFirstDueDate: string | null; entryDueDay: number | null; installmentCount: number; installmentAmountCents: number | null; firstDueDate: string | null; dueDay: number | null; settlementMode: "cash" | "structured"; cashSettlementAmountCents: number | null; cashSettlementDueDate: string | null; supplementalAmountCents: number | null; supplementalDueDate: string | null; tradeInCreditCents: number | null; tradeInDueDate: string | null; tradeInCategory: string | null; tradeInDescription: string | null }) => void;
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

export function deriveEqualInstallmentFromResidualCents(totalCents: number | null, nonRegularCents: number | null, installmentCount: number): number | null {
  if (typeof totalCents !== "number" || typeof nonRegularCents !== "number" || !Number.isInteger(installmentCount) || installmentCount <= 0) return null;
  const remainingCents = totalCents - nonRegularCents;
  if (nonRegularCents < 0 || remainingCents < 0 || remainingCents % installmentCount !== 0) return null;
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
  const [entryInstallmentCount, setEntryInstallmentCount] = useState("0");
  const [entryInstallmentBrl, setEntryInstallmentBrl] = useState("");
  const [entryFirstDueDate, setEntryFirstDueDate] = useState("");
  const [entryDueDay, setEntryDueDay] = useState("");
  const [installmentCount, setInstallmentCount] = useState("0");
  const [installmentBrl, setInstallmentBrl] = useState("");
  const [firstDueDate, setFirstDueDate] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [settlementMode, setSettlementMode] = useState<"cash" | "structured">("structured");
  const [cashSettlementBrl, setCashSettlementBrl] = useState("");
  const [cashSettlementDueDate, setCashSettlementDueDate] = useState("");
  const [supplementalBrl, setSupplementalBrl] = useState("");
  const [supplementalDueDate, setSupplementalDueDate] = useState("");
  const [tradeInBrl, setTradeInBrl] = useState("");
  const [tradeInDueDate, setTradeInDueDate] = useState("");
  const [tradeInCategory, setTradeInCategory] = useState("");
  const [tradeInDescription, setTradeInDescription] = useState("");
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
    setEntryInstallmentCount(String(selectedCase.entryInstallmentCount));
    setEntryInstallmentBrl(centsToInput(selectedCase.entryInstallmentAmountCents));
    setEntryFirstDueDate(selectedCase.entryFirstDueDate ?? "");
    setEntryDueDay(selectedCase.entryDueDay === null ? "" : String(selectedCase.entryDueDay));
    setInstallmentCount(String(selectedCase.installmentCount));
    setInstallmentBrl(centsToInput(selectedCase.installmentAmountCents));
    setFirstDueDate(selectedCase.firstDueDate ?? "");
    setDueDay(selectedCase.dueDay === null ? "" : String(selectedCase.dueDay));
    setSettlementMode(selectedCase.settlementMode);
    setCashSettlementBrl(centsToInput(selectedCase.cashSettlementAmountCents));
    setCashSettlementDueDate(selectedCase.cashSettlementDueDate ?? "");
    setSupplementalBrl(centsToInput(selectedCase.supplementalAmountCents));
    setSupplementalDueDate(selectedCase.supplementalDueDate ?? "");
    setTradeInBrl(centsToInput(selectedCase.tradeInCreditCents));
    setTradeInDueDate(selectedCase.tradeInDueDate ?? "");
    setTradeInCategory(selectedCase.tradeInCategory ?? "");
    setTradeInDescription(selectedCase.tradeInDescription ?? "");
    setTermsError("");
  }, [selectedCase?.saleCaseId, selectedCase?.negotiatedTotalCents, selectedCase?.entryAmountCents, selectedCase?.entryDueDate, selectedCase?.entryInstallmentCount, selectedCase?.entryInstallmentAmountCents, selectedCase?.entryFirstDueDate, selectedCase?.entryDueDay, selectedCase?.installmentCount, selectedCase?.installmentAmountCents, selectedCase?.firstDueDate, selectedCase?.dueDay, selectedCase?.settlementMode, selectedCase?.cashSettlementAmountCents, selectedCase?.cashSettlementDueDate, selectedCase?.supplementalAmountCents, selectedCase?.supplementalDueDate, selectedCase?.tradeInCreditCents, selectedCase?.tradeInDueDate, selectedCase?.tradeInCategory, selectedCase?.tradeInDescription]);
  const installmentQuantity = Number(installmentCount || 0);
  const entryInstallmentQuantity = Number(entryInstallmentCount || 0);
  const totalCents = centsFromBrl(totalBrl);
  const entryCents = centsFromBrl(entryBrl);
  const entryInstallmentCents = centsFromBrl(entryInstallmentBrl);
  const cashSettlementCents = centsFromBrl(cashSettlementBrl);
  const supplementalCents = centsFromBrl(supplementalBrl);
  const tradeInCents = centsFromBrl(tradeInBrl);
  const nonRegularCents = useMemo(() => {
    const values = [entryCents, entryInstallmentCents, cashSettlementCents, supplementalCents, tradeInCents];
    if (values.some((value) => value === undefined)) return null;
    return (entryCents ?? 0) + entryInstallmentQuantity * (entryInstallmentCents ?? 0) + (cashSettlementCents ?? 0) + (supplementalCents ?? 0) + (tradeInCents ?? 0);
  }, [cashSettlementCents, entryCents, entryInstallmentCents, entryInstallmentQuantity, supplementalCents, tradeInCents]);
  const automaticInstallmentCents = useMemo(() => settlementMode === "structured" ? deriveEqualInstallmentFromResidualCents(totalCents === undefined ? null : totalCents, nonRegularCents, installmentQuantity) : null, [installmentQuantity, nonRegularCents, settlementMode, totalCents]);
  const installmentPreview = useMemo(() => {
    const cents = centsFromBrl(installmentBrl);
    return typeof cents === "number" && installmentQuantity > 0 ? cents * installmentQuantity : null;
  }, [installmentBrl, installmentQuantity]);
  const reconciliation = useMemo(() => {
    const total = centsFromBrl(totalBrl);
    if (typeof total !== "number" || nonRegularCents === null || installmentPreview === null) return null;
    return total - nonRegularCents - installmentPreview;
  }, [installmentPreview, nonRegularCents, totalBrl]);
  const installmentCalendar = useMemo(() => buildMonthlyDueDates(firstDueDate, dueDay ? Number(dueDay) : null, installmentQuantity), [dueDay, firstDueDate, installmentQuantity]);
  useEffect(() => {
    if (selectedCase?.state !== "preparation" || automaticInstallmentCents === null) return;
    setInstallmentBrl(centsToInput(automaticInstallmentCents));
  }, [automaticInstallmentCents, selectedCase?.state]);
  useEffect(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(firstDueDate)) return;
    setDueDay(String(Number(firstDueDate.slice(-2))));
  }, [firstDueDate]);
  useEffect(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entryFirstDueDate)) return;
    setEntryDueDay(String(Number(entryFirstDueDate.slice(-2))));
  }, [entryFirstDueDate]);
  const availableJointProponents = props.buyers.filter((buyer) => !selectedCaseParties.some((party) => party.buyerClientId === buyer.id));
  const isFiscalReferenceValid = /^\D*(?:\d\D*){11}$|^\D*(?:\d\D*){14}$/.test(props.fiscalReference);

  const submitTerms = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const total = centsFromBrl(totalBrl);
    const entryInput = centsFromBrl(entryBrl);
    const entryInstallmentInput = centsFromBrl(entryInstallmentBrl);
    const installment = centsFromBrl(installmentBrl);
    const cashSettlement = centsFromBrl(cashSettlementBrl);
    const supplemental = centsFromBrl(supplementalBrl);
    const tradeIn = centsFromBrl(tradeInBrl);
    const parsedDueDay = dueDay ? Number(dueDay) : null;
    const parsedEntryDueDay = entryDueDay ? Number(entryDueDay) : null;
    if (total === undefined || entryInput === undefined || entryInstallmentInput === undefined || installment === undefined || cashSettlement === undefined || supplemental === undefined || tradeIn === undefined || !Number.isInteger(installmentQuantity) || !Number.isInteger(entryInstallmentQuantity) || installmentQuantity < 0 || entryInstallmentQuantity < 0 || installmentQuantity + entryInstallmentQuantity > 480) {
      setTermsError("Revise os valores em reais e a quantidade de parcelas.");
      return;
    }
    const entry = entryInput ?? 0;
    const entryInstallment = entryInstallmentInput ?? 0;
    const cash = cashSettlement ?? 0;
    const complement = supplemental ?? 0;
    const trade = tradeIn ?? 0;
    if ((entry === 0 && entryDueDate) || (entry > 0 && !entryDueDate)) {
      setTermsError("Para entrada informada, defina a data de vencimento; sem entrada, deixe a data vazia.");
      return;
    }
    if ((entryInstallmentQuantity === 0 && (entryInstallmentInput !== null || entryFirstDueDate || parsedEntryDueDay !== null)) || (entryInstallmentQuantity > 0 && (entryInstallmentInput === null || !entryFirstDueDate || !parsedEntryDueDay || parsedEntryDueDay < 1 || parsedEntryDueDay > 31 || new Date(`${entryFirstDueDate}T12:00:00`).getDate() !== parsedEntryDueDay))) {
      setTermsError("Para entrada parcelada, informe valor, primeira data e dia de vencimento. Ela pode ocorrer junto das parcelas regulares.");
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
    if ((cash === 0 && cashSettlementDueDate) || (cash > 0 && !cashSettlementDueDate) || (complement === 0 && supplementalDueDate) || (complement > 0 && !supplementalDueDate) || (trade === 0 && (tradeInDueDate || tradeInCategory || tradeInDescription)) || (trade > 0 && (!tradeInDueDate || !/^[a-z][a-z0-9_]{2,47}$/.test(tradeInCategory) || tradeInDescription.trim().length < 3))) {
      setTermsError("Cada componente declarado precisa de data; o bem entregue também precisa de categoria e descrição interna.");
      return;
    }
    if ((settlementMode === "cash" && (cash === 0 || entry > 0 || entryInstallmentQuantity > 0 || installmentQuantity > 0)) || (settlementMode === "structured" && (cash > 0 || (entry === 0 && entryInstallmentQuantity === 0 && installmentQuantity === 0)))) {
      setTermsError("Venda à vista usa somente o pagamento à vista; negociação estruturada usa entrada e/ou parcelas, sem pagamento à vista no mesmo modo.");
      return;
    }
    const regular = installment ?? 0;
    if (total === null || total <= 0 || entry + entryInstallmentQuantity * entryInstallment + installmentQuantity * regular + cash + complement + trade !== total) {
      setTermsError("Todos os componentes precisam compor exatamente o valor negociado, sem saldo residual.");
      return;
    }
    setTermsError("");
    props.onSaveTerms({ negotiatedTotalCents: total, entryAmountCents: entry || null, entryDueDate: entryDueDate || null, entryInstallmentCount: entryInstallmentQuantity, entryInstallmentAmountCents: entryInstallmentQuantity > 0 ? entryInstallment : null, entryFirstDueDate: entryFirstDueDate || null, entryDueDay: parsedEntryDueDay, installmentCount: installmentQuantity, installmentAmountCents: installmentQuantity > 0 ? regular : null, firstDueDate: firstDueDate || null, dueDay: parsedDueDay, settlementMode, cashSettlementAmountCents: cash || null, cashSettlementDueDate: cashSettlementDueDate || null, supplementalAmountCents: complement || null, supplementalDueDate: supplementalDueDate || null, tradeInCreditCents: trade || null, tradeInDueDate: tradeInDueDate || null, tradeInCategory: tradeInCategory || null, tradeInDescription: tradeInDescription.trim() || null });
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
              <label htmlFor="sale-case-settlement-mode">Modalidade principal<select id="sale-case-settlement-mode" value={settlementMode} onChange={(event) => { const mode = event.target.value as "cash" | "structured"; setSettlementMode(mode); if (mode === "cash") { setEntryBrl(""); setEntryDueDate(""); setEntryInstallmentCount("0"); setEntryInstallmentBrl(""); setEntryFirstDueDate(""); setEntryDueDay(""); setInstallmentCount("0"); setInstallmentBrl(""); setFirstDueDate(""); setDueDay(""); } else { setCashSettlementBrl(""); setCashSettlementDueDate(""); } }} disabled={props.savingTerms || selectedCase?.state !== "preparation"}><option value="structured">Entrada e/ou parcelas</option><option value="cash">Venda à vista</option></select><small>Escolha a estrutura acordada antes de compor os demais componentes.</small></label>
              {settlementMode === "cash" ? <><label htmlFor="sale-case-cash-settlement">Valor à vista (R$)<input id="sale-case-cash-settlement" inputMode="decimal" value={cashSettlementBrl} onChange={(event) => setCashSettlementBrl(event.target.value)} placeholder="Obrigatório" disabled={props.savingTerms || selectedCase?.state !== "preparation"} /></label><label htmlFor="sale-case-cash-due">Data do valor à vista<input id="sale-case-cash-due" type="date" value={cashSettlementDueDate} onChange={(event) => setCashSettlementDueDate(event.target.value)} disabled={props.savingTerms || !cashSettlementBrl.trim() || selectedCase?.state !== "preparation"} /></label></> : <><label htmlFor="sale-case-entry">Entrada à vista (R$)<input id="sale-case-entry" inputMode="decimal" value={entryBrl} onChange={(event) => setEntryBrl(event.target.value)} placeholder="Opcional" disabled={props.savingTerms || selectedCase?.state !== "preparation"} /></label><label htmlFor="sale-case-entry-due">Vencimento da entrada<input id="sale-case-entry-due" type="date" value={entryDueDate} onChange={(event) => setEntryDueDate(event.target.value)} disabled={props.savingTerms || !entryBrl.trim() || selectedCase?.state !== "preparation"} /></label><label htmlFor="sale-case-entry-installments">Parcelas de entrada<input id="sale-case-entry-installments" type="number" min="0" max="480" step="1" value={entryInstallmentCount} onChange={(event) => setEntryInstallmentCount(event.target.value)} disabled={props.savingTerms || selectedCase?.state !== "preparation"} /></label><label htmlFor="sale-case-entry-installment-value">Valor da entrada parcelada (R$)<input id="sale-case-entry-installment-value" inputMode="decimal" value={entryInstallmentBrl} onChange={(event) => setEntryInstallmentBrl(event.target.value)} placeholder={entryInstallmentQuantity > 0 ? "Valor de cada entrada" : "Sem entrada parcelada"} disabled={props.savingTerms || entryInstallmentQuantity === 0 || selectedCase?.state !== "preparation"} /></label><label htmlFor="sale-case-entry-first-due">Primeiro vencimento da entrada parcelada<input id="sale-case-entry-first-due" type="date" value={entryFirstDueDate} onChange={(event) => setEntryFirstDueDate(event.target.value)} disabled={props.savingTerms || entryInstallmentQuantity === 0 || selectedCase?.state !== "preparation"} /></label><label htmlFor="sale-case-entry-due-day">Dia da entrada parcelada<input id="sale-case-entry-due-day" type="number" min="1" max="31" step="1" value={entryDueDay} onChange={(event) => setEntryDueDay(event.target.value)} placeholder="Ex.: 10" disabled={props.savingTerms || entryInstallmentQuantity === 0 || selectedCase?.state !== "preparation"} /></label><label htmlFor="sale-case-installments">Parcelas regulares<input id="sale-case-installments" type="number" min="0" max="480" step="1" value={installmentCount} onChange={(event) => setInstallmentCount(event.target.value)} disabled={props.savingTerms || selectedCase?.state !== "preparation"} required /></label><label htmlFor="sale-case-installment-value">Valor da parcela regular (R$)<input id="sale-case-installment-value" inputMode="decimal" value={installmentBrl} onChange={(event) => setInstallmentBrl(event.target.value)} placeholder={installmentQuantity > 0 ? "Calculado a partir do saldo" : "Sem parcelas"} disabled={props.savingTerms || installmentQuantity === 0 || selectedCase?.state !== "preparation"} /><small>{automaticInstallmentCents === null && installmentQuantity > 0 ? "O saldo não divide em parcelas iguais: ajuste os componentes, o total ou a quantidade." : automaticInstallmentCents !== null ? "Cálculo sugerido pelo saldo remanescente." : ""}</small></label><label htmlFor="sale-case-first-due">Primeiro vencimento regular<input id="sale-case-first-due" type="date" value={firstDueDate} onChange={(event) => setFirstDueDate(event.target.value)} disabled={props.savingTerms || installmentQuantity === 0 || selectedCase?.state !== "preparation"} /></label><label htmlFor="sale-case-due-day">Dia de vencimento regular<input id="sale-case-due-day" type="number" min="1" max="31" step="1" value={dueDay} onChange={(event) => setDueDay(event.target.value)} placeholder="Ex.: 20" disabled={props.savingTerms || installmentQuantity === 0 || selectedCase?.state !== "preparation"} /></label></>}
              <label htmlFor="sale-case-supplemental">Complemento em dinheiro (R$)<input id="sale-case-supplemental" inputMode="decimal" value={supplementalBrl} onChange={(event) => setSupplementalBrl(event.target.value)} placeholder="Opcional" disabled={props.savingTerms || selectedCase?.state !== "preparation"} /></label><label htmlFor="sale-case-supplemental-due">Data do complemento<input id="sale-case-supplemental-due" type="date" value={supplementalDueDate} onChange={(event) => setSupplementalDueDate(event.target.value)} disabled={props.savingTerms || !supplementalBrl.trim() || selectedCase?.state !== "preparation"} /></label>
              <label htmlFor="sale-case-trade-credit">Crédito de bem entregue (R$)<input id="sale-case-trade-credit" inputMode="decimal" value={tradeInBrl} onChange={(event) => setTradeInBrl(event.target.value)} placeholder="Ex.: veículo declarado" disabled={props.savingTerms || selectedCase?.state !== "preparation"} /></label><label htmlFor="sale-case-trade-due">Data declarada do bem<input id="sale-case-trade-due" type="date" value={tradeInDueDate} onChange={(event) => setTradeInDueDate(event.target.value)} disabled={props.savingTerms || !tradeInBrl.trim() || selectedCase?.state !== "preparation"} /></label><label htmlFor="sale-case-trade-category">Categoria do bem entregue<input id="sale-case-trade-category" value={tradeInCategory} onChange={(event) => setTradeInCategory(event.target.value.toLowerCase().replace(/\s+/g, "_"))} placeholder="Ex.: veiculo" disabled={props.savingTerms || !tradeInBrl.trim() || selectedCase?.state !== "preparation"} /></label><label htmlFor="sale-case-trade-description">Descrição declarada do bem<input id="sale-case-trade-description" value={tradeInDescription} onChange={(event) => setTradeInDescription(event.target.value)} maxLength={240} placeholder="Identificação interna para revisão" disabled={props.savingTerms || !tradeInBrl.trim() || selectedCase?.state !== "preparation"} /></label>
            </div>
            {termsError && <p className="subdivision-sale-case-workspace__notice" role="alert"><CircleAlert size={15} />{termsError}</p>}
            <div className="subdivision-sale-case-workspace__installment-preview"><span>Composição da negociação</span><b>{reconciliation === 0 ? "Total conciliado" : reconciliation === null ? "Preencha os componentes" : `${formatBrl(Math.abs(reconciliation) / 100)} ${reconciliation > 0 ? "a recompor" : "acima do total"}`}</b><small>{settlementMode === "cash" ? "Venda à vista registrada para controle interno; complemento e bem entregue, se declarados, integram o mesmo total." : "Entrada, entrada parcelada e parcelas regulares podem coexistir. A sugestão de parcela regular usa somente o saldo restante."} O calendário mensal ajusta meses menores ao último dia.</small>{entryInstallmentQuantity > 0 && <p><b>Entrada parcelada:</b> {entryInstallmentQuantity} item(ns) mensais; {installmentQuantity > 0 ? "ela ocorrerá simultaneamente às parcelas regulares quando as datas coincidirem." : "sem parcelas regulares."}</p>}{installmentCalendar.length > 0 && <p><b>Calendário regular previsto:</b> {installmentCalendar.length} parcela(s), de {installmentCalendar[0]} até {installmentCalendar.at(-1)}. Próximas datas: {installmentCalendar.slice(0, 3).join(" · ")}. Esta prévia não cria item, lote interno ou alerta.</p>}<p>O bem entregue é apenas crédito e descrição declarados para revisão interna; não representa avaliação, transferência ou confirmação de recebimento.</p></div>
            <button type="submit" disabled={props.savingTerms || selectedCase?.state !== "preparation"}>{props.savingTerms ? "Salvando termos" : "Salvar termos em preparação"}</button>
          </form>
          <aside className="subdivision-foundation-card subdivision-sale-case-workspace__review">
            <div className="subdivision-foundation-card__title"><ShieldCheck size={19} /><h3>Formalização interna</h3></div>
              {selectedContract ? <>
                <p><b>Agenda interna pronta:</b> {selectedContract.scheduledItemCount} item(ns), no estado “aguardando emissão bancária”.</p>
                {selectedAttention && <p className="subdivision-sale-case-workspace__attention"><b>{selectedAttention.dueWithinFourDaysCount}</b> item(ns) vencem em até quatro dias e <b>{selectedAttention.pastDueUnreconciledCount}</b> estão anteriores à data atual sem conciliação bancária. Revise a agenda: isso não é confirmação de atraso ou pagamento.</p>}
                {selectedBatch ? <p className="subdivision-sale-case-workspace__batch"><b>Lote interno liberado:</b> {selectedBatch.itemCount} item(ns) da composição disponível(is) para controle do operador. Ele pode reunir entrada, parcelas, complemento, venda à vista e crédito declarado de bem, sem emissão bancária, mensagem, baixa ou pagamento.</p> : selectedCase?.state === "approved" ? <button type="button" onClick={props.onReleaseInternalBatch} disabled={props.releasingInternalBatch}>{props.releasingInternalBatch ? "Liberando lote interno" : "Liberar lote interno de controle"}</button> : null}
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
