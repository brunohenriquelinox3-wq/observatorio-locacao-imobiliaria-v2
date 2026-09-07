export type BuyerReadinessClient = {
  buyerClientId: string;
  displayName: string;
  registrationState: "contact_pending" | "base_data_in_progress" | "conditional_requirements_pending" | "base_data_review";
  primaryPhone: string | null;
  messagingPhone: string | null;
};

export type BuyerReadinessAttachmentIntent = {
  buyerClientId: string;
  attachmentState: "awaiting_private_upload" | "private_upload_recorded";
};

export type BuyerReadinessItem = {
  buyerClientId: string;
  displayName: string;
  registrationLabel: string;
  primaryPhone: string | null;
  messagingPhone: string | null;
};

export function buildSubdivisionBuyerReadiness(
  clients: readonly BuyerReadinessClient[],
  attachmentIntents: readonly BuyerReadinessAttachmentIntent[],
): BuyerReadinessItem[] {
  void attachmentIntents;
  const registrationLabels = {
    contact_pending: "Contato a organizar",
    base_data_in_progress: "Cadastro em organização",
    conditional_requirements_pending: "Conferência pendente",
    base_data_review: "Cadastro em revisão",
  } as const;

  return clients.map((client) => {

    return {
      buyerClientId: client.buyerClientId,
      displayName: client.displayName,
      registrationLabel: registrationLabels[client.registrationState],
      primaryPhone: client.primaryPhone,
      messagingPhone: client.messagingPhone,
    };
  });
}
