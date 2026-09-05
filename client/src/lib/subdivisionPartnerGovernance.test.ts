import { describe, expect, it } from "vitest";
import { buildSubdivisionPartnerGovernance } from "./subdivisionPartnerGovernance";

describe("buildSubdivisionPartnerGovernance", () => {
  it("ordena os papéis, usa ordinal local e mantém vigência sem expor datas", () => {
    const items = buildSubdivisionPartnerGovernance("development-a", [
      { linkId: "c", developmentId: "development-a", role: "land_contributor", startsAt: "2026-02-01T00:00:00Z", endsAt: null },
      { linkId: "a", developmentId: "development-a", role: "partner", startsAt: "2026-01-01T00:00:00Z", endsAt: "2026-02-01T00:00:00Z" },
      { linkId: "b", developmentId: "development-a", role: "shareholder", startsAt: "2026-01-01T00:00:00Z", endsAt: null },
      { linkId: "d", developmentId: "development-b", role: "shareholder", startsAt: "2026-01-01T00:00:00Z", endsAt: null },
    ]);

    expect(items).toEqual([
      expect.objectContaining({ ordinalLabel: "Sócio 01", lifecycleLabel: "Vigência declarada aberta" }),
      expect.objectContaining({ ordinalLabel: "Parceiro 01", lifecycleLabel: "Vigência declarada encerrada" }),
      expect.objectContaining({ ordinalLabel: "Cedente de terra 01", lifecycleLabel: "Vigência declarada aberta" }),
    ]);
  });
});
