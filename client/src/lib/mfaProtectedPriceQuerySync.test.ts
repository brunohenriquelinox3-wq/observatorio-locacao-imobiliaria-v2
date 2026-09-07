import { describe, expect, it } from "vitest";
import { shouldRefreshMfaProtectedPriceQueries } from "./mfaProtectedPriceQuerySync";

describe("sincronização de consulta protegida por MFA", () => {
  it("atualiza a leitura protegida somente na transição para MFA recente", () => {
    expect(shouldRefreshMfaProtectedPriceQueries(false, true)).toBe(true);
    expect(shouldRefreshMfaProtectedPriceQueries(true, true)).toBe(false);
    expect(shouldRefreshMfaProtectedPriceQueries(false, false)).toBe(false);
    expect(shouldRefreshMfaProtectedPriceQueries(true, false)).toBe(false);
  });
});
