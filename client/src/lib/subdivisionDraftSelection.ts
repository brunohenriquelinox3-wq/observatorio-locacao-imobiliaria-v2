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
  return role ? `Cliente comprador · ${subdivisionPartyRoleSelectionLabel(role)}` : "Cliente comprador em rascunho";
}

export function attachmentIntentSelectionLabel(intent: AttachmentIntentCandidate, clients: BuyerClientCandidate[], partyRoles: PartyRoleCandidate[]): string {
  const client = clients.find((candidate) => candidate.buyerClientId === intent.buyerClientId);
  return client ? `Intenção privada · ${buyerClientSelectionLabel(client, partyRoles)}` : "Intenção privada autorizada";
}

export function saleDraftSelectionLabel(draft: SaleDraftCandidate, clients: BuyerClientCandidate[], partyRoles: PartyRoleCandidate[]): string {
  const client = clients.find((candidate) => candidate.buyerClientId === draft.buyerClientId);
  return client ? `Rascunho de venda · ${buyerClientSelectionLabel(client, partyRoles)}` : "Rascunho interno de venda";
}
