import { describe, expect, it } from "vitest";
import { assetOperationalValue } from "./assetOperationalOverview";

describe("asset operational overview", () => {
  it("does not present an asset count before the context is authorized", () => {
    expect(assetOperationalValue({ contextReady: false, loading: false, count: 0, pendingLabel: "Aguardando leitura" })).toBe("Aguardando contexto");
  });

  it("presents an empty authorized result without creating an asset", () => {
    expect(assetOperationalValue({ contextReady: true, loading: false, count: 0, pendingLabel: "Aguardando leitura" })).toBe("0 em rascunho");
  });
});
