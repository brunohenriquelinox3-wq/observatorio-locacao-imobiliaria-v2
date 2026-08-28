import { describe, expect, it, vi } from "vitest";
import { storePrivateBuyerAttachment } from "./subdivisionBuyerAttachmentUpload";

const input = {
  subjectId: "00000000-0000-4000-8000-000000000001",
  organizationId: "00000000-0000-4000-8000-000000000002",
  purposeCode: "buyer_attachment",
  attachmentIntentId: "00000000-0000-4000-8000-000000000003",
  correlationId: "00000000-0000-4000-8000-000000000004",
  contentType: "application/pdf",
  bytes: Buffer.from("%PDF-synthetic"),
};

function authorizedClient() {
  return {
    rpc: vi
      .fn()
      .mockResolvedValueOnce({ data: input.attachmentIntentId, error: null })
      .mockResolvedValueOnce({ data: input.attachmentIntentId, error: null }),
  } as never;
}

describe("private buyer attachment upload", () => {
  it("rejects a disallowed content type before storage", async () => {
    const writePrivateObject = vi.fn();
    await expect(storePrivateBuyerAttachment({ ...input, contentType: "text/plain" }, authorizedClient(), writePrivateObject)).rejects.toThrow("SUBDIVISION_ATTACHMENT_UPLOAD_REJECTED");
    expect(writePrivateObject).not.toHaveBeenCalled();
  });

  it("rejects a file above two megabytes before storage", async () => {
    const writePrivateObject = vi.fn();
    await expect(storePrivateBuyerAttachment({ ...input, bytes: Buffer.alloc(2 * 1024 * 1024 + 1) }, authorizedClient(), writePrivateObject)).rejects.toThrow("SUBDIVISION_ATTACHMENT_UPLOAD_REJECTED");
    expect(writePrivateObject).not.toHaveBeenCalled();
  });

  it("rejects a declared PDF without a compatible file signature before storage", async () => {
    const writePrivateObject = vi.fn();
    await expect(storePrivateBuyerAttachment({ ...input, bytes: Buffer.from("synthetic") }, authorizedClient(), writePrivateObject)).rejects.toThrow("SUBDIVISION_ATTACHMENT_UPLOAD_REJECTED");
    expect(writePrivateObject).not.toHaveBeenCalled();
  });

  it("rejects an absent subject before storage", async () => {
    const writePrivateObject = vi.fn();
    await expect(storePrivateBuyerAttachment({ ...input, subjectId: undefined }, authorizedClient(), writePrivateObject)).rejects.toThrow("SUBDIVISION_IDENTITY_REQUIRED");
    expect(writePrivateObject).not.toHaveBeenCalled();
  });

  it("writes only after contextual authorization and returns no storage reference", async () => {
    const client = authorizedClient();
    const writePrivateObject = vi.fn().mockResolvedValue({ key: "private/redacted" });

    const result = await storePrivateBuyerAttachment(input, client, writePrivateObject);

    expect(client.rpc).toHaveBeenNthCalledWith(1, "subdivision_authorize_buyer_attachment_upload", expect.objectContaining({ p_attachment_intent_id: input.attachmentIntentId }));
    expect(writePrivateObject).toHaveBeenCalledTimes(1);
    expect(client.rpc).toHaveBeenNthCalledWith(2, "subdivision_record_buyer_attachment_upload", expect.objectContaining({ p_storage_key: "private/redacted" }));
    expect(result).toEqual({ attachmentIntentId: input.attachmentIntentId });
    expect(result).not.toHaveProperty("key");
    expect(result).not.toHaveProperty("url");
  });

  it("does not write when contextual authorization denies the intent", async () => {
    const client = { rpc: vi.fn().mockResolvedValue({ data: null, error: new Error("denied") }) } as never;
    const writePrivateObject = vi.fn();
    await expect(storePrivateBuyerAttachment(input, client, writePrivateObject)).rejects.toThrow("SUBDIVISION_ATTACHMENT_UPLOAD_DENIED");
    expect(writePrivateObject).not.toHaveBeenCalled();
  });
});
