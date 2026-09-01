import { describe, expect, it } from "vitest";
import { validateDraftPartyRolePeriod } from "./domainPartyRolePeriodValidation";

describe("validateDraftPartyRolePeriod", () => {
  it("aceita vigência aberta em qualquer ponta", () => {
    expect(validateDraftPartyRolePeriod("", "2026-09-01T10:00")).toEqual({ valid: true });
    expect(validateDraftPartyRolePeriod("2026-09-01T10:00", "")).toEqual({ valid: true });
  });

  it("aceita fim igual ou posterior ao início", () => {
    expect(validateDraftPartyRolePeriod("2026-09-01T10:00", "2026-09-01T10:00")).toEqual({ valid: true });
    expect(validateDraftPartyRolePeriod("2026-09-01T10:00", "2026-09-02T10:00")).toEqual({ valid: true });
  });

  it("bloqueia fim anterior ao início", () => {
    expect(validateDraftPartyRolePeriod("2026-09-02T10:00", "2026-09-01T10:00")).toEqual({
      valid: false,
      message: "O fim da vigência não pode ser anterior ao início.",
    });
  });
});
