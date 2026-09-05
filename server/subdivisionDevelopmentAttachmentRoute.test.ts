import express from "express";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it, vi } from "vitest";
import { registerSubdivisionDevelopmentAttachmentRoute } from "./subdivisionDevelopmentAttachmentRoute";

const servers: ReturnType<typeof express.application.listen>[] = [];

afterEach(async () => {
  await Promise.all(servers.splice(0).map(server => new Promise<void>(resolve => server.close(() => resolve()))));
});

async function requestWithDependencies(dependencies: Parameters<typeof registerSubdivisionDevelopmentAttachmentRoute>[1]) {
  const app = express();
  registerSubdivisionDevelopmentAttachmentRoute(app, dependencies);
  const server = app.listen(0);
  servers.push(server);
  await new Promise<void>(resolve => server.once("listening", () => resolve()));
  const { port } = server.address() as AddressInfo;
  return fetch(`http://127.0.0.1:${port}/api/private/subdivision-development-attachments/00000000-0000-4000-8000-000000000003`, { method: "POST" });
}

describe("rota privada de anexo do loteamento", () => {
  it("nega identidade ausente com resposta redigida antes do multipart", async () => {
    const storeAttachment = vi.fn();
    const response = await requestWithDependencies({
      resolveRequestIdentity: vi.fn().mockResolvedValue({ user: null, supabaseSubjectId: null, supabaseAccessToken: undefined }),
      attestMfa: vi.fn(),
      storeAttachment,
    });
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "DEVELOPMENT_ATTACHMENT_REQUEST_REJECTED" });
    expect(storeAttachment).not.toHaveBeenCalled();
  });

  it("nega MFA insuficiente antes de processar qualquer arquivo", async () => {
    const storeAttachment = vi.fn();
    const response = await requestWithDependencies({
      resolveRequestIdentity: vi.fn().mockResolvedValue({ user: {} as never, supabaseSubjectId: "00000000-0000-4000-8000-000000000001", supabaseAccessToken: "synthetic" }),
      attestMfa: vi.fn().mockResolvedValue({ subjectId: "00000000-0000-4000-8000-000000000001", assuranceLevel: "aal1", method: "password" }),
      storeAttachment,
    });
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "DEVELOPMENT_ATTACHMENT_REQUEST_REJECTED" });
    expect(storeAttachment).not.toHaveBeenCalled();
  });
});
