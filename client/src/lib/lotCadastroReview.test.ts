import { describe, expect, it } from "vitest";
import { lotRegistrationReview } from "./lotCadastroReview";

describe("revisão do cadastro de loteamentos", () => {
  it("mantém uma lente de cadastro que separa evidência, restrição e elegibilidade", () => {
    expect(lotRegistrationReview.key).toBe("registration");
    expect(lotRegistrationReview.steps).toHaveLength(4);
    expect(lotRegistrationReview.steps.join(" ")).toMatch(/Dossiê registral/);
    expect(lotRegistrationReview.text).toMatch(/condomínio de lotes/);
    expect(lotRegistrationReview.gate).toMatch(/evidência, owner e regra vigente/);
  });
});
