import express from "express";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it, vi } from "vitest";
import { registerPrivateBuyerAttachmentRoute } from "./subdivisionBuyerAttachmentRoute";

const servers: ReturnType<typeof express.application.listen>[] = [];

afterEach(async () => {
  await Promise.all(servers.splice(0).map(server => new Promise<void>(resolve => server.close(() => resolve()))));
});

async function requestWithDependencies(dependencies: Parameters<typeof registerPrivateBuyerAttachmentRoute>[1]) {
  const app = express();
  registerPrivateBuyerAttachmentRoute(app, dependencies);
  const server = app.listen(0);
  servers.push(server);
  await new Promise<void>(resolve => server.once("listening", () => resolve()));
  const { port } = server.address() as AddressInfo;
  return fetch(`http://127.0.0.1:${port}/api/private/subdivision-buyer-attachments/00000000-0000-4000-8000-000000000003`, { method: "POST" });
}

describe("private buyer attachment route", () => {
  it("denies an unauthenticated request with a redacted response before multipart processing", async () => {
    const attestMfa = vi.fn();
    const storeAttachment = vi.fn();
    const response = await requestWithDependencies({
      resolveRequestIdentity: vi.fn().mockResolvedValue({ user: null, supabaseSubjectId: null, supabaseAccessToken: undefined }),
      attestMfa,
      storeAttachment,
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "PRIVATE_ATTACHMENT_REQUEST_REJECTED" });
    expect(storeAttachment).not.toHaveBeenCalled();
  });

  it("denies a request without recent MFA before multipart processing", async () => {
    const storeAttachment = vi.fn();
    const response = await requestWithDependencies({
      resolveRequestIdentity: vi.fn().mockResolvedValue({ user: {} as never, supabaseSubjectId: "00000000-0000-4000-8000-000000000001", supabaseAccessToken: "synthetic" }),
      attestMfa: vi.fn().mockResolvedValue(null),
      storeAttachment,
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "PRIVATE_ATTACHMENT_REQUEST_REJECTED" });
    expect(storeAttachment).not.toHaveBeenCalled();
  });
});
