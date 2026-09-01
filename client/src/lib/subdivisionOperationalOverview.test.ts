import { describe, expect, it } from "vitest";
import { subdivisionOperationalValue } from "./subdivisionOperationalOverview";

describe("subdivision operational overview", () => {
  it("does not invent operational counts before authorization or a completed read", () => {
    expect(subdivisionOperationalValue({ contextReady: false, loading: false, count: 0, pendingLabel: "Aguardando loteamento" })).toBe("Aguardando contexto");
    expect(subdivisionOperationalValue({ contextReady: true, loading: true, pendingLabel: "Aguardando loteamento" })).toBe("Consultando");
  });

  it("shows the actual empty count returned by the authorized query", () => {
    expect(subdivisionOperationalValue({ contextReady: true, loading: false, count: 0, pendingLabel: "Aguardando loteamento" })).toBe("0 em rascunho");
  });
});
