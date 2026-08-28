import { describe, expect, it, vi } from "vitest";
import { listSubdivisionSaleDraftWorkStates, upsertSubdivisionSaleDraftWorkState } from "./subdivisionSaleDraftWorkState";

const input = { organizationId: "00000000-0000-4000-8000-000000000002", module: "loteadora" as const, purposeCode: "CADASTRO_INICIAL", saleDraftId: "00000000-0000-4000-8000-000000000003", workPhase: "attachment_review" as const, correlationId: "00000000-0000-4000-8000-000000000004" };

describe("subdivision sale draft work state", () => {
  it("requires a subject before a contextual upsert", async () => {
    const client = { rpc: vi.fn() } as never;
    await expect(upsertSubdivisionSaleDraftWorkState(undefined, input, client)).rejects.toThrow("SUBDIVISION_IDENTITY_REQUIRED");
    expect(client.rpc).not.toHaveBeenCalled();
  });

  it("returns only the declared work phase and minimized references", async () => {
    const client = { rpc: vi.fn().mockResolvedValueOnce({ data: "00000000-0000-4000-8000-000000000005", error: null }).mockResolvedValueOnce({ data: [{ sale_draft_work_state_id: "00000000-0000-4000-8000-000000000005", sale_draft_id: input.saleDraftId, work_phase: "attachment_review", updated_at: "2026-08-28T00:00:00.000Z", amount: 123 }], error: null }) } as never;
    await expect(upsertSubdivisionSaleDraftWorkState("00000000-0000-4000-8000-000000000001", input, client)).resolves.toEqual({ saleDraftWorkStateId: "00000000-0000-4000-8000-000000000005" });
    const result = await listSubdivisionSaleDraftWorkStates("00000000-0000-4000-8000-000000000001", input, client);
    expect(result).toEqual([{ saleDraftWorkStateId: "00000000-0000-4000-8000-000000000005", saleDraftId: input.saleDraftId, workPhase: "attachment_review", updatedAt: "2026-08-28T00:00:00.000Z" }]);
    expect(result[0]).not.toHaveProperty("amount");
  });
});
