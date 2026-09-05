import { describe, expect, it, vi } from "vitest";
import { commitClientImport } from "./clientImport";

const subjectId = "550e8400-e29b-41d4-a716-446655440000";
const input = {
  organizationId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  module: "loteadora" as const,
  purposeCode: "CADASTRO_INICIAL",
  correlationId: "7ba7b810-9dad-11d1-80b4-00c04fd430c8",
  fileFingerprint: "b".repeat(64),
  confirmation: "CONFIRMO_IMPORTACAO" as const,
  rows: [{ displayName: "Cliente de teste", kind: "individual" as const, role: "client" as const }],
};

describe("fronteira server-side da importação de clientes", () => {
  it("nega a ausência de subject antes de usar a credencial de serviço", async () => {
    const rpc = vi.fn();
    await expect(commitClientImport(undefined, input, { rpc } as never)).rejects.toThrow("CLIENT_IMPORT_IDENTITY_REQUIRED");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("invoca somente a RPC contextual e retorna contagens agregadas", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [{ accepted_rows: 1, created_rows: 1, duplicate_rows: 0 }], error: null });
    await expect(commitClientImport(subjectId, input, { rpc } as never)).resolves.toEqual({ acceptedRows: 1, createdRows: 1, duplicateRows: 0 });
    expect(rpc).toHaveBeenCalledWith("client_import_draft_parties", expect.objectContaining({ p_actor_user_id: subjectId, p_organization_id: input.organizationId, p_module: "loteadora", p_rows: input.rows }));
  });

  it("não vaza o erro do banco ao falhar", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { message: "detalhe interno" } });
    await expect(commitClientImport(subjectId, input, { rpc } as never)).rejects.toThrow("CLIENT_IMPORT_COMMAND_DENIED");
  });
});
