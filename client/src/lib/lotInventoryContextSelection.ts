export type DraftDevelopmentSelectionCandidate = {
  internalReference: string;
  workingPhase: "preliminary_reference" | "structuring" | "review_required";
};

export type DraftBlockSelectionCandidate = {
  blockNumber: number;
};

export type DraftLotSelectionCandidate = {
  lotNumber: number;
};

const workingPhaseLabels: Record<DraftDevelopmentSelectionCandidate["workingPhase"], string> = {
  preliminary_reference: "Referência preliminar",
  structuring: "Em estruturação",
  review_required: "Revisão necessária",
};

export function draftDevelopmentSelectionLabel(candidate: DraftDevelopmentSelectionCandidate): string {
  return `${candidate.internalReference} · ${workingPhaseLabels[candidate.workingPhase]}`;
}

export function draftBlockSelectionLabel(candidate: DraftBlockSelectionCandidate): string {
  return `Quadra ${candidate.blockNumber}`;
}

export function draftLotSelectionLabel(candidate: DraftLotSelectionCandidate): string {
  return `Lote ${candidate.lotNumber}`;
}
