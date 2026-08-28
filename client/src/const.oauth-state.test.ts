import { describe, expect, it } from "vitest";
describe("cookie de state OAuth", () => {
  it("usa atributos compatíveis com retorno OAuth em navegação principal", async () => {
    const source = await import("./const?raw");
    expect(source.default).toContain("document.cookie");
    expect(source.default).toContain("SameSite=Lax; Secure");
    expect(source.default).not.toContain("SameSite=None");
  });
});
