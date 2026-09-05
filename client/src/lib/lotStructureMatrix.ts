export type StructuralLot = {
  lotId: string;
  blockId: string;
  lotNumber: number;
};

export type StructuralInventoryState = {
  lotId: string;
  inventoryPhase: string;
};

export type StructuralLotPhase =
  | "reference_confirmed"
  | "structure_review"
  | "review_required";

export type StructuralLotCell = StructuralLot & {
  phase: StructuralLotPhase;
  phaseLabel: string;
};

const phaseLabels: Record<StructuralLotPhase, string> = {
  reference_confirmed: "Referência confirmada",
  structure_review: "Revisão de estrutura",
  review_required: "Revisão necessária",
};

function isStructuralLotPhase(value: string | undefined): value is StructuralLotPhase {
  return value === "reference_confirmed" || value === "structure_review" || value === "review_required";
}

export function buildLotStructureMatrix(
  lots: readonly StructuralLot[],
  inventoryStates: readonly StructuralInventoryState[],
): StructuralLotCell[] {
  const phaseByLotId = new Map(inventoryStates.map((state) => [state.lotId, state.inventoryPhase]));

  return [...lots]
    .sort((left, right) => left.lotNumber - right.lotNumber || left.lotId.localeCompare(right.lotId))
    .map((lot) => {
      const candidatePhase = phaseByLotId.get(lot.lotId);
      const phase = isStructuralLotPhase(candidatePhase) ? candidatePhase : "review_required";

      return {
        ...lot,
        phase,
        phaseLabel: phaseLabels[phase],
      };
    });
}
