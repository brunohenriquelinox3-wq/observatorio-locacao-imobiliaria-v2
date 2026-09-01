import { describe, expect, it } from "vitest";
import { urbanOperationalValue } from "./urbanOperationalOverview";

describe("urban operational overview", () => {
  it("does not invent funnel records before the authorized read resolves", () => {
    expect(urbanOperationalValue({ contextReady: false, loading: false, count: 0, pendingLabel: "Aguardando leitura" })).toBe("Aguardando contexto");
    expect(urbanOperationalValue({ contextReady: true, loading: true, pendingLabel: "Aguardando leitura" })).toBe("Consultando");
  });

  it("shows an empty result only after the authorized query returns it", () => {
    expect(urbanOperationalValue({ contextReady: true, loading: false, count: 0, pendingLabel: "Aguardando leitura" })).toBe("0 em rascunho");
  });
});
