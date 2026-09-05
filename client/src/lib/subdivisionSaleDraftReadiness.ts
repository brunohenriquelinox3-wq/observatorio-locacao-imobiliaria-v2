export type SaleDraftReadinessDraft = {
  saleDraftId: string;
};

export type SaleDraftReadinessCoverage = {
  saleDraftId: string;
  attachmentCoverageState: "no_attachment_intent" | "attachment_awaiting_private_upload" | "attachment_private_upload_recorded";
};

export type SaleDraftReadinessWorkState = {
  saleDraftId: string;
  workPhase: "link_review" | "attachment_review" | "human_review";
};

export type SaleDraftReadinessCoBuyer = {
  saleDraftId: string;
};

export type SaleDraftReadinessItem = {
  saleDraftId: string;
  ordinalLabel: string;
  linkLabel: string;
  attachmentLabel: string;
  participantLabel: string;
  workLabel: string;
};

const attachmentLabels: Record<SaleDraftReadinessCoverage["attachmentCoverageState"], string> = {
  no_attachment_intent: "Sem intenção privada registrada",
  attachment_awaiting_private_upload: "Intenção privada aguardando ciclo",
  attachment_private_upload_recorded: "Cobertura privada registrada",
};

const workLabels: Record<SaleDraftReadinessWorkState["workPhase"], string> = {
  link_review: "Revisão de vínculo interno",
  attachment_review: "Revisão de cobertura privada",
  human_review: "Revisão humana necessária",
};

export function buildSubdivisionSaleDraftReadiness(
  drafts: readonly SaleDraftReadinessDraft[],
  coverages: readonly SaleDraftReadinessCoverage[],
  workStates: readonly SaleDraftReadinessWorkState[],
  coBuyers: readonly SaleDraftReadinessCoBuyer[],
): SaleDraftReadinessItem[] {
  const coverageByDraftId = new Map(coverages.map((coverage) => [coverage.saleDraftId, coverage.attachmentCoverageState]));
  const workByDraftId = new Map(workStates.map((state) => [state.saleDraftId, state.workPhase]));
  const coBuyerCountByDraftId = new Map<string, number>();
  for (const coBuyer of coBuyers) coBuyerCountByDraftId.set(coBuyer.saleDraftId, (coBuyerCountByDraftId.get(coBuyer.saleDraftId) ?? 0) + 1);

  return drafts.map((draft, index) => {
    const coverage = coverageByDraftId.get(draft.saleDraftId);
    const workPhase = workByDraftId.get(draft.saleDraftId);
    const coBuyerCount = coBuyerCountByDraftId.get(draft.saleDraftId) ?? 0;

    return {
      saleDraftId: draft.saleDraftId,
      ordinalLabel: `Rascunho interno ${String(index + 1).padStart(2, "0")}`,
      linkLabel: "Vínculo interno registrado",
      attachmentLabel: coverage ? attachmentLabels[coverage] : "Revisão de cobertura privada necessária",
      participantLabel: coBuyerCount === 0 ? "Sem co-comprador interno" : `${coBuyerCount} ${coBuyerCount === 1 ? "co-comprador interno" : "co-compradores internos"}`,
      workLabel: workPhase ? workLabels[workPhase] : "Revisão humana necessária",
    };
  });
}
