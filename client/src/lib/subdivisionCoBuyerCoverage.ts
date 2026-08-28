export type OpaqueAttachmentIntent = { buyerClientId: string; attachmentState: "awaiting_private_upload" | "private_upload_recorded" };
export type OpaqueSaleDraftCoBuyer = { saleDraftId: string; buyerClientId: string };
export type OpaqueCoBuyerAttachmentCoverage = { total: number; withoutIntent: number; awaitingUpload: number; recorded: number };

export function summarizeOpaqueCoBuyerAttachmentCoverage(saleDraftId: string, coBuyers: OpaqueSaleDraftCoBuyer[], attachmentIntents: OpaqueAttachmentIntent[]): OpaqueCoBuyerAttachmentCoverage {
  const stateByBuyer = new Map(attachmentIntents.map((intent) => [intent.buyerClientId, intent.attachmentState]));
  return coBuyers.filter((coBuyer) => coBuyer.saleDraftId === saleDraftId).reduce<OpaqueCoBuyerAttachmentCoverage>((summary, coBuyer) => {
    summary.total += 1;
    const state = stateByBuyer.get(coBuyer.buyerClientId);
    if (state === "private_upload_recorded") summary.recorded += 1;
    else if (state === "awaiting_private_upload") summary.awaitingUpload += 1;
    else summary.withoutIntent += 1;
    return summary;
  }, { total: 0, withoutIntent: 0, awaitingUpload: 0, recorded: 0 });
}
