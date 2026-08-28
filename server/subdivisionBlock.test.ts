import { describe, expect, it, vi } from "vitest";
import { createDraftSubdivisionBlock, listDraftSubdivisionBlocks } from "./subdivisionBlock";

const subjectId = "550e8400-e29b-41d4-a716-446655440000";
const organizationId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const developmentId = "7ba7b810-9dad-11d1-80b4-00c04fd430c8";
const blockId = "8ba7b810-9dad-11d1-80b4-00c04fd430c8";
const correlationId = "9ba7b810-9dad-11d1-80b4-00c04fd430c8";
const context = { organizationId, module: "loteadora" as const, purposeCode: "CADASTRO_INICIAL" };
const rpc = vi.fn();
const client = { rpc } as never;

describe("subdivision block server boundary", () => {
  it("fails before using the service client when the Supabase identity is absent", async () => {
    await expect(listDraftSubdivisionBlocks(undefined, context, developmentId, client)).rejects.toThrow("SUBDIVISION_IDENTITY_REQUIRED");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("reads only the minimized contextual block summary", async () => {
    rpc.mockResolvedValueOnce({ data: [{ block_id: blockId, development_id: developmentId, block_number: 12, created_at: "2026-08-28T00:00:00+00:00" }], error: null });
    await expect(listDraftSubdivisionBlocks(subjectId, context, developmentId, client)).resolves.toEqual([{ blockId, developmentId, blockNumber: 12, createdAt: "2026-08-28T00:00:00+00:00" }]);
    expect(rpc).toHaveBeenLastCalledWith("subdivision_list_draft_blocks", expect.objectContaining({ p_actor_user_id: subjectId, p_development_id: developmentId }));
  });

  it("uses a protected contextual RPC to create the numbered matrix block", async () => {
    rpc.mockResolvedValueOnce({ data: blockId, error: null });
    await createDraftSubdivisionBlock(subjectId, { ...context, correlationId, developmentId, blockNumber: 12 }, client);
    expect(rpc).toHaveBeenLastCalledWith("subdivision_create_draft_block", expect.objectContaining({ p_development_id: developmentId, p_block_number: 12, p_correlation_id: correlationId }));
  });
});
