import { describe, expect, it, vi } from "vitest";
import { reserveSubdivisionPrivateUploadStorage } from "./subdivisionPrivateUploadReservation";

const input = {
  subjectId: "00000000-0000-4000-8000-000000000001",
  organizationId: "00000000-0000-4000-8000-000000000002",
  purposeCode: "SUBDIVISION_SALE_PREPARATION",
  targetKind: "sale_case_document" as const,
  targetId: "00000000-0000-4000-8000-000000000003",
  contentType: "application/pdf",
  byteSize: 32,
  correlationId: "00000000-0000-4000-8000-000000000004",
};

describe("private upload storage reservation", () => {
  it("encaminha somente o contrato opaco à procedure protegida", async () => {
    const client = {
      rpc: vi.fn().mockResolvedValue({ data: "private/reservations/opaque", error: null }),
    } as never;

    await expect(reserveSubdivisionPrivateUploadStorage(input, client)).resolves.toEqual({
      storageKey: "private/reservations/opaque",
    });
    expect(client.rpc).toHaveBeenCalledWith(
      "subdivision_reserve_private_upload_storage",
      expect.objectContaining({
        p_target_kind: "sale_case_document",
        p_target_id: input.targetId,
        p_byte_size: 32,
      }),
    );
  });

  it("falha fechada quando a procedure não devolve uma chave privada válida", async () => {
    const client = {
      rpc: vi.fn().mockResolvedValue({ data: "unexpected", error: null }),
    } as never;

    await expect(reserveSubdivisionPrivateUploadStorage(input, client)).rejects.toThrow(
      "SUBDIVISION_PRIVATE_UPLOAD_RESERVATION_DENIED",
    );
  });
});
