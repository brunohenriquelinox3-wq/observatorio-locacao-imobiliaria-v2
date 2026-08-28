import { describe, expect, it, vi } from "vitest";
import { addSubdivisionSaleDraftCoBuyer, listSubdivisionSaleDraftCoBuyers } from "./subdivisionSaleDraftCoBuyer";

const input = { organizationId: "00000000-0000-4000-8000-000000000002", module: "loteadora" as const, purposeCode: "CADASTRO_INICIAL", saleDraftId: "00000000-0000-4000-8000-000000000003", buyerClientId: "00000000-0000-4000-8000-000000000004", correlationId: "00000000-0000-4000-8000-000000000005" };

describe("subdivision sale draft co-buyer", () => {
  it("requires a subject before the contextual command", async () => {
    const client = { rpc: vi.fn() } as never;
    await expect(addSubdivisionSaleDraftCoBuyer(undefined, input, client)).rejects.toThrow("SUBDIVISION_IDENTITY_REQUIRED");
    expect(client.rpc).not.toHaveBeenCalled();
  });

  it("uses contextual RPCs and omits non-minimized fields", async () => {
    const client = { rpc: vi.fn().mockResolvedValueOnce({ data: "00000000-0000-4000-8000-000000000006", error: null }).mockResolvedValueOnce({ data: [{ sale_draft_co_buyer_id: "00000000-0000-4000-8000-000000000006", sale_draft_id: input.saleDraftId, buyer_client_id: input.buyerClientId, created_at: "2026-08-28T00:00:00.000Z", percentage: 50 }], error: null }) } as never;
    await expect(addSubdivisionSaleDraftCoBuyer("00000000-0000-4000-8000-000000000001", input, client)).resolves.toEqual({ saleDraftCoBuyerId: "00000000-0000-4000-8000-000000000006" });
    const result = await listSubdivisionSaleDraftCoBuyers("00000000-0000-4000-8000-000000000001", input, client);
    expect(result).toEqual([{ saleDraftCoBuyerId: "00000000-0000-4000-8000-000000000006", saleDraftId: input.saleDraftId, buyerClientId: input.buyerClientId, createdAt: "2026-08-28T00:00:00.000Z" }]);
    expect(result[0]).not.toHaveProperty("percentage");
  });
});
