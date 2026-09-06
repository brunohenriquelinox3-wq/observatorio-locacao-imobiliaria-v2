import { describe, expect, it, vi } from "vitest";
import { createSubdivisionPriceCondition, getSubdivisionLotPriceContext } from "./subdivisionPriceConditions";

const actor = "00000000-0000-4000-8000-000000000001";
const organizationId = "00000000-0000-4000-8000-000000000002";
const developmentId = "00000000-0000-4000-8000-000000000003";
const blockId = "00000000-0000-4000-8000-000000000004";
const policyId = "00000000-0000-4000-8000-000000000005";
const correlationId = "00000000-0000-4000-8000-000000000006";
const conditionId = "00000000-0000-4000-8000-000000000007";
const context = { organizationId, module: "loteadora" as const, purposeCode: "subdivision_structure" };

describe("subdivision price conditions", () => {
  it("resolves an individual Lot by authorized Block and number without exposing a Lot identifier", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: conditionId, error: null });
    await expect(createSubdivisionPriceCondition(actor, {
      ...context, developmentId, basePolicyId: policyId, conditionReference: "PC_Q1_L18", scope: "lot", blockId, lotNumber: 18,
      adjustmentKind: "temporary_discount", amount: 5, effectiveFrom: "2026-09-05", effectiveUntil: "2026-09-30", reasonCode: "campaign", documentState: "pending_evidence", correlationId,
    }, { rpc })).resolves.toEqual({ conditionId, state: "prepared" });
    expect(rpc).toHaveBeenCalledWith("subdivision_create_price_condition_v2", expect.objectContaining({ p_block_id: blockId, p_lot_number: 18, p_scope: "lot" }));
    expect(rpc.mock.calls[0]?.[1]).not.toHaveProperty("p_lot_id");
  });

  it("rejects a Lot-scoped condition that omits its number before it can reach the database", async () => {
    const rpc = vi.fn();
    await expect(createSubdivisionPriceCondition(actor, {
      ...context, developmentId, basePolicyId: policyId, conditionReference: "PC_INVALIDA", scope: "lot", blockId, lotNumber: null,
      adjustmentKind: "override_per_sqm", amount: 500, effectiveFrom: "2026-09-05", effectiveUntil: null, reasonCode: "specific_condition", documentState: "pending_evidence", correlationId,
    }, { rpc })).rejects.toThrow();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("returns no price context until an approved policy is actually in force", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: { state: "unavailable", availability_reason: "prepared_with_exceptions" }, error: null });
    await expect(getSubdivisionLotPriceContext(actor, { ...context, developmentId, blockId, lotNumber: 18 }, { rpc })).resolves.toEqual({
      state: "unavailable", availabilityReason: "prepared_with_exceptions", policyReference: null, conditionReference: null, conditionScope: null, conditionKind: null, effectiveFrom: null, effectiveUntil: null, documentState: null, effectivePricePerSqmBrl: null,
    });
    expect(rpc).toHaveBeenCalledWith("subdivision_get_lot_price_context_v3", expect.objectContaining({ p_block_id: blockId, p_lot_number: 18 }));
  });
});
