import { describe, expect, it, vi } from "vitest";
import { TRPCError } from "@trpc/server";
import type { TrpcContext } from "./_core/context";

const subjectId = "550e8400-e29b-41d4-a716-446655440000";
const correlationId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

vi.mock("./foundationReadiness", () => ({
  getFoundationReadiness: vi.fn(),
}));

vi.mock("./adminCommands", () => ({
  bootstrapCurrentSubject: vi.fn(async (currentSubjectId: string | null) => {
    if (!currentSubjectId) {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "ADMIN_COMMAND_PRECONDITIONS_UNMET" });
    }
    return { principalId: currentSubjectId, state: "pending_activation" };
  }),
  delegateMembership: vi.fn(),
  getAdministrativeSubjectStatus: vi.fn(async () => ({
    identityState: "principal_absent",
    mfaVerified: false,
    bootstrapAction: "available",
    commandMode: "bootstrap_pending",
  })),
  provisionOrganization: vi.fn(),
  revokeMembership: vi.fn(),
  suspendMembership: vi.fn(),
}));

import { appRouter } from "./routers";

function createContext(role: "admin" | "user", supabaseSubjectId: string | null): TrpcContext {
  const now = new Date();
  return {
    user: {
      id: 1,
      openId: `test-${role}`,
      name: "Test User",
      email: null,
      loginMethod: "test",
      role,
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now,
    },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
    supabaseSubjectId,
  };
}

describe("administration command router", () => {
  it("denies bootstrap to a non-administrative app session", async () => {
    await expect(
      appRouter.createCaller(createContext("user", subjectId)).administration.bootstrap({ correlationId }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("requires a connected Supabase subject before controlled bootstrap", async () => {
    await expect(
      appRouter.createCaller(createContext("admin", null)).administration.bootstrap({ correlationId }),
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED", message: "ADMIN_COMMAND_PRECONDITIONS_UNMET" });
  });

  it("returns only pending bootstrap state to an eligible administrative caller", async () => {
    await expect(
      appRouter.createCaller(createContext("admin", subjectId)).administration.bootstrap({ correlationId }),
    ).resolves.toEqual({ principalId: subjectId, state: "pending_activation" });
  });
});
