export type DomainPartySelectionCandidate = {
  displayName: string;
  kind: "individual" | "legal_entity";
  roleCount: number;
};

export function domainPartySelectionLabel(candidate: DomainPartySelectionCandidate): string {
  const kindLabel = candidate.kind === "legal_entity" ? "Pessoa jurídica" : "Pessoa física";
  const roleLabel = candidate.roleCount === 1 ? "1 papel no módulo" : `${candidate.roleCount} papéis no módulo`;

  return `${candidate.displayName} · ${kindLabel} · ${roleLabel}`;
}
