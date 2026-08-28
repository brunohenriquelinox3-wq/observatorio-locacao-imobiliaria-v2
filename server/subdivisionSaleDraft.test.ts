import { describe, expect, it, vi } from "vitest";
import { createSubdivisionSaleDraft, listSubdivisionSaleDrafts } from "./subdivisionSaleDraft";

const input = { organizationId: "00000000-0000-4000-8000-000000000002", module: "loteadora" as const, purposeCode: "CADASTRO_INICIAL", lotId: "00000000-0000-4000-8000-000000000003", buyerClientId: "00000000-0000-4000-8000-000000000004", correlationId: "00000000-0000-4000-8000-000000000005" };

describe("subdivision sale draft", () => {
  it("requires a subject before calling the contextual command", async () => {
    const client = { rpc: vi.fn() } as never;
    await expect(createSubdivisionSaleDraft(undefined, input, client)).rejects.toThrow("SUBDIVISION_IDENTITY_REQUIRED");
    expect(client.rpc).not.toHaveBeenCalled();
  });

  it("uses contextual RPCs and returns only minimized references", async () => {
    const client = { rpc: vi.fn().mockResolvedValueOnce({ data: "00000000-0000-4000-8000-000000000006", error: null }).mockResolvedValueOnce({ data: [{ sale_draft_id: "00000000-0000-4000-8000-000000000006", lot_id: input.lotId, buyer_client_id: input.buyerClientId, created_at: "2026-08-28T00:00:00.000Z", secret: "must-not-pass" }], error: null }) } as never;
    await expect(createSubdivisionSaleDraft("00000000-0000-4000-8000-000000000001", input, client)).resolves.toEqual({ saleDraftId: "00000000-0000-4000-8000-000000000006" });
    const result = await listSubdivisionSaleDrafts("00000000-0000-4000-8000-000000000001", input, client);
    expect(result).toEqual([{ saleDraftId: "00000000-0000-4000-8000-000000000006", lotId: input.lotId, buyerClientId: input.buyerClientId, createdAt: "2026-08-28T00:00:00.000Z" }]);
    expect(result[0]).not.toHaveProperty("secret");
  });
});
