import { describe, expect, it, vi } from "vitest";
import { listBuyerAttachmentIntents } from "./subdivisionBuyerAttachmentIntent";

describe("buyer attachment intent summary", () => {
  it("returns the opaque state without document metadata", async () => {
    const result = await listBuyerAttachmentIntents(
      "00000000-0000-4000-8000-000000000001",
      { organizationId: "00000000-0000-4000-8000-000000000002", module: "loteadora", purposeCode: "CADASTRO_INICIAL" },
      { rpc: vi.fn().mockResolvedValue({ data: [{ attachment_intent_id: "00000000-0000-4000-8000-000000000003", buyer_client_id: "00000000-0000-4000-8000-000000000004", created_at: "2026-08-28T00:00:00.000Z", attachment_state: "private_upload_recorded", storage_key: "must-not-pass" }], error: null }) } as never,
    );

    expect(result).toEqual([{ attachmentIntentId: "00000000-0000-4000-8000-000000000003", buyerClientId: "00000000-0000-4000-8000-000000000004", createdAt: "2026-08-28T00:00:00.000Z", attachmentState: "private_upload_recorded" }]);
    expect(result[0]).not.toHaveProperty("storageKey");
    expect(result[0]).not.toHaveProperty("url");
  });
});
