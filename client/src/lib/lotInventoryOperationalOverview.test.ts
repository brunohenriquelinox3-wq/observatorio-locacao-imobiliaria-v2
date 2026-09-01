import { describe, expect, it } from "vitest";
import { lotInventoryOperationalValue } from "./lotInventoryOperationalOverview";

describe("lot inventory operational overview", () => {
  it("does not imply lot records before an authorized context is selected", () => {
    expect(lotInventoryOperationalValue({ contextReady: false, loading: false, count: 0, pendingLabel: "Aguardando Quadra" })).toBe("Aguardando contexto");
  });

  it("keeps the Quadra dependency explicit when no lot read is available", () => {
    expect(lotInventoryOperationalValue({ contextReady: true, loading: false, pendingLabel: "Aguardando Quadra" })).toBe("Aguardando Quadra");
  });
});
