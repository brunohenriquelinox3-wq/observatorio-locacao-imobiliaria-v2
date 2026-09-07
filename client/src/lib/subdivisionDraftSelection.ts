import { subdivisionPartyRoleSelectionLabel } from "./subdivisionPartyRoleSelection";

export type BuyerClientCandidate = {
  buyerClientId: string;
  partyRoleAssignmentId: string;
};

export type PartyRoleCandidate = {
  partyRoleAssignmentId: string;
  displayName: string;
  role: string;
};

export type AttachmentIntentCandidate = {
  buyerClientId: string;
};

export type SaleDraftCandidate = {
  buyerClientId: string;
};

export function buyerClientSelectionLabel(client: BuyerClientCandidate, partyRoles: PartyRoleCandidate[]): string {
  const role = partyRoles.find((candidate) => candidate.partyRoleAssignmentId === client.partyRoleAssignmentId);
  return role ? `Cliente · ${role.displayName}` : "Cliente Loteadora";
}

export function attachmentIntentSelectionLabel(intent: AttachmentIntentCandidate, clients: BuyerClientCandidate[], partyRoles: PartyRoleCandidate[]): string {
  const client = clients.find((candidate) => candidate.buyerClientId === intent.buyerClientId);
  return client ? `Documento privado · ${buyerClientSelectionLabel(client, partyRoles)}` : "Documento privado autorizado";
}

export function saleDraftSelectionLabel(draft: SaleDraftCandidate, clients: BuyerClientCandidate[], partyRoles: PartyRoleCandidate[]): string {
  const client = clients.find((candidate) => candidate.buyerClientId === draft.buyerClientId);
  return client ? `Preparação de venda · ${buyerClientSelectionLabel(client, partyRoles)}` : "Preparação interna de venda";
}
