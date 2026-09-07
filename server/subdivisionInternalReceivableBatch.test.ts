import { describe, expect, it, vi } from "vitest";
import { listSubdivisionInternalReceivableBatches } from "./subdivisionInternalReceivableBatch";
const context = { organizationId: "00000000-0000-4000-8000-000000000002", module: "loteadora" as const, purposeCode: "SUBDIVISION_SALE_PREPARATION" };
describe("lote interno de parcelas", () => {
  it("rejeita identidade ausente sem consultar a base", async () => {
    const rpc = vi.fn(); await expect(listSubdivisionInternalReceivableBatches(undefined, context, { rpc } as never)).rejects.toThrow("SUBDIVISION_IDENTITY_REQUIRED"); expect(rpc).not.toHaveBeenCalled();
  });
});
