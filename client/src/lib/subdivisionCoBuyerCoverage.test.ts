import { describe, expect, it } from "vitest";
import { summarizeOpaqueCoBuyerAttachmentCoverage } from "./subdivisionCoBuyerCoverage";

describe("opaque co-buyer attachment coverage", () => {
  it("reports only aggregate states without document metadata", () => {
    const result = summarizeOpaqueCoBuyerAttachmentCoverage("draft-a", [{ saleDraftId: "draft-a", buyerClientId: "buyer-a" }, { saleDraftId: "draft-a", buyerClientId: "buyer-b" }, { saleDraftId: "draft-a", buyerClientId: "buyer-c" }], [{ buyerClientId: "buyer-a", attachmentState: "private_upload_recorded" }, { buyerClientId: "buyer-b", attachmentState: "awaiting_private_upload" }]);
    expect(result).toEqual({ total: 3, recorded: 1, awaitingUpload: 1, withoutIntent: 1 });
    expect(result).not.toHaveProperty("url");
    expect(result).not.toHaveProperty("storageKey");
  });
});
