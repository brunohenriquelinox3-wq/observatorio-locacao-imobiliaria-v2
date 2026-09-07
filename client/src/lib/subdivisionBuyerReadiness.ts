export type BuyerReadinessClient = {
  buyerClientId: string;
};

export type BuyerReadinessAttachmentIntent = {
  buyerClientId: string;
  attachmentState: "awaiting_private_upload" | "private_upload_recorded";
};

export type BuyerReadinessItem = {
  buyerClientId: string;
  ordinalLabel: string;
  attachmentLabel: string;
  reviewLabel: string;
};

export function buildSubdivisionBuyerReadiness(
  clients: readonly BuyerReadinessClient[],
  attachmentIntents: readonly BuyerReadinessAttachmentIntent[],
): BuyerReadinessItem[] {
  const attachmentStateByBuyerId = new Map(
    attachmentIntents.map((intent) => [intent.buyerClientId, intent.attachmentState]),
  );

  return clients.map((client, index) => {
    const state = attachmentStateByBuyerId.get(client.buyerClientId);
    const attachmentLabel = state === "private_upload_recorded"
      ? "Cobertura privada registrada"
      : state === "awaiting_private_upload"
        ? "Intenção privada aguardando ciclo"
        : "Sem intenção privada registrada";

    return {
      buyerClientId: client.buyerClientId,
      ordinalLabel: `Cliente Loteadora ${String(index + 1).padStart(2, "0")}`,
      attachmentLabel,
      reviewLabel: "Revisão humana necessária",
    };
  });
}
