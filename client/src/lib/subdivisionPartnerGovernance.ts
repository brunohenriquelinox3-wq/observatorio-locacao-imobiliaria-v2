export type SubdivisionInternalPartnerLink = {
  linkId: string;
  developmentId: string;
  role: string;
  startsAt: string;
  endsAt: string | null;
};

type InternalPartnerRole = "shareholder" | "partner" | "land_contributor";

export type SubdivisionPartnerGovernanceItem = {
  role: InternalPartnerRole;
  roleLabel: string;
  ordinalLabel: string;
  lifecycleLabel: string;
  reviewLabel: string;
};

const roleLabels: Record<InternalPartnerRole, string> = {
  shareholder: "Sócio",
  partner: "Parceiro",
  land_contributor: "Cedente de terra",
};

const roleOrder: Record<InternalPartnerRole, number> = {
  shareholder: 0,
  partner: 1,
  land_contributor: 2,
};

function isInternalPartnerRole(role: string): role is InternalPartnerRole {
  return role === "shareholder" || role === "partner" || role === "land_contributor";
}

export function buildSubdivisionPartnerGovernance(
  developmentId: string,
  links: readonly SubdivisionInternalPartnerLink[],
): SubdivisionPartnerGovernanceItem[] {
  const filteredLinks = links
    .filter((link): link is SubdivisionInternalPartnerLink & { role: InternalPartnerRole } => link.developmentId === developmentId && isInternalPartnerRole(link.role))
    .sort((left, right) => roleOrder[left.role] - roleOrder[right.role] || left.startsAt.localeCompare(right.startsAt) || left.linkId.localeCompare(right.linkId));

  const countByRole = new Map<InternalPartnerRole, number>();
  return filteredLinks.map((link) => {
    const ordinal = (countByRole.get(link.role) ?? 0) + 1;
    countByRole.set(link.role, ordinal);
    const roleLabel = roleLabels[link.role];

    return {
      role: link.role,
      roleLabel,
      ordinalLabel: `${roleLabel} ${String(ordinal).padStart(2, "0")}`,
      lifecycleLabel: link.endsAt ? "Vigência declarada encerrada" : "Vigência declarada aberta",
      reviewLabel: "Revisão humana de responsabilidade",
    };
  });
}
