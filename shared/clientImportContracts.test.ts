import { describe, expect, it } from "vitest";
import { clientImportCommitInputSchema } from "./clientImportContracts";

const base = {
  organizationId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  module: "loteadora" as const,
  purposeCode: "CADASTRO_INICIAL",
  correlationId: "7ba7b810-9dad-11d1-80b4-00c04fd430c8",
  fileFingerprint: "a".repeat(64),
  confirmation: "CONFIRMO_IMPORTACAO" as const,
};

describe("contrato de importação de clientes", () => {
  it("aceita apenas o conjunto minimizado de nome, tipo e perfil", () => {
    expect(clientImportCommitInputSchema.parse({ ...base, rows: [{ displayName: "Cliente de teste", kind: "individual", role: "client" }] }).rows).toHaveLength(1);
  });

  it("rejeita confirmação incompleta, hash inválido e linha repetida", () => {
    expect(() => clientImportCommitInputSchema.parse({ ...base, confirmation: "confirmar", rows: [{ displayName: "Cliente de teste", kind: "individual", role: "client" }] })).toThrow();
    expect(() => clientImportCommitInputSchema.parse({ ...base, fileFingerprint: "invalido", rows: [{ displayName: "Cliente de teste", kind: "individual", role: "client" }] })).toThrow();
    expect(() => clientImportCommitInputSchema.parse({ ...base, rows: [{ displayName: "Cliente de teste", kind: "individual", role: "client" }, { displayName: "cliente de teste", kind: "individual", role: "client" }] })).toThrow("repetido");
  });
});
