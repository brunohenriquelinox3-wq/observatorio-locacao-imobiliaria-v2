import { describe, expect, it, vi } from "vitest";
import { storeSubdivisionDevelopmentAttachment } from "./subdivisionDevelopmentAttachment";

const input = {
  subjectId: "00000000-0000-4000-8000-000000000001",
  organizationId: "00000000-0000-4000-8000-000000000002",
  purposeCode: "SUBDIVISION_STUDIO",
  attachmentId: "00000000-0000-4000-8000-000000000003",
  correlationId: "00000000-0000-4000-8000-000000000004",
  contentType: "application/pdf",
  bytes: Buffer.from("%PDF-synthetic"),
};

function authorizedClient() {
  return { rpc: vi.fn().mockResolvedValueOnce({ data: input.attachmentId, error: null }).mockResolvedValueOnce({ data: input.attachmentId, error: null }) } as never;
}

describe("anexo privado de loteamento", () => {
  it("rejeita tipo, assinatura e subject antes de chamar o armazenamento", async () => {
    const writer = vi.fn();
    await expect(storeSubdivisionDevelopmentAttachment({ ...input, contentType: "text/plain" }, authorizedClient(), writer)).rejects.toThrow("SUBDIVISION_DEVELOPMENT_ATTACHMENT_UPLOAD_REJECTED");
    await expect(storeSubdivisionDevelopmentAttachment({ ...input, bytes: Buffer.from("invalid") }, authorizedClient(), writer)).rejects.toThrow("SUBDIVISION_DEVELOPMENT_ATTACHMENT_UPLOAD_REJECTED");
    await expect(storeSubdivisionDevelopmentAttachment({ ...input, subjectId: undefined }, authorizedClient(), writer)).rejects.toThrow("SUBDIVISION_IDENTITY_REQUIRED");
    expect(writer).not.toHaveBeenCalled();
  });

  it("autoriza antes de gravar e não devolve chave ou URL", async () => {
    const client = authorizedClient();
    const writer = vi.fn().mockResolvedValue({ key: "private/redacted" });
    const result = await storeSubdivisionDevelopmentAttachment(input, client, writer);
    expect(client.rpc).toHaveBeenNthCalledWith(1, "subdivision_authorize_development_attachment_upload", expect.objectContaining({ p_attachment_id: input.attachmentId }));
    expect(client.rpc).toHaveBeenNthCalledWith(2, "subdivision_record_development_attachment_upload", expect.objectContaining({ p_storage_key: "private/redacted" }));
    expect(result).toEqual({ attachmentId: input.attachmentId });
    expect(result).not.toHaveProperty("key");
    expect(result).not.toHaveProperty("url");
  });
});
