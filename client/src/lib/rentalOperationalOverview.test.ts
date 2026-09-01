import { describe, expect, it } from "vitest";
import { rentalOperationalValue } from "./rentalOperationalOverview";

describe("rental operational overview", () => {
  it("does not imply operational data before the authorized context is ready", () => {
    expect(rentalOperationalValue({ contextReady: false, loading: false, count: 0, pendingLabel: "Aguardando leitura" })).toBe("Aguardando contexto");
    expect(rentalOperationalValue({ contextReady: true, loading: true, pendingLabel: "Aguardando leitura" })).toBe("Consultando");
  });

  it("shows an authorized empty result without creating a rental record", () => {
    expect(rentalOperationalValue({ contextReady: true, loading: false, count: 0, pendingLabel: "Aguardando leitura" })).toBe("0 em rascunho");
  });
});
