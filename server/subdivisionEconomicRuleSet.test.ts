import { describe, expect, it, vi } from "vitest";
import { createSubdivisionEconomicRuleSet, listSubdivisionEconomicRuleSets } from "./subdivisionEconomicRuleSet";

const input = { organizationId: "00000000-0000-4000-8000-000000000002", module: "loteadora" as const, purposeCode: "CADASTRO_INICIAL", developmentId: "00000000-0000-4000-8000-000000000003", versionReference: "REGRAS_001", workingState: "draft_internal" as const, correlationId: "00000000-0000-4000-8000-000000000004" };

describe("subdivision economic rule set", () => {
  it("requires a subject before calling the contextual command", async () => {
    const client = { rpc: vi.fn() } as never;
    await expect(createSubdivisionEconomicRuleSet(undefined, input, client)).rejects.toThrow("SUBDIVISION_IDENTITY_REQUIRED");
    expect(client.rpc).not.toHaveBeenCalled();
  });

  it("returns only a minimized non-monetary rule set summary", async () => {
    const client = { rpc: vi.fn().mockResolvedValueOnce({ data: "00000000-0000-4000-8000-000000000005", error: null }).mockResolvedValueOnce({ data: [{ economic_rule_set_id: "00000000-0000-4000-8000-000000000005", development_id: input.developmentId, version_reference: input.versionReference, working_state: "draft_internal", created_at: "2026-08-28T00:00:00.000Z", amount: 100 }], error: null }) } as never;
    await expect(createSubdivisionEconomicRuleSet("00000000-0000-4000-8000-000000000001", input, client)).resolves.toEqual({ economicRuleSetId: "00000000-0000-4000-8000-000000000005" });
    const result = await listSubdivisionEconomicRuleSets("00000000-0000-4000-8000-000000000001", input, client);
    expect(result).toEqual([{ economicRuleSetId: "00000000-0000-4000-8000-000000000005", developmentId: input.developmentId, versionReference: input.versionReference, workingState: "draft_internal", createdAt: "2026-08-28T00:00:00.000Z" }]);
    expect(result[0]).not.toHaveProperty("amount");
  });
});
