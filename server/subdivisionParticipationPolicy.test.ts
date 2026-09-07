import { describe, expect, it, vi } from "vitest";
import { addSubdivisionParticipationPolicyRule, createSubdivisionParticipationPolicyVersion, lookupSubdivisionInternalPartyByFiscalReference, upsertSubdivisionInternalPartyProfile } from "./subdivisionParticipationPolicy";

const actorId = "550e8400-e29b-41d4-a716-446655440000";
const organizationId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const developmentId = "7ba7b810-9dad-11d1-80b4-00c04fd430c8";
const correlationId = "9ba7b810-9dad-11d1-80b4-00c04fd430c8";
const context = { organizationId, module: "loteadora" as const, purposeCode: "CADASTRO_INICIAL" };

describe("subdivision participation policy", () => {
  it("exige identidade antes de registrar a referência fiscal protegida", async () => {
    await expect(upsertSubdivisionInternalPartyProfile(undefined, { ...context, correlationId, partyRoleAssignmentId: developmentId, documentReference: "12345678901" }, { rpc: vi.fn() } as never)).rejects.toThrow("SUBDIVISION_IDENTITY_REQUIRED");
  });

  it("envia a busca fiscal somente ao RPC contextual do loteamento", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [{ internal_party_role_link_id: developmentId, party_role_assignment_id: "8ba7b810-9dad-11d1-80b4-00c04fd430c8", display_name: "Parte interna", role: "partner", party_kind: "individual" }], error: null });
    const found = await lookupSubdivisionInternalPartyByFiscalReference(actorId, { ...context, correlationId, developmentId, documentReference: "12345678901" }, { rpc } as never);
    expect(found?.internalPartyRoleLinkId).toBe(developmentId);
    expect(rpc).toHaveBeenCalledWith("subdivision_lookup_internal_party_by_fiscal_reference", expect.objectContaining({ p_development_id: developmentId, p_document_reference: "12345678901" }));
  });

  it("cria versão em rascunho sem acionar pagamento ou repasse", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: { policy_version_id: developmentId, version_number: 1, state: "draft" }, error: null });
    const result = await createSubdivisionParticipationPolicyVersion(actorId, { ...context, correlationId, developmentId, validFrom: "2026-09-08", validUntil: null, requireFullAllocation: false }, { rpc } as never);
    expect(result).toEqual({ policyVersionId: developmentId, versionNumber: 1, state: "draft" });
    expect(rpc).toHaveBeenCalledWith("subdivision_create_participation_policy_version", expect.objectContaining({ p_require_full_allocation: false }));
  });

  it("rejeita método percentual com valor fixo concorrente antes da RPC", async () => {
    await expect(addSubdivisionParticipationPolicyRule(actorId, { ...context, correlationId, policyVersionId: developmentId, internalPartyRoleLinkId: "8ba7b810-9dad-11d1-80b4-00c04fd430c8", allocationMethod: "percentage_per_schedule", percentageBasisPoints: 1200, fixedAmountCents: 100, capTotalCents: null, appliesToAllLots: true, scheduleKinds: ["installment"] }, { rpc: vi.fn() } as never)).rejects.toThrow();
  });
});
