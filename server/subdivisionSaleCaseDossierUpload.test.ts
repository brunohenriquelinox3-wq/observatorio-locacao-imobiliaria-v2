import { describe, expect, it, vi } from "vitest";
import { storePrivateSaleCaseDossierAttachment } from "./subdivisionSaleCaseDossierUpload";

describe("upload privado do dossiê comercial", () => {
  it("rejeita tipo não permitido antes de chamar autorização ou armazenamento", async () => {
    const rpc = vi.fn();
    const write = vi.fn();
    await expect(storePrivateSaleCaseDossierAttachment({ subjectId: "00000000-0000-4000-8000-000000000001", organizationId: "00000000-0000-4000-8000-000000000002", purposeCode: "subdivision_sale_preparation", attachmentIntentId: "00000000-0000-4000-8000-000000000003", correlationId: "00000000-0000-4000-8000-000000000004", contentType: "text/plain", bytes: Buffer.from("not a private document") }, { rpc }, write)).rejects.toThrow("SUBDIVISION_SALE_CASE_ATTACHMENT_REJECTED");
    expect(rpc).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
  });
});
