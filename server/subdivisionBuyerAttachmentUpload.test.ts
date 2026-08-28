import { describe, expect, it } from "vitest";
import { storePrivateBuyerAttachment } from "./subdivisionBuyerAttachmentUpload";

describe("private buyer attachment upload", () => {
  it("rejects a disallowed content type before storage", async () => {
    await expect(storePrivateBuyerAttachment({ subjectId: "00000000-0000-4000-8000-000000000001", organizationId: "00000000-0000-4000-8000-000000000002", purposeCode: "buyer_attachment", attachmentIntentId: "00000000-0000-4000-8000-000000000003", correlationId: "00000000-0000-4000-8000-000000000004", contentType: "text/plain", bytes: Buffer.from("synthetic") })).rejects.toThrow("SUBDIVISION_ATTACHMENT_UPLOAD_REJECTED");
  });
});
