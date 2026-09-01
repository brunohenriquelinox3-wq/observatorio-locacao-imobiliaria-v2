export type AssetContextSelectionCandidate = {
  referenceLabel: string;
  internalReference: string;
  kind: string;
  moduleState: "draft" | "preparing" | "eligible" | "blocked" | "withdrawn";
};

const kindLabels: Record<string, string> = {
  apartment: "Apartamento",
  house: "Casa",
  kitnet: "Kitnet",
  commercial_unit: "Unidade comercial",
  urban_lot: "Lote urbano",
  building: "Edificação",
  other_urban_asset: "Outro ativo urbano",
};

const stateLabels: Record<AssetContextSelectionCandidate["moduleState"], string> = {
  draft: "Rascunho",
  preparing: "Em preparação",
  eligible: "Elegível",
  blocked: "Bloqueado",
  withdrawn: "Retirado",
};

export function assetContextSelectionLabel(candidate: AssetContextSelectionCandidate): string {
  const kindLabel = kindLabels[candidate.kind] ?? "Ativo urbano";
  return `${candidate.referenceLabel} · ${candidate.internalReference} · ${kindLabel} · ${stateLabels[candidate.moduleState]}`;
}
