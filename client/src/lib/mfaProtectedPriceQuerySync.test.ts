import { describe, expect, it } from "vitest";
import { shouldRefreshSessionPriceQueries } from "./mfaProtectedPriceQuerySync";

describe("sincronização de consulta vinculada à sessão MFA", () => {
  it("atualiza a leitura somente na transição para uma sessão AAL2", () => {
    expect(shouldRefreshSessionPriceQueries(false, true)).toBe(true);
    expect(shouldRefreshSessionPriceQueries(true, true)).toBe(false);
    expect(shouldRefreshSessionPriceQueries(false, false)).toBe(false);
    expect(shouldRefreshSessionPriceQueries(true, false)).toBe(false);
  });
});
