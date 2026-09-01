import { describe, expect, it } from "vitest";
import { marketCities, resolveMarketCity } from "./homeMarketData";

describe("resolveMarketCity", () => {
  it("devolve a cidade escolhida ou uma referência de mercado segura", () => {
    expect(resolveMarketCity("Natal").cidade).toBe("Natal");
    expect(resolveMarketCity("não-listada")).toEqual(marketCities[0]);
  });
});
