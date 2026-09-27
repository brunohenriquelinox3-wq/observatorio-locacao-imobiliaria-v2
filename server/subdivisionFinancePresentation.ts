const participantRoleLabels: Record<string, string> = {
  shareholder: "Sócio",
  partner: "Parceiro",
  land_contributor: "Cedente de terra",
};

const saleStateLabels: Record<string, string> = {
  preparation: "Venda em preparação",
  terms_review: "Negociação em revisão",
  awaiting_approval: "Aguardando aprovação",
  approved: "Venda aprovada",
  cancelled: "Venda cancelada",
  archived: "Venda arquivada",
};

const lineageStageLabels: Record<string, string> = {
  loteamento: "Loteamento",
  quadra: "Quadra",
  lote: "Lote",
  venda: "Venda",
  item_nominal: "Item nominal",
};

/**
 * Presents only the internal-party roles that are part of the Loteadora
 * vocabulary. Unknown values deliberately do not reach the operator UI.
 */
export function formatSubdivisionFinanceParticipantRole(role: string): string {
  return participantRoleLabels[role.trim().toLowerCase()] ?? "Papel do participante não informado";
}

/**
 * Keeps sale-state enums out of the nominal traceability view.
 */
export function formatSubdivisionFinanceSaleState(state: string | null): string {
  if (!state) return "Situação da venda não informada nesta leitura";
  return saleStateLabels[state.trim().toLowerCase()] ?? "Situação da venda não informada nesta leitura";
}

/**
 * Keeps the incomplete traceability warning useful without exposing DTO values.
 */
export function formatSubdivisionFinanceLineageStage(stage: string): string {
  return lineageStageLabels[stage.trim().toLowerCase()] ?? "Etapa não informada";
}
