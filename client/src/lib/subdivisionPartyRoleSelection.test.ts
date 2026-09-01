import { describe, expect, it } from "vitest";
import { subdivisionPartyRoleSelectionLabel } from "./subdivisionPartyRoleSelection";

describe("subdivisionPartyRoleSelectionLabel", () => {
  it("identifica o papel interno de forma operacional sem exibir IDs técnicos", () => {
    expect(subdivisionPartyRoleSelectionLabel({ displayName: "Parte autorizada", role: "land_contributor" })).toBe(
      "Parte autorizada · Cedente de terra",
    );
  });

  it("mantém um rótulo seguro para papéis futuros não mapeados", () => {
    expect(subdivisionPartyRoleSelectionLabel({ displayName: "Parte autorizada", role: "future_role" })).toBe(
      "Parte autorizada · Papel temporal",
    );
  });
});
