import { describe, expect, it } from "vitest";
import { domainOperationalValue } from "./domainOperationalOverview";

describe("domain operational overview", () => {
  it("does not show a number without an authorized context", () => {
    expect(domainOperationalValue({ contextReady: false, loading: false, count: 0, pendingLabel: "Aguardando leitura" })).toBe("Aguardando contexto");
  });

  it("shows an empty result only after the authorized read settles", () => {
    expect(domainOperationalValue({ contextReady: true, loading: false, count: 0, pendingLabel: "Aguardando leitura" })).toBe("0 em rascunho");
  });
});
