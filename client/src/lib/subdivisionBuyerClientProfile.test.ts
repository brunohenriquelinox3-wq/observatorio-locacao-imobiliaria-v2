import { describe, expect, it } from "vitest";
import { buyerClientProfileCompletion, recommendedBuyerClientRequirements } from "./subdivisionBuyerClientProfile";

describe("buyer client profile presentation helpers", () => {
  it("suggests only conditional readiness checks and never a commercial workflow", () => {
    const recommendations = recommendedBuyerClientRequirements({
      partyKind: "legal_entity", civilStatus: "married", representationState: "legal_entity_represented",
      documentReferencePresent: false, primaryEmailPresent: false, primaryPhonePresent: false, messagingPhonePresent: false,
    });
    expect(recommendations).toEqual(expect.arrayContaining(["fiscal_identifier", "identity_evidence", "address_evidence", "civil_status_evidence", "spousal_qualification", "representation_powers", "legal_entity_registration", "legal_entity_governance"]));
    expect(recommendations).not.toEqual(expect.arrayContaining(["credit_score" as never, "contract" as never, "payment" as never]));
  });

  it("summarizes field presence without reading profile values", () => {
    expect(buyerClientProfileCompletion({
      partyKind: "individual", civilStatus: "not_declared", representationState: "self_represented",
      documentReferencePresent: true, primaryEmailPresent: true, primaryPhonePresent: false, messagingPhonePresent: false,
    })).toEqual({ filled: 2, total: 4, percentage: 50 });
  });
});
