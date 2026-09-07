import { describe, expect, it, vi } from "vitest";
import { archiveSubdivisionClient, listArchivedSubdivisionClients, registerSubdivisionClientDirect, restoreSubdivisionClient } from "./subdivisionClientLifecycle";

const context = { organizationId: "11111111-1111-4111-8111-111111111111", module: "loteadora" as const, purposeCode: "cadastro_inicial" };
const correlationId = "22222222-2222-4222-8222-222222222222";
const clientId = "33333333-3333-4333-8333-333333333333";

describe("lifecycle of Cliente Loteadora", () => {
  it("registers only a minimal client through the protected RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [{ client_id: clientId }], error: null });
    await expect(registerSubdivisionClientDirect("subject", { ...context, correlationId, partyKind: "individual", displayName: "Pessoa de teste" }, { rpc })).resolves.toEqual({ buyerClientId: clientId });
    expect(rpc).toHaveBeenCalledWith("subdivision_register_client_direct", expect.objectContaining({ p_display_name: "Pessoa de teste" }));
  });

  it("archives and restores only the contextual client lifecycle", async () => {
    const archiveRpc = vi.fn().mockResolvedValue({ data: { buyer_client_id: clientId, lifecycle_state: "archived" }, error: null });
    const restoreRpc = vi.fn().mockResolvedValue({ data: { buyer_client_id: clientId, lifecycle_state: "draft" }, error: null });
    await expect(archiveSubdivisionClient("subject", { ...context, correlationId, buyerClientId: clientId }, { rpc: archiveRpc })).resolves.toMatchObject({ lifecycleState: "archived" });
    await expect(restoreSubdivisionClient("subject", { ...context, correlationId, buyerClientId: clientId }, { rpc: restoreRpc })).resolves.toMatchObject({ lifecycleState: "draft" });
  });

  it("keeps archived-list parsing strict and identity-bound", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [{ client_id: clientId, display_name: "Pessoa de teste", archived_at: "2026-09-07T00:00:00.000Z" }], error: null });
    await expect(listArchivedSubdivisionClients(undefined, context, { rpc })).rejects.toThrow("SUBDIVISION_IDENTITY_REQUIRED");
    await expect(listArchivedSubdivisionClients("subject", context, { rpc })).resolves.toHaveLength(1);
  });
});
