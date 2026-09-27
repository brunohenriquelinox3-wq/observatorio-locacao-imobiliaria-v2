import { describe, expect, it } from "vitest";
import {
  classifySubdivisionReadError,
  presentSubdivisionReadError,
} from "./subdivisionReadErrorPresentation";

describe("subdivisionReadErrorPresentation", () => {
  it("classifica códigos de acesso sem expor o payload técnico", () => {
    expect(
      classifySubdivisionReadError({ data: { code: "FORBIDDEN" } })
    ).toBe("access");
    expect(
      classifySubdivisionReadError({ message: "DOMAIN_CONTEXT_DENIED" })
    ).toBe("access");
    expect(presentSubdivisionReadError("access")).toEqual({
      title: "Esta área não está disponível para sua sessão",
      description:
        "Confira a organização selecionada ou peça a atualização do seu acesso. Nenhum dado foi alterado.",
    });
  });

  it("classifica a causa não reconhecida como falha temporária segura", () => {
    expect(classifySubdivisionReadError(new Error("network failure"))).toBe(
      "temporary"
    );
    expect(presentSubdivisionReadError("temporary").description).toContain(
      "Tente novamente"
    );
  });
});
