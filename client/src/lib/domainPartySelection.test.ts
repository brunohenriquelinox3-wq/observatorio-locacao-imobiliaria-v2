import { describe, expect, it } from "vitest";
import { domainPartySelectionLabel } from "./domainPartySelection";

describe("domainPartySelectionLabel", () => {
  it("descreve uma Party autorizada sem revelar seu identificador técnico", () => {
    expect(domainPartySelectionLabel({ displayName: "Parte de teste", kind: "individual", roleCount: 1 })).toBe(
      "Parte de teste · Pessoa física · 1 papel no módulo",
    );
  });

  it("mantém a distinção de pessoa jurídica e pluralização de papéis", () => {
    expect(domainPartySelectionLabel({ displayName: "Empresa de teste", kind: "legal_entity", roleCount: 2 })).toBe(
      "Empresa de teste · Pessoa jurídica · 2 papéis no módulo",
    );
  });
});
