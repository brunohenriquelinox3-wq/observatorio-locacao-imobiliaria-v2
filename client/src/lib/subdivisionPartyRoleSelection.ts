export type SubdivisionPartyRoleSelectionCandidate = {
  displayName: string;
  role: string;
};

const roleLabels: Record<string, string> = {
  shareholder: "Sócio",
  partner: "Parceiro",
  land_contributor: "Cedente de terra",
  client: "Cliente",
  buyer: "Comprador",
};

export function subdivisionPartyRoleSelectionLabel(candidate: SubdivisionPartyRoleSelectionCandidate): string {
  return `${candidate.displayName} · ${roleLabels[candidate.role] ?? "Papel temporal"}`;
}
