import { describe, expect, it, vi } from "vitest";
import {
  archiveSubdivisionPriceEvidenceLink,
  linkSubdivisionPriceEvidence,
  listSubdivisionPriceEvidenceSummary,
} from "./subdivisionPriceEvidence";

const actor = "00000000-0000-4000-8000-000000000001";
const organizationId = "00000000-0000-4000-8000-000000000002";
const developmentId = "00000000-0000-4000-8000-000000000003";
const attachmentId = "00000000-0000-4000-8000-000000000004";
const policyId = "00000000-0000-4000-8000-000000000005";
const evidenceLinkId = "00000000-0000-4000-8000-000000000006";
const correlationId = "00000000-0000-4000-8000-000000000007";
const context = { organizationId, module: "loteadora" as const, purposeCode: "subdivision_structure", developmentId };

describe("subdivision price evidence", () => {
  it("links only opaque attachment and subject identifiers through the protected RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: evidenceLinkId, error: null });
    await expect(linkSubdivisionPriceEvidence(actor, {
      ...context, attachmentId, subjectKind: "price_base_policy", subjectId: policyId, correlationId,
    }, { rpc })).resolves.toEqual({ evidenceLinkId });
    expect(rpc).toHaveBeenCalledWith("subdivision_link_price_evidence_v1", expect.objectContaining({
      p_attachment_id: attachmentId,
      p_subject_kind: "price_base_policy",
      p_subject_id: policyId,
    }));
    expect(rpc.mock.calls[0]?.[1]).not.toHaveProperty("p_storage_key");
    expect(rpc.mock.calls[0]?.[1]).not.toHaveProperty("p_price");
  });

  it("returns only aggregate evidence counts without attachment metadata", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [{ subject_kind: "price_condition", subject_id: policyId, evidence_count: 2 }], error: null });
    await expect(listSubdivisionPriceEvidenceSummary(actor, context, { rpc })).resolves.toEqual([
      { subjectKind: "price_condition", subjectId: policyId, evidenceCount: 2 },
    ]);
  });

  it("requires a valid correlation before an archive command reaches the database", async () => {
    const rpc = vi.fn();
    await expect(archiveSubdivisionPriceEvidenceLink(actor, { ...context, evidenceLinkId, correlationId: "invalid" }, { rpc })).rejects.toThrow();
    expect(rpc).not.toHaveBeenCalled();
  });
});
