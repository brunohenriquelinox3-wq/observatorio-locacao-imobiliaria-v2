type PriceConditionScope = "development" | "block" | "lot";

function ordinal(index: number) {
  return String(Math.max(1, index + 1)).padStart(2, "0");
}

export function formatSubdivisionDevelopmentLabel(index: number, displayName?: string | null, internalReference?: string | null) {
  const name = displayName?.trim();
  const reference = internalReference?.trim();
  if (name && reference && name !== reference) return `${name} · ${reference}`;
  if (name) return name;
  if (reference) return reference;
  return `Loteamento ${ordinal(index)}`;
}

export function formatPricePolicyLabel(index: number) {
  return `Política-base ${ordinal(index)}`;
}

export function formatPriceConditionLabel(index: number, scope: PriceConditionScope) {
  const scopeLabel: Record<PriceConditionScope, string> = {
    development: "Geral",
    block: "Quadra",
    lot: "Lote",
  };
  return `Ajuste ${ordinal(index)} · ${scopeLabel[scope]}`;
}

export function formatLotPriceAdjustmentLabel(blockNumber: number, lotNumber: number) {
  return `Ajuste · Q${blockNumber} L${lotNumber}`;
}
