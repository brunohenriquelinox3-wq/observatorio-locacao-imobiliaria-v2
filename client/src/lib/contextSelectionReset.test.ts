import { describe, expect, it } from "vitest";
import { retainAuthorizedSelection } from "./contextSelectionReset";

describe("retainAuthorizedSelection", () => {
  const records = [{ id: "authorized-one" }, { id: "authorized-two" }];

  it("preserva o valor enquanto a consulta ainda está carregando ou o ID está autorizado", () => {
    expect(retainAuthorizedSelection("authorized-one", undefined, (item) => item.id)).toBe("authorized-one");
    expect(retainAuthorizedSelection("authorized-two", records, (item) => item.id)).toBe("authorized-two");
  });

  it("limpa somente um valor ausente da leitura já autorizada", () => {
    expect(retainAuthorizedSelection("removed-record", records, (item) => item.id)).toBe("");
    expect(retainAuthorizedSelection("", records, (item) => item.id)).toBe("");
  });
});
